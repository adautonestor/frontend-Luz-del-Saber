import { useState, useEffect } from 'react'
import { useAcademicStore } from '../stores/academicStore'
import { useCoursesStore } from '../stores/coursesStore'
import { usersService } from '../services/usersService'
import { courseService } from '../services/academic/courseService'

/**
 * Custom hook para gestionar la carga de datos académicos
 * Centraliza toda la lógica de obtención y filtrado de datos
 * Integrado con APIs reales del backend
 */
export const useAcademicData = () => {
  // Academic structure data from stores
  const academicStore = useAcademicStore()
  const coursesStore = useCoursesStore()

  // Local state for additional data
  const [competencies, setCompetencies] = useState([])
  const [capacities, setCapacities] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  // Tree state
  const [expandedItems, setExpandedItems] = useState({})

  const loadTeachers = async () => {
    try {
      const teachersList = await usersService.getByRole('profesor')
      setTeachers(teachersList || [])
    } catch (error) {
      console.error('Error loading teachers:', error)
      setTeachers([])
    }
  }

  const loadCompetenciesAndCapacities = async () => {
    try {
      const [comps, caps] = await Promise.all([
        courseService.getAllCompetencies(),
        courseService.getAllCapacities()
      ])
      setCompetencies(comps || [])
      setCapacities(caps || [])
    } catch (error) {
      console.error('Error loading competencies and capacities:', error)
      setCompetencies([])
      setCapacities([])
    }
  }

  const loadAvailableCourses = async () => {
    try {
      // Initialize courses store without teacher filter to get all courses
      await coursesStore.initialize()
      const allCourses = coursesStore.courses || []

      // Get unique course names/templates (not specific instances)
      const uniqueCourseNames = [...new Set(allCourses.map(course => course.name || course.nombre))]
      const coursesTemplates = uniqueCourseNames
        .map(nombre => {
          const exampleCourse = allCourses.find(c => (c.name || c.nombre) === nombre)
          return {
            id: `template-${nombre}`,
            nombre,
            description: exampleCourse?.description || exampleCourse?.descripcion || '',
            area: exampleCourse?.area || ''
          }
        })
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }))

      setAvailableCourses(coursesTemplates)
    } catch (error) {
      console.error('Error loading available courses:', error)
      setAvailableCourses([])
    }
  }

  const loadAcademicData = async () => {
    setLoading(true)
    try {
      // Ejecutar todo en paralelo para optimizar carga
      await Promise.all([
        academicStore.initialize(),
        loadAvailableCourses(),
        loadCompetenciesAndCapacities(),
        loadTeachers()
      ])

      // Auto expand first level
      if (academicStore.levels && academicStore.levels.length > 0) {
        setExpandedItems({ [academicStore.levels[0].id]: true })
      }
    } catch (error) {
      console.error('Error loading academic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAcademicStructure = async (academicYear) => {
    if (!academicYear) {
      return
    }

    try {
      await academicStore.loadAcademicStructure(academicYear)

      // Auto expand first level
      if (academicStore.levels && academicStore.levels.length > 0) {
        setExpandedItems({ [academicStore.levels[0].id]: true })
      }
    } catch (error) {
      console.error('❌ [AcademicStructure] Error loading academic structure:', error)
    }
  }

  const handleAcademicYearChange = async (academicYear) => {
    await loadAcademicStructure(academicYear)
    // Reset expanded items when changing year
    setExpandedItems({})
  }

  // Load data on mount
  useEffect(() => {
    loadAcademicData()
  }, [])

  return {
    // States from academicStore
    academicYears: academicStore.academicYears,
    setAcademicYears: (years) => {
      academicStore.academicYears = years
    },
    currentAcademicYear: academicStore.selectedAcademicYear,
    setCurrentAcademicYear: (year) => {
      academicStore.selectedAcademicYear = year
    },
    selectedAcademicYear: academicStore.selectedAcademicYear,
    setSelectedAcademicYear: (year) => {
      academicStore.selectedAcademicYear = year
    },
    levels: academicStore.levels,
    setLevels: (levels) => {
      academicStore.levels = levels
    },
    grades: academicStore.grades,
    setGrades: (grades) => {
      academicStore.grades = grades
    },
    sections: academicStore.sections,
    setSections: (sections) => {
      academicStore.sections = sections
    },
    courses: academicStore.courses,
    setCourses: (courses) => {
      academicStore.courses = courses
    },

    // Local states
    competencies,
    setCompetencies,
    capacities,
    setCapacities,
    availableCourses,
    setAvailableCourses,
    teachers,
    setTeachers,
    loading: loading || academicStore.isLoading || coursesStore.isLoading,
    expandedItems,
    setExpandedItems,

    // Functions
    loadAcademicData,
    loadAcademicStructure,
    handleAcademicYearChange
  }
}
