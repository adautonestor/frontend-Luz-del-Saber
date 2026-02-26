import React from 'react'
import { Users, UserPlus } from 'lucide-react'

/**
 * Paso 1: Búsqueda de estudiante por DNI
 * Muestra información del estudiante y del padre asignado (si existe)
 */
const StudentSearchStep = ({
  searchDni,
  handleSearchByDni,
  foundStudent,
  studentParent,
  formData,
  errors
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4">Buscar Estudiante por DNI</h3>

      {/* Campo de búsqueda por DNI */}
      <div>
        <label className="label">DNI del Estudiante *</label>
        <input
          type="text"
          value={searchDni}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 12)
            handleSearchByDni(value)
          }}
          placeholder="Escribe el DNI del estudiante..."
          className={`input ${errors.studentId ? 'border-red-500' : ''}`}
          maxLength="12"
        />
        <p className="text-xs text-gray-500 mt-1">
          Escribe el DNI del estudiante para buscar y mostrar su información
        </p>
        {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
      </div>

      {/* Mensaje si no se encuentra el estudiante */}
      {searchDni.length >= 8 && !foundStudent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No se encontró ningún estudiante sin matrícula con el DNI <strong>{searchDni}</strong>
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Verifica que el DNI sea correcto y que el estudiante esté registrado sin matrícula activa
          </p>
        </div>
      )}

      {/* Información del estudiante encontrado */}
      {foundStudent && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Users size={20} />
              Información del Estudiante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nombres:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.first_names}</span>
              </div>
              <div>
                <span className="text-gray-600">Apellidos:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.last_names}</span>
              </div>
              <div>
                <span className="text-gray-600">DNI:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.dni}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha Nacimiento:</span>
                <span className="ml-2 font-medium text-gray-900">{formData.fechaNacimiento}</span>
              </div>
              <div>
                <span className="text-gray-600">Género:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formData.genero === 'M' ? 'Masculino' : formData.genero === 'F' ? 'Femenino' : formData.genero}
                </span>
              </div>
              {formData.direccion && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del padre asignado */}
          {studentParent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <UserPlus size={20} />
                Padre/Tutor Asignado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {studentParent.name} {studentParent.apellidoPaterno || studentParent.last_names || ''} {studentParent.apellidoMaterno || ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">DNI:</span>
                  <span className="ml-2 font-medium text-gray-900">{studentParent.dni}</span>
                </div>
                <div>
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="ml-2 font-medium text-gray-900">{studentParent.telefono || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{studentParent.email || '-'}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-800">
                  <strong>✓</strong> Este padre/tutor será asignado automáticamente en la matrícula
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <UserPlus size={20} />
                Sin Padre/Tutor Asignado
              </h4>
              <p className="text-sm text-amber-800">
                Este estudiante no tiene un padre/tutor asignado.
                Deberás asignarlo en el paso 3 de la matrícula.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StudentSearchStep
