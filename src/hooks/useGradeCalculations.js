import { useMemo, useCallback } from 'react'
import { useGradesStore } from '../stores/gradesStore.jsx'

/**
 * Hook personalizado para cálculos relacionados con calificaciones
 * Incluye promedios, estructura de evaluación y filtrado de estudiantes
 */
export const useGradeCalculations = ({
  selectedCourse,
  selectedQuarter,
  selectedGrade,
  selectedSection,
  selectedLevel, // ID o nombre del nivel educativo
  searchTerm,
  students,
  courses,
  evaluationStructures,
  getGradesByStudentAndCourse,
  getGradingSystemForCourse,
  // Función opcional de conversión desde useGradingScales
  convertLetterToNumeric = null
}) => {
  // ==================== SELECTED COURSE DATA ====================
  const selectedCourseData = useMemo(() => {
    return courses?.find(c => c.id === selectedCourse)
  }, [courses, selectedCourse])

  // ==================== EVALUATION STRUCTURE ====================
  const currentEvaluationStructure = useMemo(() => {
    if (!selectedCourse || !evaluationStructures) {
      return null
    }

    // Find the evaluation structure for current course and quarter
    const structure = evaluationStructures.find(s =>
      s.course_id === selectedCourse &&
      s.quarter === parseInt(selectedQuarter)
    )

    return structure
  }, [evaluationStructures, selectedCourse, selectedQuarter])

  // ==================== GRADING SYSTEM ====================
  const gradingSystem = useMemo(() => {
    // Determinar según el NIVEL educativo (selectedLevel)
    // Inicial (1) y Primaria (2) usan sistema literal (A, B, C, D)
    // Secundaria (3) y Bachiller (4) usan sistema vigesimal (0-20)
    if (selectedLevel === 1 || selectedLevel === 2 ||
        selectedLevel === 'Inicial' || selectedLevel === 'Primaria') {
      return 'literal'
    }
    // Secundaria y Bachiller usan vigesimal
    return 'vigesimal'
  }, [selectedLevel])

  // ==================== UNIQUE CATEGORIES (COMPETENCIAS) ====================
  const uniqueCategories = useMemo(() => {
    if (!currentEvaluationStructure) {
      // Fallback to default structure if no evaluation structure is configured
      const fallbackCategories = [
        {
          id: `comp-competencia1-${selectedCourse}`,
          numero: 1,
          name: 'Competencia 1',
          nombreCompetencia: 'Resuelve problemas de cantidad',
          peso: 25,
          description: 'Capacidad para resolver problemas matemáticos de cantidad'
        },
        {
          id: `comp-competencia2-${selectedCourse}`,
          numero: 2,
          name: 'Competencia 2',
          nombreCompetencia: 'Resuelve problemas de regularidad',
          peso: 25,
          description: 'Capacidad para identificar y resolver patrones'
        },
        {
          id: `comp-competencia3-${selectedCourse}`,
          numero: 3,
          name: 'Competencia 3',
          nombreCompetencia: 'Resuelve problemas de forma',
          peso: 25,
          description: 'Capacidad para trabajar con formas geométricas'
        },
        {
          id: `comp-competencia4-${selectedCourse}`,
          numero: 4,
          name: 'Competencia 4',
          nombreCompetencia: 'Gestiona datos e incertidumbre',
          peso: 25,
          description: 'Capacidad para analizar e interpretar datos'
        }
      ]
      return fallbackCategories
    }

    // Use configured evaluation structure - support both 'competencias' and 'categorias'
    const items = currentEvaluationStructure.competencias || currentEvaluationStructure.categorias || []

    const structureCompetences = items.map((item, index) => ({
      id: item.id || `comp-${(item.name || '').toLowerCase().replace(/\s+/g, '')}-${selectedCourse}`,
      numero: item.numero || index + 1,
      name: item.name || `Competencia ${item.numero || index + 1}`,
      nombreCompetencia: item.nombreCompetencia || item.name,
      peso: item.peso,
      description: item.description || ''
    }))

    return structureCompetences
  }, [currentEvaluationStructure, selectedCourse])

  // ==================== CALCULATE STUDENT AVERAGE ====================
  const calculateStudentAverage = useCallback((studentId, courseId, bimestre) => {
    const { getCompetenceGrades } = useGradesStore.getState()

    if (!uniqueCategories || uniqueCategories.length === 0) return 0

    let weightedSum = 0
    let totalWeight = 0
    let hasAnyGrade = false

    // Recorrer cada competencia y calcular su promedio ponderado
    uniqueCategories.forEach(category => {
      // Obtener las notas de esta competencia para este estudiante
      const competenceGrades = getCompetenceGrades(studentId, courseId, category.id, parseInt(bimestre))

      if (competenceGrades && competenceGrades.length > 0) {
        hasAnyGrade = true

        // Calcular el promedio de esta competencia
        let competenceAverage = 0

        if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
          // Sistema vigesimal: calcular promedio numérico
          const validGrades = competenceGrades.filter(g => (g.value || g.valor) && !isNaN(parseFloat(g.value || g.valor)))
          if (validGrades.length > 0) {
            const sum = validGrades.reduce((acc, g) => acc + parseFloat(g.value || g.valor), 0)
            competenceAverage = sum / validGrades.length
          }
        } else {
          // Sistema literal: convertir a numérico para cálculo
          // Valores consistentes con la configuración central: A=4, B=3, C=2, D=1
          const defaultLetterToNumber = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
          const validGrades = competenceGrades.filter(g => {
            const val = g.value || g.valor
            return val && (convertLetterToNumeric || defaultLetterToNumber[val])
          })
          if (validGrades.length > 0) {
            const sum = validGrades.reduce((acc, g) => {
              const val = g.value || g.valor
              if (convertLetterToNumeric) {
                return acc + (convertLetterToNumeric(val) || 0)
              }
              return acc + (defaultLetterToNumber[val] || 0)
            }, 0)
            competenceAverage = sum / validGrades.length
          }
        }

        // Aplicar el peso de la competencia al promedio
        const categoryWeight = category.peso || 0
        weightedSum += competenceAverage * (categoryWeight / 100)
        totalWeight += categoryWeight
      }
    })

    // Si no hay notas, retornar 0
    if (!hasAnyGrade || totalWeight === 0) return 0

    // Normalizar el promedio ponderado por el peso total calificado
    return weightedSum / (totalWeight / 100)
  }, [uniqueCategories, gradingSystem])

  // ==================== GET COMPETENCE AVERAGE ====================
  const getCompetenceAverage = useCallback((studentId, courseId, categoryId, bimestre) => {
    const { getCompetenceGrades } = useGradesStore.getState()
    const grades = getCompetenceGrades(studentId, courseId, categoryId, parseInt(bimestre))

    if (!grades || grades.length === 0) return null

    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
      const validGrades = grades.filter(g => (g.value || g.valor) && !isNaN(parseFloat(g.value || g.valor)))
      if (validGrades.length === 0) return null

      const sum = validGrades.reduce((acc, g) => acc + parseFloat(g.value || g.valor), 0)
      return (sum / validGrades.length).toFixed(2)
    } else {
      // For letter grades, return the most frequent
      const letterCounts = grades.reduce((acc, g) => {
        const val = g.value || g.valor
        if (val) {
          acc[val] = (acc[val] || 0) + 1
        }
        return acc
      }, {})

      const mostFrequent = Object.keys(letterCounts).reduce((a, b) =>
        letterCounts[a] > letterCounts[b] ? a : b, ''
      )

      return mostFrequent || null
    }
  }, [gradingSystem])

  // ==================== FILTERED STUDENTS ====================
  const filteredStudents = useMemo(() => {
    return students?.filter(student => {
      // Filter by search term
      const matchesSearch = !searchTerm ||
        student.first_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.codigoEstudiante?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by grade
      const matchesGrade = !selectedGrade || student.grade_id === selectedGrade

      // Filter by section
      const matchesSection = !selectedSection || student.section_id === selectedSection

      return matchesSearch && matchesGrade && matchesSection
    }).slice(0, 30) || [] // Limit to 30 students max for performance
  }, [students, searchTerm, selectedGrade, selectedSection])

  // ==================== GET STUDENT GRADES FOR CATEGORY ====================
  const getStudentGradesForCategory = useCallback((studentId, categoryId) => {
    const studentGrades = getGradesByStudentAndCourse(studentId, selectedCourse)
    return studentGrades.filter(g => g.categoriaId === categoryId && g.quarter === parseInt(selectedQuarter))
  }, [selectedCourse, selectedQuarter, getGradesByStudentAndCourse])

  // ==================== HAS OBSERVATION ====================
  const hasObservation = useCallback((studentId, categoryId, subcategoryId) => {
    const studentGrades = getGradesByStudentAndCourse(studentId, selectedCourse)
    const grade = studentGrades.find(g =>
      g.categoriaId === categoryId &&
      g.subcategoriaId === subcategoryId &&
      g.quarter === parseInt(selectedQuarter)
    )
    return grade?.observacion ? true : false
  }, [selectedCourse, selectedQuarter, getGradesByStudentAndCourse])

  // ==================== RETURN ====================
  return {
    selectedCourseData,
    gradingSystem,
    currentEvaluationStructure,
    uniqueCategories,
    calculateStudentAverage,
    getCompetenceAverage,
    filteredStudents,
    getStudentGradesForCategory,
    hasObservation
  }
}
