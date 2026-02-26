import { useState, useEffect } from 'react'
import studentsService from '../services/studentsService'
import { useAcademicStore } from '../stores/academicStore'

/**
 * Hook para administración de boletas de notas (vista admin)
 * Maneja estudiantes, filtros y datos académicos
 */
export const useReportCardsAdmin = () => {
  const academicStore = useAcademicStore()

  const [students, setStudents] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [allGrades, setAllGrades] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    academicYear: '',
    nivel: '',
    grade: '',
    section: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  // Recargar grados cuando cambie el año seleccionado en el filtro
  useEffect(() => {
    if (!filters.academicYear || academicYears.length === 0) return

    const selectedYear = academicYears.find(
      y => String(y.año) === String(filters.academicYear)
    )
    if (selectedYear) {
      // Cargar estructura del año seleccionado para obtener sus grados
      const storeState = useAcademicStore.getState()
      storeState.loadAcademicStructure(selectedYear).then(() => {
        const updatedState = useAcademicStore.getState()
        setAllGrades(updatedState.grades || [])
      }).catch(err => {
        console.error('Error cargando grados del año:', err)
      })
    }
  }, [filters.academicYear, academicYears])

  const loadData = async () => {
    try {
      // Initialize academic store si no tiene años cargados
      const storeState = useAcademicStore.getState()
      if (!storeState.academicYears || storeState.academicYears.length === 0) {
        await storeState.initialize()
      }

      // Obtener estado actualizado después de inicializar
      const updatedState = useAcademicStore.getState()

      // Load academic years from store
      const years = updatedState.academicYears || []
      setAcademicYears(years)

      // Load grades from store
      setAllGrades(updatedState.grades || [])

      // Establecer el año activo como filtro inicial
      const activeYear = updatedState.selectedAcademicYear
      if (activeYear) {
        setFilters(prev => ({
          ...prev,
          academicYear: String(activeYear.año || activeYear.year || '')
        }))
      }

      // Load students
      await loadStudents()
    } catch (error) {
      console.error('Error loading data:', error)
      setAcademicYears([])
      setAllGrades([])
      setStudents([])
    }
  }

  const loadStudents = async () => {
    try {
      const studentsData = await studentsService.getAll()
      const storeState = useAcademicStore.getState()
      const gradesData = storeState.grades || []

      // Enrich students with grade info
      const enrichedStudents = studentsData.map(student => {
        const gradeId = student.grade_id
        const grade = gradesData.find(g => g.id === gradeId)
        const levelId = grade?.level_id

        return {
          ...student,
          gradeName: grade?.name || student.grado || '',
          nivel: student.nivel || '',
          gradingSystem: student.nivel || 'secundaria'
        }
      })

      setStudents(enrichedStudents || [])
    } catch (error) {
      console.error('Error loading students:', error)
      setStudents([])
    }
  }

  // Filter students based on current filters
  const getFilteredStudents = () => {
    return students.filter(student => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const fullName = `${student.first_names} ${student.last_names}`.toLowerCase()
        const dni = student.dni || ''
        if (!fullName.includes(searchLower) && !dni.includes(searchLower)) {
          return false
        }
      }

      // Academic year filter
      if (filters.academicYear) {
        if (student.academic_year?.toString() !== filters.academicYear) {
          return false
        }
      }

      // Level filter (comparar por ID)
      if (filters.nivel && Number(student.level_id) !== Number(filters.nivel)) {
        return false
      }

      // Grade filter
      if (filters.grade && student.gradeName !== filters.grade) {
        return false
      }

      // Section filter
      if (filters.section && student.seccion !== filters.section) {
        return false
      }

      return true
    })
  }

  return {
    students,
    academicYears,
    allGrades,
    filters,
    setFilters,
    loadData,
    getFilteredStudents
  }
}
