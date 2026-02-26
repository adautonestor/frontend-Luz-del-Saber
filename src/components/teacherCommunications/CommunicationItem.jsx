import React from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, FileText, CheckCircle, AlertCircle, Calendar, User
} from 'lucide-react'
import { getTypeColor, formatDateTime } from '@/utils/teacherCommunications'

/**
 * Item individual de comunicación en la lista
 * @param {Object} communication - El comunicado
 * @param {number} index - Índice para animación
 * @param {Function} onClick - Callback al hacer click
 * @param {boolean} isOwn - Si es un comunicado propio del usuario
 */
const CommunicationItem = ({ communication, index, onClick, isOwn = false }) => {
  // Mapeo de íconos
  const iconMap = {
    informativo: MessageSquare,
    tarea: FileText,
    permiso: CheckCircle,
    urgente: AlertCircle,
    evento: Calendar
  }

  const Icon = iconMap[communication.type] || MessageSquare
  const colorClass = getTypeColor(communication.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 hover:bg-gray-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className={`p-3 rounded-lg bg-${colorClass}-100`}>
            <Icon className={`w-6 h-6 text-${colorClass}-600`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {communication.asunto}
              </h3>
              {isOwn ? (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  Mi comunicado
                </span>
              ) : (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                  <User size={10} />
                  Recibido
                </span>
              )}
              {communication.prioridad === 'alta' && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                  Alta prioridad
                </span>
              )}
            </div>
            <p className="text-gray-600 line-clamp-2">{communication.contenido}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{formatDateTime(communication.fechaEnvio)}</span>
              <span>•</span>
              <span>{communication.destinatarios.total} destinatarios</span>
              {communication.estadisticas && (
                <>
                  <span>•</span>
                  <span>{communication.estadisticas.leidos} leídos</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CommunicationItem
