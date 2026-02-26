import React from 'react'
import { Calendar, Building, BookOpen } from 'lucide-react'

/**
 * Componente de navegación por tabs (Años Lectivos, Estructura, Cursos)
 */
const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'anos-lectivos',
      label: 'Años Lectivos',
      icon: Calendar
    },
    {
      id: 'estructura',
      label: 'Estructura Educativa',
      icon: Building
    },
    {
      id: 'cursos',
      label: 'Gestión de Cursos',
      icon: BookOpen
    }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                isActive
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default TabsNavigation
