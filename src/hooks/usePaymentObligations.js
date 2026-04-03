import { useState } from 'react'
import { usePaymentsStore } from '../stores/paymentsStore'

/**
 * Hook para gestionar obligaciones de pago y registros
 * Maneja pagos manuales, filtros de estado y edición de vencimientos
 */
export const usePaymentObligations = () => {
  const {
    obligations,
    paymentRecords,
    initialize,
    registerManualPayment,
    updatePaymentObligation
  } = usePaymentsStore()

  // Alias para compatibilidad
  const updateObligation = updatePaymentObligation

  // Estados para gestión de pagos
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterNivel, setFilterNivel] = useState('')
  const [searchStudent, setSearchStudent] = useState('')
  const [selectedObligation, setSelectedObligation] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Estados para edición de fechas de vencimiento
  const [editingDueDate, setEditingDueDate] = useState(null)
  const [newDueDate, setNewDueDate] = useState('')

  // Estados para modales de alerta
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Aceptar',
    cancelText: null,
    onCancel: null
  })

  // Abrir modal de pago manual
  const openManualPaymentModal = (obligation, student) => {
    setSelectedObligation(obligation)
    setSelectedStudent(student)
    setShowManualPaymentModal(true)
  }

  // Cerrar modal de pago manual
  const closeManualPaymentModal = () => {
    setShowManualPaymentModal(false)
    setSelectedObligation(null)
    setSelectedStudent(null)
  }

  // Registrar pago manual
  const handleManualPayment = async (paymentData) => {
    try {
      await registerManualPayment(paymentData)
      closeManualPaymentModal()
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      return true
    } catch (error) {
      console.error('Error registering payment:', error)
      showAlert({
        title: 'Error al Registrar Pago',
        message: error.message || 'Ocurrió un error al registrar el pago',
        type: 'error'
      })
      return false
    }
  }

  // Iniciar edición de fecha de vencimiento
  const startEditingDueDate = (obligation) => {
    setEditingDueDate(obligation.id)
    setNewDueDate(obligation.due_date || '')
  }

  // Cancelar edición de fecha
  const cancelEditingDueDate = () => {
    setEditingDueDate(null)
    setNewDueDate('')
  }

  // Guardar nueva fecha de vencimiento
  const saveDueDate = async (obligationId) => {
    if (!newDueDate) {
      alert('Por favor ingrese una fecha válida')
      return
    }

    try {
      const obligation = obligations.find(o => o.id === obligationId)
      if (!obligation) return

      // Recalcular estado según nueva fecha
      const today = new Date()
      const dueDate = new Date(newDueDate)
      const currentStatus = obligation.estado_pago || obligation.estadoPago
      const isPaid = currentStatus === 'pagado'

      let newStatus = currentStatus
      if (!isPaid) {
        if (dueDate < today) {
          newStatus = 'vencido'
        } else {
          newStatus = 'pendiente'
        }
      }

      // Actualizar obligación en el backend
      await updateObligation(obligationId, {
        due_date: newDueDate,
        estado_pago: newStatus
      })

      cancelEditingDueDate()
    } catch (error) {
      console.error('Error updating due date:', error)
      showAlert({
        title: 'Error al Actualizar',
        message: 'No se pudo actualizar la fecha de vencimiento',
        type: 'error'
      })
    }
  }

  // Mostrar alerta
  const showAlert = (config) => {
    setAlertModal({
      isOpen: true,
      title: config.title || '',
      message: config.message || '',
      type: config.type || 'info',
      onConfirm: config.onConfirm || null,
      confirmText: config.confirmText || 'Aceptar',
      cancelText: config.cancelText || null,
      onCancel: config.onCancel || null
    })
  }

  // Cerrar alerta
  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null,
      confirmText: 'Aceptar',
      cancelText: null,
      onCancel: null
    })
  }

  // Obtener el estado real de la obligación (considerando vencimiento)
  const getRealStatus = (obligation) => {
    const baseStatus = obligation.estadoPago || obligation.estado_pago || obligation.status || 'pendiente'

    // Si ya está pagado, mantener ese estado
    if (baseStatus === 'pagado' || baseStatus === 'paid') {
      return 'pagado'
    }

    // Si está en verificación, mantener ese estado
    if (baseStatus === 'en_verificacion') {
      return 'en_verificacion'
    }

    // Detectar si está vencido por la fecha
    if (obligation.due_date) {
      const dueDate = new Date(obligation.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dueDate < today) {
        return 'vencido'
      }
    }

    // Si el status es 'partial', devolver 'parcial'
    if (baseStatus === 'partial') {
      return 'parcial'
    }

    return 'pendiente'
  }

  // Obtener obligaciones filtradas
  const getFilteredObligations = () => {
    let filtered = obligations

    // Filtrar por estado
    if (filterStatus && filterStatus !== 'todos') {
      filtered = filtered.filter(o => {
        const realStatus = getRealStatus(o)
        return realStatus === filterStatus
      })
    }

    // Filtrar por nivel
    if (filterNivel && filterNivel !== '') {
      filtered = filtered.filter(o => {
        const nivel = o.nivel || o.level || o.student_level || o.level_name || ''
        return nivel.toLowerCase().includes(filterNivel.toLowerCase())
      })
    }

    // Filtrar por búsqueda de estudiante
    if (searchStudent && searchStudent.trim() !== '') {
      const searchLower = searchStudent.toLowerCase().trim()
      filtered = filtered.filter(o => {
        const studentName = o.studentName || o.student_name || o.estudiante || ''
        const studentFirstNames = o.student_first_names || o.first_names || ''
        const studentSecondName = o.student_last_names || o.last_names || ''
        const studentPaternalLN = o.student_paternal_last_name || o.paternal_last_name || ''
        const studentMaternalLN = o.student_maternal_last_name || o.maternal_last_name || ''
        const nombres = studentSecondName ? `${studentFirstNames} ${studentSecondName}` : studentFirstNames
        const apellidos = `${studentPaternalLN} ${studentMaternalLN}`.trim()
        const fullName = `${apellidos} ${nombres}`.trim()

        return studentName.toLowerCase().includes(searchLower) ||
               fullName.toLowerCase().includes(searchLower)
      })
    }

    return filtered
  }

  // Calcular estadísticas
  const getStats = () => {
    const total = obligations.length
    const pagadas = obligations.filter(o => o.estadoPago === 'pagado').length
    const pendientes = obligations.filter(o => o.estadoPago === 'pendiente').length
    const vencidas = obligations.filter(o => o.estadoPago === 'vencido').length

    const totalMonto = obligations.reduce((sum, o) => sum + (o.amount || 0), 0)
    const paid_amount = obligations
      .filter(o => o.estadoPago === 'pagado')
      .reduce((sum, o) => sum + (o.amount || 0), 0)
    const montoPendiente = totalMonto - paid_amount

    return {
      total,
      pagadas,
      pendientes,
      vencidas,
      totalMonto,
      montoPagado: paid_amount,
      montoPendiente
    }
  }

  return {
    // Store data
    obligations,
    paymentRecords,
    // Filter state
    filterStatus,
    setFilterStatus,
    filterNivel,
    setFilterNivel,
    searchStudent,
    setSearchStudent,
    // Payment modal
    selectedObligation,
    selectedStudent,
    showManualPaymentModal,
    openManualPaymentModal,
    closeManualPaymentModal,
    handleManualPayment,
    // Due date editing
    editingDueDate,
    newDueDate,
    setNewDueDate,
    startEditingDueDate,
    cancelEditingDueDate,
    saveDueDate,
    // Alert modal
    alertModal,
    showAlert,
    closeAlert,
    // Schedule modal
    showScheduleModal,
    setShowScheduleModal,
    // Success message
    showSuccessMessage,
    setShowSuccessMessage,
    // Utilities
    getFilteredObligations,
    getStats,
    initialize
  }
}
