import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bell, AlertCircle } from 'lucide-react'

/**
 * Tarjetas de resumen de estadísticas de comunicaciones
 */
const CommunicationsSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total',
      value: stats.total,
      icon: MessageSquare,
      color: 'bg-blue-500',
      delay: 0
    },
    {
      title: 'No Leídos',
      value: stats.unread,
      icon: Bell,
      color: 'bg-red-500',
      delay: 0.1
    },
    {
      title: 'Importantes',
      value: stats.important,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      delay: 0.2
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`${card.color} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default CommunicationsSummaryCards
