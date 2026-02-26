import { useState, useEffect } from 'react'
import { usePaymentsStore } from '@/stores/paymentsStore'

/**
 * Custom Hook para manejar el estado del componente FamilyPaymentSchedule
 * Gestiona estados de UI, filtros, paginación y lógica de pagos
 */

/**
 * Hook principal para el estado del cronograma de pagos familiar
 * @param {string} userId - ID del usuario (padre) actual
 * @returns {Object} Estado y handlers del componente
 */
export const useFamilyPaymentScheduleState = (userId) => {
  // ============================
  // Estados de Datos
  // ============================
  const [familySchedule, setFamilySchedule] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // ============================
  // Estados de Filtros
  // ============================
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterConcept, setFilterConcept] = useState('all')
  const [filterStudent, setFilterStudent] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // ============================
  // Estados de UI
  // ============================
  const [expandedMonth, setExpandedMonth] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1) // 1: método, 2: detalles, 3: confirmación

  // ============================
  // Estados de Pago
  // ============================
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [voucherFile, setVoucherFile] = useState(null)
  const [operationNumber, setOperationNumber] = useState('')

  // ============================
  // Store de Pagos
  // ============================
  const { getFamilyPaymentSchedule, createPaymentIntention, methods, initialize } = usePaymentsStore()

  // ============================
  // Efectos
  // ============================

  /**
   * Cargar cronograma de pagos y métodos de pago al montar
   */
  useEffect(() => {
    loadInitialData()
  }, [userId])

  /**
   * Refresco automático cada 30 segundos
   */
  useEffect(() => {
    if (!userId) return

    const intervalId = setInterval(() => {
      console.log('Refrescando cronograma automáticamente...')
      loadFamilySchedule(true) // Silent refresh
    }, 30000) // 30 segundos

    return () => clearInterval(intervalId)
  }, [userId])

  /**
   * Cargar datos iniciales
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      // Inicializar store para cargar métodos de pago
      await initialize()
      // Cargar cronograma
      await loadFamilySchedule()
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Cargar cronograma de pagos de la familia
   * @param {boolean} silent - Si es true, no muestra indicador de carga
   */
  const loadFamilySchedule = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      const schedule = await getFamilyPaymentSchedule(userId)
      setFamilySchedule(schedule || [])
    } catch (error) {
      console.error('Error al cargar cronograma familiar:', error)
      setFamilySchedule([])
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  /**
   * Refrescar cronograma manualmente
   */
  const refreshSchedule = () => {
    console.log('Refrescando cronograma manualmente...')
    loadFamilySchedule(false)
  }

  // Obtener métodos de pago activos del store
  const activePaymentMethods = methods.filter(m => m.status === 'active')

  // ============================
  // Handlers de Filtros
  // ============================

  /**
   * Resetear todos los filtros
   */
  const resetFilters = () => {
    setFilterStatus('all')
    setFilterMonth('all')
    setFilterConcept('all')
    setFilterStudent('all')
    setSearchTerm('')
  }

  // ============================
  // Handlers de UI
  // ============================

  /**
   * Toggle expandir/colapsar mes
   */
  const toggleMonthExpansion = (monthKey) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey)
  }

  // ============================
  // Handlers de Modal de Pago
  // ============================

  /**
   * Abrir modal de pago
   * @param {Object} payment - Objeto de pago/obligación
   */
  const openPaymentModal = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
    setPaymentStep(1)
    setSelectedMethod(null)
    setVoucherFile(null)
    setOperationNumber('')
  }

  /**
   * Cerrar modal de pago y resetear estados
   */
  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPayment(null)
    setSelectedMethod(null)
    setVoucherFile(null)
    setOperationNumber('')
    setPaymentStep(1)
  }

  /**
   * Confirmar selección de método de pago y avanzar a paso 2
   * @param {Object} method - Método de pago seleccionado
   */
  const handleConfirmMethod = (method) => {
    setSelectedMethod(method)
    setPaymentStep(2)
  }

  /**
   * Volver al paso de selección de método
   */
  const goBackToMethodSelection = () => {
    setPaymentStep(1)
    setSelectedMethod(null)
    setVoucherFile(null)
    setOperationNumber('')
  }

  /**
   * Manejar subida de archivo de comprobante
   * @param {Event} e - Evento de cambio de input
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Por favor, sube un archivo JPG, PNG o PDF')
        return
      }

      // Validar tamaño (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('El archivo no debe superar los 5MB')
        return
      }

      setVoucherFile(file)
    }
  }

  /**
   * Enviar pago para verificación
   */
  const handleSubmitPayment = async () => {
    if (!selectedPayment || !selectedMethod) {
      alert('Faltan datos del pago')
      return
    }

    // Validar número de operación para métodos digitales y bancarios
    if ((selectedMethod.type === 'digital' || selectedMethod.type === 'bank') && !operationNumber.trim()) {
      alert('Debes ingresar el número de operación')
      return
    }

    // Validar voucher
    if (!voucherFile) {
      alert('Debes subir un comprobante de pago')
      return
    }

    try {
      setIsLoading(true)

      // Subir voucher primero si existe (usando endpoint específico para padres)
      let voucherPath = null
      if (voucherFile) {
        const formData = new FormData()
        formData.append('file', voucherFile)
        formData.append('folder', 'payment-vouchers')

        // Usar endpoint de payment-intentions que permite rol padre
        const { post } = await import('@/services/api')
        const uploadResponse = await post('/payment-intentions/upload-voucher', formData)
        voucherPath = uploadResponse?.data?.path || uploadResponse?.path || null
      }

      // Preparar datos para payment_intention (mapeo correcto para el backend)
      const intentionData = {
        obligation_id: selectedPayment.id,
        student_id: selectedPayment.student_id,
        user_id: userId, // ID del padre
        amount: parseFloat(selectedPayment.pending_balance || selectedPayment.amount),
        payment_method: selectedMethod.name,
        operation_number: operationNumber.trim() || `CASH-${Date.now()}`,
        observations: `Pago de ${selectedPayment.concepto} - ${selectedPayment.monthName || 'Único'}`,
        voucher: voucherPath,
        payment_date: new Date().toISOString(),
        registration_date: new Date().toISOString()
      }

      // Crear intención de pago
      await createPaymentIntention(intentionData)

      // Avanzar a confirmación
      setPaymentStep(3)

      // Recargar cronograma después de un momento
      setTimeout(() => {
        loadFamilySchedule()
      }, 1500)
    } catch (error) {
      console.error('Error al registrar pago:', error)
      alert('Ocurrió un error al registrar el pago. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Convertir archivo a Base64
   * @param {File} file - Archivo a convertir
   * @returns {Promise<string>} Base64 string
   */
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // ============================
  // Return del Hook
  // ============================
  return {
    // Datos
    familySchedule,
    isLoading,
    paymentMethods: activePaymentMethods, // Métodos de pago dinámicos

    // Filtros
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterConcept,
    setFilterConcept,
    filterStudent,
    setFilterStudent,
    searchTerm,
    setSearchTerm,
    resetFilters,

    // UI
    expandedMonth,
    toggleMonthExpansion,

    // Modal de Pago
    showPaymentModal,
    paymentStep,
    selectedPayment,
    selectedMethod,
    setSelectedMethod,
    voucherFile,
    setVoucherFile,
    operationNumber,
    setOperationNumber,
    openPaymentModal,
    closePaymentModal,
    handleConfirmMethod,
    goBackToMethodSelection,
    handleFileUpload,
    handleSubmitPayment,

    // Acciones
    loadFamilySchedule,
    refreshSchedule
  }
}

export default useFamilyPaymentScheduleState
