import React from 'react'
import { Search, RefreshCw } from 'lucide-react'

const UsersFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onRefresh
}) => {
  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellidos o email..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <select
          className="input w-full md:w-40"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          <option value="Director">Director</option>
          <option value="Secretaria">Secretaria</option>
          <option value="Profesor">Docente</option>
          <option value="Padre">Padre</option>
        </select>

        <select
          className="input w-full md:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>

        <button
          onClick={onRefresh}
          className="btn btn-outline px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>
    </div>
  )
}

export default UsersFilters
