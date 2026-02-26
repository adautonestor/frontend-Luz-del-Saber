import React from 'react'
import { motion } from 'framer-motion'
import { FileText, UserPlus, History, CheckCircle } from 'lucide-react'
import { getStatusColor, getStatusIcon, capitalizeFirst } from '../../utils/enrollmentHelpers.jsx'

/**
 * Componente para mostrar el historial de solicitudes de matrícula
 * Lista todas las solicitudes del padre con su estado actual
 * @param {Array} requests - Array de solicitudes de matrícula
 * @param {Function} onCreateNew - Callback para crear nueva solicitud
 */
const EnrollmentRequestsList = ({ requests, onCreateNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Solicitudes
        </h3>
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay solicitudes registradas
          </h3>
          <p className="text-gray-600 mb-4">
            Aún no has enviado ninguna solicitud de matrícula.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4" />
            Crear Primera Solicitud
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {request.estudianteData?.first_names} {request.estudianteData?.last_names}
                  </h4>
                  <p className="text-sm text-gray-600">
                    DNI: {request.estudianteData?.dni}
                  </p>
                </div>
                <div className={`
                  inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                  ${getStatusColor(request.state)}
                `}>
                  {getStatusIcon(request.state)}
                  {capitalizeFirst(request.state)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nivel:</span>
                  <p className="text-gray-900">
                    {capitalizeFirst(request.nivel)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Grado y Sección:</span>
                  <p className="text-gray-900">{request.grado} - {request.seccion}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fecha de Solicitud:</span>
                  <p className="text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              {request.observations && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Observaciones:</span>
                  <p className="text-sm text-gray-900 mt-1">{request.observations}</p>
                </div>
              )}

              {request.state === 'rechazada' && request.rejection_reason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-sm font-medium text-red-800">Motivo de rechazo:</span>
                    <p className="text-sm text-red-700 mt-1">{request.rejection_reason}</p>
                  </div>
                </div>
              )}

              {request.state === 'aprobada' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Solicitud aprobada
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      El estudiante ha sido matriculado exitosamente.
                      Ya puedes ver sus datos en la sección "Mis Hijos".
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default EnrollmentRequestsList
