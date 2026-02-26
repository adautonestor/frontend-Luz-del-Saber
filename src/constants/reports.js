/**
 * Constantes para módulo de reportes (FALLBACKS)
 * Los datos dinámicos se cargan desde las APIs correspondientes
 * Estas constantes se usan solo como respaldo si las APIs fallan
 */

/**
 * Lista de hijos (FALLBACK - vacío)
 * Los datos dinámicos se cargan desde parentProfileService.getMyChildren()
 */
export const CHILDREN = []

/**
 * Períodos académicos (FALLBACK - vacío)
 * Los datos dinámicos deberían venir del backend
 */
export const PERIODS = []

/**
 * Orden de períodos (FALLBACK - vacío)
 * Define el orden cronológico de los períodos
 */
export const PERIOD_ORDER = []

/**
 * Mock de reportes (FALLBACK - vacío)
 * Los datos reales deberían venir de reportsService o similar
 */
export const getMockReports = () => ({})
