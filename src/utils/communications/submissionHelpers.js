/**
 * Construye el payload de comunicación para enviar al store
 * @param {Object} formData - Datos del formulario
 * @param {Object} user - Usuario actual
 * @param {string} status - Estado de la comunicación: 'sent' (enviar) o 'draft' (borrador)
 * @returns {Object} Payload de comunicación
 */
export const buildCommunicationPayload = (formData, user, status = 'sent') => {
  // Determinar estructura de destinatarios según el esquema
  let destinatariosObj = { type: 'todos', valores: [] }

  if (formData.usuarioEspecifico) {
    // Usuario específico seleccionado
    destinatariosObj = {
      type: 'especifico',
      valores: [formData.usuarioEspecifico.id]
    }
  } else if (formData.destinatarios.length > 0) {
    // Determinar tipo basado en los destinatarios seleccionados
    if (formData.destinatarios.includes('todos')) {
      // Opción "Todos" seleccionada
      destinatariosObj = { type: 'todos', valores: [] }
    } else if (formData.destinatarios.includes('profesores') && formData.destinatarios.includes('padres')) {
      // Ambos grupos seleccionados (profesores + padres)
      destinatariosObj = { type: 'profesores_y_padres', valores: [] }
    } else if (formData.destinatarios.includes('profesores')) {
      // Solo profesores seleccionados
      destinatariosObj = { type: 'profesores', valores: [] }
    } else if (formData.destinatarios.includes('padres')) {
      // Solo padres seleccionados
      destinatariosObj = { type: 'padres', valores: [] }
    } else {
      // Otros casos (por nivel, grado, sección si se implementan)
      destinatariosObj = { type: 'todos', valores: formData.destinatarios }
    }
  }

  // Preparar adjuntos con estructura correcta
  // - Adjuntos existentes (de DB): tienen key, no tienen file
  // - Adjuntos nuevos (upload): tienen file, no tienen key
  const adjuntosFormatted = (formData.adjuntos || []).map(adj => ({
    id: adj.id,
    name: adj.name,
    url: adj.data, // Usar data como url (es un data URL para preview)
    type: adj.type,
    tamaño: adj.tamaño || adj.size,
    key: adj.key, // Preservar key para adjuntos existentes
    file: adj.file, // Archivo original para subir a Wasabi (solo nuevos)
    isExisting: adj.isExisting, // Marcar si es existente
    fechaSubida: adj.fechaSubida || new Date().toISOString()
  }))

  // Determinar el estado correcto basado en si está programado o no
  let finalStatus = status
  if (status !== 'draft') {
    // Si hay fecha programada, el estado debe ser 'scheduled'
    // Si no hay fecha programada, el estado es 'sent' (envío inmediato)
    finalStatus = (formData.programado && formData.fechaProgramada) ? 'scheduled' : 'sent'
  }

  return {
    type: formData.type || 'comunicado', // Usar directamente el valor del formulario
    titulo: formData.titulo,
    contenido: formData.contenido,
    destinatarios: destinatariosObj,
    remitente: user.id, // ID del usuario actual
    prioridad: formData.prioridad,
    adjuntos: adjuntosFormatted,
    // scheduled_date: Fecha/hora para envío programado (formato ISO con timezone)
    scheduled_date: (formData.programado && formData.fechaProgramada) ? new Date(formData.fechaProgramada).toISOString() : null,
    due_date: formData.due_date,
    requiereConfirmacion: formData.prioridad === 'alta',
    status: finalStatus // 'scheduled' para programado, 'sent' para envío inmediato, 'draft' para borrador
  }
}

/**
 * Maneja el envío del formulario de comunicación (crear o editar)
 * @param {Event} e - Evento del formulario
 * @param {Object} formData - Datos del formulario
 * @param {Object} user - Usuario actual
 * @param {Function} createCommunication - Función del store para crear comunicación
 * @param {Function} updateCommunication - Función del store para actualizar comunicación
 * @param {Function} loadData - Función para recargar datos
 * @param {Function} handleCloseModal - Función para cerrar el modal
 * @param {string} status - Estado de la comunicación: 'sent' (enviar) o 'draft' (borrador)
 */
export const handleCommunicationSubmit = async (
  e,
  formData,
  user,
  createCommunication,
  updateCommunication,
  loadData,
  handleCloseModal,
  status = 'sent'
) => {
  e.preventDefault()

  const isEditing = !!formData.id
  const isDraft = status === 'draft'

  try {
    const communicationPayload = buildCommunicationPayload(formData, user, status)

    let result
    if (isEditing) {
      // Actualizar comunicado existente
      result = await updateCommunication(formData.id, communicationPayload)
    } else {
      // Crear nuevo comunicado
      result = await createCommunication(communicationPayload)
    }

    await loadData()
    handleCloseModal()
  } catch (error) {
    console.error('❌ Error enviando comunicación:', error)
    const action = isDraft ? 'guardar borrador' : (isEditing ? 'actualizar' : 'enviar')
    alert(`Error al ${action}: ` + error.message)
  }
}
