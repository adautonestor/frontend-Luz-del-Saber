import { create } from 'zustand'
import { attendanceService } from '../services/attendanceService'
import studentsService from '../services/studentsService'
import { getTodayLima, parseDateOnly } from '../utils/dateUtils'

/**
 * Normaliza el estado de entrada de un registro a las categorías que usa la UI:
 * 'asistio' | 'tardanza' | 'falta' | 'blanco' | null
 * Contempla tanto los estados del QR (a_tiempo/presente) como los manuales.
 */
const normalizeEntryStatus = (entryStatus, entryTime) => {
  if (entryStatus === 'tardanza' || entryStatus === 'tarde') return 'tardanza'
  if (entryStatus === 'falta' || entryStatus === 'ausente') return 'falta'
  if (entryStatus === 'blanco') return 'blanco'
  if (entryStatus === 'asistio' || entryStatus === 'a_tiempo' || entryStatus === 'presente' || entryTime) return 'asistio'
  return null
}

/**
 * Mapea un registro del backend al formato enriquecido que consumen los
 * componentes del dashboard de asistencia (estadoEntrada, *Justificada, etc.).
 */
const mapAttendanceRecord = (r) => ({
  ...r,
  estadoEntrada: normalizeEntryStatus(r.entry_status1, r.entry_time1),
  horaEntrada: r.entry_time1,
  tardanzaJustificada: !!r.late_justified,
  faltaJustificada: !!r.absence_justified,
  justificacionTardanza: r.late_justification || '',
  justificacionFalta: r.absence_justification || '',
  fechaJustificacion: r.justification_date
})

/**
 * Attendance Store - Sistema de Control de Asistencia
 * Integrado con APIs reales del backend
 */
export const useAttendanceStore = create((set, get) => ({
  // State
  attendanceRecords: [],
  schedules: [],
  todaySummary: null,
  isLoading: false,
  error: null,

  // Actions
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      const [records, schedules] = await Promise.all([
        attendanceService.getAllRecords(),
        attendanceService.getAllSchedules()
      ])

      set({
        attendanceRecords: records || [],
        schedules: schedules || [],
        isLoading: false
      })
    } catch (error) {
      console.error('Error loading attendance data:', error)
      set({
        error: error.message || 'Error al cargar datos de asistencia',
        isLoading: false
      })
    }
  },

  // ==================== ATTENDANCE RECORDS ====================
  createAttendanceRecord: async (recordData) => {
    set({ isLoading: true, error: null })

    try {
      const newRecord = await attendanceService.createRecord(recordData)

      set(state => ({
        attendanceRecords: [...state.attendanceRecords, newRecord],
        isLoading: false
      }))

      return newRecord
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateAttendanceRecord: async (recordId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedRecord = await attendanceService.updateRecord(recordId, updates)

      set(state => ({
        attendanceRecords: state.attendanceRecords.map(r =>
          r.id === recordId ? updatedRecord : r
        ),
        isLoading: false
      }))

      return updatedRecord
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteAttendanceRecord: async (recordId) => {
    set({ isLoading: true, error: null })

    try {
      await attendanceService.removeRecord(recordId)

      set(state => ({
        attendanceRecords: state.attendanceRecords.filter(r => r.id !== recordId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  getRecordsByStudent: (studentId) => {
    const { attendanceRecords } = get()
    return attendanceRecords.filter(r => r.student_id === studentId || r.student_id === studentId)
  },

  getRecordsByDate: (date) => {
    const { attendanceRecords } = get()
    return attendanceRecords.filter(r => r.fecha === date || r.date === date)
  },

  // ==================== ATTENDANCE SCHEDULES ====================
  createAttendanceSchedule: async (scheduleData) => {
    set({ isLoading: true, error: null })

    try {
      const newSchedule = await attendanceService.createSchedule(scheduleData)

      set(state => ({
        schedules: [...state.schedules, newSchedule],
        isLoading: false
      }))

      return newSchedule
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateAttendanceSchedule: async (scheduleId, updates) => {
    set({ isLoading: true, error: null })

    try {
      const updatedSchedule = await attendanceService.updateSchedule(scheduleId, updates)

      set(state => ({
        schedules: state.schedules.map(s =>
          s.id === scheduleId ? updatedSchedule : s
        ),
        isLoading: false
      }))

      return updatedSchedule
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteAttendanceSchedule: async (scheduleId) => {
    set({ isLoading: true, error: null })

    try {
      await attendanceService.removeSchedule(scheduleId)

      set(state => ({
        schedules: state.schedules.filter(s => s.id !== scheduleId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  getScheduleByLevel: (level) => {
    const { schedules } = get()
    return schedules.find(s => s.nivel === level || s.level === level)
  },

  // ==================== UTILITY FUNCTIONS ====================
  getAttendanceStats: () => {
    const { attendanceRecords } = get()
    const total = attendanceRecords.length
    const present = attendanceRecords.filter(r => r.state === 'presente' || r.status === 'presente').length
    const late = attendanceRecords.filter(r => r.state === 'tarde' || r.status === 'tarde').length
    const absent = attendanceRecords.filter(r => r.state === 'ausente' || r.status === 'ausente').length

    return {
      total,
      present,
      late,
      absent,
      presentPercentage: total > 0 ? (present / total) * 100 : 0,
      latePercentage: total > 0 ? (late / total) * 100 : 0,
      absentPercentage: total > 0 ? (absent / total) * 100 : 0
    }
  },

  getStudentAttendance: (studentId) => {
    const { attendanceRecords } = get()
    return attendanceRecords.filter(r =>
      (r.student_id === studentId || r.estudiante_id === studentId)
    ).sort((a, b) => {
      // parseDateOnly evita el desfase UTC->Lima al ordenar por fecha civil.
      const dateA = parseDateOnly(a.date || a.fecha)
      const dateB = parseDateOnly(b.date || b.fecha)
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0) // Más reciente primero
    })
  },

  getMonthlyStats: (studentId, year, month) => {
    const { attendanceRecords } = get()

    // Filtrar registros del estudiante para el año y mes indicados.
    const monthlyRecords = attendanceRecords.filter(r => {
      const recordStudentId = r.student_id || r.estudiante_id
      if (recordStudentId !== studentId) return false

      const recordDate = parseDateOnly(r.date || r.fecha)
      if (!recordDate) return false
      return recordDate.getFullYear() === year && (recordDate.getMonth() + 1) === month
    })

    const statusOf = (r) =>
      r.estadoEntrada || normalizeEntryStatus(r.entry_status1, r.entry_time1)

    const asistio = monthlyRecords.filter(r => statusOf(r) === 'asistio').length
    const tardanzas = monthlyRecords.filter(r => statusOf(r) === 'tardanza').length
    const faltas = monthlyRecords.filter(r => statusOf(r) === 'falta').length
    const blanco = monthlyRecords.filter(r => statusOf(r) === 'blanco').length
    const total = monthlyRecords.length

    // Asistencia efectiva = asistió + tardanzas (igual asistieron).
    const efectivas = asistio + tardanzas
    const porcentajeAsistencia = total > 0 ? Math.round((efectivas / total) * 100) : 0

    return {
      total,
      asistio,
      tardanzas,
      faltas,
      blanco,
      porcentajeAsistencia,
      // Alias retrocompatibles
      present: asistio,
      late: tardanzas,
      absent: faltas
    }
  },

  // ==================== CONTROL DE ASISTENCIA (PANEL DOCENTE) ====================

  /**
   * Carga los registros de asistencia de una sección (todas las fechas) en el
   * estado del store y construye el objeto classData para una fecha concreta.
   * - classData alimenta la tabla de registro, la vista del día y las estadísticas.
   * - attendanceRecords queda poblado para que getMonthlyStats funcione.
   *
   * @param {number} gradeId
   * @param {number} sectionId
   * @param {string} date - 'YYYY-MM-DD'
   * @returns {Promise<Object>} classData
   */
  getClassAttendance: async (gradeId, sectionId, date) => {
    set({ isLoading: true, error: null })

    try {
      const [allStudents, allRecords] = await Promise.all([
        studentsService.getAll(),
        attendanceService.getAllRecords()
      ])

      const students = (allStudents || []).filter(
        s => s.grade_id === gradeId && s.section_id === sectionId
      )
      const studentIds = new Set(students.map(s => s.id))

      // Registros de la sección (todas las fechas) -> al estado para reportes mensuales.
      const sectionRecords = (allRecords || [])
        .filter(r => studentIds.has(r.student_id))
        .map(mapAttendanceRecord)

      set({ attendanceRecords: sectionRecords, isLoading: false })

      // Registros del día seleccionado.
      const dayRecords = sectionRecords.filter(r => (r.date || r.fecha) === date)

      const stats = {
        asistio: dayRecords.filter(r => r.estadoEntrada === 'asistio').length,
        tardanzas: dayRecords.filter(r => r.estadoEntrada === 'tardanza').length,
        faltas: dayRecords.filter(r => r.estadoEntrada === 'falta').length,
        blanco: dayRecords.filter(r => r.estadoEntrada === 'blanco').length
      }

      const recordedIds = new Set(dayRecords.map(r => r.student_id))
      const absentStudents = students.filter(s => !recordedIds.has(s.id))

      return {
        totalStudents: students.length,
        present: dayRecords.length, // estudiantes con algún registro ese día
        absent: stats.faltas,
        stats,
        records: dayRecords,
        absentStudents
      }
    } catch (error) {
      console.error('Error al cargar asistencia de la clase:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Registro/edición manual del estado de asistencia del día de un estudiante.
   * @param {number} studentId
   * @param {string} date - 'YYYY-MM-DD'
   * @param {string} estado - 'asistio' | 'tardanza' | 'falta' | 'blanco'
   * @param {number} userId
   * @param {number} [quarter] - bimestre
   */
  registerManualAttendance: async (studentId, date, estado, userId, quarter) => {
    const record = await attendanceService.registerManual({
      student_id: studentId,
      date,
      status: estado,
      quarter
    })
    return record
  },

  /**
   * Justifica una tardanza con un comentario.
   */
  justifyLateArrival: async (recordId, justification, userId) => {
    return await attendanceService.updateRecord(recordId, {
      late_justified: true,
      late_justification: justification
    })
  },

  /**
   * Justifica una falta (inasistencia) con un comentario adicional.
   */
  justifyAbsence: async (recordId, justification, userId) => {
    return await attendanceService.updateRecord(recordId, {
      absence_justified: true,
      absence_justification: justification
    })
  },

  /**
   * Quita la justificación de una tardanza o falta.
   * @param {number} recordId
   * @param {'tardanza'|'falta'} tipo
   */
  removeJustification: async (recordId, tipo) => {
    const updates = tipo === 'falta'
      ? { absence_justified: false }
      : { late_justified: false }
    return await attendanceService.updateRecord(recordId, updates)
  },

  clearError: () => {
    set({ error: null })
  },

  // ==================== ESCANEO DE DNI ====================

  /**
   * Escanear DNI (código de barras del DNI físico) y registrar asistencia
   * @param {string} dni - DNI escaneado del código de barras
   * @param {number} userId - ID del usuario que registra
   * @param {string} mode - 'auto' (automático), 'entrada' o 'salida'
   */
  scanDNI: async (dni, userId, mode = 'auto') => {
    set({ isLoading: true, error: null })

    try {
      const result = await attendanceService.smartScan(dni, mode)

      // Actualizar registros locales si es necesario
      if (result.record) {
        set(state => {
          const existingIndex = state.attendanceRecords.findIndex(
            r => r.id === result.record.id
          )

          if (existingIndex >= 0) {
            // Actualizar registro existente
            const newRecords = [...state.attendanceRecords]
            newRecords[existingIndex] = result.record
            return { attendanceRecords: newRecords, isLoading: false }
          } else {
            // Agregar nuevo registro
            return {
              attendanceRecords: [result.record, ...state.attendanceRecords],
              isLoading: false
            }
          }
        })
      } else {
        set({ isLoading: false })
      }

      return result
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Obtener resumen de asistencia del día
   */
  loadTodaySummary: async () => {
    set({ isLoading: true, error: null })

    try {
      const summary = await attendanceService.getTodaySummary()
      set({
        todaySummary: summary,
        attendanceRecords: summary.records || [],
        isLoading: false
      })
      return summary
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Obtener estadísticas del día (compatible con página actual)
   */
  getTodayAttendance: () => {
    const { todaySummary, attendanceRecords } = get()

    if (todaySummary) {
      return {
        totalStudents: todaySummary.totalRecords || 0,
        present: todaySummary.present || 0,
        absent: todaySummary.absent || 0,
        late: todaySummary.late || 0
      }
    }

    // Calcular desde registros locales
    const today = getTodayLima()
    const todayRecords = attendanceRecords.filter(r =>
      (r.date === today || r.fecha === today)
    )

    return {
      totalStudents: todayRecords.length,
      present: todayRecords.filter(r => r.entry_time1 || r.horaEntrada).length,
      absent: 0,
      late: todayRecords.filter(r =>
        r.entry_status1 === 'tardanza' || r.estadoEntrada === 'tardanza'
      ).length
    }
  }
}))
