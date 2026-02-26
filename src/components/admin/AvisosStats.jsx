import React from 'react'
import { Megaphone, Eye, AlertCircle, Calendar } from 'lucide-react'

const AvisosStats = ({ stats }) => {
  const cards = [
    { label: 'Total Avisos', value: stats.total, icon: Megaphone, color: 'blue' },
    { label: 'Activos', value: stats.activos, icon: Eye, color: 'green' },
    { label: 'Inactivos', value: stats.inactivos, icon: AlertCircle, color: 'gray' },
    { label: 'Este Mes', value: stats.thisMonth, icon: Calendar, color: 'purple' }
  ]

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center">
            <div className={`p-2 ${colorClasses[color].bg} rounded-lg`}>
              <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AvisosStats
