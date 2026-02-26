import React from 'react'

/**
 * Secciones de actividad reciente y alertas del dashboard
 */
const DashboardActivity = () => {
  const recentActivities = [
    'Nueva nota registrada: Ana - Matemática (18)',
    'Comunicado recibido: Reunión de padres',
    'Pago confirmado: Mensualidad de Marzo',
    'Boleta disponible: Luis - Primer Bimestre'
  ]

  const alerts = [
    { text: 'Pago de mensualidad vence el 1 de Abril', color: 'text-yellow-600', urgent: true },
    { text: 'Comunicado requiere confirmación de lectura', color: 'text-blue-600', urgent: false },
    { text: 'Reunión de padres programada para el 15 de Abril', color: 'text-green-600', urgent: false }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              {activity}
            </div>
          ))}
        </div>
      </div>

      {/* Important Alerts */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas Importantes
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className={`text-sm ${alert.color} flex items-center`}>
              <div className={`w-2 h-2 bg-current rounded-full mr-3 ${alert.urgent ? 'animate-pulse' : ''}`} />
              {alert.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardActivity
