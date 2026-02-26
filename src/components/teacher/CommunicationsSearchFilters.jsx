import React from 'react'
import { Search, Plus } from 'lucide-react'

/**
 * Barra de controles de comunicaciones
 * Incluye tabs, búsqueda, filtros y botón de nuevo comunicado
 */
const CommunicationsSearchFilters = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  filterPriority,
  setFilterPriority,
  onNewCommunication
}) => {
  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sent'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enviados
          </button>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar comunicado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de prioridad */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta prioridad</option>
            <option value="medium">Prioridad media</option>
            <option value="low">Baja prioridad</option>
          </select>

          {/* Botón nuevo comunicado */}
          <button
            onClick={onNewCommunication}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2" size={16} />
            Nuevo Comunicado
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommunicationsSearchFilters
