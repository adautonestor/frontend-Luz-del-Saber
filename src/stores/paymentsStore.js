import { create } from 'zustand'
import { paymentsService } from '../services/paymentsService'

// Importar utilidades refactorizadas
import {
  calculateMora,
  DEFAULT_MORA_CONFIG
} from '../utils/payments/moraCalculator.jsx'
import {
  generateFamilyPaymentSchedule,
  hasStudentPendingMonthlyPayments as checkPendingPayments,
  getStudentPaymentStatus as getPaymentStatus,
  getObligationStats
} from '../utils/payments/obligationProcessor.jsx'
import {
  calculateObligationUpdate,
  createPaymentRecord,
  createObligationUpdate,
  createPaymentConfirmation,
  createPaymentRejection,
  isDuplicateOperationNumber,
  calculatePaymentStats
} from '../utils/payments/paymentProcessor.jsx'

/**
 * Payments Store - Gestión de Pagos
 * Integrado con APIs reales del backend
 */
export const usePaymentsStore = create((set, get) => ({
  // ==================== STATE ====================
  concepts: [],
  methods: [],
  obligations: [],
  paymentRecords: [],
  paymentIntentions: [],
  isLoading: false,
  error: null,

  // ==================== FILTERS ====================
  filters: {
    student: '',
    concept: '',
    status: '',
    month: '',
    search: ''
  },

  // ==================== MORA CONFIG ====================
  moraConfig: DEFAULT_MORA_CONFIG,

  // Función wrapper para calcular mora (mantiene compatibilidad)
  calculateMora: (dueDate, baseAmount = null) => {
    const config = get().moraConfig
    return calculateMora(dueDate, baseAmount, config)
  },

  // Actualizar configuración de mora desde settings
  updateMoraConfig: (newConfig) => {
    set({ moraConfig: { ...get().moraConfig, ...newConfig } })
  },

  // ==================== INITIALIZE ====================
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      // Cargar datos desde APIs reales
      const [concepts, methods, obligations, records, intentions] = await Promise.all([
        paymentsService.getAllConcepts(),
        paymentsService.getAllMethods(),
        paymentsService.getAllObligations(),
        paymentsService.getAllRecords(),
        paymentsService.getAllIntentions()
      ])

      // Mapear obligaciones para normalizar campos del backend
      const mappedObligations = (obligations || []).map(obl => {
        // Normalizar el estado del backend al formato del frontend
        let estadoPago = obl.status || 'pending'
        if (estadoPago === 'paid') estadoPago = 'pagado'
        else if (estadoPago === 'pending') estadoPago = 'pendiente'
        else if (estadoPago === 'partial') estadoPago = 'parcial'
        else if (estadoPago === 'overdue') estadoPago = 'vencido'

        return {
          ...obl,
          estadoPago,
          amount: parseFloat(obl.total_amount || 0)
        }
      })

      set({
        concepts: concepts || [],
        methods: methods || [],
        obligations: mappedObligations,
        paymentRecords: records || [],
        paymentIntentions: intentions || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error al cargar sistema de pagos:', error)
      set({
        error: error.message || 'Error al cargar sistema de pagos',
        isLoading: false
      })
    }
  },

  // ==================== PAYMENT CONCEPTS ====================
  createPaymentConcept: async (conceptData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await paymentsService.createConcept(conceptData)

      // Extraer el concepto y los contadores de obligaciones generadas
      const newConcept = response.data || response
      const obligationsGenerated = response.obligationsGenerated || 0
      const studentsAffected = response.studentsAffected || 0

      set(state => ({
        concepts: [...state.concepts, newConcept],
        isLoading: false
      }))

      // Recargar obligaciones si se generaron
      if (obligationsGenerated > 0) {
        await get().initialize()
      }

      return {
        concept: newConcept,
        obligationsGenerated,
        studentsAffected
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updatePaymentConcept: async (conceptId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedConcept = await paymentsService.updateConcept(conceptId, updates)

      set(state => ({
        concepts: state.concepts.map(c => c.id === conceptId ? updatedConcept : c),
        isLoading: false
      }))

      return updatedConcept
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deletePaymentConcept: async (conceptId) => {
    set({ isLoading: true, error: null })

    try {
      await paymentsService.removeConcept(conceptId)

      set(state => ({
        concepts: state.concepts.filter(c => c.id !== conceptId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  regenerateObligations: async (conceptId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await paymentsService.regenerateObligations(conceptId)

      // Recargar obligaciones después de regenerar
      await get().initialize()

      set({ isLoading: false })

      return {
        obligationsDeleted: response.obligationsDeleted || 0,
        obligationsGenerated: response.obligationsGenerated || 0,
        studentsAffected: response.studentsAffected || 0
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  getConceptObligations: async (conceptId) => {
    set({ isLoading: true, error: null })

    try {
      const obligations = await paymentsService.getConceptObligations(conceptId)
      set({ isLoading: false })
      return obligations
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== PAYMENT METHODS ====================
  createPaymentMethod: async (methodData) => {
    set({ isLoading: true, error: null })

    try {
      const newMethod = await paymentsService.createMethod(methodData)

      set(state => ({
        methods: [...state.methods, newMethod],
        isLoading: false
      }))

      return newMethod
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updatePaymentMethod: async (methodId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedMethod = await paymentsService.updateMethod(methodId, updates)

      set(state => ({
        methods: state.methods.map(m => m.id === methodId ? updatedMethod : m),
        isLoading: false
      }))

      return updatedMethod
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deletePaymentMethod: async (methodId) => {
    set({ isLoading: true, error: null })

    try {
      await paymentsService.removeMethod(methodId)

      set(state => ({
        methods: state.methods.filter(m => m.id !== methodId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== PAYMENT OBLIGATIONS ====================
  createPaymentObligation: async (obligationData) => {
    set({ isLoading: true, error: null })

    try {
      const newObligation = await paymentsService.createObligation(obligationData)

      set(state => ({
        obligations: [...state.obligations, newObligation],
        isLoading: false
      }))

      return newObligation
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updatePaymentObligation: async (obligationId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedObligation = await paymentsService.updateObligation(obligationId, updates)

      set(state => ({
        obligations: state.obligations.map(o => o.id === obligationId ? updatedObligation : o),
        isLoading: false
      }))

      return updatedObligation
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deletePaymentObligation: async (obligationId) => {
    set({ isLoading: true, error: null })

    try {
      await paymentsService.removeObligation(obligationId)

      set(state => ({
        obligations: state.obligations.filter(o => o.id !== obligationId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  getObligationsByStudent: async (studentId) => {
    set({ isLoading: true, error: null })

    try {
      const obligations = await paymentsService.getObligationsByStudent(studentId)
      set({ isLoading: false })
      return obligations
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== PAYMENT INTENTIONS ====================
  createPaymentIntention: async (intentionData) => {
    set({ isLoading: true, error: null })

    try {
      const newIntention = await paymentsService.createIntention(intentionData)

      set(state => ({
        paymentIntentions: [...state.paymentIntentions, newIntention],
        isLoading: false
      }))

      return newIntention
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  approvePaymentIntention: async (intentionId) => {
    set({ isLoading: true, error: null })

    try {
      const approvedIntention = await paymentsService.approveIntention(intentionId)

      set(state => ({
        paymentIntentions: state.paymentIntentions.map(i =>
          i.id === intentionId ? approvedIntention : i
        ),
        isLoading: false
      }))

      // Recargar obligaciones y registros
      await get().initialize()

      return approvedIntention
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  rejectPaymentIntention: async (intentionId, reason) => {
    set({ isLoading: true, error: null })

    try {
      const rejectedIntention = await paymentsService.rejectIntention(intentionId, reason)

      set(state => ({
        paymentIntentions: state.paymentIntentions.map(i =>
          i.id === intentionId ? rejectedIntention : i
        ),
        isLoading: false
      }))

      return rejectedIntention
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== PAYMENT RECORDS ====================
  createPaymentRecordDirect: async (recordData) => {
    set({ isLoading: true, error: null })

    try {
      const newRecord = await paymentsService.createRecord(recordData)

      set(state => ({
        paymentRecords: [...state.paymentRecords, newRecord],
        isLoading: false
      }))

      // Recargar obligaciones para reflejar el pago
      await get().initialize()

      return newRecord
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Registrar pago manual
   * Esta función procesa un pago realizado fuera del sistema
   */
  registerManualPayment: async (paymentData, voucherFile = null) => {
    set({ isLoading: true, error: null })

    try {
      const {
        obligation_id,
        student_id,
        concept_id,
        payment_date,
        metodoPago,
        operation_number,
        paid_amount,
        observations
      } = paymentData

      // Obtener la obligación actual para calcular el nuevo saldo
      const { obligations } = get()
      const obligation = obligations.find(o => o.id === obligation_id)

      if (!obligation) {
        throw new Error('Obligación no encontrada')
      }

      const totalAmount = parseFloat(obligation.total_amount || 0)
      const previouslyPaid = parseFloat(obligation.paid_amount || 0)
      const newPaidAmount = parseFloat(paid_amount)
      const totalPaid = previouslyPaid + newPaidAmount
      const pendingBalance = totalAmount - totalPaid

      // Determinar estado de la obligación
      let newStatus = 'pending'
      if (totalPaid >= totalAmount) {
        newStatus = 'paid'
      } else if (totalPaid > 0) {
        newStatus = 'partial'
      }

      // Preparar array de pagos (sin voucher, el backend lo agregará)
      const payments = [{
        payment_date: payment_date,
        payment_method: metodoPago,
        operation_number: operation_number || null,
        amount: newPaidAmount,
        observations: observations || null,
        registered_at: new Date().toISOString()
      }]

      // Crear el registro de pago
      const recordData = {
        obligation_id,
        student_id,
        concept_id,
        total_amount: totalAmount,
        paid_amount: newPaidAmount,
        pending_balance: pendingBalance,
        payments: payments,
        status: newStatus
      }

      // Crear FormData si hay archivo
      let dataToSend
      if (voucherFile) {
        dataToSend = new FormData()
        dataToSend.append('voucher', voucherFile)
        dataToSend.append('data', JSON.stringify(recordData))
      } else {
        dataToSend = recordData
      }

      const newRecord = await paymentsService.createRecord(dataToSend)

      // Actualizar la obligación
      await paymentsService.updateObligation(obligation_id, {
        paid_amount: totalPaid,
        pending_balance: pendingBalance,
        status: newStatus,
        last_payment_date: payment_date
      })

      // Actualizar el estado local
      set(state => ({
        paymentRecords: [...state.paymentRecords, newRecord],
        obligations: state.obligations.map(o =>
          o.id === obligation_id
            ? {
                ...o,
                paid_amount: totalPaid,
                pending_balance: pendingBalance,
                status: newStatus,
                estadoPago: newStatus,
                last_payment_date: payment_date
              }
            : o
        ),
        isLoading: false
      }))

      return newRecord
    } catch (error) {
      console.error('Error al registrar pago manual:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Obtener cronograma de pagos familiar (desde el backend)
   */
  getFamilyPaymentSchedule: async (userId) => {
    set({ isLoading: true, error: null })

    try {
      // Get parent's children directly using userId
      const { studentsService } = await import('../services/studentsService')
      const childrenResponse = await studentsService.getByParent(userId)
      const children = childrenResponse?.data || childrenResponse || []

      if (!Array.isArray(children) || children.length === 0) {
        set({ isLoading: false })
        return []
      }

      // Get obligations for all children
      const allObligations = []
      for (const child of children) {
        try {
          const obligations = await paymentsService.getObligationsByStudent(child.id)
          const obligationsArray = obligations?.data || obligations || []

          // Add student info to each obligation and map fields for UI
          obligationsArray.forEach(obl => {
            allObligations.push({
              ...obl,
              student_name: `${child.first_names} ${child.last_names}`,
              student_id: child.id,
              // Datos completos del estudiante para PDF
              student_dni: child.dni,
              student_code: child.code,
              student_nivel: child.nivelNombre || child.nivel,
              student_grado: child.gradoNombre || child.grado,
              student_seccion: child.seccionNombre || child.seccion,
              // Campos mapeados para el componente FamilyPaymentSchedule
              estudiante: `${child.first_names} ${child.last_names}`,
              concepto: obl.concept_name || obl.concepto,
              concept_type: obl.concept_type,
              state: obl.status === 'paid' ? 'pagado' :
                     obl.status === 'partial' ? 'parcial' :
                     obl.status === 'en_verificacion' ? 'en_verificacion' :
                     obl.status === 'exonerado' ? 'exonerado' :
                     new Date(obl.due_date) < new Date() ? 'vencido' : 'pendiente',
              amount: obl.total_amount,
              saldo: obl.pending_balance,
              // Para pagos únicos (due_month = null), mostrar "Pago único" o la fecha
              monthName: obl.due_month
                ? new Date(2025, obl.due_month - 1).toLocaleString('es', { month: 'long' })
                : (obl.concept_type === 'unico' ? 'Pago único' : '-'),
              periodo: obl.due_month
                ? new Date(2025, obl.due_month - 1).toLocaleString('es', { month: 'long' })
                : (obl.concept_type === 'unico' ? 'Pago único' : '-'),
              payment_date: obl.last_payment_date,
              paid_amount: obl.paid_amount
            })
          })
        } catch (error) {
          console.error(`Error loading obligations for student ${child.id}:`, error)
        }
      }

      set({ isLoading: false })
      return allObligations
    } catch (error) {
      console.error('Error loading family payment schedule:', error)
      set({ error: error.message, isLoading: false })
      return []
    }
  },

  /**
   * Generar cronograma de pagos familiar
   */
  generateFamilyPaymentSchedule: (studentId) => {
    const { obligations, concepts } = get()
    return generateFamilyPaymentSchedule(studentId, obligations, concepts)
  },

  /**
   * Verificar si estudiante tiene pagos mensuales pendientes
   */
  hasStudentPendingMonthlyPayments: (studentId) => {
    const { obligations } = get()
    return checkPendingPayments(studentId, obligations)
  },

  /**
   * Obtener estado de pagos del estudiante
   */
  getStudentPaymentStatus: (studentId) => {
    const { obligations, paymentRecords } = get()
    return getPaymentStatus(studentId, obligations, paymentRecords)
  },

  /**
   * Obtener estadísticas de obligaciones
   */
  getObligationStats: () => {
    const { obligations } = get()
    return getObligationStats(obligations)
  },

  /**
   * Calcular estadísticas de pagos
   */
  calculatePaymentStats: () => {
    const { paymentRecords, paymentIntentions } = get()
    return calculatePaymentStats(paymentRecords, paymentIntentions)
  },

  // ==================== FILTERS ====================
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        student: '',
        concept: '',
        status: '',
        month: '',
        search: ''
      }
    })
  },

  // ==================== ERROR HANDLING ====================
  clearError: () => {
    set({ error: null })
  }
}))
