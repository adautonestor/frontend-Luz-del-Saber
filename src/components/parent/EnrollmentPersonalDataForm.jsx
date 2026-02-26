import React from 'react'
import { GENDER_OPTIONS } from '../../config/enrollmentConstants'

/**
 * Formulario de datos personales del estudiante (Paso 1)
 * Recopila información básica como nombres, DNI, fecha de nacimiento, etc.
 * @param {Object} formData - Datos del formulario
 * @param {Object} formErrors - Errores de validación
 * @param {Function} onInputChange - Handler para cambios en inputs
 */
const EnrollmentPersonalDataForm = ({ formData, formErrors, onInputChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Datos Personales del Estudiante
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombres *
          </label>
          <input
            type="text"
            value={formData.first_names}
            onChange={(e) => onInputChange('first_names', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.first_names ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Ingresa los nombres"
          />
          {formErrors.first_names && (
            <p className="text-red-500 text-sm mt-1">{formErrors.first_names}</p>
          )}
        </div>

        {/* Apellidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos *
          </label>
          <input
            type="text"
            value={formData.last_names}
            onChange={(e) => onInputChange('last_names', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.last_names ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="Ingresa los apellidos"
          />
          {formErrors.last_names && (
            <p className="text-red-500 text-sm mt-1">{formErrors.last_names}</p>
          )}
        </div>

        {/* DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DNI *
          </label>
          <input
            type="text"
            value={formData.dni}
            onChange={(e) => onInputChange('dni', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.dni ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="12345678"
            maxLength="8"
          />
          {formErrors.dni && (
            <p className="text-red-500 text-sm mt-1">{formErrors.dni}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => onInputChange('fechaNacimiento', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {formErrors.fechaNacimiento && (
            <p className="text-red-500 text-sm mt-1">{formErrors.fechaNacimiento}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género *
          </label>
          <select
            value={formData.genero}
            onChange={(e) => onInputChange('genero', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
              ${formErrors.genero ? 'border-red-500' : 'border-gray-300'}
            `}
          >
            <option value="">Selecciona género</option>
            {GENDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {formErrors.genero && (
            <p className="text-red-500 text-sm mt-1">{formErrors.genero}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => onInputChange('telefono', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="999123456"
          />
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <input
          type="text"
          value={formData.direccion}
          onChange={(e) => onInputChange('direccion', e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500
            ${formErrors.direccion ? 'border-red-500' : 'border-gray-300'}
          `}
          placeholder="Dirección completa"
        />
        {formErrors.direccion && (
          <p className="text-red-500 text-sm mt-1">{formErrors.direccion}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="email@ejemplo.com"
        />
      </div>
    </div>
  )
}

export default EnrollmentPersonalDataForm
