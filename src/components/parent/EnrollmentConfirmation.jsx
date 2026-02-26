import React from 'react'
import { AlertCircle } from 'lucide-react'
import { formatGender, capitalizeFirst } from '../../utils/enrollmentHelpers.jsx'

/**
 * Vista de confirmación de datos (Paso 3)
 * Muestra un resumen de todos los datos ingresados para confirmar antes de enviar
 * @param {Object} formData - Datos del formulario para mostrar
 */
const EnrollmentConfirmation = ({ formData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Confirmación de Datos
      </h3>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Estudiante:</span>
            <p className="text-gray-900">{formData.first_names} {formData.last_names}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">DNI:</span>
            <p className="text-gray-900">{formData.dni}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span>
            <p className="text-gray-900">{formData.fechaNacimiento}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Género:</span>
            <p className="text-gray-900">{formatGender(formData.genero)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Nivel Académico:</span>
            <p className="text-gray-900">
              {capitalizeFirst(formData.nivel)} - {formData.grado} - Sección {formData.seccion}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Dirección:</span>
            <p className="text-gray-900">{formData.direccion}</p>
          </div>
        </div>
        {formData.observations && (
          <div>
            <span className="text-sm font-medium text-gray-600">Observaciones:</span>
            <p className="text-gray-900">{formData.observations}</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Información importante</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tu solicitud será revisada por el área administrativa.
              Te notificaremos sobre el estado de tu solicitud a través de este portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnrollmentConfirmation
