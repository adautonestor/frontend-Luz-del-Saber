import { create } from 'zustand'
import { communicationsService } from '../services/communicationsService'

/**
 * Communications Store - Sistema de Comunicaciones
 * Integrado con APIs reales del backend
 */
export const useCommunicationsStore = create((set, get) => ({
  // State
  communications: [],
  avisos: [],
  readConfirmations: [],
  isLoading: false,
  error: null,

  // Filters
  filters: {
    type: '',
    priority: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  },

  // Actions
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      const [communications, avisos, confirmations] = await Promise.all([
        communicationsService.getAll(),
        communicationsService.getAllAvisos(),
        communicationsService.getAllReadConfirmations()
      ])

      set({
        communications: communications || [],
        avisos: avisos || [],
        readConfirmations: confirmations || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading communications:', error)
      set({
        error: error.message || 'Error al cargar comunicaciones',
        isLoading: false
      })
    }
  },

  // ==================== COMMUNICATIONS ====================
  createCommunication: async (commData) => {
    set({ isLoading: true, error: null })

    try {
      const newComm = await communicationsService.create(commData)

      set(state => ({
        communications: [...state.communications, newComm],
        isLoading: false
      }))

      return newComm
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateCommunication: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updated = await communicationsService.update(id, updates)

      set(state => ({
        communications: state.communications.map(c => c.id === id ? updated : c),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteCommunication: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await communicationsService.remove(id)

      set(state => ({
        communications: state.communications.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== AVISOS ====================
  createAviso: async (avisoData) => {
    set({ isLoading: true, error: null })

    try {
      const newAviso = await communicationsService.createAviso(avisoData)

      set(state => ({
        avisos: [...state.avisos, newAviso],
        isLoading: false
      }))

      return newAviso
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateAviso: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updated = await communicationsService.updateAviso(id, updates)

      set(state => ({
        avisos: state.avisos.map(a => a.id === id ? updated : a),
        isLoading: false
      }))

      return updated
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteAviso: async (id) => {
    set({ isLoading: true, error: null })

    try {
      await communicationsService.removeAviso(id)

      set(state => ({
        avisos: state.avisos.filter(a => a.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== READ CONFIRMATIONS ====================
  markAsRead: async (communicationId, userId) => {
    set({ isLoading: true, error: null })

    try {
      const confirmation = await communicationsService.markAsRead(communicationId, userId)

      set(state => ({
        readConfirmations: [...state.readConfirmations, confirmation],
        isLoading: false
      }))

      return confirmation
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  isReadByUser: (communicationId, userId) => {
    const { readConfirmations } = get()
    return readConfirmations.some(
      conf => conf.communication_id === communicationId && conf.user_id === userId
    )
  },

  getReadCount: (communicationId) => {
    const { readConfirmations } = get()
    return readConfirmations.filter(conf => conf.communication_id === communicationId).length
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
        type: '',
        priority: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        search: ''
      }
    })
  },

  getFilteredCommunications: () => {
    const { communications, filters } = get()
    let filtered = [...communications]

    if (filters.type) {
      filtered = filtered.filter(c => c.type === filters.type || c.type === filters.type)
    }
    if (filters.priority) {
      filtered = filtered.filter(c => c.priority === filters.priority || c.prioridad === filters.priority)
    }
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status || c.state === filters.status)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(searchLower) ||
        c.titulo?.toLowerCase().includes(searchLower) ||
        c.message?.toLowerCase().includes(searchLower) ||
        c.mensaje?.toLowerCase().includes(searchLower)
      )
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(c => c.fecha >= filters.dateFrom || c.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c => c.fecha <= filters.dateTo || c.date <= filters.dateTo)
    }

    return filtered
  },

  clearError: () => {
    set({ error: null })
  },

  // ==================== USER-SPECIFIC FUNCTIONS ====================
  getUserCommunications: (userId, userRole = null) => {
    const { communications, readConfirmations } = get()

    // Filtrar comunicaciones según destinatarios y estado
    const filteredComms = communications.filter(comm => {
      const dest = comm.destinatarios || {}
      const destType = dest.type || ''
      const destValores = dest.valores || []
      const rolLower = (userRole || '').toLowerCase()
      const estado = comm.state || comm.status || ''

      // =========================================================
      // IMPORTANTE: Comunicados programados NO son visibles
      // Solo se muestran cuando el estado es 'sent' o 'enviado'
      // Los comunicados 'scheduled' o 'programado' solo los ve el admin
      // =========================================================
      if (estado === 'scheduled' || estado === 'programado') {
        return false
      }

      // Solo mostrar comunicados con estado 'sent' o 'enviado'
      if (estado !== 'sent' && estado !== 'enviado') {
        return false
      }

      // Si es para "todos", el usuario lo ve
      if (destType === 'todos') return true

      // Si es para "profesores_y_padres", verificar si es profesor o padre
      if (destType === 'profesores_y_padres') {
        const esPadre = rolLower === 'padre' || rolLower === 'tutor' || rolLower === 'apoderado'
        const esProfesor = rolLower === 'profesor' || rolLower === 'docente' || rolLower === 'teacher'
        return esPadre || esProfesor
      }

      // Si es para "padres" y el usuario es padre, lo ve
      if (destType === 'padres') {
        return rolLower === 'padre' || rolLower === 'tutor' || rolLower === 'apoderado'
      }

      // Si es para "profesores" y el usuario es profesor, lo ve
      if (destType === 'profesores' || destType === 'docentes') {
        return rolLower === 'profesor' || rolLower === 'docente' || rolLower === 'teacher'
      }

      // Si es "especifico", verificar si el ID del usuario está en valores
      if (destType === 'especifico') {
        return destValores.includes(userId) || destValores.includes(String(userId)) || destValores.includes(Number(userId))
      }

      // Por defecto, mostrar si no hay filtro específico
      return true
    })

    // Map communications and add isRead property
    return filteredComms.map(comm => ({
      ...comm,
      isRead: readConfirmations.some(
        conf => conf.communication_id === comm.id && conf.user_id === userId
      )
    }))
  },

  getUrgentUnattendedCommunications: (userId) => {
    const { communications } = get()

    // Filter urgent communications that are not attended yet
    return communications.filter(comm => {
      // Check if it's urgent (priority = 'urgent' or 'high')
      const isUrgent = comm.priority === 'urgent' || comm.priority === 'high'

      // Check if it's not attended yet
      const isUnattended = !comm.attended && comm.status === 'sent'

      // Check if user is in recipients
      // Recipients can be a JSON string or an array
      let recipients = comm.recipients
      if (typeof recipients === 'string') {
        try {
          recipients = JSON.parse(recipients)
        } catch (e) {
          recipients = []
        }
      }
      const isRecipient = Array.isArray(recipients) && recipients.includes(userId)

      return isUrgent && isUnattended && isRecipient
    })
  }
}))
