import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Eye, Users } from 'lucide-react'

/**
 * Tarjetas de estadísticas de comunicaciones
 * Muestra: enviados, leídos, respuestas
 */
const CommunicationsStatsCards = ({ communications }) => {
  // Calcular estadísticas usando los campos correctos del backend
  const stats = {
    // Contar comunicados enviados (state puede ser 'sent' o 'enviado')
    sent: communications.filter(c =>
      c.state === 'sent' || c.state === 'enviado' || c.status === 'sent'
    ).length,
    // Sumar lecturas usando estadisticas.totalLeidos o readCount
    read: communications.reduce((sum, c) => {
      const leidos = c.estadisticas?.totalLeidos || c.estadisticas?.leidos || c.readCount || 0
      return sum + leidos
    }, 0),
    // Sumar respuestas
    responses: communications.reduce((sum, c) => {
      const respuestas = c.estadisticas?.respuestas || c.responses || 0
      return sum + respuestas
    }, 0)
  }

  const cards = [
    {
      title: 'Enviados',
      value: stats.sent,
      icon: MessageSquare,
      bgColor: 'bg-blue-500',
      delay: 0
    },
    {
      title: 'Leídos',
      value: stats.read,
      icon: Eye,
      bgColor: 'bg-green-500',
      delay: 0.2
    },
    {
      title: 'Respuestas',
      value: stats.responses,
      icon: Users,
      bgColor: 'bg-purple-500',
      delay: 0.3
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`${card.bgColor} rounded-lg p-3`}>
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

export default CommunicationsStatsCards
