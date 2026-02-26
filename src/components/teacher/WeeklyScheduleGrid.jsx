import React from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { DAY_LABELS, DAYS } from '../../config/scheduleConstants'
import { getTypeIcon, getColorClass, isEventInTimeSlot, isToday } from '../../utils/scheduleHelpers'

/**
 * Grid de horario semanal
 */
const WeeklyScheduleGrid = ({ scheduleData, weekDates, onEventClick }) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 font-medium text-gray-900 border-r border-gray-200">
              Hora
            </div>
            {DAY_LABELS.map((dayLabel, index) => {
              const date = weekDates[index]
              const isTodayDate = isToday(date)
              return (
                <div
                  key={dayLabel}
                  className={`p-4 text-center border-r border-gray-200 ${
                    isTodayDate ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{dayLabel}</div>
                  <div className={`text-sm ${isTodayDate ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time slots */}
          <div className="divide-y divide-gray-100">
            {scheduleData.timeSlots.map((timeSlot) => (
              <div key={timeSlot} className="grid grid-cols-8 min-h-[80px]">
                <div className="p-4 border-r border-gray-200 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">{timeSlot}</div>
                </div>

                {DAYS.map((day, dayIndex) => {
                  const daySchedule = scheduleData.weeklySchedule[day] || []
                  const eventsInSlot = daySchedule.filter(event =>
                    isEventInTimeSlot(event, timeSlot)
                  )

                  const isTodayDate = isToday(weekDates[dayIndex])

                  return (
                    <div
                      key={`${day}-${timeSlot}`}
                      className={`p-2 border-r border-gray-200 relative ${
                        isTodayDate ? 'bg-blue-50' : ''
                      }`}
                    >
                      {eventsInSlot.map((event) => {
                        const TypeIcon = getTypeIcon(event.type)
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-2 rounded-lg border-l-4 mb-1 cursor-pointer hover:shadow-md transition-shadow ${
                              getColorClass(event.color)
                            }`}
                            onClick={() => onEventClick(event)}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <TypeIcon className="w-4 h-4" />
                              <span className="text-xs font-medium truncate">
                                {event.subject}
                              </span>
                            </div>

                            <div className="text-xs opacity-90">
                              {event.startTime} - {event.endTime}
                            </div>

                            {event.room && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs">{event.room}</span>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyScheduleGrid
