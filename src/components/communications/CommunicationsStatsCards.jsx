import React from 'react'
import {
  MessageSquare, Calendar, Clock, CheckCircle
} from 'lucide-react'

/**
 * Cards de estadísticas de comunicaciones
 * Muestra totales de enviados, borradores, programados y del mes actual
 */
const CommunicationsStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Enviados</p>
            <p className="text-2xl font-semibold">{stats.totalSent}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Borradores</p>
            <p className="text-2xl font-semibold">{stats.drafts}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Programados</p>
            <p className="text-2xl font-semibold">{stats.scheduled}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Este Mes</p>
            <p className="text-2xl font-semibold">{stats.thisMonth}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunicationsStatsCards
