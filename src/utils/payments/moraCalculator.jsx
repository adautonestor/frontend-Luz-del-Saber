/**
 * Utilidades para cálculo de mora (intereses por retraso)
 * Funciones puras sin dependencias de React o stores
 */

/**
 * Configuración por defecto de mora
 */
export const DEFAULT_MORA_CONFIG = {
  enabled: true,
  dailyRate: 0.80, // S/. 0.80 por día
  maxAmount: 24.00, // Máximo S/. 24.00 (1 mes)
  maxDays: 30 // Máximo 30 días de mora
}

/**
 * Calcula la mora (interés moratorio) basado en la fecha de vencimiento
 * @param {string|Date} dueDate - Fecha de vencimiento
 * @param {number} baseAmount - Monto base (opcional, no se usa actualmente pero se mantiene para compatibilidad)
 * @param {Object} config - Configuración de mora (opcional)
 * @returns {number} Monto de mora calculado
 */
export function calculateMora(dueDate, baseAmount = null, config = DEFAULT_MORA_CONFIG) {
  if (!config.enabled) return 0

  const now = new Date()
  const due = new Date(dueDate)

  // Si aún no está vencido, no hay mora
  if (due >= now) return 0

  // Calcular días de retraso
  const msPerDay = 24 * 60 * 60 * 1000
  const daysLate = Math.floor((now - due) / msPerDay)

  // Limitar a máximo de días
  const effectiveDays = Math.min(daysLate, config.maxDays)

  // Calcular mora
  const mora = effectiveDays * config.dailyRate

  // Limitar a máximo de mora
  return Math.min(mora, config.maxAmount)
}

/**
 * Calcula los días de retraso desde la fecha de vencimiento
 * @param {string|Date} dueDate - Fecha de vencimiento
 * @returns {number} Días de retraso (0 si no está vencido)
 */
export function calculateDaysLate(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)

  if (due >= now) return 0

  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((now - due) / msPerDay)
}

/**
 * Determina si una obligación está vencida
 * @param {string|Date} dueDate - Fecha de vencimiento
 * @returns {boolean} true si está vencida
 */
export function isOverdue(dueDate) {
  const now = new Date()
  const due = new Date(dueDate)
  return due < now
}

/**
 * Calcula el monto total incluyendo mora
 * @param {number} baseAmount - Monto base
 * @param {string|Date} dueDate - Fecha de vencimiento
 * @param {Object} config - Configuración de mora (opcional)
 * @returns {Object} { baseAmount, mora, total }
 */
export function calculateTotalWithMora(baseAmount, dueDate, config = DEFAULT_MORA_CONFIG) {
  const mora = calculateMora(dueDate, baseAmount, config)
  return {
    baseAmount,
    mora,
    total: baseAmount + mora
  }
}

/**
 * Formatea el mensaje de mora para mostrar al usuario
 * @param {number} moraAmount - Monto de mora
 * @param {number} daysLate - Días de retraso
 * @returns {string} Mensaje formateado
 */
export function formatMoraMessage(moraAmount, daysLate) {
  if (moraAmount === 0) return 'Sin mora'
  return `S/. ${moraAmount.toFixed(2)} (${daysLate} día${daysLate !== 1 ? 's' : ''} de retraso)`
}

/**
 * Calcula la mora proyectada para una fecha futura
 * @param {string|Date} dueDate - Fecha de vencimiento original
 * @param {string|Date} projectionDate - Fecha futura para proyección
 * @param {Object} config - Configuración de mora (opcional)
 * @returns {number} Mora proyectada
 */
export function projectMora(dueDate, projectionDate, config = DEFAULT_MORA_CONFIG) {
  if (!config.enabled) return 0

  const due = new Date(dueDate)
  const projection = new Date(projectionDate)

  // Si la fecha de proyección es antes o igual al vencimiento, no hay mora
  if (projection <= due) return 0

  // Calcular días de retraso proyectados
  const msPerDay = 24 * 60 * 60 * 1000
  const daysLate = Math.floor((projection - due) / msPerDay)

  // Limitar a máximo de días
  const effectiveDays = Math.min(daysLate, config.maxDays)

  // Calcular mora proyectada
  const mora = effectiveDays * config.dailyRate

  // Limitar a máximo de mora
  return Math.min(mora, config.maxAmount)
}

/**
 * Valida la configuración de mora
 * @param {Object} config - Configuración a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateMoraConfig(config) {
  const errors = []

  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled debe ser booleano')
  }

  if (typeof config.dailyRate !== 'number' || config.dailyRate < 0) {
    errors.push('dailyRate debe ser un número positivo')
  }

  if (typeof config.maxAmount !== 'number' || config.maxAmount < 0) {
    errors.push('maxAmount debe ser un número positivo')
  }

  if (typeof config.maxDays !== 'number' || config.maxDays < 0 || !Number.isInteger(config.maxDays)) {
    errors.push('maxDays debe ser un número entero positivo')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
