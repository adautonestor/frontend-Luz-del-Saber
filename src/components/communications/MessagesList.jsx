import React from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Send, Calendar, Clock, CheckCircle,
  AlertCircle, Eye, Edit, Trash2, Users, Paperclip,
  Image, File
} from 'lucide-react'
import { formatDateOnly, parseDateOnly, isPastDate } from '../../utils/dateUtils'
import Pagination from '../common/Pagination'
import { usePagination } from '../../hooks/usePagination'

/**
 * Lista de mensajes de comunicaciones con filtros, búsqueda y acciones
 * Muestra mensajes filtrados, ordenados por fecha y prioridad
 */
/**
 * Normaliza el estado del comunicado a formato estándar (inglés)
 * Backend devuelve: 'sent', 'scheduled', 'draft', 'deleted'
 * Algunos lugares usan español: 'enviado', 'programado', 'borrador'
 */
const normalizeStatus = (state) => {
  if (!state) return 'draft'
  const statusMap = {
    'enviado': 'sent',
    'programado': 'scheduled',
    'borrador': 'draft',
    'eliminado': 'deleted'
  }
  return statusMap[state] || state
}

/**
 * Obtiene la etiqueta en español para un estado
 */
const getStatusLabel = (state) => {
  const normalized = normalizeStatus(state)
  const labels = {
    'sent': 'Enviado',
    'scheduled': 'Programado',
    'draft': 'Borrador',
    'deleted': 'Eliminado'
  }
  return labels[normalized] || state || 'Desconocido'
}

const MessagesList = ({
  communications,
  searchTerm,
  typeFilter,
  statusFilter,
  priorityFilter,
  setSelectedMessage,
  setIsModalOpen,
  setFormData,
  formData,
  user,
  markAsAttended,
  loadData,
  getRecipientCount,
  onDelete
}) => {
  // Filtrar comunicaciones
  const filteredCommunications = communications
    .filter(c => {
      if (typeFilter === 'todos') return true
      // Mapear valores legacy a los nuevos
      const typeMap = {
        'general': 'comunicado',
        'urgente': 'notificacion'
      }
      const normalizedType = typeMap[c.type] || c.type
      return normalizedType === typeFilter
    })
    .filter(c => {
      // Filtrar por estado
      if (!statusFilter || statusFilter === 'todos') return true
      const normalizedState = normalizeStatus(c.state)
      return normalizedState === statusFilter
    })
    .filter(c => {
      // Filtrar por prioridad
      if (!priorityFilter || priorityFilter === 'todos') return true
      return c.prioridad === priorityFilter
    })
    .filter(c => {
      if (!searchTerm || searchTerm === '') return true
      const searchLower = searchTerm.toLowerCase()
      const titulo = (c.titulo || '').toLowerCase()
      const contenido = (c.contenido || '').toLowerCase()
      const fecha = c.fechaEnvio ? formatDateOnly(c.fechaEnvio) : ''
      return titulo.includes(searchLower) || contenido.includes(searchLower) || fecha.includes(searchTerm)
    })
    .filter((comm, index, self) =>
      index === self.findIndex((c) => c.id === comm.id)
    )
    .sort((a, b) => {
      // Primero ordenar por fecha (más reciente primero)
      const dateCompare = new Date(b.fechaEnvio) - new Date(a.fechaEnvio)
      if (dateCompare !== 0) return dateCompare

      // Luego ordenar por prioridad (alta > media > baja)
      const priorityOrder = { alta: 4, media: 3, normal: 2, baja: 1 }
      return (priorityOrder[b.prioridad] || 0) - (priorityOrder[a.prioridad] || 0)
    })

  // Paginación del lado del cliente sobre la lista ya filtrada
  const pg = usePagination(
    filteredCommunications,
    10,
    JSON.stringify({ searchTerm, typeFilter, statusFilter, priorityFilter })
  )

  // Estado vacío: no hay comunicados aún
  if (communications.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay comunicados aún
        </h3>
        <p className="text-gray-600 mb-6">
          Comienza enviando tu primer comunicado a la comunidad educativa.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 mx-auto"
        >
          <Send size={20} />
          Enviar Primer Comunicado
        </button>
      </div>
    )
  }

  // Mostrar mensaje si no hay resultados después de filtrar
  if (filteredCommunications.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-gray-600">
          No hay comunicados que coincidan con los filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div>
      {pg.pageItems.map((comm) => (
          <motion.div
            key={comm.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {comm.titulo}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    comm.prioridad === 'alta'
                      ? 'bg-red-100 text-red-800'
                      : comm.prioridad === 'media'
                      ? 'bg-yellow-100 text-yellow-800'
                      : comm.prioridad === 'normal'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {comm.prioridad}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    normalizeStatus(comm.state) === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : normalizeStatus(comm.state) === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : normalizeStatus(comm.state) === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(comm.state)}
                  </span>
                  {comm.prioridad === 'alta' && comm.atendido && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle size={12} className="fill-current" />
                      Solucionado
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {comm.contenido}
                </p>

                {/* Mostrar adjuntos si los hay */}
                {comm.adjuntos && comm.adjuntos.length > 0 && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
                    <Paperclip size={14} />
                    <span>{comm.adjuntos.length} archivo{comm.adjuntos.length > 1 ? 's' : ''} adjunto{comm.adjuntos.length > 1 ? 's' : ''}</span>
                    <div className="flex gap-1">
                      {comm.adjuntos.map((adjunto, index) => (
                        <span key={index} className="inline-flex items-center">
                          {adjunto.type.startsWith('image/') ? (
                            <Image size={12} className="text-blue-500" />
                          ) : (
                            <File size={12} className="text-red-500" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {getRecipientCount(comm)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDateOnly(comm.fechaEnvio)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(comm.fechaEnvio).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {comm.due_date && (
                    <span className={`flex items-center gap-1 ${
                      isPastDate(comm.due_date)
                        ? 'text-red-600 font-semibold'
                        : 'text-orange-600'
                    }`}>
                      <AlertCircle size={14} />
                      Vence: {formatDateOnly(comm.due_date)}
                    </span>
                  )}
                  {normalizeStatus(comm.state) === 'sent' && comm.estadisticas && (
                    <>
                      <span className="flex items-center gap-1 text-blue-600" title="Usuarios que leyeron el comunicado">
                        <Eye size={14} />
                        Leídos: {comm.estadisticas.totalLeidos || 0}/{comm.estadisticas.totalEnviados || 0}
                      </span>
                      {comm.requiereConfirmacion && (
                        <span className="flex items-center gap-1 text-green-600" title="Usuarios que confirmaron lectura">
                          <CheckCircle size={14} />
                          Confirmados: {comm.estadisticas.totalConfirmados || 0}/{comm.estadisticas.totalEnviados || 0}
                        </span>
                      )}
                    </>
                  )}
                  {normalizeStatus(comm.state) === 'scheduled' && comm.fechaProgramada && (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Clock size={14} />
                      Se enviará: {new Date(comm.fechaProgramada).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setSelectedMessage(comm)}
                  className="text-primary-600 hover:text-primary-700"
                  title="Ver detalles"
                >
                  <Eye size={18} />
                </button>
                {/* Botón Marcar como Atendido para comunicados de prioridad alta */}
                {comm.prioridad === 'alta' && normalizeStatus(comm.state) === 'sent' && (comm.remitenteId === user.id || user.rol === 'Director') && (
                  <button
                    onClick={async () => {
                      try {
                        await markAsAttended(comm.id, user.id)
                        await loadData()
                      } catch (error) {
                        console.error('Error marking as attended:', error)
                        alert(error.message || 'Error al marcar como atendido')
                      }
                    }}
                    className={`${comm.atendido ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'}`}
                    title={comm.atendido ? 'Marcar como atendido nuevamente' : 'Marcar como atendido'}
                  >
                    <CheckCircle size={18} className={comm.atendido ? 'fill-current' : ''} />
                  </button>
                )}
                {/* Indicador de comunicado atendido */}
                {comm.prioridad === 'alta' && comm.atendido && (
                  <div className="flex items-center gap-1 text-green-600 font-medium" title={`Atendido el ${formatDateOnly(comm.fechaAtendido)}`}>
                    <CheckCircle size={16} className="fill-current" />
                    <span className="text-xs">Solucionado</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    // Convertir destinatarios de objeto a array si es necesario
                    let destinatariosArray = []
                    if (Array.isArray(comm.destinatarios)) {
                      destinatariosArray = comm.destinatarios
                    } else if (comm.destinatarios?.type) {
                      // Es un objeto, convertir a array basándose en el tipo
                      destinatariosArray = [comm.destinatarios.type]
                    }

                    // Cargar adjuntos existentes
                    let adjuntosExistentes = []
                    if (comm.attachments && Array.isArray(comm.attachments)) {
                      adjuntosExistentes = comm.attachments.map((att, index) => ({
                        id: att.key || `existing-${index}`,
                        name: att.name,
                        type: att.type,
                        tamaño: att.size,
                        key: att.key, // Guardar key para referencia
                        isExisting: true // Marcar como existente
                      }))
                    }

                    const editData = {
                      ...formData,
                      id: comm.id, // Guardar ID para identificar que es edición
                      titulo: comm.title || comm.titulo,
                      contenido: comm.content || comm.contenido,
                      type: comm.type,
                      prioridad: comm.priority || comm.prioridad,
                      destinatarios: destinatariosArray,
                      due_date: comm.expiration_date ? comm.expiration_date.split('T')[0] : (comm.due_date ? comm.due_date.split('T')[0] : ''),
                      programado: comm.status === 'scheduled' || comm.state === 'programado',
                      fechaProgramada: comm.scheduled_date || comm.scheduled_for || '',
                      adjuntos: adjuntosExistentes
                    }

                    setFormData(editData)
                    setIsModalOpen(true)
                  }}
                  className="text-gray-600 hover:text-gray-700"
                  title="Editar mensaje"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`¿Estás seguro de eliminar "${comm.titulo}"?`)) {
                      try {
                        await onDelete(comm.id)
                        if (loadData) loadData()
                      } catch (error) {
                        console.error('Error al eliminar:', error)
                        alert('Error al eliminar el comunicado')
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                  title="Eliminar mensaje"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

      {/* Paginación */}
      <Pagination
        page={pg.page}
        totalPages={pg.totalPages}
        total={pg.total}
        from={pg.from}
        to={pg.to}
        pageSize={pg.pageSize}
        onPageChange={pg.setPage}
        onPrev={pg.prev}
        onNext={pg.next}
        onPageSizeChange={pg.setPageSize}
      />

      {/* Resumen de actividad */}
      {communications.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Resumen de Actividad</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {communications.filter(c => normalizeStatus(c.state) === 'sent').length}
              </div>
              <div className="text-gray-600">Enviados</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {communications.filter(c => normalizeStatus(c.state) === 'draft').length}
              </div>
              <div className="text-gray-600">Borradores</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {communications.filter(c => normalizeStatus(c.state) === 'scheduled').length}
              </div>
              <div className="text-gray-600">Programados</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-600">
                {Math.round(communications.filter(c => normalizeStatus(c.state) === 'sent').length / Math.max(communications.length, 1) * 100)}%
              </div>
              <div className="text-gray-600">Tasa de envío</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagesList
