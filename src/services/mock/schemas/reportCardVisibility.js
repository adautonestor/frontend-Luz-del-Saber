/**
 * Utilidades para verificación de visibilidad de boletas de notas
 * Funciones para determinar si una boleta es visible según configuraciones
 */

/**
 * Verifica si una boleta de notas es visible
 * @param {string} academicYearId - ID del año académico
 * @param {number|string} bimester - Número de bimestre (1-4)
 * @param {string} level - Nivel educativo (inicial, primaria, secundaria)
 * @param {string} gradeId - ID del grado
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {boolean} True si la boleta es visible
 */
export const isReportCardVisible = (academicYearId, bimester, level, gradeId, visibilityConfigs) => {
  // Si no hay configuraciones, por defecto es visible
  if (!visibilityConfigs || !Array.isArray(visibilityConfigs) || visibilityConfigs.length === 0) {
    return true
  }

  // Buscar configuración que coincida con los parámetros
  const matchingConfig = visibilityConfigs.find(config => {
    // Obtener valores de la configuración (manejar diferentes formatos)
    const configAcademicYear = config.academic_year_id || config.academicYearId || config.año_lectivo_id
    const configBimester = config.bimester || config.bimestre || config.quarter
    const configLevel = config.level || config.nivel || config.level_id
    const configGrade = config.grade_id || config.gradeId || config.grado_id

    // Verificar coincidencias
    const yearMatches = !configAcademicYear || configAcademicYear === academicYearId
    const bimesterMatches = !configBimester || configBimester?.toString() === bimester?.toString()
    const levelMatches = !configLevel || configLevel === level
    const gradeMatches = !configGrade || configGrade === gradeId

    return yearMatches && bimesterMatches && levelMatches && gradeMatches
  })

  // Si no se encuentra configuración específica, es visible por defecto
  if (!matchingConfig) {
    return true
  }

  // Verificar el estado de visibilidad en la configuración encontrada
  const isVisible = matchingConfig.visible || matchingConfig.is_visible || matchingConfig.isVisible

  // Manejar diferentes formatos de valores booleanos
  if (typeof isVisible === 'boolean') {
    return isVisible
  }
  if (typeof isVisible === 'number') {
    return isVisible === 1
  }
  if (typeof isVisible === 'string') {
    return isVisible === 'true' || isVisible === '1'
  }

  // Por defecto, si existe la configuración pero no tiene valor explícito, considerar visible
  return true
}

/**
 * Verifica si una boleta es visible para un estudiante específico
 * @param {string} studentId - ID del estudiante
 * @param {string} academicYearId - ID del año académico
 * @param {number|string} bimester - Número de bimestre
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {boolean} True si es visible
 */
export const isReportCardVisibleForStudent = (studentId, academicYearId, bimester, visibilityConfigs) => {
  if (!visibilityConfigs || !Array.isArray(visibilityConfigs) || visibilityConfigs.length === 0) {
    return true
  }

  // Buscar configuración específica del estudiante
  const studentConfig = visibilityConfigs.find(config => {
    const configStudentId = config.student_id || config.studentId
    const configAcademicYear = config.academic_year_id || config.academicYearId || config.año_lectivo_id
    const configBimester = config.bimester || config.bimestre || config.quarter

    return configStudentId === studentId &&
           (!configAcademicYear || configAcademicYear === academicYearId) &&
           (!configBimester || configBimester?.toString() === bimester?.toString())
  })

  if (!studentConfig) {
    return true
  }

  const isVisible = studentConfig.visible || studentConfig.is_visible || studentConfig.isVisible

  if (typeof isVisible === 'boolean') {
    return isVisible
  }
  if (typeof isVisible === 'number') {
    return isVisible === 1
  }
  if (typeof isVisible === 'string') {
    return isVisible === 'true' || isVisible === '1'
  }

  return true
}

/**
 * Obtener bimestres visibles para un año académico y grado
 * @param {string} academicYearId - ID del año académico
 * @param {string} gradeId - ID del grado
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {Array} Array de números de bimestres visibles (1-4)
 */
export const getVisibleBimesters = (academicYearId, gradeId, visibilityConfigs) => {
  const allBimesters = [1, 2, 3, 4]

  if (!visibilityConfigs || !Array.isArray(visibilityConfigs) || visibilityConfigs.length === 0) {
    return allBimesters
  }

  // Filtrar bimestres visibles
  return allBimesters.filter(bimester => {
    const config = visibilityConfigs.find(c => {
      const configAcademicYear = c.academic_year_id || c.academicYearId || c.año_lectivo_id
      const configBimester = c.bimester || c.bimestre || c.quarter
      const configGrade = c.grade_id || c.gradeId || c.grado_id

      return (!configAcademicYear || configAcademicYear === academicYearId) &&
             (!configBimester || configBimester?.toString() === bimester?.toString()) &&
             (!configGrade || configGrade === gradeId)
    })

    // Si no hay configuración, es visible
    if (!config) return true

    // Verificar visibilidad
    const isVisible = config.visible || config.is_visible || config.isVisible

    if (typeof isVisible === 'boolean') return isVisible
    if (typeof isVisible === 'number') return isVisible === 1
    if (typeof isVisible === 'string') return isVisible === 'true' || isVisible === '1'

    return true
  })
}

/**
 * Verificar si todos los bimestres están visibles
 * @param {string} academicYearId - ID del año académico
 * @param {string} gradeId - ID del grado
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {boolean} True si todos los bimestres son visibles
 */
export const areAllBimestersVisible = (academicYearId, gradeId, visibilityConfigs) => {
  const visibleBimesters = getVisibleBimesters(academicYearId, gradeId, visibilityConfigs)
  return visibleBimesters.length === 4
}

/**
 * Obtener estado de visibilidad de todos los bimestres
 * @param {string} academicYearId - ID del año académico
 * @param {string} gradeId - ID del grado
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {Object} Objeto con estado de cada bimestre {1: true, 2: false, ...}
 */
export const getBimestersVisibilityStatus = (academicYearId, gradeId, visibilityConfigs) => {
  const status = {}

  for (let bimester = 1; bimester <= 4; bimester++) {
    status[bimester] = isReportCardVisible(academicYearId, bimester, null, gradeId, visibilityConfigs)
  }

  return status
}
