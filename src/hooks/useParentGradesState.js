import { useState, useEffect } from 'react'
import { usePaymentsStore } from '../stores/paymentsStore'
import { generatePDFBlob } from '../components/parent/GradesPDF'
import { parentStudentRelationsService } from '../services/parentStudentRelationsService'
import gradesService from '../services/gradesService'
import evaluationStructuresService from '../services/evaluationStructuresService'
import { convertGradeToNumeric, convertAverageValueToLetter } from '../utils/gradeConversion'
import { getGradingScalesStore } from '../stores/gradingScalesStore'

/**
 * Obtiene un color para una competencia basado en su índice
 * @param {number} index - Índice de la competencia
 * @returns {string} - Clase de color Tailwind
 */
const getCompetenciaColor = (index) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500'
  ]
  return colors[index % colors.length]
}

/**
 * Transforma el array de calificaciones del backend al formato esperado por el frontend
 * @param {Array} gradesArray - Array de calificaciones individuales del backend
 * @param {Object} evaluationStructuresMap - Mapa de estructuras de evaluación por courseId
 * @param {Object} averagesMap - Mapa de promedios calculados por courseId_categoryId
 * @returns {Object} - Objeto con subjects, quarterAverage, behaviorGrades
 */
const transformGradesToSubjects = (gradesArray, evaluationStructuresMap = {}, averagesMap = {}) => {
  if (!Array.isArray(gradesArray) || gradesArray.length === 0) {
    return {
      subjects: [],
      quarterAverage: 0,
      behaviorGrades: {
        discipline: 'N/A',
        responsibility: 'N/A',
        respect: 'N/A',
        cooperation: 'N/A'
      }
    }
  }

  // Función auxiliar para buscar nombre de subcategoría
  const getSubcategoryName = (courseId, categoryId, subcategoryId) => {
    const structure = evaluationStructuresMap[courseId]
    if (!structure || !structure.competencies) {
      return `Evaluación ${subcategoryId}`
    }

    // Buscar en el formato {competencias: [...]}
    const competencias = structure.competencies.competencias || structure.competencies
    if (!Array.isArray(competencias)) {
      return `Evaluación ${subcategoryId}`
    }

    // Buscar la competencia que coincida con categoryId
    const competencia = competencias.find(comp => {
      const compId = comp.id || `COMP_${(comp.nombreCompetencia || comp.name || '').replace(/\s+/g, '_').toUpperCase()}`
      return compId === categoryId
    })

    if (!competencia || !competencia.subcategorias) {
      return `Evaluación ${subcategoryId}`
    }

    // Buscar la subcategoría por ID
    const subcategoria = competencia.subcategorias.find(sub => sub.id === subcategoryId)
    if (subcategoria && subcategoria.name) {
      return subcategoria.name
    }

    return `Evaluación ${subcategoryId}`
  }

  // Agrupar calificaciones por curso y competencia
  const courseMap = {}
  const competenciaMap = {}

  gradesArray.forEach(grade => {
    const courseId = grade.course_id
    const courseName = grade.course_name || `Curso ${courseId}`
    const categoryId = grade.category_id || 'general'
    const subcategoryId = grade.subcategory_id

    // Construir nombre completo del profesor
    const teacherName = grade.teacher_first_names && grade.teacher_last_names
      ? `${grade.teacher_first_names} ${grade.teacher_last_names}`
      : grade.teacher_name || 'Sin asignar'

    if (!courseMap[courseId]) {
      courseMap[courseId] = {
        id: courseId,
        name: courseName,
        teacher: teacherName,
        average: 0,
        grades: [],
        observations: [],
        competencias: {},
        evaluations: []
      }
    }

    // Agregar el valor de la calificación
    // Detectar si es grading_system literal y convertir correctamente
    const originalValue = grade.value
    const gradingSystem = grade.grading_system || 'numeric'
    let gradeValue

    if (gradingSystem === 'literal' && ['A', 'B', 'C', 'D', 'AD'].includes(String(originalValue).toUpperCase())) {
      // Es una nota literal, convertir usando la escala correcta
      gradeValue = convertGradeToNumeric(originalValue, gradingSystem)
    } else {
      // Es una nota numérica o no reconocida
      gradeValue = parseFloat(originalValue) || 0
    }

    courseMap[courseId].grades.push(gradeValue)

    // Agregar observación si existe
    if (grade.observation && grade.observation.trim()) {
      courseMap[courseId].observations.push(grade.observation)
    }

    // Crear estructura de competencias
    if (!courseMap[courseId].competencias[categoryId]) {
      courseMap[courseId].competencias[categoryId] = {
        id: categoryId,
        name: `Competencia ${Object.keys(courseMap[courseId].competencias).length + 1}`,
        average: null,
        grades: [],
        color: getCompetenciaColor(Object.keys(courseMap[courseId].competencias).length)
      }
    }

    // Agregar calificación a la competencia
    courseMap[courseId].competencias[categoryId].grades.push(gradeValue)

    // Obtener nombre y peso de la subcategoría desde la estructura
    const subcategoryName = getSubcategoryName(courseId, categoryId, subcategoryId)

    // Obtener el peso de la estructura de evaluación
    let weight = 0
    const structure = evaluationStructuresMap[courseId]
    if (structure && structure.competencies) {
      const competencias = structure.competencies.competencias || structure.competencies
      if (Array.isArray(competencias)) {
        const competencia = competencias.find(comp => {
          const compId = comp.id || `COMP_${(comp.nombreCompetencia || comp.name || '').replace(/\s+/g, '_').toUpperCase()}`
          return compId === categoryId
        })
        if (competencia && competencia.subcategorias) {
          const subcategoria = competencia.subcategorias.find(sub => sub.id === subcategoryId)
          if (subcategoria && subcategoria.peso !== undefined) {
            weight = subcategoria.peso
          }
        }
      }
    }

    // Crear evaluación individual
    const evaluation = {
      id: grade.id,
      name: subcategoryName,
      competenciaId: categoryId,
      grade: gradeValue,
      gradeDisplay: gradingSystem === 'literal' ? String(originalValue).toUpperCase() : gradeValue, // Mostrar letra o número
      gradingSystem: gradingSystem,
      registration_date: grade.registration_date || grade.date_time_registration,
      comment: grade.observation || null,
      weight: weight || 0
    }

    courseMap[courseId].evaluations.push(evaluation)
  })

  // Calcular promedios por curso y crear array de subjects
  const subjects = Object.values(courseMap).map(course => {
    // Usar promedios del backend en lugar de calcular en frontend
    const competenciasArray = Object.values(course.competencias).map(comp => {
      const averageKey = `${course.id}_${comp.id}`
      const backendAverage = averagesMap[averageKey]

      if (backendAverage !== undefined) {
        const numericValue = parseFloat(backendAverage.value)
        const gradingSystem = backendAverage.grading_system

        // Si es sistema literal, convertir el número a letra
        let displayValue = numericValue
        if (gradingSystem === 'literal') {
          displayValue = convertAverageValueToLetter(numericValue, gradingSystem)
        }

        return {
          ...comp,
          average: numericValue, // Mantener valor numérico para cálculos
          averageDisplay: displayValue, // Valor para mostrar (letra o número)
          gradingSystem: gradingSystem
        }
      } else {
        return {
          ...comp,
          average: null,
          averageDisplay: null
        }
      }
    })

    return {
      ...course,
      trend: 'stable', // TODO: Calcular tendencia comparando con bimestres anteriores
      // Combinar observaciones en una sola string o tomar la última
      observations: course.observations.length > 0
        ? course.observations.join(' | ')
        : null,
      competencias: competenciasArray // Convertir objeto a array
    }
  })

  return {
    subjects
    // NOTA: La sección de comportamiento fue eliminada porque los datos
    // no están implementados en el backend (student_behaviors no tiene
    // los campos responsibility, respect, cooperation)
  }
}

