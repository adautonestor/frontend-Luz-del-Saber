import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Users, GraduationCap, UserPlus, Key, Copy, Download } from 'lucide-react'
import { PaymentScheduleDownloadButton } from '../admin/PaymentSchedulePDF'

/**
 * Modal de confirmación de matrícula exitosa
 * Muestra todos los detalles del estudiante, información académica, padre asignado y credenciales
 */
const EnrollmentSuccessModal = ({ enrollmentDetails, onClose }) => {
  if (!enrollmentDetails) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-green-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} />
            <div>
              <h2 className="text-2xl font-bold">¡Matrícula Exitosa!</h2>
              <p className="text-green-100">El estudiante ha sido matriculado correctamente</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del Estudiante */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={20} />
              Datos del Estudiante
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span>
                <p className="font-medium">{enrollmentDetails.estudiante.name}</p>
              </div>
              <div>
                <span className="text-gray-500">DNI:</span>
                <p className="font-medium">{enrollmentDetails.estudiante.dni}</p>
              </div>
              <div>
                <span className="text-gray-500">Código de Estudiante:</span>
                <p className="font-medium">{enrollmentDetails.code}</p>
              </div>
              <div>
                <span className="text-gray-500">Año Lectivo:</span>
                <p className="font-medium">{enrollmentDetails.estudiante.anoLectivo}</p>
              </div>
            </div>
          </div>

          {/* Información Académica */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <GraduationCap size={20} />
              Información Académica
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Nivel:</span>
                <p className="font-medium capitalize">{enrollmentDetails.estudiante.nivel}</p>
              </div>
              <div>
                <span className="text-gray-500">Grado:</span>
                <p className="font-medium">{enrollmentDetails.estudiante.grado}</p>
              </div>
              <div>
                <span className="text-gray-500">Sección:</span>
                <p className="font-medium">{enrollmentDetails.estudiante.seccion}</p>
              </div>
            </div>
          </div>

          {/* Información del Padre */}
          {enrollmentDetails.padre && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <UserPlus size={20} />
                Padre/Tutor Registrado
              </h3>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{enrollmentDetails.padre.name}</p>
                  <p className="text-gray-500">DNI: {enrollmentDetails.padre.dni}</p>
                </div>
                <span className="text-gray-600">{enrollmentDetails.padre.relacion}</span>
              </div>
            </div>
          )}

          {/* Credenciales del Nuevo Padre */}
          {enrollmentDetails.parentCredentials && enrollmentDetails.parentCredentials.isNew && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Key size={20} />
                Credenciales de Acceso Generadas
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Se han generado credenciales automáticas para el nuevo padre/tutor.
                </p>

                <div className="bg-white p-3 rounded border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Usuario (Email):</span>
                        <p className="font-mono text-sm font-medium">{enrollmentDetails.parentCredentials.email}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(enrollmentDetails.parentCredentials.email)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Copiar email"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Contraseña:</span>
                        <p className="font-mono text-sm font-medium">{enrollmentDetails.parentCredentials.password}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(enrollmentDetails.parentCredentials.password)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Copiar contraseña"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Esta es una contraseña temporal. Se recomienda que el padre/tutor cambie la contraseña en su primer acceso al sistema.
                </p>
              </div>
            </div>
          )}

          {/* Información de Registro */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <div>
                <span>Fecha de Matrícula: </span>
                <span className="font-medium">{enrollmentDetails.fechaMatricula}</span>
              </div>
              <div>
                <span>Hora: </span>
                <span className="font-medium">{enrollmentDetails.horaMatricula}</span>
              </div>
            </div>
          </div>

          {/* Nota sobre cronograma de pagos */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-800">
              <strong>Nota:</strong> El cronograma de pagos ha sido generado automáticamente
              según los conceptos configurados. Puede consultarlo en el módulo de Pagos.
            </p>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg">
          {/* Botón de descarga del cronograma de pagos */}
          {enrollmentDetails && enrollmentDetails.estudiante && (
            <PaymentScheduleDownloadButton
              studentData={{
                first_names: enrollmentDetails.estudiante.name?.split(' ').slice(0, -1).join(' ') || '',
                last_names: enrollmentDetails.estudiante.name?.split(' ').slice(-1).join(' ') || '',
                dni: enrollmentDetails.estudiante.dni || '',
                code: enrollmentDetails.code || '',
                nivel: enrollmentDetails.estudiante.nivel || '',
                grado: enrollmentDetails.estudiante.grado || '',
                seccion: enrollmentDetails.estudiante.seccion || ''
              }}
              paymentSchedule={enrollmentDetails.cronogramaPagos || []}
              className="btn btn-outline flex items-center gap-2"
            >
              <Download size={16} className="inline" />
              Descargar Cronograma de Pagos
            </PaymentScheduleDownloadButton>
          )}

          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Finalizar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default EnrollmentSuccessModal
