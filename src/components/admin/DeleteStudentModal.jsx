import React from 'react'
import { motion } from 'framer-motion'

const DeleteStudentModal = ({ isOpen, student, onClose, onConfirm }) => {
  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirmar eliminación</h3>
        <p className="text-gray-600 mb-6">
          ¿Está seguro de eliminar al estudiante{' '}
          <span className="font-semibold">
            {student.first_names} {student.last_names}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default DeleteStudentModal
