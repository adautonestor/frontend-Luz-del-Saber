import { useState, useEffect } from 'react'
import studentsService from '@/services/studentsService'
import { parentStudentRelationsService } from '@/services/parentStudentRelationsService'
import { reportCardVisibilityService } from '@/services/reportCardVisibilityService'
import { useAcademicStore } from '@/stores/academicStore'
import { generateBoletaData } from '@/utils/reportCards'
import courseService from '@/services/academic/courseService'
import evaluationStructuresService from '@/services/evaluationStructuresService'
import gradesService from '@/services/gradesService'
import { academicYearService } from '@/services/academic/academicYearService'
import { AVAILABLE_YEARS } from '@/constants/reportCards'

/**
 * Hook personalizado para cargar y manejar datos de boletas de notas
 * Integrado con APIs reales del backend
 * @param {Object} user - Usuario actual
 * @returns {Object} Datos y funciones del reporte de calificaciones
 */
export const useReportCardData = (user) => {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [boletaData, setBoletaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [visibilityConfigs, setVisibilityConfigs] = useState([])
  const [availableYears, setAvailableYears] = useState(AVAILABLE_YEARS)
  const [academicYearsData, setAcademicYearsData] = useState([])

  const academicStore = useAcademicStore()

  // Load academic years from API
  useEffect(() => {
    loadAcademicYears()
  }, [])

  // Load children
  useEffect(() => {
    loadChildren()
  }, [user])

  // Load boleta data when child, year or academic years data changes
  useEffect(() => {
    if (selectedChild && academicYearsData.length > 0) {
      loadBoletaData()
    }
  }, [selectedChild, selectedYear, academicYearsData])

  // Load visibility configurations
  useEffect(() => {
    loadVisibilityConfigs()
  }, [])

  const loadAcademicYears = async () => {
    try {
      const years = await academicYearService.getAll()
      if (years && years.length > 0) {
        // Guardar datos completos de años académicos para obtener IDs después
        setAcademicYearsData(years)

        // Extraer los años numéricos y ordenarlos descendentemente
        const yearNumbers = years
          .map(y => y.año || y.year)
          .filter(Boolean)
          .sort((a, b) => b - a)

        if (yearNumbers.length > 0) {
          setAvailableYears(yearNumbers)
          // Si el año seleccionado no está en la lista, seleccionar el más reciente
          if (!yearNumbers.includes(selectedYear)) {
            setSelectedYear(yearNumbers[0])
          }
        }
      }
    } catch (error) {
      console.error('Error loading academic years:', error)
      // Mantener los años de fallback
    }
  }

  const loadVisibilityConfigs = async () => {
    try {
      const configs = await reportCardVisibilityService.getAll()
      setVisibilityConfigs(configs || [])
    } catch (error) {
      console.error('Error loading visibility configs:', error)
      setVisibilityConfigs([])
    }
  }

  const loadChildren = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Obtener ID del padre (puede venir como parentId o directamente como id si el user es padre)
      const parentId = user.parentId || (user.rol === 'Padre' ? user.id : null)

      if (!parentId) {
        console.warn('No parent ID found for user')
        setChildren([])
        return
      }

      // Obtener estudiantes del padre desde la API
      const studentsData = await parentStudentRelationsService.getStudentsByParent(parentId)

      // Asegurarse de que academicStore esté inicializado
      if (!academicStore.grades || academicStore.grades.length === 0) {
        await academicStore.initialize()
      }

      const grades = academicStore.grades || []
      const levels = academicStore.levels || []

      // Enriquecer datos de estudiantes con información de grado y nivel
      const childrenData = studentsData.map(student => {
        const grade_id = student.grade_id
        const grade = grades.find(g => g.id === grade_id)
        // Obtener el nombre del nivel usando comparación numérica
        const level = levels.find(l => Number(l.id) === Number(grade?.level_id))

        return {
          ...student,
          gradeName: grade?.name || '',
          nivel: level?.name || '',  // Nombre del nivel (ej: "Inicial"), no el ID
          level_id: grade?.level_id || null,  // ID del nivel para cálculos internos
          gradingSystem: grade?.level_id === 7 ? 'secundaria' : (grade?.level_id ? 'primaria' : 'secundaria')
        }
      }).filter(Boolean)

      setChildren(childrenData)

      if (childrenData.length > 0 && !selectedChild) {
        setSelectedChild(childrenData[0])
      }
    } catch (error) {
      console.error('Error loading children:', error)
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  const loadBoletaData = async () => {
    if (!selectedChild) return

    setLoading(true)

    try {
      const studentGradeId = Number(selectedChild.grade_id)
      const studentLevelId = Number(selectedChild.level_id)

      // Obtener el academic_year_id correspondiente al año seleccionado
      const academicYearRecord = academicYearsData.find(
        y => (y.año || y.year) === selectedYear
      )
      const academicYearId = academicYearRecord?.id || null

      // Obtener todos los cursos
      const courses = await courseService.getAllCourses() || []

      // Filtrar cursos: por grade_id directo O por level_id del curso
      const studentCourses = courses.filter(c => {
        const courseGradeId = Number(c.grade_id)
        const courseLevelId = Number(c.level_id)

        if (courseGradeId && studentGradeId) {
          return courseGradeId === studentGradeId
        }
        if (courseLevelId && studentLevelId) {
          return courseLevelId === studentLevelId
        }
        return false
      })

      // Obtener estructuras de evaluación del grado del estudiante
      const evaluationStructures = await evaluationStructuresService.getAll() || []
      const studentEvalStructures = evaluationStructures.filter(es =>
        Number(es.grade_id) === studentGradeId ||
        studentCourses.some(c => Number(c.id) === Number(es.course_id))
      )

      // Obtener calificaciones del estudiante (notas individuales)
      const allGrades = await gradesService.getAllCompetencyGrades({
        student_id: selectedChild.id
      }) || []
      const studentGrades = allGrades.filter(g => Number(g.student_id) === Number(selectedChild.id))

      // Obtener promedios por competencia del backend, filtrando por año académico
      let competencyAverages = []
      for (let quarter = 1; quarter <= 4; quarter++) {
        try {
          const quarterAverages = await gradesService.getCompetencyAverages({
            student_id: selectedChild.id,
            quarter: quarter,
            academic_year_id: academicYearId
          }) || []
          competencyAverages = [...competencyAverages, ...quarterAverages]
        } catch (err) {
          // Silenciar errores de bimestres sin datos
        }
      }

      // Generar datos de la boleta
      const boletaStructure = generateBoletaData(
        selectedChild,
        studentCourses,
        studentEvalStructures,
        studentGrades,
        competencyAverages
      )
      setBoletaData(boletaStructure)
    } catch (error) {
      console.error('Error loading boleta data:', error)
      setBoletaData(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    children,
    selectedChild,
    setSelectedChild,
    selectedYear,
    setSelectedYear,
    availableYears,
    boletaData,
    loading,
    visibilityConfigs,
    loadBoletaData
  }
}
