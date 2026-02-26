/**
 * Obtiene los grados filtrados por nivel
 * @param {string} levelId - ID del nivel
 * @param {Array} grades - Todos los grados disponibles
 * @returns {Array} Grados filtrados
 */
export const getGradesByLevel = (levelId, grades) => {
  return grades.filter(grade => grade.level_id === levelId)
}

/**
 * Obtiene las secciones filtradas por grado
 * @param {string} gradeId - ID del grado
 * @param {Array} sections - Todas las secciones disponibles
 * @returns {Array} Secciones filtradas
 */
export const getSectionsByGrade = (gradeId, sections) => {
  return sections.filter(section => section.grade_id === gradeId)
}

/**
 * Actualiza un filtro específico en el formulario
 * @param {string} key - Clave del filtro
 * @param {*} value - Valor del filtro
 * @param {Function} setFormData - Función para actualizar el estado del formulario
 */
export const updateFiltros = (key, value, setFormData) => {
  setFormData(prev => ({
    ...prev,
    filtros: {
      ...prev.filtros,
      [key]: value
    }
  }))
}
