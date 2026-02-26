import React from 'react'
import { motion } from 'framer-motion'
import {
  Send, Paperclip, Upload, X, Image, File, Save
} from 'lucide-react'

/**
 * Modal para crear y enviar nuevas comunicaciones
 * Incluye formulario completo con destinatarios, filtros, adjuntos y programación
 */
const CreateCommunicationModal = ({
  isOpen,
  formData,
  setFormData,
  handleSubmit,
  handleSaveDraft,
  handleCloseModal,
  handleFileUpload,
  removeAttachment,
  formatFileSize,
  availableUsers,
  userSearchTerm,
  setUserSearchTerm,
  levels,
  grades,
  sections,
  areas,
  getGradesByLevel,
  getSectionsByGrade,
  updateFiltros,
  getEstimatedRecipientCount,
  getFilterDescription
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header - Fijo */}
          <div className="flex-shrink-0 border-b px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Editar Mensaje' : 'Nuevo Mensaje'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="comunicado">Comunicado</option>
                  <option value="circular">Circular</option>
                  <option value="notificacion">Notificación</option>
                  <option value="anuncio">Anuncio</option>
                </select>
              </div>

              <div>
                <label className="label">Prioridad</label>
                <select
                  className="input"
                  value={formData.prioridad}
                  onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
                >
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Título</label>
              <input
                type="text"
                className="input"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="label">Contenido</label>
              <textarea
                className="input min-h-[150px]"
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                required
              />
            </div>

            {/* Sección de adjuntos */}
            <div>
              <label className="label">Archivos adjuntos</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Subir archivos
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PDF, JPG, PNG, GIF hasta 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload').click()}
                      className="btn btn-outline inline-flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Seleccionar archivos
                    </button>
                  </div>
                </div>

                {/* Lista de archivos adjuntos */}
                {formData.adjuntos.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Archivos seleccionados:
                    </h4>
                    <div className="space-y-2">
                      {formData.adjuntos.map((adjunto) => (
                        <div key={adjunto.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            {adjunto.type.startsWith('image/') ? (
                              <Image className="h-5 w-5 text-blue-500 mr-2" />
                            ) : (
                              <File className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{adjunto.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(adjunto.tamaño)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(adjunto.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="label">Destinatarios</label>

              {/* Destinatarios generales */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Grupos generales</h4>
                <div className="grid grid-cols-2 gap-2">
                  {/* Opción "Todos" - si se selecciona, deshabilita las demás */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.destinatarios.includes('todos')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Al seleccionar "todos", limpiar otros destinatarios
                          setFormData({
                            ...formData,
                            destinatarios: ['todos'],
                            usuarioEspecifico: null
                          })
                          setUserSearchTerm('')
                        } else {
                          setFormData({
                            ...formData,
                            destinatarios: []
                          })
                        }
                      }}
                    />
                    <span>Todos</span>
                  </label>

                  {/* Opción "Profesores" - deshabilitada si "todos" está seleccionado */}
                  <label className={`flex items-center ${formData.destinatarios.includes('todos') ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.destinatarios.includes('profesores')}
                      disabled={formData.destinatarios.includes('todos')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            destinatarios: [...formData.destinatarios, 'profesores'],
                            usuarioEspecifico: null
                          })
                          setUserSearchTerm('')
                        } else {
                          setFormData({
                            ...formData,
                            destinatarios: formData.destinatarios.filter(d => d !== 'profesores')
                          })
                        }
                      }}
                    />
                    <span>Profesores</span>
                  </label>

                  {/* Opción "Padres" - deshabilitada si "todos" está seleccionado */}
                  <label className={`flex items-center ${formData.destinatarios.includes('todos') ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={formData.destinatarios.includes('padres')}
                      disabled={formData.destinatarios.includes('todos')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            destinatarios: [...formData.destinatarios, 'padres'],
                            usuarioEspecifico: null
                          })
                          setUserSearchTerm('')
                        } else {
                          setFormData({
                            ...formData,
                            destinatarios: formData.destinatarios.filter(d => d !== 'padres')
                          })
                        }
                      }}
                    />
                    <span>Padres</span>
                  </label>

                  {/* Nota: "Estudiantes" fue removido - no se pueden enviar comunicados a estudiantes */}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="label">O enviar a usuario específico</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input"
                    placeholder="Buscar usuario por nombre..."
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value)
                      if (e.target.value && formData.destinatarios.length > 0) {
                        setFormData({
                          ...formData,
                          destinatarios: []
                        })
                      }
                    }}
                  />
                  {userSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {availableUsers
                        .filter(user => {
                          const userName = user.name || `${user.first_name || ''} ${user.last_names || ''}`.trim() || ''
                          const userEmail = user.email || ''
                          return userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            userEmail.toLowerCase().includes(userSearchTerm.toLowerCase())
                        })
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                usuarioEspecifico: user,
                                destinatarios: []
                              })
                              const displayName = user.name || `${user.first_name || ''} ${user.last_names || ''}`.trim()
                              setUserSearchTerm(displayName)
                            }}
                          >
                            <div>
                              <div className="font-medium">{user.name || `${user.first_name || ''} ${user.last_names || ''}`.trim()}</div>
                              <div className="text-sm text-gray-500">{user.email || ''} - {user.rol || user.role || ''}</div>
                            </div>
                          </button>
                        ))}
                      {availableUsers.filter(user => {
                        const userName = user.name || `${user.first_name || ''} ${user.last_names || ''}`.trim() || ''
                        const userEmail = user.email || ''
                        return userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          userEmail.toLowerCase().includes(userSearchTerm.toLowerCase())
                      }).length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No se encontraron usuarios</div>
                      )}
                    </div>
                  )}
                </div>
                {formData.usuarioEspecifico && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formData.usuarioEspecifico.name || `${formData.usuarioEspecifico.first_name || ''} ${formData.usuarioEspecifico.last_names || ''}`.trim()}</span>
                        <span className="text-sm text-gray-500 ml-2">({formData.usuarioEspecifico.rol || formData.usuarioEspecifico.role || ''})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({...formData, usuarioEspecifico: null})
                          setUserSearchTerm('')
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="programado"
                className="mr-2"
                checked={formData.programado}
                onChange={(e) => setFormData({...formData, programado: e.target.checked})}
              />
              <label htmlFor="programado" className="text-sm">
                Programar envío
              </label>
            </div>

            {formData.programado && (
              <div>
                <label className="label">Fecha y hora de envío</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.fechaProgramada}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => {
                    const newFechaProgramada = e.target.value
                    // Si la fecha de vencimiento es anterior a la nueva fecha programada, limpiarla
                    const newDueDate = formData.due_date && formData.due_date < newFechaProgramada.split('T')[0]
                      ? ''
                      : formData.due_date
                    setFormData({...formData, fechaProgramada: newFechaProgramada, due_date: newDueDate})
                  }}
                  required={formData.programado}
                />
              </div>
            )}

            {/* Fecha de Vencimiento */}
            <div>
              <label className="label">Fecha de vencimiento (opcional)</label>
              {(() => {
                // Calcular fecha mínima (hoy en formato local)
                const today = new Date()
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                const minDate = formData.programado && formData.fechaProgramada
                  ? formData.fechaProgramada.split('T')[0]
                  : todayStr

                return (
                  <input
                    type="date"
                    className="input"
                    value={formData.due_date}
                    onChange={(e) => {
                      const selectedDate = e.target.value
                      // Validación adicional: no permitir fechas pasadas
                      if (selectedDate < todayStr) {
                        return // No hacer nada si la fecha es anterior a hoy
                      }
                      setFormData({...formData, due_date: selectedDate})
                    }}
                    min={minDate}
                  />
                )
              })()}
              <p className="text-xs text-gray-500 mt-1">
                {formData.programado && formData.fechaProgramada
                  ? 'La fecha de vencimiento debe ser posterior a la fecha programada de envío.'
                  : 'Predeterminado: 7 días desde hoy. Los padres podrán ver el comunicado hasta esta fecha.'}
              </p>
            </div>

            </div>

            {/* Footer - Fijo */}
            <div className="flex-shrink-0 border-t px-6 py-4 flex justify-between bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline px-4 py-2"
              >
                Cancelar
              </button>
              <div className="flex gap-3">
                {/* Botón Guardar Borrador - Solo para nuevos comunicados */}
                {!formData.id && handleSaveDraft && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleSaveDraft(e)
                    }}
                    disabled={!formData.titulo || !formData.contenido}
                    className={`px-4 py-2 flex items-center gap-2 ${
                      !formData.titulo || !formData.contenido
                        ? 'btn btn-outline cursor-not-allowed opacity-50'
                        : 'btn btn-outline hover:bg-gray-100'
                    }`}
                  >
                    <Save size={18} />
                    Guardar Borrador
                  </button>
                )}
                {/* Botón Enviar */}
                <button
                  type="submit"
                  disabled={formData.destinatarios.length === 0 && !formData.usuarioEspecifico}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    formData.destinatarios.length === 0 && !formData.usuarioEspecifico
                      ? 'btn btn-outline cursor-not-allowed opacity-50'
                      : 'btn btn-primary'
                  }`}
                >
                  <Send size={18} />
                  {formData.id ? 'Guardar Cambios' : 'Enviar Mensaje'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateCommunicationModal
