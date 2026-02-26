import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Users, AlertCircle } from 'lucide-react'

/**
 * Tarjetas de estadísticas del horario
 */
const ScheduleStatsCards = ({ todayClassesCount, totalHours }) => {
  const stats = [
    {
      icon: BookOpen,
      color: 'bg-blue-500',
      label: 'Clases Hoy',
      value: todayClassesCount,
      delay: 0
    },
    {
      icon: Clock,
      color: 'bg-green-500',
      label: 'Horas Semanales',
      value: `${totalHours}h`,
      delay: 0.1
    },
    {
      icon: Users,
      color: 'bg-purple-500',
      label: 'Reuniones',
      value: '3',
      delay: 0.2
    },
    {
      icon: AlertCircle,
      color: 'bg-yellow-500',
      label: 'Evaluaciones',
      value: '2',
      delay: 0.3
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ScheduleStatsCards
