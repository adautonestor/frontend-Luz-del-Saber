import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Play, MoreHorizontal } from 'lucide-react'
import { getTypeIcon, getColorClass, isEventNow, isEventPast } from '../../utils/scheduleHelpers'

/**
 * Horario del día actual
 */
const TodaySchedule = ({ todayClasses }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Horario de Hoy - {new Date().toLocaleDateString('es-PE', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </h3>

      <div className="space-y-3">
        {todayClasses.length > 0 ? (
          todayClasses.map((event, index) => {
            const TypeIcon = getTypeIcon(event.type)
            const isNow = isEventNow(event)
            const isPast = isEventPast(event)

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                  isNow ? 'border-green-500 bg-green-50' :
                  isPast ? 'border-gray-200 bg-gray-50 opacity-60' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${getColorClass(event.color)}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{event.subject}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.room && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.room}
                      </div>
                    )}
                    {event.students && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.students} estudiantes
                      </div>
                    )}
                  </div>
                </div>

                {isNow && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Play className="w-4 h-4" />
                    En curso
                  </div>
                )}

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No tienes clases programadas para hoy</p>
            <p className="text-sm">¡Disfruta tu día libre!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TodaySchedule
