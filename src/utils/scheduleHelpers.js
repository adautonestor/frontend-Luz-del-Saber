import { EVENT_TYPE_ICONS, EVENT_COLORS, DAYS } from '../config/scheduleConstants'

/**
 * Obtiene el icono correspondiente al tipo de evento
 */
export const getTypeIcon = (type) => {
  return EVENT_TYPE_ICONS[type] || EVENT_TYPE_ICONS.default
}

/**
 * Obtiene las clases CSS de color para un evento
 */
export const getColorClass = (color) => {
  return EVENT_COLORS[color] || EVENT_COLORS.gray
}

/**
 * Calcula las fechas de la semana actual
 */
export const getCurrentWeekDates = (currentDate) => {
  const startOfWeek = new Date(currentDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para inicio en lunes
  startOfWeek.setDate(diff)

  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    weekDates.push(date)
  }
  return weekDates
}

/**
 * Obtiene el nombre del día actual
 */
export const getTodayDayName = () => {
  return DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
}

/**
 * Calcula el total de horas de clase en una semana
 */
export const getTotalHoursWeek = (scheduleData) => {
  let totalMinutes = 0
  Object.values(scheduleData.weeklySchedule).forEach(daySchedule => {
    daySchedule.forEach(event => {
      if (event.type === 'class') {
        const start = new Date(`2024-01-01 ${event.startTime}`)
        const end = new Date(`2024-01-01 ${event.endTime}`)
        totalMinutes += (end - start) / (1000 * 60)
      }
    })
  })
  return (totalMinutes / 60).toFixed(1)
}

/**
 * Verifica si un evento está en un slot de tiempo específico
 */
export const isEventInTimeSlot = (event, timeSlot) => {
  const eventStart = new Date(`2024-01-01 ${event.startTime}`)
  const slotTime = new Date(`2024-01-01 ${timeSlot}`)
  const eventEnd = new Date(`2024-01-01 ${event.endTime}`)

  return eventStart <= slotTime && slotTime < eventEnd
}

/**
 * Verifica si un evento está ocurriendo ahora
 */
export const isEventNow = (event) => {
  const currentTime = new Date()
  const eventStart = new Date(`${currentTime.toDateString()} ${event.startTime}`)
  const eventEnd = new Date(`${currentTime.toDateString()} ${event.endTime}`)
  return currentTime >= eventStart && currentTime <= eventEnd
}

/**
 * Verifica si un evento ya pasó
 */
export const isEventPast = (event) => {
  const currentTime = new Date()
  const eventEnd = new Date(`${currentTime.toDateString()} ${event.endTime}`)
  return currentTime > eventEnd
}

/**
 * Cuenta eventos por tipo en una lista de eventos
 */
export const countEventsByType = (events, type) => {
  return events.filter(event => event.type === type).length
}

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date) => {
  return date.toDateString() === new Date().toDateString()
}
