import { calculateMora } from './moraCalculator.jsx'
import { parseDateOnly } from '../dateUtils'

/**
 * Utilidades para procesamiento y agrupación de obligaciones de pago
 * Incluye lógica de agrupación familiar y cálculo de totales
 */

/**
 * Identifica al hijo principal (mayor) de una familia
 * Ordena por nivel educativo (secundaria > primaria > inicial) y luego por grado
 * @param {Array} students - Array de estudiantes
 * @returns {Object|null} Estudiante principal o null si no hay estudiantes
 */
export function getPrimaryStudent(students) {
  if (!students || students.length === 0) return null

  return students.sort((a, b) => {
    // Primero por nivel (secundaria > primaria > inicial)
    const nivelOrder = { 'secundaria': 3, 'primaria': 2, 'inicial': 1 }
    const nivelDiff = (nivelOrder[b.nivel] || 0) - (nivelOrder[a.nivel] || 0)
    if (nivelDiff !== 0) return nivelDiff

    // Luego por grado (número)
    const gradoA = parseInt(a.grado) || 0
    const gradoB = parseInt(b.grado) || 0
    return gradoB - gradoA
  })[0]
}

/**
 * Agrupa obligaciones por periodo (mes-año)
 * @param {Array} obligations - Array de obligaciones
 * @param {Array} students - Array de estudiantes para referencia
 * @param {Array} concepts - Array de conceptos de pago
 * @param {Function} calculateMoraFn - Función de cálculo de mora (opcional)
 * @returns {Object} Obligaciones agrupadas por periodo
 */
