import React from 'react'
import { Plus, Bell, Users, Home, CheckCircle, BookOpen } from 'lucide-react'

/**
 * Panel de acciones rápidas y próximas actividades
 */
const ScheduleQuickActions = () => {
  const quickActions = [
    { icon: Plus, label: 'Nueva Actividad' },
    { icon: Bell, label: 'Configurar Recordatorio' },
    { icon: Users, label: 'Programar Reunión' },
    { icon: Home, label: 'Solicitar Permiso' }
  ]

  const upcomingActivities = [
    {
      icon: CheckCircle,
      color: 'bg-yellow-50 text-yellow-600',
      title: 'Evaluación Matemática',
      time: 'Mañana 9:00 AM'
    },
    {
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      title: 'Reunión Padres',
      time: 'Jueves 3:00 PM'
    },
    {
      icon: BookOpen,
      color: 'bg-green-50 text-green-600',
      title: 'Capacitación',
      time: 'Viernes 4:00 PM'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                className="w-full btn btn-outline flex items-center gap-2 justify-center"
              >
                <Icon size={16} />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Actividades</h3>
        <div className="space-y-3">
          {upcomingActivities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div key={index} className={`flex items-center gap-3 p-3 ${activity.color} rounded-lg`}>
                <Icon className="w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ScheduleQuickActions
