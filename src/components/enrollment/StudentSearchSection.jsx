import React from 'react'
import { X, User, Users } from 'lucide-react'

/**
 * Sección de búsqueda de estudiantes existentes
 * Muestra búsqueda, resultados e información del estudiante y padre
 */
const StudentSearchSection = ({
  searchStudent,
  showStudentDropdown,
  foundStudent,
  studentParent,
  filteredStudents,
  parentChildren,
  setShowStudentDropdown,
  handleSelectStudent,
  handleClearStudent,
  handleSearchChange
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Estudiante *
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchStudent}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowStudentDropdown(true)}
            placeholder="Escribe el nombre o apellido del estudiante..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-20"
          />
          {foundStudent && (
            <button
              type="button"
              onClick={handleClearStudent}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Busca por nombres o apellidos del estudiante sin matrícula
        </p>

        {/* Dropdown de resultados */}
        {showStudentDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowStudentDropdown(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No se encontraron estudiantes disponibles
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full px-3 py-2 text-left hover:bg-primary-50 transition-colors border-b last:border-b-0 ${
                      foundStudent?.id === student.id ? 'bg-primary-100' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names}, {student.first_names}
                    </div>
                    <div className="text-sm text-gray-600">
                      DNI: {student.dni}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Información del estudiante encontrado */}
      {foundStudent && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <User size={20} />
              Información del Estudiante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nombres:</span>
                <span className="ml-2 font-medium text-gray-900">{foundStudent.first_names}</span>
              </div>
              <div>
                <span className="text-gray-600">Apellidos:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {`${foundStudent.paternal_last_name || ''} ${foundStudent.maternal_last_name || ''}`.trim() || foundStudent.last_names}
                </span>
              </div>
              <div>
                <span className="text-gray-600">DNI:</span>
                <span className="ml-2 font-medium text-gray-900">{foundStudent.dni}</span>
              </div>
              {foundStudent.fechaNacimiento && (
                <div>
                  <span className="text-gray-600">Fecha Nac.:</span>
                  <span className="ml-2 font-medium text-gray-900">{foundStudent.fechaNacimiento}</span>
                </div>
              )}
              {foundStudent.sexo && (
                <div>
                  <span className="text-gray-600">Sexo:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {foundStudent.sexo === 'M' ? 'Masculino' : 'Femenino'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información del padre asignado */}
          {studentParent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                <Users size={20} />
                Padre/Tutor Asignado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-900">{studentParent.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">DNI:</span>
                  <span className="ml-2 font-medium text-gray-900">{studentParent.dni}</span>
                </div>
                {studentParent.telefono && (
                  <div>
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="ml-2 font-medium text-gray-900">{studentParent.telefono}</span>
                  </div>
                )}
                {studentParent.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">{studentParent.email}</span>
                  </div>
                )}
              </div>
              {parentChildren.length > 1 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-800">
                    <strong>✓</strong> Este padre tiene {parentChildren.length} hijo(s). Se aplicará descuento automático.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
              <p className="text-sm text-gray-600">No Asignado</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default StudentSearchSection