export function groupObligationsByPeriod(obligations, students = [], concepts = [], calculateMoraFn = calculateMora) {
  const groupedObligations = {}

  obligations.forEach(obligation => {
    const date = parseDateOnly(obligation.due_date) || new Date(obligation.due_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!groupedObligations[key]) {
      groupedObligations[key] = {
        periodo: key,
        mes: date.getMonth() + 1,
        año: date.getFullYear(),
        due_date: obligation.due_date,
        detalles: [],
        total_amount: 0,
        paid_amount: 0,
        pending_balance: 0,
        state: 'pendiente'
      }
    }

    const concept = concepts.find(c => c.id === obligation.concept_id)
    const student = students.find(s => s.id === obligation.student_id)
    const mora = (obligation.state === 'pendiente' || obligation.state === 'parcial') ?
      calculateMoraFn(obligation.due_date, obligation.total_amount) : 0

    groupedObligations[key].detalles.push({
      estudiante: student ? `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() + `, ${student.first_names || ''}${student.last_names ? ' ' + student.last_names : ''}` : 'N/A',
      student_id: student?.id,
      concepto: concept?.name || 'N/A',
      concept_id: concept?.id,
      obligation_id: obligation.id,
      amount: obligation.total_amount,
      pagado: obligation.paid_amount,
      saldo: obligation.pending_balance,
      mora: mora,
      state: obligation.state
    })

    groupedObligations[key].total_amount += obligation.total_amount
    groupedObligations[key].paid_amount += obligation.paid_amount
    groupedObligations[key].pending_balance += obligation.pending_balance

    // Estado general del mes (pendiente si alguno está pendiente)
    if (obligation.state === 'pendiente' || obligation.state === 'parcial') {
      groupedObligations[key].state = 'pendiente'
    } else if (groupedObligations[key].state !== 'pendiente' && obligation.state === 'pagado') {
      groupedObligations[key].state = 'pagado'
    }
  })

  return groupedObligations
}

/**
 * Convierte obligaciones agrupadas a array ordenado por fecha
 * @param {Object} groupedObligations - Obligaciones agrupadas
 * @returns {Array} Array de periodos ordenados
 */
export function sortGroupedObligationsByDate(groupedObligations) {
  return Object.values(groupedObligations)
    .sort((a, b) => (parseDateOnly(a.due_date)?.getTime() || 0) - (parseDateOnly(b.due_date)?.getTime() || 0))
}

/**
 * Filtra obligaciones de estudiantes de una familia
 * @param {Array} obligations - Todas las obligaciones
 * @param {Array} familyStudentIds - IDs de estudiantes de la familia
 * @returns {Array} Obligaciones filtradas
 */
export function filterFamilyObligations(obligations, familyStudentIds) {
  return obligations.filter(o => familyStudentIds.includes(o.student_id))
}

/**
 * Calcula el total de mora para un conjunto de obligaciones
 * @param {Array} obligations - Array de obligaciones
 * @param {Function} calculateMoraFn - Función de cálculo de mora
 * @returns {number} Total de mora
 */
export function calculateTotalMora(obligations, calculateMoraFn = calculateMora) {
  return obligations.reduce((total, obligation) => {
    if (obligation.state === 'pendiente' || obligation.state === 'parcial') {
      return total + calculateMoraFn(obligation.due_date, obligation.total_amount)
    }
    return total
  }, 0)
}

/**
 * Obtiene estadísticas de obligaciones
 * @param {Array} obligations - Array de obligaciones
 * @returns {Object} Estadísticas { total, pagadas, pendientes, vencidas, montoTotal, montoPagado, saldoPendiente }
 */
export function getObligationStats(obligations) {
  const now = new Date()

  return {
    total: obligations.length,
    pagadas: obligations.filter(o => o.state === 'pagado').length,
    pendientes: obligations.filter(o => o.state === 'pendiente').length,
    parciales: obligations.filter(o => o.state === 'parcial').length,
    vencidas: obligations.filter(o => {
      const dueDate = parseDateOnly(o.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return (o.state === 'pendiente' || o.state === 'parcial') && dueDate && dueDate.getTime() < today.getTime()
    }).length,
    total_amount: obligations.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    paid_amount: obligations.reduce((sum, o) => sum + (o.paid_amount || 0), 0),
    pending_balance: obligations.reduce((sum, o) => sum + (o.pending_balance || 0), 0)
  }
}

/**
 * Filtra obligaciones por criterios múltiples
 * @param {Array} obligations - Array de obligaciones
 * @param {Object} filters - Filtros { studentId, conceptId, status, month, year }
 * @returns {Array} Obligaciones filtradas
 */
export function filterObligations(obligations, filters = {}) {
  let filtered = [...obligations]

  if (filters.studentId) {
    filtered = filtered.filter(o => o.student_id === filters.studentId)
  }

  if (filters.conceptId) {
    filtered = filtered.filter(o => o.concept_id === filters.conceptId)
  }

  if (filters.status) {
    filtered = filtered.filter(o => o.state === filters.status)
  }

  if (filters.month) {
    filtered = filtered.filter(o => o.due_month === filters.month)
  }

  if (filters.year) {
    filtered = filtered.filter(o => o.academic_year === filters.year)
  }

  return filtered
}

/**
 * Genera un resumen de cronograma de pagos familiar
 * @param {Array} familyStudents - Estudiantes de la familia
 * @param {Array} obligations - Todas las obligaciones
 * @param {Array} concepts - Conceptos de pago
 * @param {Function} calculateMoraFn - Función de cálculo de mora
 * @returns {Object} { schedule, primaryStudent, totalStats }
 */
export function generateFamilyPaymentSchedule(familyStudents, obligations, concepts, calculateMoraFn = calculateMora) {
  if (!familyStudents || familyStudents.length === 0) {
    return { schedule: [], primaryStudent: null, totalStats: null }
  }

  // Identificar hijo principal
  const primaryStudent = getPrimaryStudent(familyStudents)

  // Obtener IDs de la familia
  const familyStudentIds = familyStudents.map(s => s.id)

  // Filtrar obligaciones familiares
  const familyObligations = filterFamilyObligations(obligations, familyStudentIds)

  // Agrupar por periodo
  const groupedObligations = groupObligationsByPeriod(familyObligations, familyStudents, concepts, calculateMoraFn)

  // Ordenar por fecha
  const schedule = sortGroupedObligationsByDate(groupedObligations)

  // Calcular estadísticas totales
  const totalStats = getObligationStats(familyObligations)

  return {
    schedule,
    primaryStudent,
    totalStats
  }
}

/**
 * Verifica si un estudiante tiene pagos mensuales pendientes
 * @param {string} studentId - ID del estudiante
 * @param {Array} obligations - Array de obligaciones
 * @returns {boolean} true si tiene pagos pendientes
 */
export function hasStudentPendingMonthlyPayments(studentId, obligations) {
  return obligations.some(o =>
    o.student_id === studentId &&
    (o.state === 'pendiente' || o.state === 'parcial') &&
    o.type !== 'unico' // Excluir pagos únicos
  )
}

/**
 * Obtiene el estado general de pagos de un estudiante
 * @param {string} studentId - ID del estudiante
 * @param {Array} obligations - Array de obligaciones
 * @returns {Object} { status, pendingCount, overdueCount, totalPending }
 */
export function getStudentPaymentStatus(studentId, obligations) {
  const studentObligations = obligations.filter(o => o.student_id === studentId)

  const pendingCount = studentObligations.filter(o => o.state === 'pendiente' || o.state === 'parcial').length
  const overdueCount = studentObligations.filter(o => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = parseDateOnly(o.due_date)
    return (o.state === 'pendiente' || o.state === 'parcial') && dueDate && dueDate.getTime() < today.getTime()
  }).length
  const totalPending = studentObligations
    .filter(o => o.state === 'pendiente' || o.state === 'parcial')
    .reduce((sum, o) => sum + o.pending_balance, 0)

  let status = 'al-dia'
  if (overdueCount > 0) {
    status = 'vencido'
  } else if (pendingCount > 0) {
    status = 'pendiente'
  }

  return {
    status,
    pendingCount,
    overdueCount,
    totalPending
  }
}
