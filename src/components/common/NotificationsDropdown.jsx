import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, Megaphone, AlertCircle, Check, ChevronRight, X } from 'lucide-react'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { useAuthStore } from '../../stores/authStore'

/**
 * Dropdown de notificaciones para el navbar
 * Muestra comunicados y avisos no leídos
 */
const NotificationsDropdown = ({
  linkTo = '/comunicados',
  themeColor = 'primary' // 'primary' | 'green' | 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { user } = useAuthStore()
  const {
    communications,
    avisos,
    readConfirmations,
    getUserCommunications,
    markAsRead,
    isLoading
  } = useCommunicationsStore()

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Obtener comunicaciones del usuario
  const userCommunications = user?.id
    ? getUserCommunications(user.id, user.rol)
    : []

  // Filtrar no leídas
  const unreadCommunications = userCommunications.filter(comm => !comm.isRead)

  // Avisos activos (los avisos no tienen sistema de lectura por usuario)
  const activeAvisos = avisos.filter(aviso => aviso.state === 'active')

  // Total de notificaciones
  const totalUnread = unreadCommunications.length

  // Combinar y ordenar notificaciones (máximo 5)
  const allNotifications = [
    ...unreadCommunications.slice(0, 4).map(comm => ({
      id: comm.id,
      type: 'communication',
      title: comm.titulo || comm.title,
      message: comm.contenido || comm.mensaje || comm.message || comm.content,
      priority: comm.prioridad || comm.priority,
      date: comm.fechaEnvio || comm.send_date || comm.created_at || comm.createdAt || new Date().toISOString(),
      isRead: comm.isRead
    })),
    ...activeAvisos.slice(0, 2).map(aviso => ({
      id: aviso.id,
      type: 'aviso',
      title: aviso.titulo || aviso.title,
      message: aviso.contenido || aviso.content,
      date: aviso.created_at || aviso.createdAt || aviso.fechaCreacion || new Date().toISOString(),
      isRead: true // Los avisos no tienen tracking de lectura
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  // Marcar como leído
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation()
    if (user?.id) {
      await markAsRead(notificationId, user.id)
    }
  }

  // Colores según tema
  const themeColors = {
    primary: {
      badge: 'bg-red-500',
      hover: 'hover:bg-primary-50',
      text: 'text-primary-600',
      button: 'bg-primary-600 hover:bg-primary-700'
    },
    green: {
      badge: 'bg-red-500',
      hover: 'hover:bg-green-50',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    blue: {
      badge: 'bg-red-500',
      hover: 'hover:bg-blue-50',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const colors = themeColors[themeColor] || themeColors.primary

  // Icono según tipo de notificación
  const getNotificationIcon = (type, priority) => {
    if (priority === 'alta' || priority === 'high') {
      return <AlertCircle size={16} className="text-red-500" />
    }
    if (type === 'aviso') {
      return <Megaphone size={16} className="text-yellow-500" />
    }
    return <MessageSquare size={16} className="text-blue-500" />
  }

  // Formatear fecha relativa
  const formatRelativeDate = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 0) return 'Ahora' // Fecha futura
    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <Bell size={24} />
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white ${colors.badge} rounded-full ring-2 ring-white`}
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {totalUnread > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge} text-white`}>
                  {totalUnread} sin leer
                </span>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
                  Cargando...
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No hay notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {allNotifications.map((notification) => (
                    <div
                      key={`${notification.type}-${notification.id}`}
                      className={`p-3 ${colors.hover} transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatRelativeDate(notification.date)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.type === 'communication' && !notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="mt-1.5 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Check size={12} />
                              Marcar como leído
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <Link
                to={linkTo}
                className={`flex items-center justify-center gap-1 text-sm ${colors.text} font-medium hover:underline`}
                onClick={() => setIsOpen(false)}
              >
                Ver todos los comunicados
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsDropdown
