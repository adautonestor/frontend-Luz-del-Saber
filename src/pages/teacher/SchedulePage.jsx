import React, { useState, useEffect } from 'react'
import { Today } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useScheduleStore } from '../../stores/scheduleStore'
import { VIEW_MODES, VIEW_MODE_LABELS } from '../../config/scheduleConstants'
import { getCurrentWeekDates, getTodayDayName, getTotalHoursWeek, countEventsByType } from '../../utils/scheduleHelpers'
import ScheduleStatsCards from '../../components/teacher/ScheduleStatsCards'
import WeekNavigation from '../../components/teacher/WeekNavigation'
import WeeklyScheduleGrid from '../../components/teacher/WeeklyScheduleGrid'
import TodaySchedule from '../../components/teacher/TodaySchedule'
import ScheduleQuickActions from '../../components/teacher/ScheduleQuickActions'
import EventDetailModal from '../../components/teacher/EventDetailModal'

/**
 * Página de horario del profesor
 */
const SchedulePage = () => {
  const { user } = useAuthStore()
  const {
    teacherSchedules,
    loading: storeLoading,
    initialize
  } = useScheduleStore()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState(VIEW_MODES.WEEK)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [scheduleData, setScheduleData] = useState({ weeklySchedule: {} })

  useEffect(() => {
    loadScheduleData()
  }, [user])

  const loadScheduleData = async () => {
    try {
      await initialize()

      // Obtener horarios del profesor actual
      const teacherId = user?.teacher_id || user?.id
      const mySchedules = teacherSchedules[teacherId] || []

      // Transformar datos de API a formato esperado por los componentes
      const weeklySchedule = organizeScheduleByDay(mySchedules)

      setScheduleData({ weeklySchedule })
    } catch (error) {
      console.error('Error loading schedule:', error)
    }
  }

  // Organizar horarios por día de la semana
  const organizeScheduleByDay = (schedules) => {
    const weeklySchedule = {
      lunes: [],
      martes: [],
      miércoles: [],
      jueves: [],
      viernes: [],
      sábado: []
    }

    schedules.forEach(schedule => {
      const day = schedule.dia_semana?.toLowerCase() || schedule.day?.toLowerCase()
      if (weeklySchedule[day]) {
        weeklySchedule[day].push({
          id: schedule.id,
          time: schedule.hora_inicio || schedule.startTime,
          endTime: schedule.hora_fin || schedule.endTime,
          subject: schedule.curso || schedule.subject,
          grade: schedule.grado || schedule.grade,
          section: schedule.seccion || schedule.section,
          type: 'class'
        })
      }
    })

    return weeklySchedule
  }

  const weekDates = getCurrentWeekDates(currentDate)
  const todayDayName = getTodayDayName()
  const todayClasses = scheduleData.weeklySchedule[todayDayName] || []

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (storeLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando horario...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu horario académico y actividades
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {Object.values(VIEW_MODES).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {VIEW_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
          <button
            onClick={goToToday}
            className="btn btn-outline flex items-center gap-2"
          >
            <Today size={20} />
            Hoy
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <ScheduleStatsCards
        todayClassesCount={countEventsByType(todayClasses, 'class')}
        totalHours={getTotalHoursWeek(scheduleData)}
      />

      {/* Navigation */}
      <WeekNavigation
        weekDates={weekDates}
        onNavigateWeek={navigateWeek}
      />

      {/* Weekly Schedule */}
      {viewMode === VIEW_MODES.WEEK && (
        <WeeklyScheduleGrid
          scheduleData={scheduleData}
          weekDates={weekDates}
          onEventClick={setSelectedEvent}
        />
      )}

      {/* Today's Schedule and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodaySchedule todayClasses={todayClasses} />
        </div>

        <ScheduleQuickActions />
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}

export default SchedulePage
