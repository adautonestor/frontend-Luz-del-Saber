import React from 'react'
import { motion } from 'framer-motion'
import {
  Users, Eye, Edit, Trash2, MessageSquare, Calendar,
  AlertCircle, Image, FileText, File
} from 'lucide-react'

/**
 * Lista de comunicaciones con acciones (ver, editar, eliminar)
 * Muestra título, contenido, estadísticas, adjuntos y metadata
 * @param {Function} isOwnCommunication - Función para verificar si un comunicado es del usuario actual
 */
const TeacherCommunicationsList = ({
  communications,
  getPriorityColor,
  getPriorityIcon,
  getTypeIcon,
  formatDate,
  onView,
  onEdit,
  onDelete,
  isOwnCommunication
}) => {
  if (communications.length === 0) {
    return (
      <div className="card p-12 text-center">
        <MessageSquare className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No hay comunicados
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Crea tu primer comunicado para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {communications.map((communication, index) => (
        <motion.div
          key={`${communication.id}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Título y prioridad */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(communication.type)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {communication.titulo}
                  </h3>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(communication.prioridad)}`}>
                  {getPriorityIcon(communication.prioridad)}
                  <span className="ml-1 capitalize">{communication.prioridad}</span>
                </div>
              </div>

              {/* Contenido (resumen) */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {communication.contenido}
              </p>

              {/* Indicadores de archivos adjuntos */}
              {(communication.adjuntos && communication.adjuntos.length > 0) && (
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  {communication.adjuntos.filter(adj => adj.type.includes('image')).length > 0 && (
                    <span className="flex items-center gap-1">
                      <Image size={14} className="text-blue-500" />
                      {communication.adjuntos.filter(adj => adj.type.includes('image')).length} imagen(es)
                    </span>
                  )}
                  {communication.adjuntos.filter(adj => adj.type.includes('pdf')).length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText size={14} className="text-red-500" />
                      {communication.adjuntos.filter(adj => adj.type.includes('pdf')).length} PDF(s)
                    </span>
                  )}
                  {communication.adjuntos.filter(adj => !adj.type.includes('image') && !adj.type.includes('pdf')).length > 0 && (
                    <span className="flex items-center gap-1">
                      <File size={14} className="text-gray-500" />
                      {communication.adjuntos.filter(adj => !adj.type.includes('image') && !adj.type.includes('pdf')).length} archivo(s)
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {(() => {
                    const dest = communication.destinatarios || {}
                    if (dest.type === 'todos') return 'Todos'
                    if (dest.type === 'profesores') return 'Profesores'
                    if (dest.type === 'padres') return 'Padres'
                    if (dest.type === 'profesores_y_padres') return 'Profesores y Padres'
                    if (dest.type === 'especifico' && dest.valores?.length) return `${dest.valores.length} usuario(s)`
                    if (communication.estadisticas?.totalDestinatarios) return `${communication.estadisticas.totalDestinatarios} destinatarios`
                    if (communication.recipientCount) return `${communication.recipientCount} destinatarios`
                    return 'Sin destinatarios'
                  })()}
                </div>
                {(communication.state === 'enviado' || communication.state === 'sent' || communication.status === 'sent') && (
                  <>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {communication.estadisticas?.totalLeidos || communication.readCount || 0} leídos
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {communication.responses || 0} respuestas
                    </div>
                  </>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(communication.fechaEnvio || communication.sentDate || communication.fechaCreacion)}
                </div>
                {(communication.due_date || communication.expirationDate) && (
                  <div className={`flex items-center gap-1 ${
                    new Date(communication.due_date || communication.expirationDate) < new Date()
                      ? 'text-red-600 font-semibold'
                      : 'text-orange-600'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    Vence: {new Date(communication.due_date || communication.expirationDate).toLocaleDateString('es-PE')}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onView(communication)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <Eye size={18} />
              </button>
              {/* Solo mostrar Editar y Eliminar si es un comunicado propio */}
              {isOwnCommunication && isOwnCommunication(communication) && (
                <>
                  <button
                    onClick={() => onEdit(communication)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(communication)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default TeacherCommunicationsList
