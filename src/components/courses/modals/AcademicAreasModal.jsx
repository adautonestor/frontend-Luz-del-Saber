import React from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, Check, Edit, Trash2, BookOpen } from 'lucide-react'

/**
 * Modal de gestión de áreas académicas
 */
const AcademicAreasModal = ({
  show,
  academicAreas,
  editingArea,
  areaForm,
  onAreaFormChange,
  onCreateArea,
  onEditArea,
  onSaveArea,
  onDeleteArea,
  onClose
}) => {
  if (!show) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-[60]"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Áreas Académicas</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Form Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {editingArea ? 'Editar Área' : 'Nueva Área'}
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Área *
                    </label>
                    <input
                      type="text"
                      value={areaForm.name}
                      onChange={(e) => onAreaFormChange('name', e.target.value)}
                      placeholder="Ej: Matemáticas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={areaForm.description}
                      onChange={(e) => onAreaFormChange('description', e.target.value)}
                      placeholder="Descripción del área académica"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onSaveArea}
                      className="btn btn-primary px-4 py-2 flex items-center gap-2"
                    >
                      <Check size={16} />
                      {editingArea ? 'Actualizar' : 'Crear Área'}
                    </button>
                    {editingArea && (
                      <button
                        onClick={onCreateArea}
                        className="btn btn-outline px-4 py-2"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Areas List */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Áreas Existentes ({academicAreas.length})
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {academicAreas.map((area) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h5 className="font-medium text-gray-900">{area.name}</h5>
                        {area.description && (
                          <p className="text-sm text-gray-600">{area.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditArea(area)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar área"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteArea(area)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar área"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {academicAreas.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No hay áreas académicas definidas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn btn-primary px-6 py-2"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default AcademicAreasModal
