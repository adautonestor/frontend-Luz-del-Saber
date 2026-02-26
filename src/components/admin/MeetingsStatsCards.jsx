import React from 'react'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { countMeetingsByStatus } from '../../utils/parentMeetingsHelpers'
import { MEETING_STATUS } from '../../config/parentMeetingsConstants'

/**
 * Tarjetas de estadísticas de reuniones
 */
const MeetingsStatsCards = ({ meetings }) => {
  const stats = [
    {
      label: 'Total Reuniones',
      value: meetings.length,
      icon: Calendar,
      color: 'text-gray-400'
    },
    {
      label: 'Realizadas',
      value: countMeetingsByStatus(meetings, MEETING_STATUS.REALIZADA),
      icon: CheckCircle,
      color: 'text-green-400',
      valueColor: 'text-green-600'
    },
    {
      label: 'Programadas',
      value: countMeetingsByStatus(meetings, MEETING_STATUS.PROGRAMADA),
      icon: Clock,
      color: 'text-blue-400',
      valueColor: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-semibold ${stat.valueColor || 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MeetingsStatsCards
