/**
 * Utilidades para procesamiento de pagos
 * Incluye lógica de actualización de obligaciones tras pagos
 */

/**
 * Calcula el nuevo estado de una obligación basado en montos
 * @param {Object} obligation - Obligación con montoTotal, montoPagado, saldoPendiente
 * @returns {string} Estado: 'pagado', 'parcial', 'pendiente'
 */
export function calculateObligationStatus(obligation) {
  if (obligation.pending_balance === 0 || obligation.paid_amount >= obligation.total_amount) {
    return 'pagado'
  }
  if (obligation.paid_amount > 0) {
    return 'parcial'
  }
  return 'pendiente'
}

/**
 * Calcula los nuevos montos de una obligación después de un pago
 * @param {Object} obligation - Obligación actual
 * @param {number} paymentAmount - Monto del pago
 * @returns {Object} { paid_amount, saldoPendiente, estado }
 */
export function calculateObligationUpdate(obligation, paymentAmount) {
  const newMontoPagado = obligation.paid_amount + paymentAmount
  const newSaldoPendiente = Math.max(0, obligation.total_amount - newMontoPagado)
  const newStatus = calculateObligationStatus({
    ...obligation,
    paid_amount: newMontoPagado,
    pending_balance: newSaldoPendiente
  })

  return {
    paid_amount: newMontoPagado,
    pending_balance: newSaldoPendiente,
    state: newStatus
  }
}

/**
 * Valida que un monto de pago sea válido para una obligación
 * @param {number} paymentAmount - Monto a pagar
 * @param {Object} obligation - Obligación
 * @returns {Object} { valid: boolean, error: string|null }
 */
export function validatePaymentAmount(paymentAmount, obligation) {
  if (!paymentAmount || paymentAmount <= 0) {
    return { valid: false, error: 'El monto debe ser mayor a 0' }
  }

  if (paymentAmount > obligation.pending_balance) {
    return {
      valid: false,
      error: `El monto no puede ser mayor al saldo pendiente (S/. ${obligation.pending_balance.toFixed(2)})`
    }
  }

  return { valid: true, error: null }
}

/**
 * Crea un objeto de registro de pago
 * @param {Object} params - Parámetros del pago
 * @returns {Object} Registro de pago formateado
 */
export function createPaymentRecord({
  student_id,
  conceptoId,
  obligacionId,
  fechaPago,
  montoPagado,
  metodoPagoId,
  numeroOperacion,
  observaciones,
  voucher,
  tipoRegistro = 'manual',
  registradoPor = 'admin'
}) {
  return {
    student_id,
    conceptoId,
    obligacionId,
    payment_date: fechaPago || new Date().toISOString(),
    montoPagado,
    metodoPagoId,
    numeroOperacion,
    observaciones,
    voucher,
    state: 'confirmado',
    tipoRegistro,
    registradoPor,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Crea un objeto de actualización de obligación tras pago
 * @param {Object} obligation - Obligación actual
 * @param {number} paymentAmount - Monto pagado
 * @param {string} paymentDate - Fecha del pago
 * @returns {Object} Datos para actualizar la obligación
 */
export function createObligationUpdate(obligation, paymentAmount, paymentDate) {
  const update = calculateObligationUpdate(obligation, paymentAmount)

  return {
    ...update,
    fechaUltimoPago: paymentDate || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Valida los datos de una intención de pago
 * @param {Object} intentionData - Datos de la intención
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePaymentIntention(intentionData) {
  const errors = []

  if (!intentionData.obligation_id) {
    errors.push('Obligación es requerida')
  }

  if (!intentionData.amount || intentionData.amount <= 0) {
    errors.push('Monto debe ser mayor a 0')
  }

  if (!intentionData.payment_method) {
    errors.push('Medio de pago es requerido')
  }

  if (!intentionData.operation_number) {
    errors.push('Número de operación es requerido')
  }

  if (!intentionData.payment_date) {
    errors.push('Fecha de pago es requerida')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Formatea un objeto de intención de pago para guardar
 * @param {Object} intentionData - Datos de la intención
 * @returns {Object} Intención formateada
 */
export function formatPaymentIntention(intentionData) {
  return {
    ...intentionData,
    state: 'pendiente',
    registration_date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Crea un objeto de confirmación de pago
 * @param {Object} confirmationData - Datos de confirmación (opcional)
 * @param {string} adminId - ID del administrador que confirma
 * @returns {Object} Datos de confirmación
 */
export function createPaymentConfirmation(confirmationData = {}, adminId = 'current-admin-id') {
  return {
    state: 'confirmado',
    fechaConfirmacion: new Date().toISOString(),
    confirmadoPor: adminId,
    ...confirmationData,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Crea un objeto de rechazo de pago
 * @param {string} reason - Razón del rechazo
 * @param {string} adminId - ID del administrador que rechaza
 * @returns {Object} Datos de rechazo
 */
export function createPaymentRejection(reason, adminId = 'current-admin-id') {
  return {
    state: 'rechazado',
    rejection_reason: reason,
    fechaRechazo: new Date().toISOString(),
    rechazadoPor: adminId,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Calcula estadísticas de pagos
 * @param {Array} paymentRecords - Registros de pago
 * @param {Array} obligations - Obligaciones
 * @returns {Object} Estadísticas de pagos
 */
export function calculatePaymentStats(paymentRecords, obligations) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Pagos del mes actual
  const paymentsThisMonth = paymentRecords.filter(p => {
    const date = new Date(p.payment_date)
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
  })

  // Totales
  const totalRecaudado = paymentRecords.reduce((sum, p) => sum + (p.paid_amount || 0), 0)
  const totalPendiente = obligations
    .filter(o => o.state === 'pendiente' || o.state === 'parcial')
    .reduce((sum, o) => sum + (o.pending_balance || 0), 0)

  // Vencidos
  const vencidos = obligations.filter(o => {
    const dueDate = new Date(o.due_date)
    return (o.state === 'pendiente' || o.state === 'parcial') && dueDate < now
  })

  return {
    totalRecaudado,
    totalPendiente,
    totalVencido: vencidos.reduce((sum, o) => sum + (o.pending_balance || 0), 0),
    paymentsThisMonth: paymentsThisMonth.length,
    amountThisMonth: paymentsThisMonth.reduce((sum, p) => sum + (p.paid_amount || 0), 0),
    obligacionesPagadas: obligations.filter(o => o.state === 'pagado').length,
    obligacionesPendientes: obligations.filter(o => o.state === 'pendiente').length,
    obligacionesParciales: obligations.filter(o => o.state === 'parcial').length,
    obligacionesVencidas: vencidos.length
  }
}

/**
 * Agrupa pagos por método de pago
 * @param {Array} paymentRecords - Registros de pago
 * @param {Array} paymentMethods - Métodos de pago disponibles
 * @returns {Array} Pagos agrupados por método
 */
export function groupPaymentsByMethod(paymentRecords, paymentMethods) {
  const grouped = {}

  paymentRecords.forEach(payment => {
    const methodId = payment.metodoPagoId
    if (!grouped[methodId]) {
      const method = paymentMethods.find(m => m.id === methodId)
      grouped[methodId] = {
        metodo: method?.name || 'Desconocido',
        count: 0,
        total: 0,
        pagos: []
      }
    }

    grouped[methodId].count++
    grouped[methodId].total += payment.paid_amount
    grouped[methodId].pagos.push(payment)
  })

  return Object.values(grouped)
}

/**
 * Obtiene los pagos más recientes
 * @param {Array} paymentRecords - Registros de pago
 * @param {number} limit - Límite de registros
 * @returns {Array} Pagos ordenados por fecha descendente
 */
export function getRecentPayments(paymentRecords, limit = 10) {
  return [...paymentRecords]
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
    .slice(0, limit)
}

/**
 * Verifica si un número de operación ya existe
 * @param {string} numeroOperacion - Número de operación a verificar
 * @param {Array} existingIntentions - Intenciones existentes
 * @returns {boolean} true si ya existe
 */
export function isDuplicateOperationNumber(numeroOperacion, existingIntentions) {
  return existingIntentions.some(i => i.operation_number === numeroOperacion)
}

/**
 * Calcula el porcentaje de pago de una obligación
 * @param {Object} obligation - Obligación
 * @returns {number} Porcentaje (0-100)
 */
export function calculatePaymentPercentage(obligation) {
  if (obligation.total_amount === 0) return 0
  return Math.min(100, (obligation.paid_amount / obligation.total_amount) * 100)
}
