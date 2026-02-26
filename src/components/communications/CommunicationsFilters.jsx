import React from 'react'
import { Search, Megaphone, Bell, Calendar, Plus, X } from 'lucide-react'

/**
 * Filtros y acciones rápidas de comunicaciones
 * Incluye búsqueda, filtro por tipo, filtro por estado y botones de acciones rápidas
 */
const CommunicationsFilters = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  setIsModalOpen
}) => {
  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar mensajes..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <select
          className="input w-full md:w-40"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          <option value="comunicado">Comunicados</option>
          <option value="circular">Circulares</option>
          <option value="notificacion">Notificaciones</option>
        </select>

        <select
          className="input w-full md:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="sent">Enviados</option>
          <option value="scheduled">Programados</option>
          <option value="draft">Borradores</option>
        </select>

        <select
          className="input w-full md:w-40"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="todos">Todas las prioridades</option>
          <option value="alta">Alta (Urgente)</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {/* Botón limpiar filtros - solo visible si hay filtros activos */}
        {(searchTerm || typeFilter !== 'todos' || statusFilter !== 'todos' || priorityFilter !== 'todos') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setTypeFilter('todos')
              setStatusFilter('todos')
              setPriorityFilter('todos')
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Limpiar todos los filtros"
          >
            <X size={16} />
            <span className="text-sm font-medium">Limpiar</span>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              // Resetear otros filtros y filtrar por comunicados
              setSearchTerm('')
              setStatusFilter('todos')
              setPriorityFilter('todos')
              setTypeFilter('comunicado')
            }}
            className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
              typeFilter === 'comunicado' && statusFilter === 'todos' && priorityFilter === 'todos' && !searchTerm
                ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-400'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Megaphone size={16} />
            <span className="text-sm font-medium">Comunicados</span>
          </button>
          <button
            onClick={() => {
              // Resetear otros filtros y filtrar por prioridad alta (urgentes)
              setSearchTerm('')
              setStatusFilter('todos')
              setTypeFilter('todos')
              setPriorityFilter('alta')
            }}
            className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
              priorityFilter === 'alta' && typeFilter === 'todos' && statusFilter === 'todos' && !searchTerm
                ? 'bg-red-200 text-red-800 ring-2 ring-red-400'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <Bell size={16} />
            <span className="text-sm font-medium">Urgentes</span>
          </button>
          <button
            onClick={() => {
              // Formato DD/MM/YYYY para coincidir con formatDateOnly
              const today = new Date()
              const day = String(today.getDate()).padStart(2, '0')
              const month = String(today.getMonth() + 1).padStart(2, '0')
              const year = today.getFullYear()
              const formattedDate = `${day}/${month}/${year}`
              // Resetear otros filtros y buscar por fecha de hoy
              setTypeFilter('todos')
              setStatusFilter('todos')
              setPriorityFilter('todos')
              setSearchTerm(formattedDate)
            }}
            className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
              searchTerm && searchTerm.includes('/')
                ? 'bg-green-200 text-green-800 ring-2 ring-green-400'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <Calendar size={16} />
            <span className="text-sm font-medium">Hoy</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Nuevo</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default CommunicationsFilters
