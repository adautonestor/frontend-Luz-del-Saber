import { useState, useEffect, useCallback } from 'react'
import { useCoursesStore } from '../stores/coursesStore'
import { courseService } from '../services/academic/courseService'
import { gradesService } from '../services/gradesService'
import { evaluationStructuresService } from '../services/evaluationStructuresService'
import { getGradingScalesStore } from '../stores/gradingScalesStore'

export const useCourseDetailState = (course) => {
  const { getCourseStudents } = useCoursesStore()

  // Estados existentes
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)

  // Nuevos estados para competencias
  const [selectedBimester, setSelectedBimester] = useState(1)
  const [courseCompetencies, setCourseCompetencies] = useState([])
  const [competencyAverages, setCompetencyAverages] = useState({})
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false)
  const [isLoadingAverages, setIsLoadingAverages] = useState(false)

  // Cargar estudiantes del curso
  useEffect(() => {
    loadStudents()
  }, [course])

  const loadStudents = () => {
    const storeStudents = getCourseStudents(course.id)
    setStudentsList(storeStudents)
  }

  // Cargar competencias del curso desde evaluation_structures
  useEffect(() => {
    const loadCompetencies = async () => {
      if (!course?.id) return

      setIsLoadingCompetencies(true)
      try {
        // Primero intentar cargar desde evaluation_structures
        const structures = await evaluationStructuresService.getAll({
          course_id: course.id
        })

        // Extraer competencias únicas de las estructuras
        const competenciesMap = new Map()

        if (structures && structures.length > 0) {
          structures.forEach(structure => {
            // Las competencias pueden estar en 'competencies' o como JSON
            let comps = structure.competencies

            // Si es string, parsear
            if (typeof comps === 'string') {
              try {
                comps = JSON.parse(comps)
              } catch (e) {
                comps = null
              }
            }

            // Si tiene un wrapper 'competencias', extraer
            if (comps?.competencias && Array.isArray(comps.competencias)) {
              comps = comps.competencias
            }

            // Procesar array de competencias
            if (Array.isArray(comps)) {
              comps.forEach((comp, index) => {
                const compId = comp.id || `COMP_${comp.nombreCompetencia?.replace(/\s+/g, '_').toUpperCase()}`
                if (!competenciesMap.has(compId)) {
                  competenciesMap.set(compId, {
                    id: compId,
                    name: comp.nombreCompetencia || comp.name || `Competencia ${index + 1}`,
                    code: comp.codigo || comp.code || '',
                    description: comp.descripcion || comp.description || '',
                    order: index,
                    grading_system: structure.grading_system || 'literal'
                  })
                }
              })
            }
          })
        }

        // Si no hay competencias en evaluation_structures, intentar con course_competencies
        if (competenciesMap.size === 0) {
          const comps = await courseService.getCourseCompetenciesByCourse(course.id)
          if (comps && comps.length > 0) {
            comps.forEach((comp, index) => {
              competenciesMap.set(comp.id, {
                id: comp.id,
                name: comp.name || comp.competencia_nombre,
                code: comp.code || comp.competencia_codigo,
                description: comp.description || comp.competencia_descripcion,
                order: comp.order || index,
                grading_system: comp.grading_system || 'literal'
              })
            })
          }
        }

        const sortedComps = Array.from(competenciesMap.values())
          .sort((a, b) => (a.order || 0) - (b.order || 0))

        setCourseCompetencies(sortedComps)
      } catch (error) {
        console.error('Error al cargar competencias del curso:', error)
        setCourseCompetencies([])
      } finally {
        setIsLoadingCompetencies(false)
      }
    }

    loadCompetencies()
  }, [course?.id])

  // Cargar promedios de competencias cuando cambia el bimestre o los estudiantes
  useEffect(() => {
    const loadAverages = async () => {
      if (!course?.id || studentsList.length === 0 || courseCompetencies.length === 0) {
        return
      }

      setIsLoadingAverages(true)
      try {
        // Cargar promedios para todos los estudiantes y todos los bimestres
        const averagesMap = {}

        // Cargar promedios de todos los bimestres para tener datos completos
        for (const bim of [1, 2, 3, 4]) {
          for (const student of studentsList) {
            try {
              const averages = await gradesService.getCompetencyAverages({
                student_id: student.id,
                course_id: course.id,
                quarter: bim
              })

              // Mapear los promedios por competencia
              if (averages && Array.isArray(averages)) {
                averages.forEach(avg => {
                  // Usar category_id o competency_id según lo que venga
                  const compId = avg.category_id || avg.competency_id || avg.course_competency_id
                  const key = `${student.id}-${compId}-${bim}`
                  averagesMap[key] = {
                    average_value: avg.average_value,
                    grading_system: avg.grading_system,
                    calculation_details: avg.calculation_details
                  }
                })
              }
            } catch (err) {
              // Ignorar errores individuales, continuar con otros estudiantes
              console.warn(`Error al cargar promedio para estudiante ${student.id}, bimestre ${bim}:`, err)
            }
          }
        }

        setCompetencyAverages(averagesMap)
      } catch (error) {
        console.error('Error al cargar promedios de competencias:', error)
      } finally {
        setIsLoadingAverages(false)
      }
    }

    loadAverages()
  }, [course?.id, studentsList, courseCompetencies])

  // Función para obtener el promedio de una competencia específica
  const getCompetencyAverage = useCallback((studentId, competencyId, bimester) => {
    // Intentar con diferentes formatos de ID
    const possibleKeys = [
      `${studentId}-${competencyId}-${bimester}`,
      `${studentId}-${competencyId?.toString()}-${bimester}`,
    ]

    for (const key of possibleKeys) {
      if (competencyAverages[key]) {
        return competencyAverages[key]
      }
    }

    return null
  }, [competencyAverages])

  // Función para formatear la nota según el sistema de calificación
  // Usa el store SSOT para conversiones dinámicas con levelId del curso
  const formatGradeValue = useCallback((avgData) => {
    if (!avgData) return '--'

    const value = avgData.average_value
    if (value === null || value === undefined) return '--'

    const store = getGradingScalesStore()
    // Usar levelId del curso para obtener configuración correcta
    const levelId = course?.level_id || null

    // Si es sistema literal, usar store centralizado con levelId
    if (avgData.grading_system === 'literal') {
      return store.convertNumericToLetter(value, levelId)
    }

    // Si es numérico, mostrar el número con 1 decimal
    return typeof value === 'number' ? value.toFixed(1) : value
  }, [course?.level_id])

  const filteredStudents = studentsList.filter(student =>
    `${student.first_names} ${student.last_names} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleViewStudentDetail = (student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
  }

  // Función de color según la nota - usa store SSOT con levelId del curso
  const getGradeColor = useCallback((grade) => {
    const levelId = course?.level_id || null
    return getGradingScalesStore().getGradeColorClasses(grade, levelId)
  }, [course?.level_id])

  // Función para obtener el color basado en el avgData - usa store SSOT con levelId
  const getGradeColorFromAvg = useCallback((avgData) => {
    if (!avgData) return 'bg-gray-100 text-gray-500'

    const value = avgData.average_value
    if (value === null || value === undefined) return 'bg-gray-100 text-gray-500'

    const store = getGradingScalesStore()
    // Usar levelId del curso para configuración correcta
    const levelId = course?.level_id || null

    // Para sistema literal, convertir a letra y obtener color usando levelId
    if (avgData.grading_system === 'literal') {
      const letter = store.convertNumericToLetter(value, levelId)
      return store.getGradeColorClasses(letter, levelId)
    }

    // Para sistema numérico, obtener color directamente con levelId
    return store.getGradeColorClasses(value, levelId)
  }, [course?.level_id])

  return {
    // State
    searchTerm,
    selectedStudents,
    studentsList,
    filteredStudents,
    selectedStudent,
    showStudentDetail,

    // Nuevos estados de competencias
    selectedBimester,
    courseCompetencies,
    competencyAverages,
    isLoadingCompetencies,
    isLoadingAverages,

    // Setters
    setSearchTerm,
    setSelectedStudents,
    setShowStudentDetail,
    setSelectedBimester,

    // Functions
    handleSelectStudent,
    handleSelectAll,
    handleViewStudentDetail,
    getCompetencyAverage,
    formatGradeValue,
    getGradeColor,
    getGradeColorFromAvg
  }
}