/**
 * Hook para gestión de calificaciones vista padre
 * Integrado con APIs reales del backend
 */
export const useParentGradesState = (user) => {
  const {
    getStudentPaymentStatus,
    initialize: initializePayments,
    isLoading: paymentsLoading
  } = usePaymentsStore()

  // Datos reales desde backend
  const [children, setChildren] = useState([])
  const [childrenGrades, setChildrenGrades] = useState({})

  // Períodos académicos (TODO: Obtener desde backend)
  const periods = [
    { id: 'bimester-1', name: 'I Bimestre', startDate: '2025-03-01', endDate: '2025-05-15' },
    { id: 'bimester-2', name: 'II Bimestre', startDate: '2025-05-16', endDate: '2025-07-31' },
    { id: 'bimester-3', name: 'III Bimestre', startDate: '2025-08-01', endDate: '2025-10-15' },
    { id: 'bimester-4', name: 'IV Bimestre', startDate: '2025-10-16', endDate: '2025-12-20' }
  ]

  const [selectedChild, setSelectedChild] = useState(children[0]?.id || '')
  const [selectedPeriod, setSelectedPeriod] = useState('bimester-1')
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [viewMode, setViewMode] = useState('detailed')
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  // Cargar hijos del padre
  useEffect(() => {
    const loadChildren = async () => {
      if (!user?.id) {
        return
      }

      try {
        // Comparación case-insensitive para el rol (puede ser "padre" o "Padre")
        const parentId = user.parentId || (user.rol?.toLowerCase() === 'padre' ? user.id : null)

        if (!parentId) {
          return
        }

        const studentsData = await parentStudentRelationsService.getStudentsByParent(parentId)

        setChildren(studentsData || [])

        if (studentsData && studentsData.length > 0) {
          setSelectedChild(studentsData[0].id)
        }
      } catch (error) {
        setChildren([])
      }
    }

    loadChildren()
    initializePayments()
  }, [user])

  // Cargar calificaciones del hijo seleccionado
  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedChild || !selectedPeriod) {
        return
      }

      try {
        // Extraer número de bimestre del período seleccionado
        const bimesterNumber = parseInt(selectedPeriod.split('-')[1])

        const filters = {
          student_id: selectedChild,
          quarter: bimesterNumber,
          academic_year: new Date().getFullYear()
        }

        // Usar getAllCompetencyGrades en lugar de getAllGrades (deprecado)
        const gradesArray = await gradesService.getAllCompetencyGrades(filters)

        // Obtener grado del estudiante (del primer registro de calificaciones)
        const studentGradeId = gradesArray.length > 0 ? gradesArray[0].grade_id : null

        // Obtener IDs de cursos únicos
        const uniqueCourseIds = [...new Set(gradesArray.map(g => g.course_id))]

        // Cargar estructuras de evaluación para cada curso
        const evaluationStructuresMap = {}
        for (const courseId of uniqueCourseIds) {
          try {
            const structures = await evaluationStructuresService.getAll({
              course_id: courseId,
              grade_id: studentGradeId,
              quarter: bimesterNumber,
              status: 'active'
            })

            if (structures && structures.length > 0) {
              evaluationStructuresMap[courseId] = structures[0]
            }
          } catch (structError) {
            // Error cargando estructura
          }
        }

        // Obtener promedios calculados desde el backend
        let averagesMap = {}
        try {
          const averagesResponse = await gradesService.getCompetencyAverages({
            student_id: selectedChild,
            quarter: bimesterNumber
          })

          // Crear mapa de promedios por courseId + categoryId
          if (averagesResponse && Array.isArray(averagesResponse)) {
            averagesResponse.forEach(avg => {
              const key = `${avg.course_id}_${avg.category_id}`
              averagesMap[key] = {
                value: avg.average_value,
                grading_system: avg.grading_system,
                calculation_details: avg.calculation_details
              }
            })
          }
        } catch (avgError) {
          // Error obteniendo promedios
        }

        // Transformar array de calificaciones al formato esperado por el frontend
        const transformedGrades = transformGradesToSubjects(gradesArray, evaluationStructuresMap, averagesMap)

        // Usar String(selectedChild) para normalizar la clave
        setChildrenGrades(prev => ({
          ...prev,
          [String(selectedChild)]: transformedGrades
        }))
      } catch (error) {
        console.error('Error cargando calificaciones:', error)
        // Asignar objeto con estructura correcta en vez de array vacío
        setChildrenGrades(prev => ({
          ...prev,
          [String(selectedChild)]: {
            subjects: [],
            behaviorGrades: {
              discipline: 'N/A',
              responsibility: 'N/A',
              respect: 'N/A',
              cooperation: 'N/A'
            }
          }
        }))
      }
    }

    loadGrades()
  }, [selectedChild, selectedPeriod])

  useEffect(() => {
    if (!selectedChild && children.length > 0) {
      setSelectedChild(children[0].id)
    }
  }, [selectedChild, children])

  useEffect(() => {
    if (selectedChild && !paymentsLoading) {
      const status = getStudentPaymentStatus(selectedChild)
      setPaymentStatus(status)
    }
  }, [selectedChild, paymentsLoading, getStudentPaymentStatus])

  const selectedChildData = children.find(child => String(child.id) === String(selectedChild))
  // Usar String para normalizar la clave y evitar mismatch de tipos
  const selectedChildGrades = selectedChild ? childrenGrades[String(selectedChild)] : null
  const selectedPeriodData = periods.find(period => period.id === selectedPeriod)

  const toggleSubject = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId)
  }

  const handleDownloadPDF = async () => {
    try {
      // Usar comparación flexible para evitar mismatch de tipos (string vs number)
      const currentChild = children.find(c => String(c.id) === String(selectedChild))
      const currentPeriod = periods.find(p => p.id === selectedPeriod)

      // Validación mejorada: verificar que existan subjects con contenido
      if (!currentChild) {
        alert('No hay estudiante seleccionado')
        return
      }

      if (!selectedChildGrades || !selectedChildGrades.subjects || selectedChildGrades.subjects.length === 0) {
        alert('No hay calificaciones registradas para este período')
        return
      }

      const pdfBlob = await generatePDFBlob(currentChild, selectedChildGrades, currentPeriod)
      const url = URL.createObjectURL(pdfBlob)

      setPdfUrl({
        url: url,
        fileName: `Boleta_${currentChild.name.replace(/\s+/g, '_')}_${currentPeriod.name.replace(/\s+/g, '_')}.pdf`
      })
      setShowDownloadModal(true)
    } catch (error) {
      alert(`Error al generar el PDF: ${error.message}`)
    }
  }

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl.url
      link.download = pdfUrl.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setShowDownloadModal(false)
    }
  }

  const closePDFModal = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl.url)
    setPdfUrl(null)
    setShowDownloadModal(false)
  }

  // Helper functions - usa store SSOT para colores dinámicos
  // Obtiene levelId del estudiante seleccionado para usar configuración correcta
  const getGradeColor = (grade, levelIdOverride = null) => {
    if (grade === null || grade === undefined) return 'text-gray-400'

    const store = getGradingScalesStore()
    // Usar levelId del estudiante seleccionado o el override proporcionado
    const levelId = levelIdOverride || selectedChildData?.level_id || null

    // Obtener el tipo de escala configurada para el nivel
    const scaleType = store.getScaleType(levelId)

    // Si es un número, determinar cómo procesarlo según la configuración
    if (typeof grade === 'number') {
      if (scaleType === 'letters') {
        // Para escala literal, convertir a letra usando la config del nivel
        const letter = store.convertNumericToLetter(grade, levelId)
        const hexColor = store.getGradeColor(letter, levelId)
        return hexColorToTextClass(hexColor)
      } else {
        // Para escala numérica, obtener color directamente
        const hexColor = store.getGradeColor(grade, levelId)
        return hexColorToTextClass(hexColor)
      }
    }

    // Si ya es letra, obtener color directamente usando configuración del nivel
    const hexColor = store.getGradeColor(grade, levelId)
    return hexColorToTextClass(hexColor)
  }

  // Convertir color hex a clase Tailwind
  const hexColorToTextClass = (hexColor) => {
    const colorMap = {
      '#22c55e': 'text-green-600',
      '#3b82f6': 'text-blue-600',
      '#eab308': 'text-yellow-600',
      '#ef4444': 'text-red-600',
      '#9ca3af': 'text-gray-400'
    }
    return colorMap[hexColor] || 'text-gray-400'
  }

  const getTrendIcon = (trend) => {
    const icons = {
      up: 'text-green-500',
      down: 'text-red-500 transform rotate-180',
      stable: 'text-gray-400 transform rotate-90'
    }
    return icons[trend] || icons.stable
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return {
    children,
    periods,
    selectedChild,
    setSelectedChild,
    selectedPeriod,
    setSelectedPeriod,
    expandedSubject,
    viewMode,
    setViewMode,
    paymentStatus,
    paymentsLoading,
    selectedChildData,
    selectedChildGrades,
    selectedPeriodData,
    pdfUrl,
    showDownloadModal,
    toggleSubject,
    handleDownloadPDF,
    downloadPDF,
    closePDFModal,
    getGradeColor,
    getTrendIcon,
    formatDate
  }
}
