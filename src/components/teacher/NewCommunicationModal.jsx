import React from 'react'
import { motion } from 'framer-motion'
import { X, Send, Paperclip } from 'lucide-react'

/**
 * Modal para crear/editar un comunicado
 * Incluye formulario completo con adjuntos y selección de estudiantes
 */
const NewCommunicationModal = ({
  isOpen,
  onClose,
  newCommunication,
  setNewCommunication,
  recipients,
  mockStudents,
  selectedStudents,
  showStudentSelector,
  fileHandlers,
  onRecipientChange,
  onStudentToggle,
  onSelectGrade,
  onSend,
  getFileIcon,
  formatFileSize
}) => {
  if (!isOpen) return null

  const { handleFilesSelect, handleFilesDrop, removeAttachment } = fileHandlers

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Nuevo Comunicado</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del comunicado
            </label>
            <input
              type="text"
              value={newCommunication.title}
              onChange={(e) => setNewCommunication({...newCommunication, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ingrese el título del comunicado..."
            />
          </div>

          {/* Destinatarios, Prioridad, Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinatarios
              </label>
              <select
                value={newCommunication.recipients}
                onChange={(e) => onRecipientChange(e.target.value)}
                className="input w-full"
              >
                {recipients.map(recipient => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.name} {recipient.id !== 'custom' && `(${recipient.count})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newCommunication.priority}
                onChange={(e) => setNewCommunication({...newCommunication, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={newCommunication.type}
                onChange={(e) => setNewCommunication({...newCommunication, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="academic">Académico</option>
                <option value="meeting">Reunión</option>
                <option value="materials">Materiales</option>
              </select>
            </div>
          </div>

          {/* Selector de estudiantes específicos */}
          {showStudentSelector && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Seleccionar Estudiantes ({selectedStudents.length} seleccionados)
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectGrade('5°', 'A')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    5° A
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGrade('5°', 'B')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    5° B
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGrade('4°', 'A')}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    4° A
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectGrade(null, null)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {mockStudents.map(student => (
                    <label
                      key={student.id}
                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                        selectedStudents.includes(student.id)
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => onStudentToggle(student.id)}
                        className="mr-2 rounded"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {student.name} {student.last_names}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.grado} - {student.seccion}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido del mensaje
            </label>
            <textarea
              rows={8}
              value={newCommunication.content}
              onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Escriba aquí el contenido del comunicado..."
            />
          </div>

          {/* Adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjuntos (opcional)
            </label>

            {/* File upload area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFilesDrop}
              onClick={() => document.getElementById('file-upload').click()}
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Arrastre archivos aquí o haga clic para seleccionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Formatos permitidos: PDF, JPG, PNG, DOC, DOCX (máx. 5MB)
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFilesSelect}
                className="hidden"
              />
            </div>

            {/* Attached files list */}
            {newCommunication.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos:</h4>
                {newCommunication.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento (opcional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={newCommunication.expirationDate || ''}
                onChange={(e) => setNewCommunication({...newCommunication, expirationDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {newCommunication.expirationDate && (
                <button
                  type="button"
                  onClick={() => setNewCommunication({...newCommunication, expirationDate: ''})}
                  className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                >
                  Quitar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {newCommunication.expirationDate
                ? `Vencimiento configurado: ${new Date(newCommunication.expirationDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Por defecto: 7 días desde el envío si no se especifica'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSend}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Send className="mr-2" size={16} />
              Enviar Comunicado
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NewCommunicationModal
