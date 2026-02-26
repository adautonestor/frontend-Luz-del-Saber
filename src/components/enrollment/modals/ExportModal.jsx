import React from 'react'
import { motion } from 'framer-motion'
import { Download, X } from 'lucide-react'

/**
 * Modal de confirmación para exportar estudiantes a Excel
 * Muestra resumen de datos que serán exportados
 */
const ExportModal = ({
  isOpen,
  studentsCount,
  añoEscolar,
  onExport,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Download className="text-primary-600" size={24} />
              Exportar Estudiantes
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Se exportarán <span className="font-bold text-primary-600">{studentsCount}</span> estudiantes a un archivo Excel.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">El archivo incluirá:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Datos personales (nombres, DNI, etc.)</li>
                <li>• Información académica (nivel, grado, sección)</li>
                <li>• Estado de matrícula y contrato</li>
              </ul>
            </div>

            {añoEscolar && (
              <p className="text-sm text-gray-500 mt-3">
                Año escolar: <span className="font-medium">{añoEscolar}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onExport()
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Descargar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ExportModal
