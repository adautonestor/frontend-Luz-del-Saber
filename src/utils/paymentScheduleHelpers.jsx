/**
 * Utilidades para gestión de cronogramas de pago
 * Funciones puras - los datos deben ser provistos por el llamador desde servicios/stores
 */

import * as XLSX from 'xlsx'
import { CheckCircle, Clock, AlertCircle, X, Loader2, CircleDot } from 'lucide-react'
import { PAYMENT_STATUS_COLORS, EXCEL_COLUMN_WIDTHS, EXCEL_TABLE_HEADERS_BASE, EXCEL_TABLE_HEADERS_EXTENDED, STATUS_LABELS } from '../config/paymentScheduleConstants'

/**
 * TODO: Esta función debe ser reemplazada por:
 * const students = await studentsService.getEnrolled()
 * o usar directamente el store: useStudentsStore.getState().getEnrolled()
 *
 * Filtra estudiantes matriculados activos
 * @param {Array} students - Lista de estudiantes (desde servicio/store)
 * @returns {Array} Estudiantes matriculados activos
 */
export const loadEnrolledStudents = (students = []) => {
  return students.filter(s => {
    const nivel = s.nivel || s.level_id
    const grado = s.grado || s.grade_id
    const estado = s.estado || s.status
    return nivel && grado && (estado === 'activo' || estado === 'active')
  })
}

/**
 * Busca un estudiante por DNI (match exacto)
 */
export const searchStudentByDni = (students, dni) => {
  if (dni.length < 1) return null
  return students.find(s => s.dni && s.dni.toString() === dni) || null
}

/**
 * Filtra estudiantes por DNI (coincidencia parcial)
 */
export const filterStudentsByDni = (students, dni) => {
  if (!dni || dni.length < 1) return []
  return students.filter(s => s.dni && s.dni.toString().includes(dni))
}

/**
 * Filtra estudiantes por nombre
 */
