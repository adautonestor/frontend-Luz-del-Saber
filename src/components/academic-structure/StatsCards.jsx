import React from 'react'
import { Building, School, Users, BookOpen } from 'lucide-react'

/**
 * Componente de tarjetas de estadísticas (Niveles, Grados, Secciones, Cursos)
 */
const StatsCards = ({ levels, grades, sections, courses }) => {
  const stats = [
    {
      label: 'Niveles',
      count: levels.length,
      icon: Building,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Grados',
      count: grades.length,
      icon: School,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Secciones',
      count: sections.length,
      icon: Users,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Cursos',
      count: courses.length,
      icon: BookOpen,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.count}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards
