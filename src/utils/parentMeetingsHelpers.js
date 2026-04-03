import { MEETING_STATUS } from '../config/parentMeetingsConstants'

/**
 * Utilidades para gestión de reuniones de padres
 * Helpers puros - los datos deben ser provistos por el llamador desde servicios/stores
 *
 * TODO: Crear parentMeetingsService.js para operaciones CRUD:
 * - getAll(), getById(), create(), update(), remove()
 * - getAttendances(), saveAttendance(), markAsCompleted()
 */

/**
 * Obtiene los estudiantes asociados a un padre
 * @param {string} parentId - ID del padre
 * @param {Array} students - Lista de estudiantes
 * @param {Array} relations - Relaciones padre-estudiante (desde parentStudentRelationsService)
 * @returns {string} Nombres de estudiantes separados por comas
 */
export const getParentStudents = (parentId, students, relations = []) => {
  const parentRelations = relations.filter(r => {
    const parent_id = r.parent_id || r.parent_id
    return padreId === parentId
  })
  return parentRelations.map(r => {
    const student_id = r.student_id || r.student_id
    const student = students.find(s => s.id === estudianteId)
    return student ? `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() + `, ${student.first_names || ''}${student.last_names ? ' ' + student.last_names : ''}` : ''
  }).filter(Boolean).join(', ')
}

/**
 * Obtiene el conteo de asistencia a una reunión
 * @param {string} meetingId - ID de la reunión
 * @param {Array} attendances - Lista de asistencias (desde parentMeetingsService)
 * @returns {number} Cantidad de asistentes
 */
export const getAttendanceCount = (meetingId, attendances = []) => {
  const meetingAttendances = attendances.filter(a => {
    const reunionId = a.reunion_id || a.reunionId
    const asistio = a.asistio || a.attended
    return reunionId === meetingId && asistio === true
  })
  return meetingAttendances.length
}

/**
 * Obtiene el texto de alcance de una reunión
 */
export const getMeetingScopeText = (meeting, grades, sections) => {
  if (meeting.alcance === 'todos') {
    return 'Todos los padres'
  }

  if (meeting.alcance === 'nivel') {
    return `Nivel: ${meeting.level_id}`
  }

  if (meeting.alcance === 'grado') {
    const grade = grades.find(g => g.id === meeting.grade_id)
    const section = meeting.section_id ? sections.find(s => s.id === meeting.section_id) : null
    return `${grade?.name || 'N/A'}${section ? ` - Sección ${section.name}` : ''}`
  }

  return 'N/A'
}

/**
 * Carga los datos de asistencia existentes para una reunión
 * @param {string} meetingId - ID de la reunión
 * @param {Array} parents - Lista de padres
 * @param {Array} attendances - Lista de asistencias (desde parentMeetingsService)
 * @returns {Object} Objeto con padreId como key y asistencia como valor
 */
export const loadExistingAttendance = (meetingId, parents, attendances = []) => {
  const meetingAttendances = attendances.filter(a => {
    const reunionId = a.reunion_id || a.reunionId
    return reunionId === meetingId
  })

  const attendanceObj = {}
  parents.forEach(parent => {
    const attendance = meetingAttendances.find(a => {
      const parent_id = a.parent_id || a.parent_id
      return padreId === parent.id
    })
    const asistio = attendance ? (attendance.asistio || attendance.attended) : false
    attendanceObj[parent.id] = asistio
  })

  return attendanceObj
}

/**
 * TODO: Las siguientes funciones deben ser reemplazadas por llamadas a parentMeetingsService:
 *
 * - saveAttendanceData() -> parentMeetingsService.saveAttendance(meetingId, attendanceData, userId)
 * - markMeetingAsCompleted() -> parentMeetingsService.markAsCompleted(meetingId)
 * - createMeeting() -> parentMeetingsService.create(meetingData)
 *
 * Los componentes que usen estas funciones deben ser actualizados para usar el servicio directamente.
 */

/**
 * Filtra reuniones por año escolar
 */
export const filterMeetingsByYear = (meetings, year) => {
  return meetings.filter(m => m.academic_year === year)
}

/**
 * Cuenta reuniones por estado
 */
export const countMeetingsByStatus = (meetings, status) => {
  return meetings.filter(m => m.state === status).length
}
