import { CheckCircle, Clock, AlertCircle, Loader2, XCircle } from 'lucide-react'
import { parseDateOnly } from './dateUtils'

/**
 * Utilidades para el Cronograma de Pagos Familiar
 * Funciones puras para formateo, filtrado y procesamiento de datos
 */

/**
 * Nombres de meses en español
 * @constant
 */
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

/**
 * Obtiene el nombre del mes en español
 * @param {number} month - Número del mes (1-12)
 * @returns {string} Nombre del mes
 */
export const getMonthName = (month) => {
  return MONTH_NAMES[month - 1] || ''
}

/**
 * Obtiene las clases CSS de color según el estado del pago
 * @param {string} estado - Estado del pago ('pagado', 'pendiente', 'vencido', etc.)
 * @returns {string} Clases CSS para el badge de estado
 */
export const getStatusColor = (estado) => {
  switch (estado) {
    case 'pagado':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'vencido':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'en_verificacion':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'parcial':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'exonerado':
      return 'bg-gray-100 text-gray-600 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Obtiene el icono correspondiente al estado del pago
 * @param {string} estado - Estado del pago
 * @returns {JSX.Element|null} Componente de icono
 */
export const getStatusIcon = (estado) => {
  switch (estado) {
    case 'pagado':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'pendiente':
      return <Clock className="w-5 h-5 text-yellow-600" />
    case 'vencido':
      return <AlertCircle className="w-5 h-5 text-red-600" />
    case 'en_verificacion':
      return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
    case 'parcial':
      return <Clock className="w-5 h-5 text-orange-600" />
    case 'exonerado':
      return <XCircle className="w-5 h-5 text-gray-500" />
    default:
      return null
  }
}

/**
 * Verifica si un pago está vencido
 * @param {string} fechaVencimiento - Fecha de vencimiento ISO
 * @param {string} estado - Estado del pago
 * @returns {boolean} true si está vencido
 */
export const isPaymentOverdue = (fechaVencimiento, estado) => {
  return new Date(fechaVencimiento) < new Date() && estado === 'pendiente'
}

/**
 * Aplana el cronograma de pagos a una lista continua
 * Convierte la estructura agrupada por mes a una lista plana de pagos individuales
 *
 * @param {Array} schedule - Cronograma agrupado por mes
 * @returns {Array<Object>} Lista plana de pagos con información adicional
 */
export const flattenPaymentSchedule = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) {
    return []
  }

  return schedule.flatMap(monthData =>
    monthData.detalles.map(detalle => ({
      ...detalle,
      mes: monthData.mes,
      año: monthData.año,
      periodo: monthData.periodo,
      due_date: monthData.due_date,
      monthName: `${getMonthName(monthData.mes)} ${monthData.año}`
    }))
  )
}

/**
 * Extrae valores únicos de un array de pagos para usar en filtros
 * @param {Array<Object>} payments - Array de pagos
 * @returns {Object} Objeto con arrays de valores únicos
 */
export const extractUniqueFilterValues = (payments) => {
  if (!payments || !Array.isArray(payments)) {
    return {
      concepts: [],
      months: [],
      students: []
    }
  }

  // Orden correcto de meses en español
  const monthOrder = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

  const sortedMonths = [...new Set(payments.map(p => p.periodo))].filter(Boolean).sort((a, b) => {
    const indexA = monthOrder.indexOf(a?.toLowerCase())
    const indexB = monthOrder.indexOf(b?.toLowerCase())
    return indexA - indexB
  })

  return {
    concepts: [...new Set(payments.map(p => p.concepto))],
    months: sortedMonths,
    students: [...new Set(payments.map(p => p.estudiante))]
  }
}