export const filterStudentsByName = (students, searchName) => {
  if (!searchName) return []

  const searchLower = searchName.toLowerCase()
  return students.filter(student => {
    const fullName = `${student.first_names} ${student.last_names}`.toLowerCase()
    return fullName.includes(searchLower)
  })
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * const { schedule, siblings } = await paymentScheduleService.getFamily(studentId)
 *
 * Carga el cronograma de pagos completo de una familia
 * @param {Array} students - Lista de estudiantes (desde servicio/store)
 * @param {Array} paymentObligations - Lista de obligaciones de pago (desde servicio/store)
 * @param {string} studentId - ID del estudiante
 * @returns {Object} { schedule: Array, siblings: Array }
 */
export const loadFamilyPaymentSchedule = (students = [], paymentObligations = [], studentId) => {
  const student = students.find(s => s.id === studentId)

  if (!student) {
    return { schedule: [], siblings: [] }
  }

  // Cargar SOLO las obligaciones del estudiante seleccionado
  const studentPayments = paymentObligations.filter(p => p.student_id === studentId)

  // Ordenar por año escolar (más reciente primero) y luego por fecha de vencimiento
  const sortedPayments = studentPayments.sort((a, b) => {
    const yearA = a.academic_year || 0
    const yearB = b.academic_year || 0

    if (yearA !== yearB) {
      return yearB - yearA // Descendente por año
    }

    return new Date(a.due_date) - new Date(b.due_date)
  })

  return {
    schedule: sortedPayments,
    siblings: [student] // Solo el estudiante seleccionado
  }
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * const parent = await usersService.getById(parentId)
 * o usar directamente el store: useUsersStore.getState().getById(parentId)
 *
 * Busca la información del padre/tutor
 * @param {Array} users - Lista de usuarios (desde servicio/store)
 * @param {string} parentId - ID del padre
 * @returns {Object|null} Información del padre o null
 */
export const loadParentInfo = (users = [], parentId) => {
  if (!parentId) return null

  const parent = users.find(u => {
    const rol = u.rol || u.role
    return u.id === parentId && (rol === 'Padre' || rol === 'parent')
  })
  return parent || null
}

/**
 * Determina el estado de un pago
 */
export const getPaymentStatus = (payment) => {
  // Obtener el estado del pago (puede venir como state o status del backend)
  const paymentState = payment.state || payment.status || ''

  // Verificar si está exonerado
  if (payment.exonerado || paymentState === 'exonerado') return 'exonerado'

  // Verificar si está pagado (puede ser 'pagado' del frontend o 'paid' del backend)
  if (paymentState === 'pagado' || paymentState === 'paid') return 'pagado'

  // Verificar si está en verificación
  if (paymentState === 'en_verificacion') return 'en_verificacion'

  // Verificar si está parcial
  if (paymentState === 'parcial' || paymentState === 'partial') return 'parcial'

  // Verificar si está vencido por la fecha
  if (payment.due_date) {
    const dueDate = new Date(payment.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dueDate < today) return 'vencido'
  }

  return 'pendiente'
}

/**
 * Obtiene el color CSS para un estado de pago
 */
export const getStatusColor = (status) => {
  return PAYMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-300'
}

/**
 * Obtiene el icono para un estado de pago
 */
export const getStatusIcon = (status) => {
  const icons = {
    pagado: <CheckCircle size={16} className="text-green-600" />,
    pendiente: <Clock size={16} className="text-yellow-600" />,
    vencido: <AlertCircle size={16} className="text-red-600" />,
    exonerado: <X size={16} className="text-gray-600" />,
    en_verificacion: <Loader2 size={16} className="text-blue-600 animate-spin" />,
    parcial: <CircleDot size={16} className="text-orange-600" />
  }
  return icons[status] || <Clock size={16} className="text-gray-400" />
}

/**
 * Filtra pagos válidos (con monto mayor a 0)
 */
export const getValidPayments = (paymentSchedule) => {
  return paymentSchedule.filter(p => parseFloat(p.total_amount || p.amount || 0) > 0)
}

/**
 * Calcula los totales de pagos
 */
export const calculatePaymentTotals = (validPayments) => {
  const nonExemptPayments = validPayments.filter(p => {
    const state = p.state || p.status || ''
    return !p.exonerado && state !== 'exonerado'
  })

  const totalAmount = nonExemptPayments.reduce((sum, p) => sum + parseFloat(p.total_amount || p.amount || 0), 0)
  const paidAmount = nonExemptPayments
    .filter(p => {
      const state = p.state || p.status || ''
      return state === 'pagado' || state === 'paid'
    })
    .reduce((sum, p) => sum + parseFloat(p.total_amount || p.amount || 0), 0)
  const pendingAmount = totalAmount - paidAmount
  const exemptCount = validPayments.filter(p => {
    const state = p.state || p.status || ''
    return p.exonerado || state === 'exonerado'
  }).length

  return {
    totalAmount,
    paidAmount,
    pendingAmount,
    exemptCount
  }
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * await paymentObligationsService.toggleExemption(paymentId)
 *
 * Esta es una operación de actualización (CRUD) que debe estar en el servicio de pagos.
 * El servicio debe actualizar el estado en el backend y retornar el estado actualizado.
 *
 * Calcula el nuevo estado de exoneración (DEPRECATED - usar servicio)
 * @param {boolean} currentExoneradoStatus - Estado actual
 * @returns {boolean} Nuevo estado de exoneración
 * @deprecated Usar paymentObligationsService.toggleExemption() en su lugar
 */
export const togglePaymentExemption = (currentExoneradoStatus) => {
  console.warn('⚠️ togglePaymentExemption debe ser reemplazada por paymentObligationsService.toggleExemption()')
  return !currentExoneradoStatus
}

/**
 * Exporta el cronograma de pagos a Excel
 */
export const exportScheduleToExcel = ({
  selectedStudent,
  validPayments,
  parentStudents,
  studentParent,
  totalAmount,
  paidAmount,
  pendingAmount,
  exemptCount
}) => {
  if (!selectedStudent || validPayments.length === 0) return

  const wb = XLSX.utils.book_new()
  const sheetData = []

  // Header con información del estudiante
  sheetData.push(['CRONOGRAMA DE PAGOS'])
  sheetData.push([])
  sheetData.push(['Estudiante:', `${selectedStudent.first_names} ${selectedStudent.last_names}`])
  sheetData.push(['DNI / Código:', selectedStudent.dni || '-'])
  sheetData.push(['Nivel:', selectedStudent.nivel || '-'])
  sheetData.push(['Grado:', `${selectedStudent.grado || '-'}° - Sección ${selectedStudent.seccion || '-'}`])

  // Información del padre
  if (studentParent) {
    sheetData.push(['Padre/Tutor:', `${studentParent.name} ${studentParent.apellidoPaterno || studentParent.last_names || ''} ${studentParent.apellidoMaterno || ''}`])
    if (studentParent.email) {
      sheetData.push(['Email:', studentParent.email])
    }
    if (studentParent.telefono) {
      sheetData.push(['Teléfono:', studentParent.telefono])
    }
  }
  sheetData.push([])
  sheetData.push([])

  // Tabla de pagos
  const headers = [...EXCEL_TABLE_HEADERS_BASE]
  if (parentStudents.length > 1) {
    headers.push('Estudiante')
  }
  headers.push(...EXCEL_TABLE_HEADERS_EXTENDED)
  sheetData.push(headers)

  // Función para formatear fechas consistentemente
  const formatDateForExcel = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Datos de pagos
  validPayments.forEach(payment => {
    const paymentStudent = parentStudents.find(s => s.id === payment.student_id)
    const row = [payment.academic_year || '-']

    if (parentStudents.length > 1) {
      row.push(paymentStudent ? `${paymentStudent.first_names} ${paymentStudent.last_names}` : '-')
    }

    // Calcular el estado correcto usando la misma lógica que la tabla
    const status = getPaymentStatus(payment)
    const statusLabel = STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)

    row.push(
      payment.concepto,
      payment.mes || '-',
      formatDateForExcel(payment.due_date),
      parseFloat(payment.total_amount || payment.amount || 0).toFixed(2),
      statusLabel,
      formatDateForExcel(payment.payment_date)
    )
    sheetData.push(row)
  })

  // Totales
  sheetData.push([])
  sheetData.push(['', '', '', '', ''])
  sheetData.push(['RESUMEN DE PAGOS', '', '', '', ''])
  sheetData.push(['Total a Pagar:', '', `S/ ${totalAmount.toFixed(2)}`, '', ''])
  sheetData.push(['Monto Pagado:', '', `S/ ${paidAmount.toFixed(2)}`, '', ''])
  sheetData.push(['Saldo Pendiente:', '', `S/ ${pendingAmount.toFixed(2)}`, '', ''])

  if (exemptCount > 0) {
    sheetData.push(['Pagos Exonerados:', '', exemptCount, '', ''])
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData)

  // Ajustar anchos de columna
  const colWidths = [EXCEL_COLUMN_WIDTHS.anoEscolar]
  if (parentStudents.length > 1) {
    colWidths.push(EXCEL_COLUMN_WIDTHS.estudiante)
  }
  colWidths.push(
    EXCEL_COLUMN_WIDTHS.concepto,
    EXCEL_COLUMN_WIDTHS.mes,
    EXCEL_COLUMN_WIDTHS.due_date,
    EXCEL_COLUMN_WIDTHS.amount,
    EXCEL_COLUMN_WIDTHS.state,
    EXCEL_COLUMN_WIDTHS.payment_date
  )
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Cronograma de Pagos')

  // Nombre del archivo
  const fileName = parentStudents.length > 1
    ? `Cronograma_Familiar_${studentParent?.apellidoPaterno || studentParent?.last_names || 'Padre'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    : `Cronograma_${selectedStudent.last_names}_${selectedStudent.first_names}_TodosLosAnios_${new Date().toISOString().slice(0, 10)}.xlsx`

  XLSX.writeFile(wb, fileName)
}

/**
 * Formatea el nombre completo del estudiante
 */
export const formatStudentFullName = (student) => {
  return `${student.last_names}, ${student.first_names}`
}

/**
 * Formatea el nombre completo del padre
 */
export const formatParentFullName = (parent) => {
  if (!parent) return 'No disponible'

  const firstName = parent.first_name || parent.name || ''
  const lastNames = parent.last_names || parent.apellidoPaterno || ''
  const maternalLastName = parent.apellidoMaterno || ''

  return `${firstName} ${lastNames} ${maternalLastName}`.trim()
}
