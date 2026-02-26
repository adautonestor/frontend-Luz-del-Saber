import React from 'react'
import { motion } from 'framer-motion'
import { X, Send, Image as ImageIcon, File } from 'lucide-react'
import { MESSAGE_TYPES, GRADOS as GRADOS_FALLBACK, SECCIONES as SECCIONES_FALLBACK } from '@/constants/teacherCommunications'
import { formatFileSize } from '@/utils/teacherCommunications'

/**
 * Modal para componer/editar mensajes
 */
const MessageComposerModal = ({
  show,
  onClose,
  messageForm,
  setMessageForm,
  onSend,
  getIconComponent,
  handleImageUpload,
  handleFileUpload,
  removeImage,
  removeFile,
  imageZoom,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  filtroGrado,
  setFiltroGrado,
  filtroSeccion,
  setFiltroSeccion,
  grados,
  secciones,
  estudiantesFiltrados,
  toggleEstudiante,
  seleccionarTodos,
  deseleccionarTodos
}) => {
  // Usar datos dinámicos o fallback a constantes
  const gradosToShow = grados?.length > 0 ? grados : GRADOS_FALLBACK
  const seccionesToShow = secciones?.length > 0 ? secciones : SECCIONES_FALLBACK

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Nueva Comunicación</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Tipo de mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Comunicación
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MESSAGE_TYPES.map(type => {
                const Icon = getIconComponent(type.id)
                return (
                  <button
                    key={type.id}
                    onClick={() => setMessageForm(prev => ({ ...prev, type: type.id }))}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      messageForm.type === type.id
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${
                      messageForm.type === type.id ? `text-${type.color}-600` : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
            <input
              type="text"
              value={messageForm.asunto}
              onChange={(e) => setMessageForm(prev => ({ ...prev, asunto: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Escribe el asunto del mensaje"
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
            <textarea
              value={messageForm.contenido}
              onChange={(e) => setMessageForm(prev => ({ ...prev, contenido: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Escribe el contenido del mensaje"
            />
          </div>

          {/* Destinatarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>
            <select
              value={messageForm.destinatarios}
              onChange={(e) => setMessageForm(prev => ({ ...prev, destinatarios: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="curso">Todo el curso</option>
              <option value="personalizada">Selección personalizada</option>
            </select>
          </div>

          {/* Selección de estudiantes personalizada */}
          {messageForm.destinatarios === 'personalizada' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Seleccionar Estudiantes</h3>
                <div className="flex gap-2">
                  <button
                    onClick={seleccionarTodos}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Seleccionar todos
                  </button>
                  <button
                    onClick={deseleccionarTodos}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Deseleccionar todos
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <select
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="todos">Todos los grados</option>
                  {gradosToShow.map(grado => (
                    <option key={grado} value={grado}>{grado}</option>
                  ))}
                </select>
                <select
                  value={filtroSeccion}
                  onChange={(e) => setFiltroSeccion(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="todos">Todas las secciones</option>
                  {seccionesToShow.map(seccion => (
                    <option key={seccion} value={seccion}>{seccion}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {estudiantesFiltrados.map(estudiante => (
                  <label
                    key={estudiante.id}
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={messageForm.estudiantesSeleccionados.includes(estudiante.id)}
                      onChange={() => toggleEstudiante(estudiante.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{estudiante.name}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {messageForm.estudiantesSeleccionados.length} estudiante(s) seleccionado(s)
              </div>
            </div>
          )}

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos Adjuntos
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <ImageIcon size={20} />
                <span className="text-sm">Agregar Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <File size={20} />
                <span className="text-sm">Agregar Archivo</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview de imagen */}
            {messageForm.imagen && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Imagen: {messageForm.imagen.name}</span>
                  <button onClick={removeImage} className="text-red-600 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
                <img
                  src={messageForm.imagen.data}
                  alt="Preview"
                  style={{ transform: `scale(${imageZoom})` }}
                  className="max-w-full transition-transform"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleZoomOut} className="text-sm text-gray-600">Zoom -</button>
                  <button onClick={handleZoomReset} className="text-sm text-gray-600">Reset</button>
                  <button onClick={handleZoomIn} className="text-sm text-gray-600">Zoom +</button>
                </div>
              </div>
            )}

            {/* Preview de archivo */}
            {messageForm.archivo && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File size={20} />
                    <div>
                      <p className="text-sm font-medium">{messageForm.archivo.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(messageForm.archivo.tamaño)}</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="text-red-600 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              value={messageForm.prioridad}
              onChange={(e) => setMessageForm(prev => ({ ...prev, prioridad: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Send size={18} />
              Enviar Comunicación
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MessageComposerModal