/**
 * Filtra pagos según criterios múltiples
 * @param {Array<Object>} payments - Array de pagos a filtrar
 * @param {Object} filters - Objeto con filtros aplicados
 * @param {string} filters.status - Filtro de estado
 * @param {string} filters.month - Filtro de mes
 * @param {string} filters.concept - Filtro de concepto
 * @param {string} filters.student - Filtro de estudiante
 * @param {string} filters.search - Término de búsqueda
 * @returns {Array<Object>} Pagos filtrados
 */
export const filterPayments = (payments, filters) => {
  if (!payments || !Array.isArray(payments)) {
    return []
  }

  const {
    status = 'all',
    month = 'all',
    concept = 'all',
    student = 'all',
    search = ''
  } = filters

  return payments.filter(payment => {
    const matchesStatus = status === 'all' || payment.state === status
    const matchesMonth = month === 'all' || payment.periodo === month
    const matchesConcept = concept === 'all' || payment.concepto === concept
    const matchesStudent = student === 'all' || payment.estudiante === student
    const matchesSearch = search === '' ||
      payment.estudiante.toLowerCase().includes(search.toLowerCase()) ||
      payment.concepto.toLowerCase().includes(search.toLowerCase())

    return matchesStatus && matchesMonth && matchesConcept && matchesStudent && matchesSearch
  })
}

/**
 * Calcula el total de saldo pendiente de un cronograma
 * @param {Array} schedule - Cronograma de pagos
 * @returns {number} Total de saldo pendiente
 */
export const calculateTotalPendingBalance = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) {
    return 0
  }

  return schedule.reduce((sum, item) => sum + (item.pending_balance || 0), 0)
}

/**
 * Formatea una fecha ISO a formato local
 * @param {string} isoDate - Fecha en formato ISO
 * @param {string} locale - Locale para formatear (default: 'es-PE')
 * @returns {string} Fecha formateada
 */
export const formatDate = (isoDate, locale = 'es-PE') => {
  return new Date(isoDate).toLocaleDateString(locale)
}

/**
 * Agrupa pagos por estudiante
 * @param {Array<Object>} payments - Array de pagos
 * @returns {Object} Pagos agrupados por estudiante
 */
export const groupPaymentsByStudent = (payments) => {
  if (!payments || !Array.isArray(payments)) {
    return {}
  }

  return payments.reduce((grouped, payment) => {
    const studentName = payment.estudiante
    if (!grouped[studentName]) {
      grouped[studentName] = []
    }
    grouped[studentName].push(payment)
    return grouped
  }, {})
}

/**
 * Obtiene estadísticas de pagos
 * @param {Array<Object>} payments - Array de pagos
 * @returns {Object} Estadísticas { total, pagados, pendientes, vencidos, montoTotal, montoPendiente }
 */
export const getPaymentStatistics = (payments) => {
  if (!payments || !Array.isArray(payments)) {
    return {
      total: 0,
      pagados: 0,
      pendientes: 0,
      vencidos: 0,
      total_amount: 0,
      montoPendiente: 0
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return {
    total: payments.length,
    pagados: payments.filter(p => p.state === 'pagado').length,
    pendientes: payments.filter(p => p.state === 'pendiente').length,
    vencidos: payments.filter(p => {
      const due = parseDateOnly(p.due_date)
      return p.state === 'pendiente' && due && due.getTime() < now.getTime()
    }).length,
    total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    montoPendiente: payments.reduce((sum, p) => sum + (p.saldo || 0), 0)
  }
}

/**
 * Ordena pagos por fecha de vencimiento
 * @param {Array<Object>} payments - Array de pagos
 * @param {string} order - Orden ('asc' o 'desc')
 * @returns {Array<Object>} Pagos ordenados
 */
export const sortPaymentsByDueDate = (payments, order = 'asc') => {
  if (!payments || !Array.isArray(payments)) {
    return []
  }

  return [...payments].sort((a, b) => {
    const dateA = parseDateOnly(a.due_date)?.getTime() || 0
    const dateB = parseDateOnly(b.due_date)?.getTime() || 0

    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}
