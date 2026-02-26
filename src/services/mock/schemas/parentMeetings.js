/**
 * Utilidades para procesamiento de reuniones de padres
 * Funciones para calcular resúmenes de asistencia a reuniones
 */

/**
 * Obtener resumen de asistencia a reuniones de padres para un estudiante
 * @param {Array} meetings - Reuniones programadas
 * @param {Array} attendances - Registros de asistencia a reuniones
 * @param {string} studentId - ID del estudiante
 * @param {string|number} year - Año académico
 * @returns {Object} Resumen de asistencia a reuniones
 */
export const getAttendanceSummaryForStudent = (meetings, attendances, studentId, year) => {
  if (!meetings || !Array.isArray(meetings) || !attendances || !Array.isArray(attendances)) {
    return {
      total: 0,
      attended: 0,
      missed: 0,
      percentage: 0,
      formato: '-'
    }
  }

  // Filtrar reuniones del año académico
  const yearMeetings = meetings.filter(meeting => {
    const meetingYear = meeting.academic_year || meeting.academicYear || meeting.año_academico
    return meetingYear?.toString() === year?.toString()
  })

  if (yearMeetings.length === 0) {
    return {
      total: 0,
      attended: 0,
      missed: 0,
      percentage: 0,
      formato: '-'
    }
  }

  // Contar asistencias del estudiante
  let attended = 0
  yearMeetings.forEach(meeting => {
    const meetingId = meeting.id
    const attendance = attendances.find(att => {
      const attMeetingId = att.meeting_id || att.meetingId || att.reunion_id
      const attStudentId = att.student_id || att.studentId
      return attMeetingId === meetingId && attStudentId === studentId
    })

    if (attendance && (attendance.attended || attendance.asistio)) {
      attended++
    }
  })

  const total = yearMeetings.length
  const missed = total - attended
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0

  // Formato para mostrar (ej: "3/4")
  const formato = `${attended}/${total}`

  return {
    total,
    attended,
    missed,
    percentage,
    formato
  }
}

/**
 * Verificar si un padre asistió a una reunión específica
 * @param {Array} attendances - Registros de asistencia
 * @param {string} meetingId - ID de la reunión
 * @param {string} studentId - ID del estudiante
 * @returns {boolean} true si asistió
 */
export const didAttendMeeting = (attendances, meetingId, studentId) => {
  if (!attendances || !Array.isArray(attendances)) return false

  const attendance = attendances.find(att => {
    const attMeetingId = att.meeting_id || att.meetingId || att.reunion_id
    const attStudentId = att.student_id || att.studentId
    return attMeetingId === meetingId && attStudentId === studentId
  })

  return attendance && (attendance.attended || attendance.asistio)
}

/**
 * Obtener reuniones pendientes para un estudiante
 * @param {Array} meetings - Reuniones programadas
 * @param {Array} attendances - Registros de asistencia
 * @param {string} studentId - ID del estudiante
 * @returns {Array} Reuniones pendientes
 */
export const getPendingMeetings = (meetings, attendances, studentId) => {
  if (!meetings || !Array.isArray(meetings)) return []

  const now = new Date()

  return meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date || meeting.fecha)
    const isPast = meetingDate < now

    // Solo considerar reuniones pasadas que no fueron atendidas
    if (!isPast) return false

    const attendance = attendances.find(att => {
      const attMeetingId = att.meeting_id || att.meetingId || att.reunion_id
      const attStudentId = att.student_id || att.studentId
      return attMeetingId === meeting.id && attStudentId === studentId
    })

    return !attendance || !(attendance.attended || attendance.asistio)
  })
}

/**
 * Calcular porcentaje de asistencia a reuniones
 * @param {number} attended - Reuniones asistidas
 * @param {number} total - Total de reuniones
 * @returns {number} Porcentaje de asistencia
 */
export const calculateMeetingAttendancePercentage = (attended, total) => {
  if (!total || total === 0) return 0
  return Math.round((attended / total) * 100)
}

/**
 * Obtener estado de asistencia a reuniones
 * @param {number} percentage - Porcentaje de asistencia
 * @returns {Object} Estado con label y color
 */
export const getMeetingAttendanceStatus = (percentage) => {
  if (percentage >= 80) {
    return { label: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50' }
  } else if (percentage >= 60) {
    return { label: 'Buena', color: 'text-blue-600', bgColor: 'bg-blue-50' }
  } else if (percentage >= 40) {
    return { label: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
  } else {
    return { label: 'Baja', color: 'text-red-600', bgColor: 'bg-red-50' }
  }
}

/**
 * Validar datos de reunión de padres
 * @param {Object} meeting - Datos de la reunión
 * @returns {Object} { valid: boolean, errors: Array }
 */
export const validateParentMeeting = (meeting) => {
  const errors = []

  if (!meeting) {
    errors.push('Los datos de la reunión son requeridos')
    return { valid: false, errors }
  }

  // Validar título
  if (!meeting.title && !meeting.titulo && !meeting.nombre) {
    errors.push('El título de la reunión es requerido')
  }

  // Validar fecha
  if (!meeting.date && !meeting.fecha) {
    errors.push('La fecha de la reunión es requerida')
  } else {
    const meetingDate = new Date(meeting.date || meeting.fecha)
    if (isNaN(meetingDate.getTime())) {
      errors.push('La fecha de la reunión no es válida')
    }
  }

  // Validar hora
  if (!meeting.time && !meeting.hora) {
    errors.push('La hora de la reunión es requerida')
  }

  // Validar ubicación
  if (!meeting.location && !meeting.ubicacion && !meeting.lugar) {
    errors.push('La ubicación de la reunión es requerida')
  }

  // Validar año académico
  if (!meeting.academic_year && !meeting.academicYear && !meeting.año_academico) {
    errors.push('El año académico es requerido')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Obtener reuniones para un padre específico
 * @param {Array} meetings - Todas las reuniones
 * @param {string} parentId - ID del padre
 * @param {string|number} year - Año académico (opcional)
 * @returns {Array} Reuniones del padre
 */
export const getMeetingsForParent = (meetings, parentId, year = null) => {
  if (!meetings || !Array.isArray(meetings)) {
    return []
  }

  return meetings.filter(meeting => {
    // Filtrar por año si se especifica
    if (year) {
      const meetingYear = meeting.academic_year || meeting.academicYear || meeting.año_academico
      if (meetingYear?.toString() !== year?.toString()) {
        return false
      }
    }

    // Si la reunión tiene una lista específica de padres, verificar si está incluido
    const targetParents = meeting.parent_ids || meeting.parentIds || meeting.padres || []
    if (targetParents.length > 0) {
      return targetParents.includes(parentId)
    }

    // Si no hay lista específica, asumir que es para todos los padres
    return true
  })
}

/**
 * Obtener resumen de asistencia para un padre
 * @param {Array} meetings - Reuniones
 * @param {Array} attendances - Registros de asistencia
 * @param {string} parentId - ID del padre
 * @param {string|number} year - Año académico (opcional)
 * @returns {Object} Resumen de asistencia del padre
 */
export const getAttendanceSummaryForParent = (meetings, attendances, parentId, year = null) => {
  if (!meetings || !Array.isArray(meetings) || !attendances || !Array.isArray(attendances)) {
    return {
      total: 0,
      attended: 0,
      missed: 0,
      percentage: 0,
      upcoming: 0
    }
  }

  // Obtener reuniones del padre
  const parentMeetings = getMeetingsForParent(meetings, parentId, year)

  if (parentMeetings.length === 0) {
    return {
      total: 0,
      attended: 0,
      missed: 0,
      percentage: 0,
      upcoming: 0
    }
  }

  const now = new Date()
  let attended = 0
  let upcoming = 0

  parentMeetings.forEach(meeting => {
    const meetingDate = new Date(meeting.date || meeting.fecha)
    const meetingId = meeting.id

    // Si es una reunión futura
    if (meetingDate > now) {
      upcoming++
      return
    }

    // Buscar registro de asistencia
    const attendance = attendances.find(att => {
      const attMeetingId = att.meeting_id || att.meetingId || att.reunion_id
      const attParentId = att.parent_id || att.parentId

      return attMeetingId === meetingId && attParentId === parentId
    })

    if (attendance && (attendance.attended || attendance.asistio)) {
      attended++
    }
  })

  const pastMeetings = parentMeetings.length - upcoming
  const missed = pastMeetings - attended
  const percentage = pastMeetings > 0 ? Math.round((attended / pastMeetings) * 100) : 0

  return {
    total: parentMeetings.length,
    attended,
    missed,
    percentage,
    upcoming
  }
}
