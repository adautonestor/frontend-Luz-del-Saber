/**
 * Verifica si un bimestre es visible para un estudiante
 * @param {number} bimestre - Número de bimestre (1-4)
 * @param {Object} selectedChild - Estudiante seleccionado
 * @param {number} selectedYear - Año escolar
 * @param {Array} visibilityConfigs - Configuraciones de visibilidad
 * @returns {boolean} True si el bimestre es visible
 */
export const checkBimesterVisibility = (bimestre, selectedChild, selectedYear, visibilityConfigs) => {
  if (!selectedChild) return true
  if (!visibilityConfigs || visibilityConfigs.length === 0) return true

  const studentLevelId = Number(selectedChild.nivel || selectedChild.level_id)
  const studentGradeId = Number(selectedChild.grade_id)

  // Filtrar configs del bimestre actual
  const bimesterConfigs = visibilityConfigs.filter(config => {
    const configQuarter = Number(config.quarter || config.bimestre)
    return configQuarter === bimestre
  })

  if (bimesterConfigs.length === 0) return true

  // Buscar config específica para el grado del estudiante (PRIORIDAD MÁS ALTA)
  const gradeSpecificConfig = bimesterConfigs.find(config => {
    const configGradeId = Number(config.grade_id || config.grado_id)
    return configGradeId && configGradeId === studentGradeId
  })

  if (gradeSpecificConfig) {
    console.log(`🔒 Bim ${bimestre}: Config GRADO id=${gradeSpecificConfig.id} visible=${gradeSpecificConfig.visible}`)
    return gradeSpecificConfig.visible === true
  }

  // Buscar config específica por nivel (sin grado específico)
  const levelSpecificConfig = bimesterConfigs.find(config => {
    const configLevelId = Number(config.level_id || config.nivel_id)
    const configGradeId = config.grade_id || config.grado_id
    return configLevelId && !configGradeId && configLevelId === studentLevelId
  })

  if (levelSpecificConfig) {
    console.log(`🔒 Bim ${bimestre}: Config NIVEL id=${levelSpecificConfig.id} visible=${levelSpecificConfig.visible}`)
    return levelSpecificConfig.visible === true
  }

  // Buscar config global (sin level_id ni grade_id)
  const globalConfig = bimesterConfigs.find(config => {
    const configLevelId = config.level_id || config.nivel_id
    const configGradeId = config.grade_id || config.grado_id
    return !configLevelId && !configGradeId
  })

  if (globalConfig) {
    console.log(`🔒 Bim ${bimestre}: Config GLOBAL id=${globalConfig.id} visible=${globalConfig.visible}`)
    return globalConfig.visible === true
  }

  // Por defecto, si no hay config aplicable, mostrar
  return true
}
