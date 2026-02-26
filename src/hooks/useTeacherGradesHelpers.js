import { useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import evaluationStructuresService from '../services/evaluationStructuresService'

/**
 * Hook para funciones auxiliares de calificaciones
 * Maneja columnas personalizadas, exportación, importación y navegación
 */
export const useTeacherGradesHelpers = ({
  customColumns,
  setCustomColumns,
  grades,
  setGrades,
  evaluationTypes,
  filteredStudents,
  mockStudents,
  getSubcategoriasWithCustom,
  calculateCompetenceAverage,
  calculateAverage,
  stats,
  selectedCourse,
  selectedBimester,
  selectedGrade,
  selectedSection,
  currentEvaluationStructure,
  user,
  refreshStructures
}) => {
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [columnForm, setColumnForm] = useState({ name: '', weight: 10, parentId: null })

  // Estados para los diálogos de confirmación
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  })

  // Función helper para mostrar diálogos
  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      onConfirm
    })
  }

  const closeDialog = () => {
    setDialog({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null
    })
  }

  // Handlers para columnas personalizadas
  const openAddColumnModal = (parentCompetenceId) => {
    setColumnForm({ name: '', weight: 10, parentId: parentCompetenceId })
    setShowAddColumnModal(true)
  }

  const handleAddColumn = async () => {
    if (!columnForm.name.trim() || !columnForm.parentId) return

    // Validar que haya curso, grado y bimestre seleccionados
    if (!selectedCourse || !selectedGrade || !selectedBimester) {
      showDialog(
        'warning',
        'Validación requerida',
        'Por favor selecciona Curso, Grado y Bimestre antes de agregar columnas personalizadas.'
      )
      return
    }

    // Obtener competencia padre y sus subcategorías actuales
    const parentCompetence = evaluationTypes.find(comp => comp.id === columnForm.parentId)
    if (!parentCompetence) {
      showDialog('error', 'Error', 'No se encontró la competencia seleccionada.')
      return
    }

    const currentSubcategories = getSubcategoriasWithCustom(parentCompetence.id, parentCompetence.subcategorias)

    // Validar que no exista una columna con el mismo nombre en la misma competencia
    const existingNames = currentSubcategories.map(sub => sub.name.toLowerCase().trim())
    if (existingNames.includes(columnForm.name.toLowerCase().trim())) {
      showDialog(
        'warning',
        'Nombre duplicado',
        `Ya existe una evaluación llamada "${columnForm.name}" en la competencia "${parentCompetence.name}". Por favor usa un nombre diferente.`
      )
      return
    }

    // Validar que la suma de porcentajes no supere 100%
    const currentTotalWeight = currentSubcategories.reduce((sum, sub) => sum + (sub.weight * 100), 0)
    const newTotalWeight = currentTotalWeight + columnForm.weight

    if (newTotalWeight > 100) {
      showDialog(
        'warning',
        'Porcentaje excedido',
        `La suma de porcentajes no puede superar 100%. Actualmente tienes ${Math.round(currentTotalWeight)}% asignado. Si agregas ${columnForm.weight}% llegarías a ${Math.round(newTotalWeight)}%. Puedes agregar como máximo ${Math.round(100 - currentTotalWeight)}%.`
      )
      return
    }

    try {
      const newColumn = {
        id: `CUSTOM_${Date.now()}`,
        name: columnForm.name,
        weight: columnForm.weight,
        isCustom: true
      }

      // Guardar en BD con auto-creación de estructura si no existe
      await evaluationStructuresService.addCustomColumn(
        currentEvaluationStructure?.id || null,
        columnForm.parentId,
        newColumn,
        selectedCourse,
        selectedGrade,
        selectedBimester,
        currentEvaluationStructure?.academic_year_id || null
      )

      // Agregar al estado local
      setCustomColumns([...customColumns, {
        ...newColumn,
        weight: newColumn.weight / 100, // Convertir a decimal para el frontend
        parentId: columnForm.parentId,
        color: 'bg-indigo-100'
      }])

      setShowAddColumnModal(false)
      setColumnForm({ name: '', weight: 10, parentId: null })

      // Refrescar estructuras automáticamente para obtener la nueva columna
      if (refreshStructures) {
        await refreshStructures()
      }

      // Mostrar toast de éxito (sin dialog)
      toast.success('Columna agregada exitosamente', {
        duration: 2000,
        position: 'top-center',
        icon: '✅'
      })
    } catch (error) {
      console.error('Error al agregar columna:', error)
      toast.error(`Error al agregar columna: ${error.message || 'Intenta nuevamente'}`, {
        duration: 3000,
        position: 'top-center'
      })
    }
  }

  const handleDeleteColumn = async (columnId) => {
    showDialog(
      'confirm',
      'Confirmar eliminación',
      '¿Estás seguro de eliminar esta columna? Se perderán todas las notas asociadas.',
      async () => {
        try {
          // Si hay estructura de evaluación, eliminar de BD
          if (currentEvaluationStructure?.id) {
            await evaluationStructuresService.removeCustomColumn(
              currentEvaluationStructure.id,
              columnId
            )
          }

          // Eliminar del estado local
          setCustomColumns(customColumns.filter(col => col.id !== columnId))

          // Limpiar las notas de esta columna
          const newGrades = { ...grades }
          Object.keys(newGrades).forEach(studentId => {
            if (newGrades[studentId][columnId]) {
              delete newGrades[studentId][columnId]
            }
          })
          setGrades(newGrades)

          // Refrescar estructuras y mostrar éxito
          if (refreshStructures) {
            await refreshStructures()
          }
          toast.success('Columna eliminada exitosamente', {
            duration: 2000,
            position: 'top-center'
          })
        } catch (error) {
          console.error('Error al eliminar columna:', error)
          toast.error('Error al eliminar la columna. Intenta nuevamente.', {
            duration: 3000,
            position: 'top-center'
          })
        }
      }
    )
  }

  // Navegación con teclado
  const handleKeyDown = (e, studentIndex, evalTypeIndex) => {
    if (e.key === 'Tab') {
      e.preventDefault()

      let nextStudentIndex = studentIndex
      let nextEvalTypeIndex = evalTypeIndex

      if (e.shiftKey) {
        nextStudentIndex = studentIndex - 1
        if (nextStudentIndex < 0) {
          nextStudentIndex = filteredStudents.length - 1
          nextEvalTypeIndex = evalTypeIndex - 1
          if (nextEvalTypeIndex < 0) {
            nextEvalTypeIndex = evaluationTypes.length - 1
          }
        }
      } else {
        nextStudentIndex = studentIndex + 1
        if (nextStudentIndex >= filteredStudents.length) {
          nextStudentIndex = 0
          nextEvalTypeIndex = evalTypeIndex + 1
          if (nextEvalTypeIndex >= evaluationTypes.length) {
            nextEvalTypeIndex = 0
          }
        }
      }

      const nextStudent = filteredStudents[nextStudentIndex]
      const nextEvalType = evaluationTypes[nextEvalTypeIndex]
      if (nextStudent && nextEvalType) {
        const nextInputId = `grade-${nextStudent.id}-${nextEvalType.id}`
        const nextInput = document.getElementById(nextInputId)
        if (nextInput) {
          nextInput.focus()
          nextInput.select()
        }
      }
    }

    // Navegación con flechas
    const navigateWithArrow = (direction) => {
      e.preventDefault()
      let nextStudentIndex = studentIndex
      let nextEvalTypeIndex = evalTypeIndex

      if (direction === 'down') {
        nextStudentIndex = Math.min(studentIndex + 1, filteredStudents.length - 1)
      } else if (direction === 'up') {
        nextStudentIndex = Math.max(studentIndex - 1, 0)
      } else if (direction === 'right') {
        nextEvalTypeIndex = Math.min(evalTypeIndex + 1, evaluationTypes.length - 1)
      } else if (direction === 'left') {
        nextEvalTypeIndex = Math.max(evalTypeIndex - 1, 0)
      }

      const nextStudent = filteredStudents[nextStudentIndex]
      const nextEvalType = evaluationTypes[nextEvalTypeIndex]
      if (nextStudent && nextEvalType && (nextStudentIndex !== studentIndex || nextEvalTypeIndex !== evalTypeIndex)) {
        const nextInputId = `grade-${nextStudent.id}-${nextEvalType.id}`
        const nextInput = document.getElementById(nextInputId)
        if (nextInput) {
          nextInput.focus()
          nextInput.select()
        }
      }
    }

    if (e.key === 'ArrowDown') navigateWithArrow('down')
    if (e.key === 'ArrowUp') navigateWithArrow('up')
    if (e.key === 'ArrowRight') navigateWithArrow('right')
    if (e.key === 'ArrowLeft') navigateWithArrow('left')
  }

  // Exportar a Excel
  const exportToExcel = () => {
    try {
      const excelData = []

      excelData.push(['REGISTRO DE NOTAS - ' + selectedBimester + '° BIMESTRE'])
      excelData.push(['Curso:', selectedCourse || 'Todos los cursos'])
      excelData.push(['Docente:', user?.name || 'N/A'])
      excelData.push(['Fecha:', new Date().toLocaleDateString('es-PE')])
      excelData.push([])

      const headers = ['N°', 'APELLIDOS Y NOMBRES', 'DNI']
      evaluationTypes.forEach(evalType => {
        const subsWithCustom = getSubcategoriasWithCustom(evalType.id, evalType.subcategorias)
        subsWithCustom.forEach(sub => {
          headers.push(sub.name)
        })
        headers.push(`PROM ${evalType.name}`)
      })
      excelData.push(headers)

      filteredStudents.forEach((student, index) => {
        const row = [
          index + 1,
          `${student.last_names}, ${student.first_names}`,
          student.dni
        ]

        evaluationTypes.forEach(evalType => {
          const subsWithCustom = getSubcategoriasWithCustom(evalType.id, evalType.subcategorias)
          subsWithCustom.forEach(sub => {
            const gradeData = grades[student.id]?.[sub.id]
            const average = gradeData?.average || gradeData
            row.push(typeof average === 'number' ? average : '')
          })
          const compAvg = calculateCompetenceAverage(student.id, evalType.id)
          row.push(compAvg || '')
        })

        excelData.push(row)
      })

      excelData.push([])
      excelData.push(['RESUMEN ESTADÍSTICO'])
      if (stats) {
        excelData.push(['Promedio General:', stats.promedio])
        excelData.push(['Aprobados:', stats.aprobados])
        excelData.push(['Desaprobados:', stats.desaprobados])
        excelData.push(['Mejor Nota:', stats.mejorNota])
        excelData.push(['Nota Más Baja:', stats.peorNota])
      }

      const ws = XLSX.utils.aoa_to_sheet(excelData)

      const colWidths = [
        { wch: 4 },
        { wch: 35 },
        { wch: 10 }
      ]

      evaluationTypes.forEach(evalType => {
        const subsWithCustom = getSubcategoriasWithCustom(evalType.id, evalType.subcategorias)
        subsWithCustom.forEach(() => {
          colWidths.push({ wch: 12 })
        })
        colWidths.push({ wch: 14 })
      })

      ws['!cols'] = colWidths

      const wb = XLSX.utils.book_new()
      const sheetName = `Notas_Bim${selectedBimester}`
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      const fileName = `Registro_Notas_${selectedCourse || 'General'}_Bim${selectedBimester}_${new Date().toISOString().split('T')[0]}.xlsx`
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      showDialog(
        'error',
        'Error al exportar',
        'Error al exportar el archivo Excel. Por favor intenta nuevamente.'
      )
    }
  }

  // Importar desde Excel
  const importFromExcel = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

          const newGrades = {}
          let headerRowIndex = -1

          jsonData.forEach((row, index) => {
            if (row[0] === 'N°' || row[0] === 'Nº' || row[0] === '#') {
              headerRowIndex = index
            }
          })

          if (headerRowIndex === -1) {
            showDialog(
              'error',
              'Formato no reconocido',
              'Formato de Excel no reconocido. Asegúrese de usar el formato correcto.'
            )
            return
          }

          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i]

            if (!row[0] || row[0] === 'RESUMEN ESTADÍSTICO') break

            const dni = row[2]?.toString()
            const student = mockStudents.find(s => s.dni === dni)

            if (student) {
              newGrades[student.id] = {}

              let colIndex = 3
              evaluationTypes.forEach(evalType => {
                if (row[colIndex] !== undefined && row[colIndex] !== '') {
                  newGrades[student.id][evalType.id] = parseFloat(row[colIndex]) || 0
                }
                colIndex++
              })
            }
          }

          setGrades(prevGrades => ({
            ...prevGrades,
            ...newGrades
          }))

          showDialog(
            'success',
            'Importación exitosa',
            `Se importaron las notas de ${Object.keys(newGrades).length} estudiantes exitosamente.`
          )

        } catch (error) {
          console.error('Error al importar Excel:', error)
          showDialog(
            'error',
            'Error al importar',
            'Error al leer el archivo Excel. Verifique el formato del archivo.'
          )
        }
      }

      reader.readAsArrayBuffer(file)
    }

    event.target.value = ''
  }

  return {
    showAddColumnModal,
    setShowAddColumnModal,
    columnForm,
    setColumnForm,
    openAddColumnModal,
    handleAddColumn,
    handleDeleteColumn,
    handleKeyDown,
    exportToExcel,
    importFromExcel,
    // Estados del diálogo
    dialog,
    closeDialog
  }
}
