import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Barcode as BarcodeIcon, Download, Users, CheckCircle, Filter,
  RefreshCw, FileText, Printer, AlertCircle
} from 'lucide-react'
import Barcode from 'react-barcode'
import { jsPDF } from 'jspdf'
import { useAttendanceStore } from '../../stores/attendanceStore'
import { attendanceService } from '../../services/attendanceService'
import structureService from '../../services/academic/structureService'

const QRGeneratorPage = () => {
  // Estados
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [filters, setFilters] = useState({
    level_id: '',
    grade_id: '',
    section_id: ''
  })

  // Datos para filtros
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [sections, setSections] = useState([])

  const { generateBulkQRCodes } = useAttendanceStore()

  // Cargar niveles al montar
  useEffect(() => {
    loadLevels()
  }, [])

  // Cargar grados cuando cambia el nivel
  useEffect(() => {
    if (filters.level_id) {
      loadGrades(filters.level_id)
    } else {
      setGrades([])
      setFilters(prev => ({ ...prev, grade_id: '', section_id: '' }))
    }
  }, [filters.level_id])

  // Cargar secciones cuando cambia el grado
  useEffect(() => {
    if (filters.grade_id) {
      loadSections(filters.grade_id)
    } else {
      setSections([])
      setFilters(prev => ({ ...prev, section_id: '' }))
    }
  }, [filters.grade_id])

  // Cargar estudiantes cuando cambian los filtros
  useEffect(() => {
    if (filters.level_id) {
      loadStudents()
    }
  }, [filters.level_id, filters.grade_id, filters.section_id])

  const loadLevels = async () => {
    try {
      const data = await structureService.getAllLevels()
      setLevels(data || [])
    } catch (error) {
      console.error('Error cargando niveles:', error)
    }
  }

  const loadGrades = async (levelId) => {
    try {
      const data = await structureService.getGradesByLevel(levelId)
      setGrades(data || [])
    } catch (error) {
      console.error('Error cargando grados:', error)
    }
  }

  const loadSections = async (gradeId) => {
    try {
      const data = await structureService.getSectionsByGrade(gradeId)
      setSections(data || [])
    } catch (error) {
      console.error('Error cargando secciones:', error)
    }
  }

  const loadStudents = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.getStudentsForPdf(filters)
      setStudents(data || [])
      setSelectedStudents([])
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(students.map(s => s.id))
    }
  }

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleGenerateQRCodes = async () => {
    if (selectedStudents.length === 0) {
      alert('Selecciona al menos un estudiante')
      return
    }

    setGenerating(true)
    try {
      await generateBulkQRCodes(selectedStudents)
      // Recargar estudiantes para ver los QR actualizados
      await loadStudents()
      alert(`${selectedStudents.length} códigos QR generados exitosamente`)
    } catch (error) {
      console.error('Error generando QR:', error)
      alert('Error al generar códigos QR')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    const studentsWithDNI = students.filter(s =>
      selectedStudents.includes(s.id) && s.dni
    )

    if (studentsWithDNI.length === 0) {
      alert('No hay estudiantes seleccionados con DNI')
      return
    }

    setGenerating(true)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Configuración de tarjetas - más anchas para código de barras
      const cardWidth = 85
      const cardHeight = 55
      const cardsPerRow = 2
      const cardsPerPage = 8
      const marginX = (pageWidth - (cardWidth * cardsPerRow)) / (cardsPerRow + 1)
      const marginY = 10
      const startY = 20

      // Título
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Códigos de Barras - Control de Asistencia', pageWidth / 2, 10, { align: 'center' })

      let currentPage = 0
      let cardIndex = 0

      // Importar JsBarcode para generar códigos de barras
      const JsBarcode = (await import('jsbarcode')).default

      for (const student of studentsWithDNI) {
        // Calcular posición
        const pageIndex = Math.floor(cardIndex / cardsPerPage)
        const positionInPage = cardIndex % cardsPerPage
        const row = Math.floor(positionInPage / cardsPerRow)
        const col = positionInPage % cardsPerRow

        // Nueva página si es necesario
        if (pageIndex > currentPage) {
          pdf.addPage()
          currentPage = pageIndex
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Códigos de Barras - Control de Asistencia', pageWidth / 2, 10, { align: 'center' })
        }

        const x = marginX + col * (cardWidth + marginX)
        const y = startY + row * (cardHeight + marginY)

        // Dibujar tarjeta
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.5)
        pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3)

        // Nombre del estudiante (arriba)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        const fullName = `${student.last_names}, ${student.first_names}`
        const truncatedName = fullName.length > 35 ? fullName.substring(0, 32) + '...' : fullName
        pdf.text(truncatedName, x + cardWidth / 2, y + 8, { align: 'center' })

        // Nivel y Grado
        pdf.setFontSize(7)
        pdf.setTextColor(100, 100, 100)
        const gradeInfo = `${student.level_name || ''} - ${student.grade_name || ''} ${student.section_name || ''}`
        pdf.text(gradeInfo, x + cardWidth / 2, y + 14, { align: 'center' })
        pdf.setTextColor(0, 0, 0)

        // Generar código de barras como imagen
        const canvas = document.createElement('canvas')
        JsBarcode(canvas, student.dni, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 5
        })

        const barcodeDataUrl = canvas.toDataURL('image/png')
        const barcodeWidth = 70
        const barcodeHeight = 30
        const barcodeX = x + (cardWidth - barcodeWidth) / 2
        const barcodeY = y + 18

        pdf.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight)

        // Línea de corte punteada
        pdf.setDrawColor(180, 180, 180)
        pdf.setLineDashPattern([2, 2], 0)
        pdf.line(x, y + cardHeight, x + cardWidth, y + cardHeight)
        pdf.setLineDashPattern([], 0)

        cardIndex++
      }

      // Descargar PDF
      const levelName = levels.find(l => l.id == filters.level_id)?.name || 'Todos'
      const fileName = `Barcode_Asistencia_${levelName}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar PDF')
    } finally {
      setGenerating(false)
    }
  }

  // Estudiantes sin/con DNI
  const studentsWithoutQR = students.filter(s => !s.dni)
  const studentsWithQR = students.filter(s => s.dni)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarcodeIcon className="text-blue-600" size={32} />
            Generador de Códigos de Barras
          </h1>
          <p className="mt-2 text-gray-600">
            Genera códigos de barras (DNI) para el control de asistencia de estudiantes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtrar Estudiantes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel
            </label>
            <select
              value={filters.level_id}
              onChange={(e) => setFilters(prev => ({ ...prev, level_id: e.target.value }))}
              className="w-full input"
            >
              <option value="">Seleccionar nivel...</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grado
            </label>
            <select
              value={filters.grade_id}
              onChange={(e) => setFilters(prev => ({ ...prev, grade_id: e.target.value }))}
              className="w-full input"
              disabled={!filters.level_id}
            >
              <option value="">Todos los grados</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              value={filters.section_id}
              onChange={(e) => setFilters(prev => ({ ...prev, section_id: e.target.value }))}
              className="w-full input"
              disabled={!filters.grade_id}
            >
              <option value="">Todas las secciones</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Con DNI</p>
                <p className="text-2xl font-semibold text-green-600">{studentsWithQR.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sin DNI</p>
                <p className="text-2xl font-semibold text-orange-600">{studentsWithoutQR.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Seleccionados</p>
                <p className="text-2xl font-semibold text-blue-600">{selectedStudents.length}</p>
              </div>
              <BarcodeIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      {students.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSelectAll}
            className="btn btn-outline flex items-center gap-2"
          >
            <CheckCircle size={18} />
            {selectedStudents.length === students.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>

          <button
            onClick={handleGenerateQRCodes}
            disabled={selectedStudents.length === 0 || generating}
            className="btn btn-primary flex items-center gap-2"
          >
            {generating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <BarcodeIcon size={18} />
            )}
            Generar Códigos ({selectedStudents.length})
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={selectedStudents.length === 0 || generating}
            className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download size={18} />
            Descargar PDF
          </button>
        </div>
      )}

      {/* Lista de estudiantes */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estudiante</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DNI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nivel/Grado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Código de Barras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Cargando estudiantes...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    <Users className="mx-auto mb-2 text-gray-300" size={48} />
                    <p>Selecciona un nivel para ver los estudiantes</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {student.dni ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle size={14} />
                          Listo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          <AlertCircle size={14} />
                          Sin DNI
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {student.last_names}, {student.first_names}
                      </div>
                      <div className="text-sm text-gray-500">
                        Código: {student.code}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {student.dni}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{student.level_name}</div>
                      <div className="text-sm text-gray-500">
                        {student.grade_name} - {student.section_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {student.dni ? (
                        <div className="bg-white p-1 border rounded">
                          <Barcode
                            value={student.dni}
                            width={1.2}
                            height={35}
                            fontSize={10}
                            margin={2}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin DNI</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Instrucciones de uso:</p>
            <ul className="space-y-1 text-blue-800">
              <li>1. Selecciona el nivel, grado y sección para filtrar estudiantes</li>
              <li>2. Marca los estudiantes a los que deseas generar código de barras</li>
              <li>3. El código de barras usa el DNI como identificador</li>
              <li>4. Descarga el PDF para imprimir los carnets con los códigos de barras</li>
              <li>5. Los códigos de barras pueden ser escaneados en el Control de Asistencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRGeneratorPage
