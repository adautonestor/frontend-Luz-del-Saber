import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

/**
 * Paso 3: Asignación de Padre/Tutor
 * Permite asignar un padre existente o registrar uno nuevo
 */
const ParentAssignmentStep = ({
  formData,
  parentForm,
  availableParents,
  selectedParentId,
  setSelectedParentId,
  handleParentFormChange,
  addExistingParent,
  addNewParent,
  removeParent,
  errors
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Asignación de Padre/Tutor</h3>
      <p className="text-sm text-gray-600 mb-4">Solo se puede asignar un padre/tutor por estudiante</p>

      {/* Current Parent */}
      {formData.padre && (
        <div>
          <h4 className="font-medium mb-3">Padre/Tutor Asignado:</h4>
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">
                {formData.padre.name} {formData.padre.apellidoPaterno} {formData.padre.apellidoMaterno}
              </p>
              <p className="text-sm text-gray-600">
                {formData.padre.relacion} - {formData.padre.telefono || 'Sin teléfono'}
              </p>
              {formData.padre.type === 'new' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Nuevo
                </span>
              )}
            </div>
            <button
              onClick={removeParent}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Existing Parent */}
      {!formData.padre && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Asignar Padre/Tutor Existente</h4>
          <div className="flex gap-3">
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="input flex-1"
            >
              <option value="">Seleccionar padre/tutor existente</option>
              {availableParents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} {parent.apellidoPaterno} - {parent.dni}
                </option>
              ))}
            </select>
            <button
              onClick={addExistingParent}
              disabled={!selectedParentId}
              className="btn btn-outline px-4"
            >
              Asignar
            </button>
          </div>
        </div>
      )}

      {/* Add New Parent */}
      {!formData.padre && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3">Registrar Nuevo Padre/Tutor</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="name"
                value={parentForm.name}
                onChange={handleParentFormChange}
                className="input"
                placeholder="Nombre"
              />
            </div>

            <div>
              <label className="label">Apellido Paterno *</label>
              <input
                type="text"
                name="apellidoPaterno"
                value={parentForm.apellidoPaterno}
                onChange={handleParentFormChange}
                className="input"
                placeholder="Apellido Paterno"
              />
            </div>

            <div>
              <label className="label">Apellido Materno</label>
              <input
                type="text"
                name="apellidoMaterno"
                value={parentForm.apellidoMaterno}
                onChange={handleParentFormChange}
                className="input"
                placeholder="Apellido Materno"
              />
            </div>

            <div>
              <label className="label">DNI *</label>
              <input
                type="text"
                name="dni"
                value={parentForm.dni}
                onChange={handleParentFormChange}
                className="input"
                placeholder="12345678"
                maxLength="8"
              />
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={parentForm.telefono}
                onChange={handleParentFormChange}
                className="input"
                placeholder="987654321"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={parentForm.email}
                onChange={handleParentFormChange}
                className="input"
                placeholder="padre@email.com"
              />
            </div>

            <div>
              <label className="label">Relación</label>
              <select
                name="relacion"
                value={parentForm.relacion}
                onChange={handleParentFormChange}
                className="input"
              >
                <option value="padre">Padre</option>
                <option value="madre">Madre</option>
                <option value="tutor">Tutor</option>
                <option value="abuelo">Abuelo/a</option>
                <option value="tio">Tío/a</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="label">Ocupación</label>
              <input
                type="text"
                name="ocupacion"
                value={parentForm.ocupacion}
                onChange={handleParentFormChange}
                className="input"
                placeholder="Ocupación"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Dirección</label>
            <textarea
              name="direccion"
              value={parentForm.direccion}
              onChange={handleParentFormChange}
              className="input"
              rows="2"
              placeholder="Dirección completa"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={addNewParent}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Registrar Padre/Tutor
            </button>
          </div>
        </div>
      )}

      {errors.padre && <p className="text-red-500 text-sm">{errors.padre}</p>}
    </div>
  )
}

export default ParentAssignmentStep
