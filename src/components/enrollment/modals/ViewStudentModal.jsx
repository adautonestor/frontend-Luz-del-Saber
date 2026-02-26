import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, GraduationCap, BookOpen, Users, Download, Edit, Paperclip, FileText } from 'lucide-react'
import { matriculationService } from '../../../services/matriculationService'

/**
 * Modal para visualizar detalles completos de un estudiante
 * Muestra información personal, académica y del padre/tutor
 */
const ViewStudentModal = ({
  isOpen,
  student,
  onClose,
  onEdit
}) => {
  const [observations, setObservations] = useState('')
  const [loadingObservations, setLoadingObservations] = useState(false)

  // Cargar observaciones de la matrícula
  useEffect(() => {
    const loadObservations = async () => {
      if (isOpen && student?.id && student?.academic_year_id) {
        setLoadingObservations(true)
        try {
          const matriculas = await matriculationService.getByStudent(student.id)
          const currentMatriculation = Array.isArray(matriculas)
            ? matriculas.find(m => m.academic_year_id === student.academic_year_id)
            : null

          if (currentMatriculation?.observations) {
            setObservations(currentMatriculation.observations)
          } else {
            setObservations('')
          }
        } catch (error) {
          console.error('Error al cargar observaciones:', error)
          setObservations('')
        } finally {
          setLoadingObservations(false)
        }
      }
    }

    loadObservations()
  }, [isOpen, student?.id, student?.academic_year_id])

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalles del Estudiante
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <GraduationCap className="mr-2" size={20} />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Nombres</p>
                <p className="font-medium text-gray-900">{student.first_names}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Apellidos</p>
                <p className="font-medium text-gray-900">{student.last_names}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">DNI</p>
                <p className="font-medium text-gray-900">{student.dni}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Código</p>
                <p className="font-medium text-gray-900 font-mono">{student.code}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                <p className="font-medium text-gray-900">
                  {student.fechaNacimiento ?
                    new Date(student.fechaNacimiento).toLocaleDateString('es-PE') :
                    'No especificada'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sexo</p>
                <p className="font-medium text-gray-900">
                  {student.sexo === 'M' || student.sexo === 'Masculino' ? 'Masculino' :
                   student.sexo === 'F' || student.sexo === 'Femenino' ? 'Femenino' :
                   student.sexo || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium text-gray-900">{student.telefono || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium text-gray-900">{student.direccion || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <BookOpen className="mr-2" size={20} />
              Información Académica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Nivel</p>
                <p className="font-medium text-gray-900 capitalize">{student.nivel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grado</p>
                <p className="font-medium text-gray-900">
                  {student.grado && student.grado.toString().includes('°')
                    ? student.grado
                    : student.grado ? `${student.grado}°` : 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sección</p>
                <p className="font-medium text-gray-900">{student.seccion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Año Escolar</p>
                <p className="font-medium text-gray-900">{student.academic_year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  student.state === 'activo'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {student.state.charAt(0).toUpperCase() + student.state.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contrato</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.contratoAdjunto
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {student.contratoAdjunto ? (
                      <>
                        <Paperclip size={14} />
                        Adjunto
                      </>
                    ) : (
                      'Sin contrato'
                    )}
                  </span>
                  {student.contratoAdjunto && student.contratoBase64 && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = student.contratoBase64
                        link.download = student.contratoAdjunto || 'contrato.pdf'
                        link.click()
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Download size={12} />
                      Descargar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Parent Info if available */}
          {student.parent_id && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="mr-2" size={20} />
                Información del Padre/Tutor
              </h3>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  ID del Padre: {student.parent_id}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Para más detalles, consulte la sección de usuarios
                </p>
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="mr-2" size={20} />
              Observaciones
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {loadingObservations ? (
                <p className="text-sm text-gray-500 italic">Cargando observaciones...</p>
              ) : observations ? (
                <p className="text-gray-700 whitespace-pre-wrap">{observations}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin observaciones registradas</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors flex items-center"
          >
            <Edit className="mr-2" size={16} />
            Editar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ViewStudentModal
