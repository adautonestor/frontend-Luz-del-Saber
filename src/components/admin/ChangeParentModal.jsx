import React from 'react'
import { motion } from 'framer-motion'
import { UserCheck, AlertCircle } from 'lucide-react'

const ChangeParentModal = ({
  isOpen,
  student,
  parents,
  selectedNewParent,
  onClose,
  onParentChange,
  onConfirm
}) => {
  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center mb-4">
          <UserCheck className="text-purple-600 mr-2" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">Cambiar Apoderado</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Estudiante:{' '}
            <span className="font-semibold">
              {student.first_names} {student.apellidoPaterno || student.last_names} {student.apellidoMaterno || ''}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            DNI: {student.dni} | Código: {student.code}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Nuevo Apoderado
          </label>
          <select
            value={selectedNewParent}
            onChange={(e) => onParentChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">-- Seleccione un apoderado --</option>
            {parents
              .filter(p => p.id !== student.parent_id)
              .map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.parentData?.first_names || parent.email} - DNI: {parent.parentData?.dni || 'N/A'}
                </option>
              ))}
          </select>
          {parents.filter(p => p.id !== student.parent_id).length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              No hay otros apoderados disponibles en el sistema
            </p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="text-amber-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>El nuevo apoderado tendrá acceso a toda la información del estudiante</li>
                <li>El apoderado anterior perderá el acceso a este estudiante</li>
                <li>Los pagos permanecen vinculados al estudiante</li>
                <li>Este cambio quedará registrado en la auditoría del sistema</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedNewParent}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              selectedNewParent
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Cambiar Apoderado
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ChangeParentModal
