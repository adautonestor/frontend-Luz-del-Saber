import { get, post, put, del } from './api'

/**
 * Servicio para gestión de comunicaciones
 * Conecta con las APIs reales del backend
 */
export const communicationsService = {
  // ========== COMUNICACIONES ==========

  /**
   * Obtener todas las comunicaciones
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de comunicaciones con URLs de proxy para adjuntos
   */
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/communications?${queryString}` : '/communications'

      const response = await get(endpoint)
      const communications = response.comunicaciones || response.data || response

      const apiUrl = import.meta.env.VITE_API_URL

      // Mapear comunicaciones y construir URLs del proxy para archivos
      return (communications || []).map(comm => {
        // Construir URLs de proxy para los adjuntos
        let mappedAttachments = null
        if (comm.attachments && Array.isArray(comm.attachments)) {
          mappedAttachments = comm.attachments.map(att => ({
            ...att,
            tamaño: att.size,
            url: `${apiUrl}/communications/file/${encodeURIComponent(att.key)}`
          }))
        }

        // Parsear recipients si viene como string JSON
        let parsedRecipients = comm.recipients || comm.destinatarios
        if (typeof parsedRecipients === 'string') {
          try {
            parsedRecipients = JSON.parse(parsedRecipients)
          } catch (e) {
            parsedRecipients = {}
          }
        }

        // Parsear attachments si viene como string JSON
        let parsedAttachments = comm.attachments
        if (typeof parsedAttachments === 'string') {
          try {
            parsedAttachments = JSON.parse(parsedAttachments)
          } catch (e) {
            parsedAttachments = null
          }
        }

        // Construir URLs de proxy para los adjuntos parseados
        if (parsedAttachments && Array.isArray(parsedAttachments)) {
          mappedAttachments = parsedAttachments.map(att => ({
            ...att,
            tamaño: att.size,
            url: `${apiUrl}/communications/file/${encodeURIComponent(att.key)}`
          }))
        }

        return {
          ...comm,
          // Mapear campos del backend a formato esperado por el frontend
          type: comm.type || 'comunicado', // Asegurar que type siempre esté presente
          titulo: comm.title || comm.titulo,
          contenido: comm.content || comm.contenido,
          prioridad: comm.priority || comm.prioridad,
          fechaEnvio: comm.send_date || comm.fechaEnvio,
          fechaProgramada: comm.scheduled_date || comm.fechaProgramada,
          state: comm.status || comm.state,
          destinatarios: parsedRecipients,
          remitenteId: comm.sender || comm.remitenteId,
          remitente_nombre: comm.remitente_nombre,
          remitente_apellidos: comm.remitente_apellidos,
          requiereConfirmacion: comm.requires_confirmation || comm.requiereConfirmacion,
          due_date: comm.expiration_date || comm.due_date,
          atendido: comm.attended || comm.atendido,
          fechaAtendido: comm.attended_date || comm.fechaAtendido,
          estadisticas: {
            totalEnviados: comm.statistics?.totalEnviados || comm.estadisticas?.totalEnviados || 0,
            totalLeidos: comm.statistics?.totalLeidos || comm.estadisticas?.totalLeidos || 0,
            totalConfirmados: comm.statistics?.totalConfirmados || comm.estadisticas?.totalConfirmados || 0,
            ...comm.estadisticas,
            ...comm.statistics
          },
          adjuntos: mappedAttachments
        }
      })
    } catch (error) {
      console.error('Error al obtener comunicaciones:', error)
      throw error
    }
  },

  /**
   * Obtener comunicación por ID
   * @param {number} id - ID de la comunicación
   * @returns {Promise<Object>} Comunicación
   */
  async getById(id) {
    try {
      const response = await get(`/communications/${id}`)
      return response.comunicacion || response.data || response
    } catch (error) {
      console.error(`Error al obtener comunicación ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear comunicación con archivos adjuntos
   * @param {Object} commData - Datos de la comunicación (incluye adjuntos)
   * @returns {Promise<Object>} Comunicación creada
   */
  async create(commData) {
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()

      // Agregar campos de texto
      formData.append('title', commData.titulo || commData.title)
      formData.append('content', commData.contenido || commData.content)
      formData.append('type', commData.type || 'comunicado')
      formData.append('priority', commData.prioridad || commData.priority || 'medium')
      formData.append('recipients', JSON.stringify(commData.destinatarios || commData.recipients || []))

      if (commData.requires_confirmation || commData.requiereConfirmacion) {
        formData.append('requires_confirmation', 'true')
      }
      if (commData.scheduled_date || commData.fechaProgramada) {
        formData.append('scheduled_date', commData.scheduled_date || commData.fechaProgramada)
      }
      if (commData.expiration_date || commData.due_date) {
        formData.append('expiration_date', commData.expiration_date || commData.due_date)
      }

      // Agregar status explícitamente
      formData.append('status', commData.status || 'sent')

      // Agregar archivos adjuntos si existen
      if (commData.adjuntos && commData.adjuntos.length > 0) {
        for (const adjunto of commData.adjuntos) {
          if (adjunto.file) {
            formData.append('attachments', adjunto.file)
          }
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/communications`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear comunicación')
      }

      return data.comunicacion || data.data || data
    } catch (error) {
      console.error('Error al crear comunicación:', error)
      throw error
    }
  },

  /**
   * Actualizar comunicación con soporte para nuevos archivos
   * @param {number} id - ID de la comunicación
   * @param {Object} commData - Datos actualizados (incluye adjuntos nuevos y existentes)
   * @returns {Promise<Object>} Comunicación actualizada
   */
  async update(id, commData) {
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()

      // Agregar campos de texto
      formData.append('title', commData.titulo || commData.title || '')
      formData.append('content', commData.contenido || commData.content || '')
      formData.append('type', commData.type || 'comunicado')
      formData.append('priority', commData.prioridad || commData.priority || 'medium')
      formData.append('recipients', JSON.stringify(commData.destinatarios || commData.recipients || []))

      if (commData.requires_confirmation || commData.requiereConfirmacion) {
        formData.append('requires_confirmation', 'true')
      }
      if (commData.scheduled_date || commData.fechaProgramada) {
        formData.append('scheduled_date', commData.scheduled_date || commData.fechaProgramada)
      }
      if (commData.expiration_date || commData.due_date) {
        formData.append('expiration_date', commData.expiration_date || commData.due_date)
      }

      // Agregar status (importante para que no quede NULL)
      formData.append('status', commData.status || commData.state || 'sent')

      // Separar adjuntos existentes (tienen key) de nuevos (tienen file)
      const adjuntos = commData.adjuntos || commData.attachments || []

      // Adjuntos existentes a mantener (tienen key, no tienen file)
      const existingAttachments = adjuntos.filter(att => att.key && !att.file).map(att => ({
        key: att.key,
        name: att.name,
        type: att.type,
        size: att.tamaño || att.size
      }))

      formData.append('existingAttachments', JSON.stringify(existingAttachments))

      // Adjuntos nuevos a subir (tienen file)
      const newAttachments = adjuntos.filter(att => att.file)

      for (const adjunto of newAttachments) {
        formData.append('attachments', adjunto.file)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/communications/${id}`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar comunicación')
      }

      return data.comunicacion || data.data || data
    } catch (error) {
      console.error(`Error al actualizar comunicación ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar comunicación
   * @param {number} id - ID de la comunicación
   * @returns {Promise<Object>} Confirmación
   */
  async remove(id) {
    try {
      const response = await del(`/communications/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar comunicación ${id}:`, error)
      throw error
    }
  },

  // ========== AVISOS ==========

  /**
   * Obtener todos los avisos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de avisos
   */
  async getAllAvisos(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/avisos?${queryString}` : '/avisos'

      const response = await get(endpoint)
      return response.avisos || response.data || response
    } catch (error) {
      console.error('Error al obtener avisos:', error)
      throw error
    }
  },

  /**
   * Obtener aviso por ID
   * @param {number} id - ID del aviso
   * @returns {Promise<Object>} Aviso
   */
  async getAvisoById(id) {
    try {
      const response = await get(`/avisos/${id}`)
      return response.aviso || response.data || response
    } catch (error) {
      console.error(`Error al obtener aviso ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear aviso con archivos
   * @param {Object} avisoData - Datos del aviso (incluye imagen y archivo)
   * @returns {Promise<Object>} Aviso creado
   */
  async createAviso(avisoData) {
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()

      // Agregar campos de texto
      formData.append('title', avisoData.titulo || avisoData.title)
      formData.append('content', avisoData.contenido || avisoData.content)
      if (avisoData.enlace || avisoData.link) {
        formData.append('link', avisoData.enlace || avisoData.link)
      }

      // Agregar imagen si existe (como File, no base64)
      if (avisoData.imagen && avisoData.imagen.file) {
        formData.append('image', avisoData.imagen.file)
      }

      // Agregar archivo si existe (como File, no base64)
      if (avisoData.archivo && avisoData.archivo.file) {
        formData.append('file', avisoData.archivo.file)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/avisos`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // NO establecer Content-Type, el navegador lo hace para FormData
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear aviso')
      }

      return data.aviso || data.data || data
    } catch (error) {
      console.error('Error al crear aviso:', error)
      throw error
    }
  },

  /**
   * Actualizar aviso
   * @param {number} id - ID del aviso
   * @param {Object} avisoData - Datos actualizados
   * @returns {Promise<Object>} Aviso actualizado
   */
  async updateAviso(id, avisoData) {
    try {
      const response = await put(`/avisos/${id}`, avisoData)
      return response.aviso || response.data || response
    } catch (error) {
      console.error(`Error al actualizar aviso ${id}:`, error)
      throw error
    }
  },

  /**
   * Eliminar aviso
   * @param {number} id - ID del aviso
   * @returns {Promise<Object>} Confirmación
   */
  async removeAviso(id) {
    try {
      const response = await del(`/avisos/${id}`)
      return response
    } catch (error) {
      console.error(`Error al eliminar aviso ${id}:`, error)
      throw error
    }
  },

  // ========== CONFIRMACIONES DE LECTURA ==========

  /**
   * Obtener confirmaciones de lectura
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de confirmaciones
   */
  async getAllReadConfirmations(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      const queryString = queryParams.toString()
      const endpoint = queryString ? `/read-confirmations?${queryString}` : '/read-confirmations'

      const response = await get(endpoint)
      return response.confirmaciones || response.data || response
    } catch (error) {
      console.error('Error al obtener confirmaciones de lectura:', error)
      throw error
    }
  },

  /**
   * Marcar comunicación como leída
   * @param {number} communicationId - ID de la comunicación
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Confirmación creada
   */
  async markAsRead(communicationId, userId) {
    try {
      const response = await post('/read-confirmations', {
        comunicacion_id: communicationId,
        usuario_id: userId
      })
      return response.confirmacion || response.data || response
    } catch (error) {
      console.error('Error al marcar comunicación como leída:', error)
      throw error
    }
  }
}

export default communicationsService
