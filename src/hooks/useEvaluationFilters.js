import { useState, useMemo, useEffect } from 'react'

/**
 * Hook para manejar filtros de estructuras de evaluación
 */
export const useEvaluationFilters = (evaluationStructures, grades, activeTab) => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedBimester, setSelectedBimester] = useState('1')

  // Reset filtros cuando cambia el nivel
  useEffect(() => {
    setSelectedCourse('')
    setSelectedGrade('')
    setSelectedBimester('1')
  }, [activeTab])

  const filteredStructures = useMemo(() => {
    // activeTab ahora es directamente el ID del nivel (numérico)
    const activeLevelId = activeTab ? Number(activeTab) : null

    const structures = evaluationStructures?.filter(structure => {
      const grade = grades?.find(g => g.id === structure.grade_id)
      const matchesLevel = !activeLevelId || grade?.level_id === activeLevelId

      // Convertir a number para comparaciones correctas
      const matchesCourse = !selectedCourse || Number(structure.course_id) === Number(selectedCourse)
      const matchesGrade = !selectedGrade || Number(structure.grade_id) === Number(selectedGrade)
      const matchesBimester = !selectedBimester || Number(structure.quarter) === Number(selectedBimester)
      const matchesYear = !selectedAcademicYear || Number(structure.añoLectivoId) === Number(selectedAcademicYear)

      return matchesLevel && matchesCourse && matchesGrade && matchesBimester && matchesYear
    }) || []

    // Deduplicar por ID
    const uniqueStructures = structures.reduce((acc, structure) => {
      if (!acc.find(s => s.id === structure.id)) {
        acc.push(structure)
      }
      return acc
    }, [])

    return uniqueStructures
  }, [evaluationStructures, grades, activeTab, selectedCourse, selectedGrade, selectedBimester, selectedAcademicYear])

  return {
    selectedAcademicYear,
    setSelectedAcademicYear,
    selectedCourse,
    setSelectedCourse,
    selectedGrade,
    setSelectedGrade,
    selectedBimester,
    setSelectedBimester,
    filteredStructures
  }
}
