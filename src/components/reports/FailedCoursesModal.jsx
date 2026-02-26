import React from 'react'
import { motion } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'

/**
 * Modal de cursos desaprobados de un estudiante
 * Muestra el detalle de los cursos donde el estudiante está desaprobado
 */
const FailedCoursesModal = ({
  isOpen,
  studentCourses,
  onClose
}) => {
  if (!isOpen || !studentCourses) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Cursos Desaprobados
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {studentCourses.studentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {studentCourses.subjects.map((subject, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {subject.courseName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Área: {subject.courseArea}
                    </p>
                    {subject.evaluationsCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {subject.evaluationsCount} {subject.evaluationsCount === 1 ? 'evaluación' : 'evaluaciones'}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <span className={`text-2xl font-bold ${
                      subject.grade === 'Sin notas' ? 'text-gray-400' :
                      parseFloat(subject.grade) <= 5 ? 'text-red-600' :
                      parseFloat(subject.grade) <= 8 ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {subject.grade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {studentCourses.subjects.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No hay cursos desaprobados registrados</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total de cursos desaprobados: <span className="font-semibold text-red-600">{studentCourses.subjects.length}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default FailedCoursesModal
