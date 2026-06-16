import React, { useState } from 'react'
import { X, Upload, Download, AlertCircle, CheckCircle, FileSpreadsheet, Users, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentsStore } from '../../stores/studentsStore'
import { usersService } from '../../services/usersService'
import studentsService from '../../services/studentsService'
import { academicYearService } from '../../services/academic/academicYearService'
import { matriculationService } from '../../services/matriculationService'
import * as XLSX from 'xlsx'

const StudentBulkImport = ({ isOpen, onClose }) => {
  const { createStudent, updateStudent } = useStudentsStore()
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState([])
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const downloadTemplate = () => {
    // Crear plantilla de Excel
    // Nota: No incluye nivel/grado/sección porque estos se asignan al matricular
    const template = [
      {
        'Nombres': 'Juan Carlos',
        'Apellidos': 'Pérez García',
        'DNI Estudiante': '12345678',
        'Fecha de Nacimiento': '2010-05-15',
        'Sexo (M/F)': 'M',
        'Dirección': 'Av. Principal 123',
        'Teléfono': '987654321',
        'DNI Padre/Tutor': '87654321'
      },
      {
        'Nombres': 'María Isabel',
        'Apellidos': 'López Martínez',
        'DNI Estudiante': '23456789',
        'Fecha de Nacimiento': '2011-08-22',
        'Sexo (M/F)': 'F',
        'Dirección': 'Jr. Las Flores 456',
        'Teléfono': '987654322',
        'DNI Padre/Tutor': '87654321'
      },
      {
        'Nombres': 'Pedro',
        'Apellidos': 'García Ruiz',
        'DNI Estudiante': '34567890',
        'Fecha de Nacimiento': '2012-03-10',
        'Sexo (M/F)': 'M',
        'Dirección': 'Calle Los Andes 789',
        'Teléfono': '987654323',
        'DNI Padre/Tutor': '76543210'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')

    // Forzar las celdas de DNI, Fecha y Teléfono como texto para que Excel
    // no las auto-convierta a número/fecha (preserva ceros a la izquierda
    // y formato YYYY-MM-DD legible para nuestro parser).
    const range = XLSX.utils.decode_range(ws['!ref'])
    // Columnas (índice 0): C=DNI Estudiante, D=Fecha Nac, G=Teléfono, H=DNI Padre
    const textColumns = [2, 3, 6, 7]
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of textColumns) {
        const cellAddr = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = ws[cellAddr]
        if (cell) {
          cell.t = 's' // string
          cell.z = '@' // formato texto
        }
      }
    }

    // Ajustar anchos de columna
    const colWidths = [
      { wch: 20 }, // Nombres
      { wch: 20 }, // Apellidos
      { wch: 15 }, // DNI Estudiante
      { wch: 20 }, // Fecha de Nacimiento
      { wch: 15 }, // Sexo
      { wch: 30 }, // Dirección
      { wch: 15 }, // Teléfono
      { wch: 18 }  // DNI Padre/Tutor
    ]
    ws['!cols'] = colWidths

    // Descargar archivo
    XLSX.writeFile(wb, 'plantilla_estudiantes.xlsx')
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setErrors([])
      processFile(selectedFile)
    }
  }

  // Convierte cualquier representación de fecha (Date object, serial Excel, string)
  // a formato YYYY-MM-DD que es lo que espera el backend (Postgres DATE).
  // Devuelve null si no es una fecha válida.
  const normalizeDate = (raw) => {
    if (raw === null || raw === undefined || raw === '') return null

    // Caso 1: Date object (cuando XLSX.read se llama con cellDates: true)
    if (raw instanceof Date) {
      if (isNaN(raw.getTime())) return null
      // Usar componentes locales para evitar desfase por zona horaria
      const y = raw.getFullYear()
      const m = String(raw.getMonth() + 1).padStart(2, '0')
      const d = String(raw.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    // Caso 2: número serial de Excel (días desde 1900-01-01, con bug de Lotus)
    if (typeof raw === 'number') {
      const parsed = XLSX.SSF.parse_date_code(raw)
      if (!parsed) return null
      const y = parsed.y
      const m = String(parsed.m).padStart(2, '0')
      const d = String(parsed.d).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    // Caso 3: string. Aceptar YYYY-MM-DD directo o intentar parsear.
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
      // Soportar DD/MM/YYYY o D/M/YYYY (formato común en Perú)
      const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
      if (dmy) {
        const d = dmy[1].padStart(2, '0')
        const m = dmy[2].padStart(2, '0')
        const y = dmy[3]
        return `${y}-${m}-${d}`
      }
      // Intento final: dejar que Date lo parsee
      const parsed = new Date(trimmed)
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear()
        const mm = String(parsed.getMonth() + 1).padStart(2, '0')
        const dd = String(parsed.getDate()).padStart(2, '0')
        return `${y}-${mm}-${dd}`
      }
    }

    return null
  }

  // Normaliza el DNI: convierte a string, elimina espacios, y rellena con
  // ceros a la izquierda hasta 8 dígitos (Excel pierde los ceros si la celda es número).
  const normalizeDni = (raw) => {
    if (raw === null || raw === undefined || raw === '') return ''
    const str = String(raw).trim().replace(/\s+/g, '')
    // Solo dígitos
    if (!/^\d+$/.test(str)) return str
    if (str.length < 8) return str.padStart(8, '0')
    return str
  }

  // Normaliza el género a 'M' o 'F'. Acepta variantes: M/F, m/f, Masculino/Femenino, Hombre/Mujer.
  const normalizeGender = (raw) => {
    if (!raw) return null
    const str = String(raw).trim().toUpperCase()
    if (str === 'M' || str === 'MASCULINO' || str === 'HOMBRE') return 'M'
    if (str === 'F' || str === 'FEMENINO' || str === 'MUJER') return 'F'
    return null
  }

  const processFile = async (file) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        // cellDates: true → Excel convierte celdas tipo fecha a Date objects.
        // raw: false en sheet_to_json hace que valores se devuelvan ya formateados.
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: false, cellText: false })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true })

        // Obtener todos los padres registrados
        let todosLosPadres = []
        try {
          todosLosPadres = await usersService.getByRole('padre') || []
        } catch (error) {
          console.error('Error al obtener padres:', error)
          setErrors(['Error al conectar con el servidor. Intente nuevamente.'])
          return
        }

        // Obtener todos los estudiantes existentes para verificar si ya existen (por DNI)
        let estudiantesExistentes = []
        try {
          estudiantesExistentes = await studentsService.getAll() || []
        } catch (error) {
          console.error('Error al obtener estudiantes:', error)
          setErrors(['Error al conectar con el servidor. Intente nuevamente.'])
          return
        }

        // Obtener año académico activo para verificar matrículas
        let añoActivo = null
        try {
          añoActivo = await academicYearService.getActive()
        } catch (error) {
          console.error('Error al obtener año activo:', error)
          // No es crítico, continuamos sin verificar matrículas
        }

        // Obtener matrículas del año activo (si existe)
        let matriculasActivas = []
        if (añoActivo) {
          try {
            const todasMatriculas = await matriculationService.getAll({ academic_year_id: añoActivo.id })
            // Filtrar solo matrículas activas/vigentes (no canceladas)
            matriculasActivas = (todasMatriculas || []).filter(m =>
              m.status !== 'cancelled' && m.status !== 'cancelado' && m.status !== 'rejected'
            )
          } catch (error) {
            console.error('Error al obtener matrículas:', error)
            // No es crítico, continuamos sin verificar matrículas
          }
        }

        // Crear un Set con los IDs de estudiantes matriculados en año activo
        const estudiantesMatriculadosIds = new Set(matriculasActivas.map(m => m.student_id))

        // Validar y mapear datos
        const processedData = []
        const validationErrors = []
        const dnisVistosEnArchivo = new Map() // dni → fila donde apareció primero

        jsonData.forEach((row, index) => {
          const rowNum = index + 2 // +2 porque Excel empieza en 1 y hay header

          // Validaciones básicas del estudiante
          const nombres = row['Nombres'] ? String(row['Nombres']).trim() : ''
          if (!nombres) {
            validationErrors.push(`Fila ${rowNum}: El campo "Nombres" es obligatorio`)
            return
          }

          const apellidos = row['Apellidos'] ? String(row['Apellidos']).trim() : ''
          if (!apellidos) {
            validationErrors.push(`Fila ${rowNum}: El campo "Apellidos" es obligatorio`)
            return
          }

          const dniEstudiante = normalizeDni(row['DNI Estudiante'])
          if (!dniEstudiante || dniEstudiante.length !== 8 || !/^\d{8}$/.test(dniEstudiante)) {
            validationErrors.push(`Fila ${rowNum}: DNI del estudiante debe tener exactamente 8 dígitos numéricos (recibido: "${row['DNI Estudiante']}")`)
            return
          }

          // Detectar DNI duplicado dentro del mismo archivo
          if (dnisVistosEnArchivo.has(dniEstudiante)) {
            validationErrors.push(`Fila ${rowNum}: DNI ${dniEstudiante} está duplicado en el archivo (ya aparece en la fila ${dnisVistosEnArchivo.get(dniEstudiante)})`)
            return
          }
          dnisVistosEnArchivo.set(dniEstudiante, rowNum)

          // Validar fecha de nacimiento
          const birthDate = normalizeDate(row['Fecha de Nacimiento'])
          if (!birthDate) {
            validationErrors.push(`Fila ${rowNum}: Fecha de Nacimiento inválida o vacía. Use formato YYYY-MM-DD o DD/MM/YYYY (recibido: "${row['Fecha de Nacimiento']}")`)
            return
          }

          // Validar género
          const gender = normalizeGender(row['Sexo (M/F)'])
          if (!gender) {
            validationErrors.push(`Fila ${rowNum}: El campo "Sexo (M/F)" debe ser M o F (recibido: "${row['Sexo (M/F)']}")`)
            return
          }

          // Validar DNI del padre
          const dniPadre = normalizeDni(row['DNI Padre/Tutor'])
          if (!dniPadre) {
            validationErrors.push(`Fila ${rowNum}: DNI del Padre/Tutor es obligatorio`)
            return
          }

          // Buscar padre en la lista de padres (compara como string normalizado)
          const padre = todosLosPadres.find(p => normalizeDni(p.dni) === dniPadre)

          if (!padre) {
            validationErrors.push(`Fila ${rowNum}: No se encontró un padre/tutor registrado con DNI ${dniPadre}. Por favor, registre primero al padre en el sistema.`)
            return
          }

          // Verificar si el estudiante ya existe en la DB (por DNI)
          const estudianteExistente = estudiantesExistentes.find(e => normalizeDni(e.dni) === dniEstudiante)
          const isUpdate = !!estudianteExistente

          // Verificar si el estudiante tiene matrícula activa en año vigente
          const tieneMatriculaActiva = isUpdate && estudiantesMatriculadosIds.has(estudianteExistente?.id)

          // Si tiene matrícula activa, NO se puede actualizar por importación
          if (tieneMatriculaActiva) {
            const nombreCompleto = `${nombres} ${apellidos}`
            validationErrors.push(`Fila ${rowNum}: El estudiante "${nombreCompleto}" (DNI: ${dniEstudiante}) está matriculado en el año lectivo vigente y no puede ser modificado por importación.`)
            return
          }

          // Separar apellidos (Apellido Paterno y Apellido Materno)
          const apellidosSplit = apellidos.split(/\s+/)
          const paternal_last_name = apellidosSplit[0] || apellidos
          const maternal_last_name = apellidosSplit.slice(1).join(' ') || ''

          // Normalizar teléfono (Excel puede venir como número)
          const phone = row['Teléfono'] !== undefined && row['Teléfono'] !== null && row['Teléfono'] !== ''
            ? String(row['Teléfono']).trim()
            : null

          // Mapear datos del estudiante AL FORMATO DE LA API
          const studentData = {
            // Campos obligatorios
            barcode: dniEstudiante, // El código de barras es el mismo DNI
            first_names: nombres,
            last_names: paternal_last_name, // last_names es el apellido paterno principal
            paternal_last_name: paternal_last_name,
            maternal_last_name: maternal_last_name,
            dni: dniEstudiante,
            document_type: 'DNI',
            birth_date: birthDate, // Ya normalizado a YYYY-MM-DD
            gender: gender, // Ya normalizado a M o F
            address: row['Dirección'] ? String(row['Dirección']).trim() : '',
            phone: phone,
            parent_id: padre.id, // El backend convertirá esto a JSON parents
            has_double_shift: false,
            status: 'active',
            // Campos de control
            _isUpdate: isUpdate,
            _existingId: estudianteExistente?.id || null,
            // Campos para preview
            _preview: {
              padreNombre: padre.first_name || padre.name || '',
              padreApellido: padre.last_names || '',
              padreDni: padre.dni,
              action: isUpdate ? 'Actualizar' : 'Crear'
            }
          }

          processedData.push(studentData)
        })

        setErrors(validationErrors)
        setPreviewData(processedData)
      } catch (error) {
        console.error('Error al procesar archivo:', error)
        setErrors(['Error al procesar el archivo. Asegúrese de que sea un archivo Excel válido.'])
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    if (previewData.length === 0 || errors.length > 0) {
      return
    }

    setProcessing(true)
    const importErrors = []
    let createdCount = 0
    let updatedCount = 0

    try {
      // Procesar estudiantes uno por uno (crear o actualizar)
      for (const studentData of previewData) {
        try {
          // Remover campos de control antes de enviar al backend
          const { _preview, _isUpdate, _existingId, ...dataToSend } = studentData

          if (_isUpdate) {
            // ACTUALIZAR estudiante existente
            await updateStudent(_existingId, dataToSend)
            updatedCount++
          } else {
            // CREAR nuevo estudiante
            await createStudent(dataToSend)
            createdCount++
          }
        } catch (error) {
          const nombreCompleto = `${studentData.first_names} ${studentData.paternal_last_name}`
          const action = studentData._isUpdate ? 'actualizar' : 'crear'
          importErrors.push(`Error al ${action} ${nombreCompleto}: ${error.message}`)
        }
      }

      if (createdCount > 0 || updatedCount > 0) {
        // Mensaje de resumen
        let mensaje = '¡Importación completada! '
        if (createdCount > 0) mensaje += `${createdCount} estudiante(s) creado(s). `
        if (updatedCount > 0) mensaje += `${updatedCount} estudiante(s) actualizado(s).`

        setSuccessMessage(mensaje)
        setShowSuccessAnimation(true)

        // Esperar 2.5 segundos, luego cerrar modal y refrescar
        setTimeout(() => {
          setShowSuccessAnimation(false)
          onClose() // Esto disparará el refresh en el componente padre

          // Limpiar estados después de cerrar
          setFile(null)
          setPreviewData([])
          setSuccess(false)
          setSuccessMessage('')
          setErrors([])
        }, 2500)
      }

      if (importErrors.length > 0) {
        setErrors(importErrors)
      }
    } catch (err) {
      setErrors([err.message || 'Error al importar estudiantes'])
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Importar Estudiantes por Lote</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <AlertCircle className="mr-2" size={18} />
                Instrucciones Importantes:
              </h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li><strong>PRIMERO:</strong> Asegúrese de que todos los padres/tutores estén registrados en el sistema (Usuarios → Nuevo Usuario → Rol: Padre)</li>
                <li>Descargue la plantilla de Excel con el formato correcto</li>
                <li>Complete los datos de los estudiantes en la plantilla</li>
                <li><strong>Fecha de Nacimiento:</strong> Use el formato <code>YYYY-MM-DD</code> (ej: 2010-05-15) o <code>DD/MM/YYYY</code> (ej: 15/05/2010)</li>
                <li><strong>Sexo:</strong> Acepta <code>M</code>, <code>F</code>, Masculino o Femenino</li>
                <li><strong>DNI:</strong> Debe tener 8 dígitos. Si Excel quita ceros a la izquierda, formatee la celda como Texto.</li>
                <li><strong>Importante:</strong> En la columna "DNI Padre/Tutor", coloque el DNI del padre que YA está registrado en el sistema</li>
                <li>El sistema vinculará automáticamente al estudiante con el padre usando el DNI</li>
                <li>Si un DNI de padre no se encuentra, se mostrará un error y NO se importará ese estudiante</li>
                <li>Suba el archivo Excel completado y revise la vista previa antes de confirmar</li>
              </ol>
            </div>

            {/* Warning about enrolled students */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                <Lock className="mr-2" size={18} />
                Estudiantes Protegidos:
              </h3>
              <p className="text-sm text-amber-700">
                Los estudiantes que ya están <strong>matriculados en el año lectivo vigente</strong> no pueden ser modificados mediante importación masiva.
                Si necesita actualizar datos de un estudiante matriculado, debe hacerlo de forma individual desde la gestión de estudiantes.
              </p>
            </div>

            {/* Download Template */}
            <div className="mb-6">
              <button
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="mr-2" size={18} />
                Descargar Plantilla Excel
              </button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir Archivo Excel
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileSpreadsheet className="mx-auto text-gray-400 mb-3" size={48} />
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Upload className="mr-2" size={18} />
                  Seleccionar Archivo
                </label>
                {file && (
                  <p className="mt-3 text-sm text-gray-600">
                    Archivo seleccionado: {file.name}
                  </p>
                )}
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                      Errores encontrados:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}


            {/* Preview */}
            {previewData.length > 0 && errors.length === 0 && (
              <div>
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center mb-2">
                    <Users className="mr-2" size={20} />
                    Vista Previa ({previewData.length} estudiantes)
                  </h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      {previewData.filter(s => !s._isUpdate).length} nuevos
                    </span>
                    <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      {previewData.filter(s => s._isUpdate).length} actualizaciones
                    </span>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estudiante
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            DNI Estudiante
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Padre/Tutor Vinculado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 5).map((student, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {student.first_names} {student.paternal_last_name} {student.maternal_last_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {student.dni}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="text-gray-900 font-medium">
                                {student._preview.padreNombre} {student._preview.padreApellido}
                              </div>
                              <div className="text-gray-500 text-xs">
                                DNI: {student._preview.padreDni}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                student._isUpdate
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {student._preview.action}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 5 && (
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                        ... y {previewData.length - 5} estudiantes más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={previewData.length === 0 || errors.length > 0 || processing}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                previewData.length > 0 && errors.length === 0 && !processing
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={18} />
                  Importar {previewData.length > 0 && `(${previewData.length})`}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Animación de éxito - aparece al frente del modal */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-md mx-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="bg-green-100 rounded-full p-6 mb-4"
                >
                  <CheckCircle size={64} className="text-green-600" strokeWidth={2.5} />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-gray-900 mb-2 text-center"
                >
                  ¡Éxito!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 text-center"
                >
                  {successMessage}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}

export default StudentBulkImport