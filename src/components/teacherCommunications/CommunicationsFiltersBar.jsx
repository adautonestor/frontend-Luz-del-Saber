import React from 'react'
import { Search } from 'lucide-react'
import { COMMUNICATION_TABS, MESSAGE_TYPES } from '@/constants/teacherCommunications'

/**
 * Barra con tabs y filtros de comunicaciones
 */
const CommunicationsFiltersBar = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange
}) => {
  return (
    <div className="card">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {COMMUNICATION_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar comunicaciones..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos los tipos</option>
            {MESSAGE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default CommunicationsFiltersBar
