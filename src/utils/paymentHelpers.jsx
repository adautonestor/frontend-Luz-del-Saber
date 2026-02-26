import React from 'react'
import { CheckCircle, Clock, AlertTriangle, Eye, XCircle } from 'lucide-react'

/**
 * Obtiene el color de fondo y texto según el estado del pago
 * @param {string} status - Estado del pago
 * @returns {string} Clases de Tailwind
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'verifying':
      return 'bg-blue-100 text-blue-800'
    case 'processing':
      return 'bg-purple-100 text-purple-800'
    case 'exonerado':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Obtiene el ícono correspondiente al estado del pago
 * @param {string} status - Estado del pago
 * @returns {JSX.Element} Componente de ícono
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="w-4 h-4" />
    case 'pending':
      return <Clock className="w-4 h-4" />
    case 'overdue':
      return <AlertTriangle className="w-4 h-4" />
    case 'verifying':
      return <Eye className="w-4 h-4" />
    case 'processing':
      return <Clock className="w-4 h-4" />
    case 'exonerado':
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

/**
 * Obtiene el texto descriptivo del estado del pago
 * @param {string} status - Estado del pago
 * @returns {string} Texto del estado
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'paid':
      return 'Pagado'
    case 'pending':
      return 'Pendiente'
    case 'overdue':
      return 'Vencido'
    case 'verifying':
      return 'Por Verificar'
    case 'processing':
      return 'Procesando'
    case 'exonerado':
      return 'Exonerado'
    default:
      return 'Desconocido'
  }
}

/**
 * Formatea una fecha en formato dd/mm/aaaa
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Formatea un monto como moneda peruana
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado con símbolo de soles
 */
export const formatCurrency = (amount) => {
  return `S/ ${amount.toFixed(2)}`
}

/**
 * Calcula estadísticas de resumen de pagos
 * @param {Array} payments - Array de pagos
 * @returns {Object} Objeto con estadísticas calculadas
 */
export const calculatePaymentStats = (payments) => {
  // Excluir pagos exonerados de todos los cálculos
  const nonExemptPayments = payments.filter(p =>
    p.status !== 'exonerado' && !p.exonerado
  )

  const totalPending = nonExemptPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const overdueCount = nonExemptPayments
    .filter(p => p.status === 'overdue').length

  const paidThisMonth = nonExemptPayments
    .filter(p => p.status === 'paid' && p.paymentDate &&
      new Date(p.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const exemptCount = payments.filter(p =>
    p.status === 'exonerado' || p.exonerado
  ).length

  return {
    totalPending,
    overdueCount,
    paidThisMonth,
    exemptCount
  }
}

/**
 * Filtra pagos según criterios especificados
 * @param {Array} payments - Array de pagos
 * @param {Object} filters - Objeto con criterios de filtro
 * @returns {Array} Array de pagos filtrados
 */
export const filterPayments = (payments, filters) => {
  return payments.filter(payment => {
    // Filtro por hijo
    if (filters.childId !== 'all' && payment.childId !== filters.childId) return false

    // Filtro por estado
    if (filters.status !== 'all' && payment.status !== filters.status) return false

    // Filtro por mes
    if (filters.month !== 'all') {
      const paymentMonth = new Date(payment.dueDate)
      const monthKey = `${paymentMonth.getFullYear()}-${String(paymentMonth.getMonth() + 1).padStart(2, '0')}`
      if (monthKey !== filters.month) return false
    }

    // Filtro por concepto
    if (filters.concept !== 'all' && payment.concept !== filters.concept) return false

    return true
  })
}

/**
 * Extrae conceptos únicos de un array de pagos
 * @param {Array} payments - Array de pagos
 * @returns {Array} Array de conceptos únicos
 */
export const getUniqueConcepts = (payments) => {
  return [...new Set(payments.map(p => p.concept))]
}

/**
 * Extrae meses únicos de un array de pagos
 * @param {Array} payments - Array de pagos
 * @returns {Array} Array de meses únicos en formato YYYY-MM
 */
export const getUniqueMonths = (payments) => {
  return [...new Set(payments.map(p => {
    const date = new Date(p.dueDate)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }))].sort()
}
