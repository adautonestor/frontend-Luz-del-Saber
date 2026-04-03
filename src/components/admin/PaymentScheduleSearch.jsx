import React from 'react'
import { X, AlertCircle } from 'lucide-react'

/**
 * Componente de búsqueda de estudiantes por DNI o nombre
 */
const PaymentScheduleSearch = ({
  searchDni,
  searchName,
  filteredStudents,
  filteredByDni = [],
  showDropdown,
  showDniDropdown,
  students,
  onSearchByDni,
  onSearchByName,
  onSelectStudent,
  onSelectStudentByDni,
  onClearSearch,
  setShowDropdown,
  setShowDniDropdown
}) => {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search by DNI */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por DNI
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchDni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 12)
                onSearchByDni(value)
              }}
              onFocus={() => searchDni && setShowDniDropdown(true)}
              placeholder="Escribe el DNI del estudiante..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              maxLength="12"
            />
            {searchDni && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Dropdown de resultados por DNI */}
          {showDniDropdown && searchDni && filteredByDni.length > 0 && (
            <>
              {/* Overlay para cerrar el dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDniDropdown(false)}
              />

              {/* Lista de estudiantes */}
              <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredByDni.slice(0, 10).map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => onSelectStudentByDni(student)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {student.paternal_last_name || ''} {student.maternal_last_name || ''}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      DNI: {student.dni} - {student.nivel || 'Sin nivel'} {student.grado || ''}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search by Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Nombre
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchName}
              onChange={(e) => onSearchByName(e.target.value)}
              onFocus={() => searchName && setShowDropdown(true)}
              placeholder="Escribe el nombre o apellido..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
            />
            {searchName && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Dropdown de resultados */}
          {showDropdown && searchName && filteredStudents.length > 0 && (
            <>
              {/* Overlay para cerrar el dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Lista de estudiantes */}
              <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => onSelectStudent(student)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {student.paternal_last_name || ''} {student.maternal_last_name || ''}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      DNI: {student.dni} - {student.nivel} {student.grado}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-6">
        {students.length} estudiantes con cronogramas de pago (incluye históricos)
      </p>
    </>
  )
}

export default PaymentScheduleSearch
