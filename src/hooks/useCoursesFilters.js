import { useState, useMemo } from 'react'

/**
 * Hook para manejar filtros y paginación de cursos
 */
export const useCoursesFilters = (courses, selectedAcademicYear) => {
  const [filters, setFilters] = useState({
    search: '',
    nivel: '',
    area: ''
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar cursos
  const filteredCourses = useMemo(() => {
    return courses
      .filter(course => {
        // Filtro de búsqueda por nombre o código
        const matchesSearch = !filters.search ||
          course.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          course.code?.toLowerCase().includes(filters.search.toLowerCase())

        // Filtro por área (comparar IDs)
        const matchesArea = !filters.area || Number(course.academic_area_id) === Number(filters.area)

        // Filtro por nivel (convertir a número para comparar)
        const matchesNivel = !filters.nivel || Number(course.level_id) === Number(filters.nivel)

        // Filtro por año lectivo
        const academicYearId = typeof selectedAcademicYear === 'object'
          ? selectedAcademicYear?.id
          : selectedAcademicYear
        const matchesYear = !academicYearId ||
                           Number(course.academic_year_id) === Number(academicYearId) ||
                           Number(course.año_lectivo_id) === Number(academicYearId)

        return matchesSearch && matchesArea && matchesNivel && matchesYear
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }))
  }, [courses, filters, selectedAcademicYear])

  // Cursos paginados
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCourses.slice(startIndex, endIndex)
  }, [filteredCourses, currentPage])

  // Información de paginación
  const paginationInfo = useMemo(() => {
    const totalItems = filteredCourses.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return {
      totalItems,
      totalPages,
      startItem,
      endItem,
      currentPage
    }
  }, [filteredCourses.length, currentPage])

  // Cambiar filtro y resetear página
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setCurrentPage(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ search: '', nivel: '', area: '' })
    setCurrentPage(1)
  }

  // Cambiar página
  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, paginationInfo.totalPages))
  }

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  return {
    filters,
    filteredCourses,
    paginatedCourses,
    paginationInfo,
    currentPage,
    handleFilterChange,
    clearFilters,
    goToPage,
    nextPage,
    prevPage
  }
}
