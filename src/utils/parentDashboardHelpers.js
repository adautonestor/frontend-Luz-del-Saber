import { WEEK_DAYS } from '../config/parentLayoutConstants'
import { getGradingScalesStore } from '../stores/gradingScalesStore'

/**
 * Filtra los estudiantes hijos del padre actual
 */
export const getMyChildren = (students, parentId) => {
  return students.filter(student =>
    student.parentIds && student.parentIds.includes(parentId)
  )
}

/**
 * Obtiene los avisos activos más recientes
 */
export const getActiveAvisos = (avisosData, limit = 3) => {
  return avisosData
    .filter(aviso => aviso.activo)
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, limit)
}

/**
 * Obtiene el horario de un hijo específico con datos enriquecidos
 */
export const getChildSchedule = (selectedChild, getGradeSchedules, allCourses) => {
  if (!selectedChild) return []

  const childSchedules = getGradeSchedules(selectedChild.grade_id, selectedChild.section_id)

  // Enriquecer con datos de curso y profesor
  return childSchedules.map(schedule => {
    const course = allCourses.find(c => c.id === schedule.course_id)
    const teacher = course?.profesorNombre || 'Sin asignar'

    return {
      ...schedule,
      cursoNombre: course?.name || 'Curso no encontrado',
      profesorNombre: teacher
    }
  })
}

/**
 * Organiza los horarios por días de la semana
 */
export const getWeeklySchedule = (childSchedules) => {
  return WEEK_DAYS.map((day, dayIndex) => {
    const daySchedules = childSchedules
      .filter(schedule => schedule.dia === dayIndex)
      .sort((a, b) => {
        const timeA = a.horaInicio.split(':').map(Number)
        const timeB = b.horaInicio.split(':').map(Number)
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
      })

    return {
      day,
      dayIndex,
      schedules: daySchedules
    }
  })
}

/**
 * Obtiene información del grado y sección del hijo
 */
export const getChildInfo = (selectedChild, grades, sections) => {
  if (!selectedChild) return null

  const grade = grades.find(g => g.id === selectedChild.grade_id)
  const section = sections.find(s => s.id === selectedChild.section_id)

  return {
    gradoNombre: grade?.name || 'N/A',
    seccionNombre: section?.name || 'N/A',
    nivel: grade?.nivel || 'N/A'
  }
}

/**
 * Obtiene el color según el promedio académico
 * Usa configuración dinámica del store SSOT según el nivel del estudiante
 * @param {number} average - Promedio del estudiante
 * @param {number} levelId - ID del nivel educativo (opcional, para config dinámica)
 * @returns {string} Clase de color de Tailwind
 */
export const getAverageColor = (average, levelId = null) => {
  if (average === null || average === undefined) return 'text-gray-400'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(average, levelId)

  // Mapear color hex a clase Tailwind
  const colorMap = {
    '#22c55e': 'text-green-600',
    '#3b82f6': 'text-blue-600',
    '#eab308': 'text-yellow-600',
    '#ef4444': 'text-red-600',
    '#9ca3af': 'text-gray-400'
  }

  return colorMap[hexColor] || 'text-gray-400'
}

/**
 * Obtiene el estado académico textual
 */
export const getAcademicStatusText = (status) => {
  const statusMap = {
    excellent: 'Excelente',
    good: 'Bueno',
    regular: 'Regular'
  }
  return statusMap[status] || 'Regular'
}

/**
 * Obtiene el color del estado académico
 */
export const getAcademicStatusColor = (status) => {
  const colorMap = {
    excellent: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    regular: 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-red-100 text-red-800'
}

/**
 * Verifica si hay comunicaciones de alta prioridad sin leer
 */
export const hasHighPriorityUnread = (userCommunications) => {
  return userCommunications.filter(comm =>
    comm.prioridad === 'alta' && !comm.isRead
  ).length > 0
}
