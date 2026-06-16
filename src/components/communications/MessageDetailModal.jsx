import React from 'react'
import { motion } from 'framer-motion'
import {
  Paperclip, Image, File, CheckCircle, Eye, Mail
} from 'lucide-react'
import { formatDateSafe } from '../../utils/dateUtils'

/**
 * Modal de detalle de comunicación/mensaje
 * Muestra el contenido completo, adjuntos y estadísticas de lectura
 */
const MessageDetailModal = ({
  selectedMessage,
  setSelectedMessage,
  formatFileSize,
  getRecipientCount,
  readConfirmations,
  user,
  markAsAttended,
  loadData
}) => {
  if (!selectedMessage) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedMessage(null)}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-lg max-w-2xl w-full p-6"
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedMessage.titulo}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedMessage.prioridad === 'alta'
                  ? 'bg-red-100 text-red-800'
                  : selectedMessage.prioridad === 'media'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                Prioridad {selectedMessage.prioridad}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedMessage.state === 'enviado'
                  ? 'bg-green-100 text-green-800'
                  : selectedMessage.state === 'programado'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedMessage.state}
              </span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedMessage.contenido}
            </p>
          </div>

          {/* Mostrar archivos adjuntos con preview */}
          {selectedMessage.adjuntos && selectedMessage.adjuntos.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Paperclip size={16} />
                Archivos Adjuntos ({selectedMessage.adjuntos.length})
              </h4>
              <div className="space-y-3">
                {selectedMessage.adjuntos.map((adjunto, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    {/* Si es imagen, mostrar preview */}
                    {adjunto.type.startsWith('image/') ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Image size={16} className="text-blue-500" />
                          <span className="font-medium">{adjunto.name}</span>
                          <span className="text-xs text-gray-400">({formatFileSize(adjunto.tamaño)})</span>
                        </div>
                        <img
                          src={adjunto.url}
                          alt={adjunto.name}
                          className="max-w-full h-auto rounded border border-gray-200 max-h-96 object-contain"
                        />
                      </div>
                    ) : adjunto.type === 'application/pdf' ? (
                      /* Si es PDF, mostrar visor */
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <File size={16} className="text-red-500" />
                          <span className="font-medium">{adjunto.name}</span>
                          <span className="text-xs text-gray-400">({formatFileSize(adjunto.tamaño)})</span>
                        </div>
                        <iframe
                          src={adjunto.url}
                          className="w-full h-96 border border-gray-300 rounded"
                          title={adjunto.name}
                        />
                      </div>
                    ) : (
                      /* Otros tipos de archivo */
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <File size={16} className="text-gray-500" />
                        <span className="font-medium">{adjunto.name}</span>
                        <span className="text-xs text-gray-400">({formatFileSize(adjunto.tamaño)})</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Destinatarios:</span>
              <span className="font-medium">{getRecipientCount(selectedMessage)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fecha de envío:</span>
              <span className="font-medium">
                {new Date(selectedMessage.fechaEnvio).toLocaleString('es-PE')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remitente:</span>
              <span className="font-medium">{selectedMessage.remitenteId || 'Sistema'}</span>
            </div>
            {selectedMessage.due_date && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha de vencimiento:</span>
                <span className="font-medium text-orange-600">
                  {formatDateSafe(selectedMessage.due_date)}
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas de lectura */}
          {selectedMessage.state === 'enviado' && selectedMessage.estadisticas && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Estadísticas de Lectura</h4>

              {/* Resumen de estadísticas */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedMessage.estadisticas.totalEnviados || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Enviados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedMessage.estadisticas.totalLeidos || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Leídos</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedMessage.estadisticas.porcentajeLeidos || 0}%
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Tasa de lectura</div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${selectedMessage.estadisticas.porcentajeLeidos || 0}%` }}
                  />
                </div>
              </div>

              {/* Lista detallada de todos los destinatarios con su estado */}
              <div className="mt-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Estado de Lectura por Usuario
                </h5>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Usuario
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Rol
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha de Lectura
                        </th>
                        {selectedMessage.requiereConfirmacion && (
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Confirmación
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {readConfirmations
                        .filter(rc => rc.comunicadoId === selectedMessage.id)
                        .sort((a, b) => {
                          // Ordenar: confirmados > leídos > pendientes
                          const statusA = a.fechaConfirmacion ? 3 : a.fechaLectura ? 2 : 1;
                          const statusB = b.fechaConfirmacion ? 3 : b.fechaLectura ? 2 : 1;
                          return statusB - statusA;
                        })
                        .map((confirmation, index) => {
                          const isRead = !!confirmation.fechaLectura;
                          const isConfirmed = !!confirmation.fechaConfirmacion;

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {confirmation.usuario_nombre || 'Usuario desconocido'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                {confirmation.usuario_email || '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    <CheckCircle size={12} />
                                    Confirmado
                                  </span>
                                ) : isRead ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    <Eye size={12} />
                                    Leído
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    <Mail size={12} />
                                    Pendiente
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {confirmation.fechaLectura
                                  ? new Date(confirmation.fechaLectura).toLocaleString('es-PE', {
                                      dateStyle: 'short',
                                      timeStyle: 'short'
                                    })
                                  : '-'
                                }
                              </td>
                              {selectedMessage.requiereConfirmacion && (
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {confirmation.fechaConfirmacion
                                    ? new Date(confirmation.fechaConfirmacion).toLocaleString('es-PE', {
                                        dateStyle: 'short',
                                        timeStyle: 'short'
                                      })
                                    : '-'
                                  }
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setSelectedMessage(null)}
              className="btn btn-outline px-4 py-2"
            >
              Cerrar
            </button>
            {selectedMessage.prioridad === 'alta' && selectedMessage.state === 'enviado' && (selectedMessage.remitenteId === user.id || user.rol === 'director_general') && (
              <button
                onClick={async () => {
                  try {
                    await markAsAttended(selectedMessage.id, user.id)
                    await loadData()
                    setSelectedMessage(null)
                  } catch (error) {
                    console.error('Error marking as attended:', error)
                    alert(error.message || 'Error al marcar como atendido')
                  }
                }}
                className={`btn px-4 py-2 flex items-center gap-2 ${
                  selectedMessage.atendido
                    ? 'btn-secondary'
                    : 'btn-primary'
                }`}
              >
                <CheckCircle size={18} />
                {selectedMessage.atendido ? 'Marcar Atendido Nuevamente' : 'Marcar como Atendido'}
              </button>
            )}
            {selectedMessage.prioridad === 'alta' && selectedMessage.atendido && (
              <div className="flex items-center gap-2 text-green-600 font-medium px-4 py-2">
                <CheckCircle size={18} className="fill-current" />
                <span>Solucionado el {new Date(selectedMessage.fechaAtendido).toLocaleDateString('es-PE')}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MessageDetailModal
