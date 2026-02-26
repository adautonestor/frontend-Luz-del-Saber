import React from 'react'
import { Users } from 'lucide-react'

/**
 * Formulario para crear un nuevo estudiante durante la matrícula
 * Incluye datos personales y selección de padre
 */
const NewStudentForm = ({
  newStudentData,
  parents,
  parentChildren,
  handleNewStudentChange
}) => {
  return (
    <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <Users className="mr-2" size={16} />
          Seleccionar Padre *
        </label>
        <select
          name="parent_id"
          value={newStudentData.parent_id}
          onChange={handleNewStudentChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        >
          <option value="">Seleccionar padre</option>
          {parents.map(parent => (
            <option key={parent.id} value={parent.id}>
              {parent.first_name} {parent.last_names} - DNI: {parent.dni || 'N/A'}
            </option>
          ))}
        </select>
        {parents.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            No hay padres registrados en el sistema
          </p>
        )}
        {newStudentData.parent_id && parentChildren.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Este padre ya tiene {parentChildren.length} hijo(s) registrado(s). El descuento se calculará automáticamente.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombres *
          </label>
          <input
            type="text"
            name="first_names"
            value={newStudentData.first_names}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Nombres del estudiante"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos *
          </label>
          <input
            type="text"
            name="last_names"
            value={newStudentData.last_names}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Apellidos del estudiante"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNI *
          </label>
          <input
            type="text"
            name="dni"
            value={newStudentData.dni}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="12345678"
            maxLength="8"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            name="fechaNacimiento"
            value={newStudentData.fechaNacimiento}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sexo *
          </label>
          <select
            name="sexo"
            value={newStudentData.sexo}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={newStudentData.telefono}
            onChange={handleNewStudentChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="+51 987 654 321"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <input
          type="text"
          name="direccion"
          value={newStudentData.direccion}
          onChange={handleNewStudentChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Dirección completa"
        />
      </div>
    </div>
  )
}

export default NewStudentForm
