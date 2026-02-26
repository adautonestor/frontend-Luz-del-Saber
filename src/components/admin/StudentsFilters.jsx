import React from 'react'
import { Search, ArrowUp, ArrowDown } from 'lucide-react'

const StudentsFilters = ({
  searchTerm,
  filterNivel,
  filterGrado,
  sortOrder,
  niveles,
  grados,
  onSearchChange,
  onNivelChange,
  onGradoChange,
  onToggleSort
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, DNI o código..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          value={filterNivel}
          onChange={(e) => onNivelChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {niveles.map(nivel => (
            <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
          ))}
        </select>

        <select
          value={filterGrado}
          onChange={(e) => onGradoChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {grados.map(grado => (
            <option key={grado.value} value={grado.value}>{grado.label}</option>
          ))}
        </select>

        <button
          onClick={onToggleSort}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title={sortOrder === 'asc' ? 'Ordenar Z-A' : 'Ordenar A-Z'}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp className="text-gray-600" size={20} />
          ) : (
            <ArrowDown className="text-gray-600" size={20} />
          )}
          <span className="text-sm font-medium text-gray-700">
            Apellidos {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default StudentsFilters
