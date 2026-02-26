import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Hook para gestionar estructuras de evaluación (CRUD)
 */
export const useEvaluationStructure = (
  selectedAcademicYear,
  selectedCourse,
  selectedGrade,
  selectedBimester,
  setSelectedBimester,
  evaluationStructures,
  createEvaluationStructure,
  updateEvaluationStructure,
  initializeGrades,
  grades,
  courses,
  academicYears
) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStructure, setEditingStructure] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const [structureData, setStructureData] = useState({
    name: '',
    description: '',
    competencias: []
  })
  const [formGrade, setFormGrade] = useState('')
  const [selectedNivel, setSelectedNivel] = useState('')
  const [applyToAllGrades, setApplyToAllGrades] = useState(true)
  const [selectedGrades, setSelectedGrades] = useState([])

  const handleNewStructureClick = () => {
    setValidationError(null)

    // Validar solo filtros necesarios (sin grado)
    if (!selectedAcademicYear || !selectedCourse || !selectedBimester) {
      setValidationError({
        type: 'warning',
        title: 'Filtros incompletos',
        message: 'Debes seleccionar Año Lectivo, Curso y Bimestre antes de crear una estructura de evaluación.'
      })
      setTimeout(() => setValidationError(null), 5000)
      return
    }

    // No verificamos duplicados aquí porque el grado se selecciona en el modal

    setShowCreateModal(true)
    setEditingStructure(null)
    setStructureData({ name: '', description: '', competencias: [] })
    setFormGrade('')
    setApplyToAllGrades(true)
    setSelectedGrades([])
  }

  const validateStructure = () => {
    const errors = []
    if (!selectedAcademicYear) errors.push('Debe seleccionar un año lectivo')
    if (!selectedCourse) errors.push('Debe seleccionar un curso')
    if (!selectedBimester) errors.push('Debe seleccionar un bimestre')
    // Solo validar grados seleccionados en modo CREAR (no en edición)
    if (!editingStructure && selectedGrades.length === 0) {
      errors.push('Debe seleccionar al menos un grado')
    }
    if (structureData.competencias.length === 0) {
      errors.push('Debe agregar al menos una competencia')
    }
    return errors
  }

  const saveStructure = async () => {
    const errors = validateStructure()
    if (errors.length > 0) {
      setValidationError({
        type: 'error',
        title: 'Errores de validación',
        message: errors.join(' • ')
      })
      return
    }

    setValidationError(null)

    try {
      const courseName = courses?.find(c => c.id === selectedCourse)?.name || 'Curso'
      const targetGradeIds = selectedGrades

      // Determinar sistema de calificación según el grado (en edición usa el grade existente)
      const gradeIdForSystem = editingStructure ? editingStructure.grade_id : targetGradeIds[0]
      const firstGrade = grades?.find(g => g.id === gradeIdForSystem)
      const levelId = firstGrade?.level_id

      // Mapeo de level_id a sistema de calificación
      const gradingSystemMap = {
        1: 'literal',      // Inicial: AD, A, B, C
        2: 'literal',      // Primaria: AD, A, B, C
        3: 'vigesimal',    // Secundaria: 0-20
        4: 'vigesimal'     // Bachiller: 0-20 (por defecto)
      }
      const systemToUse = gradingSystemMap[levelId] || 'literal'

      if (editingStructure) {
        const gradeName = grades?.find(g => g.id === editingStructure.grade_id)?.name || 'Grado'
        const generatedName = `${gradeName} - ${courseName} - Bimestre ${selectedBimester}`

        const structurePayload = {
          course_id: selectedCourse,
          grade_id: editingStructure.grade_id,
          teacher_id: null,
          quarter: parseInt(selectedBimester),
          name: generatedName,
          description: structureData.description,
          competencias: structureData.competencias,
          gradingSystem: systemToUse,  // ✅ Ahora usa el sistema correcto según nivel
          academic_year: new Date().getFullYear(),
          añoLectivoId: selectedAcademicYear
        }

        await updateEvaluationStructure(editingStructure.id, structurePayload)
      } else {
        for (const gradeId of targetGradeIds) {
          const gradeName = grades?.find(g => g.id === gradeId)?.name || 'Grado'
          const generatedName = `${gradeName} - ${courseName} - Bimestre ${selectedBimester}`

          const structurePayload = {
            course_id: selectedCourse,
            grade_id: gradeId,
            teacher_id: null,
            quarter: parseInt(selectedBimester),
            name: generatedName,
            description: structureData.description,
            competencias: structureData.competencias,
            gradingSystem: systemToUse,  // ✅ Ahora usa el sistema correcto según nivel
            academic_year: new Date().getFullYear(),
            añoLectivoId: selectedAcademicYear
          }

          await createEvaluationStructure(structurePayload)
        }
      }

      setShowCreateModal(false)
      setEditingStructure(null)
      setStructureData({ name: '', description: '', competencias: [] })
      setValidationError(null)
      initializeGrades()
    } catch (error) {
      setValidationError({
        type: 'error',
        title: 'Error al guardar',
        message: error.message
      })
    }
  }

  const editStructure = (structure) => {
    setEditingStructure(structure)
    setStructureData({
      name: structure.name || '',
      description: structure.description || '',
      competencias: JSON.parse(JSON.stringify(structure.competencias || structure.categorias || []))
    })
    setFormGrade(structure.grade_id || '')
    setSelectedBimester(structure.quarter.toString())
    setShowCreateModal(true)
  }

  const exportStructure = (structure) => {
    // Obtener nombres del curso, grado y año académico
    const courseName = courses?.find(c => c.id === structure.course_id)?.name || 'Curso'
    const gradeData = grades?.find(g => g.id === structure.grade_id)
    const gradeName = gradeData?.name || 'Grado'
    const yearData = academicYears?.find(y => y.id === structure.academic_year_id || y.año === structure.academic_year)
    const yearName = yearData?.name || `Año ${structure.academic_year}`
    const competencias = structure.competencias || structure.categorias || []
    const fileName = `Rubrica_${courseName}_${gradeName}_B${structure.quarter}`.replace(/\s+/g, '_')

    // Crear documento PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Colores
    const primaryColor = [37, 99, 235] // Azul
    const headerBg = [241, 245, 249] // Gris claro

    // Encabezado
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('RÚBRICA DE EVALUACIÓN', pageWidth / 2, 15, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${courseName} - ${gradeName}`, pageWidth / 2, 23, { align: 'center' })
    doc.text(`${structure.quarter}° Bimestre - ${yearName}`, pageWidth / 2, 30, { align: 'center' })

    // Información general
    let yPos = 45

    doc.setTextColor(0, 0, 0)
    doc.setFillColor(...headerBg)
    doc.rect(14, yPos - 5, pageWidth - 28, 25, 'F')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Información General', 18, yPos + 2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const infoY = yPos + 10
    doc.text(`Curso: ${courseName}`, 18, infoY)
    doc.text(`Grado: ${gradeName}`, 80, infoY)
    doc.text(`Bimestre: ${structure.quarter}°`, 140, infoY)
    doc.text(`Año Lectivo: ${yearName}`, 18, infoY + 6)
    doc.text(`Sistema: ${structure.grading_system === 'literal' ? 'Literal (AD, A, B, C)' : 'Numérico (0-20)'}`, 80, infoY + 6)

    yPos = infoY + 20

    // Título de competencias
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text(`Competencias (${competencias.length})`, 14, yPos)

    yPos += 8

    // Tabla de competencias
    if (competencias.length > 0) {
      const tableData = competencias.map((comp, index) => [
        comp.numero || index + 1,
        comp.nombreCompetencia || `Competencia ${comp.numero || index + 1}`,
        comp.description || '-'
      ])

      autoTable(doc, {
        startY: yPos,
        head: [['N°', 'Competencia', 'Descripción']],
        body: tableData,
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 14, right: 14 }
      })

      yPos = doc.lastAutoTable.finalY + 10
    } else {
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('No hay competencias configuradas', pageWidth / 2, yPos + 10, { align: 'center' })
      yPos += 25
    }

    // Pie de página
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(200, 200, 200)
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20)

    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE')}`, 14, pageHeight - 12)
    doc.text('Sistema de Gestión Educativa', pageWidth - 14, pageHeight - 12, { align: 'right' })

    // Descargar PDF
    doc.save(`${fileName}.pdf`)
  }

  return {
    showCreateModal,
    setShowCreateModal,
    editingStructure,
    validationError,
    setValidationError,
    structureData,
    setStructureData,
    formGrade,
    setFormGrade,
    selectedNivel,
    setSelectedNivel,
    applyToAllGrades,
    setApplyToAllGrades,
    selectedGrades,
    setSelectedGrades,
    handleNewStructureClick,
    saveStructure,
    editStructure,
    exportStructure
  }
}
