/**
 * UTILIDAD DE MIGRACIÓN Y CORRECCIÓN DE DATOS ACADÉMICOS
 *
 * TODO CRÍTICO: Este archivo completo debe ser removido/movido:
 * 1. Estas funciones son scripts de migración/setup one-time
 * 2. NO deben estar en utilities, deben estar en:
 *    - migrations/ folder para scripts de migración
 *    - o en un adminService con endpoints específicos
 * 3. NO deben ser usadas en componentes de producción
 * 4. Son útiles solo para desarrollo/debugging desde consola
 *
 * DEPRECATED: No usar estas funciones en código de producción
 */

/**
 * @deprecated Usar migrations en el backend o adminService.migrateAcademicData()
 */
export const fixAcademicData = () => {
  console.error('❌ DEPRECATED: fixAcademicData debe ser reemplazada por migrations o adminService')
  console.warn('⚠️ Esta función manipula datos directamente y no debe usarse en producción')
  console.log('ℹ️ Implementar como migración en el backend o endpoint administrativo')

  alert('Esta función está deprecated. Implementar como migración en el backend.')
}

/**
 * @deprecated Usar migrations en el backend o coursesService.updateCodes()
 */
export const updateCourseCodes = () => {
  console.error('❌ DEPRECATED: updateCourseCodes debe ser reemplazada por migrations o coursesService')
  console.warn('⚠️ Esta función manipula datos directamente y no debe usarse en producción')
  console.log('ℹ️ Implementar como endpoint en coursesService o como migración')

  alert('Esta función está deprecated. Usar coursesService.updateCodes()')
}

// Exponer las funciones globalmente para uso en consola (solo debugging)
// NOTA: Estas son funciones deprecated, no usar en producción
if (typeof window !== 'undefined') {
  window.fixAcademicData = fixAcademicData
  window.updateCourseCodes = updateCourseCodes
}
