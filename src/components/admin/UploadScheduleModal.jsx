import React from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

const UploadScheduleModal = ({
  showUploadModal,
  uploadForm,
  setUploadForm,
  isDragging,
  closeUploadModal,
  handleFileChange,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleUpload,
  levels,
  grades,
  sections,
  getGradesByLevel,
  getSectionsByGrade
}) => {
  if (!showUploadModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {uploadForm.type === 'alumnos' ? 'Subir Horario de Alumnos' : 'Subir Horario de Docente'}
            </h2>
            <button
              onClick={closeUploadModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Campo de archivo */}
            <div>
              <label className="label">Imagen del Horario *</label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {uploadForm.preview ? (
                    <div className="space-y-3">
                      <img
                        src={uploadForm.preview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadForm(prev => ({ ...prev, archivo: null, preview: null }))}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Subir una imagen</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">o arrastrar y soltar</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="label">Descripción</label>
              <textarea
                className="input"
                rows="3"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional del horario..."
              />
            </div>

            {/* Información del tipo */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Tipo:</strong> {uploadForm.type === 'alumnos' ? 'Horario para Alumnos' : 'Horario para Docentes'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {uploadForm.type === 'alumnos'
                  ? 'Este horario será clasificado por nivel, grado y sección'
                  : 'Este horario será asignado a un profesor específico'
                }
              </p>
            </div>

            {/* Clasificación */}
            {uploadForm.type === 'alumnos' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Clasificación para Alumnos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Nivel *</label>
                    <select
                      className="input"
                      value={uploadForm.level_id}
                      onChange={(e) => {
                        setUploadForm(prev => ({
                          ...prev,
                          level_id: e.target.value,
                          grade_id: '',
                          section_id: ''
                        }))
                      }}
                    >
                      <option value="">Seleccionar nivel</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Grado *</label>
                    <select
                      className="input"
                      value={uploadForm.grade_id}
                      onChange={(e) => {
                        setUploadForm(prev => ({
                          ...prev,
                          grade_id: e.target.value,
                          section_id: ''
                        }))
                      }}
                      disabled={!uploadForm.level_id}
                    >
                      <option value="">Seleccionar grado</option>
                      {getGradesByLevel(uploadForm.level_id).map(grade => (
                        <option key={grade.id} value={grade.id}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Sección *</label>
                    <select
                      className="input"
                      value={uploadForm.section_id}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, section_id: e.target.value }))}
                      disabled={!uploadForm.grade_id}
                    >
                      <option value="">Seleccionar sección</option>
                      {getSectionsByGrade(uploadForm.grade_id).map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name} - {section.shift === 'morning' ? 'Mañana' : section.shift === 'afternoon' ? 'Tarde' : section.shift || 'Sin turno'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {uploadForm.type === 'docentes' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Niveles</h4>
                <p className="text-sm text-gray-600 mb-3">Selecciona el nivel educativo para el cual es este horario de docentes</p>
                <div>
                  <label className="label">Nivel *</label>
                  <select
                    className="input"
                    value={uploadForm.level_id}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, level_id: e.target.value }))}
                  >
                    <option value="">Seleccionar nivel</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeUploadModal}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadForm.archivo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={16} />
              {uploadForm.type === 'alumnos' ? 'Subir Horario de Alumnos' : 'Subir Horario de Docente'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UploadScheduleModal
