import { create } from 'zustand'
import { attendanceService } from '../services/attendanceService'
import { getTodayLima } from '../utils/dateUtils'

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
  getTodayAttendance: () => {
    const today = getTodayLima()
    return get().getRecordsByDate(today)
  },

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
      const dateA = new Date(a.date || a.fecha)
      const dateB = new Date(b.date || b.fecha)
      return dateB - dateA // Most recent first
    })
  },

  getMonthlyStats: (studentId, year, month) => {
    const { attendanceRecords } = get()

    // Filter records for the specified student, year, and month
    const monthlyRecords = attendanceRecords.filter(r => {
      const recordStudentId = r.student_id || r.estudiante_id
      if (recordStudentId !== studentId) return false

      const recordDate = new Date(r.date || r.fecha)
      return recordDate.getFullYear() === year && (recordDate.getMonth() + 1) === month
    })

    if (monthlyRecords.length === 0) {
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        justified: 0,
        presentPercentage: 0,
        latePercentage: 0,
        absentPercentage: 0
      }
    }

    const present = monthlyRecords.filter(r =>
      r.state === 'asistio' || r.state === 'presente' || r.status === 'asistio' || r.status === 'presente'
    ).length

    const late = monthlyRecords.filter(r =>
      r.state === 'tardanza' || r.state === 'tarde' || r.status === 'tardanza' || r.status === 'tarde'
    ).length

    const absent = monthlyRecords.filter(r =>
      r.state === 'falta' || r.state === 'ausente' || r.status === 'falta' || r.status === 'ausente'
    ).length

    const justified = monthlyRecords.filter(r => r.justified || r.justificado).length

    const total = monthlyRecords.length

    return {
      total,
      present,
      late,
      absent,
      justified,
      presentPercentage: total > 0 ? (present / total) * 100 : 0,
      latePercentage: total > 0 ? (late / total) * 100 : 0,
      absentPercentage: total > 0 ? (absent / total) * 100 : 0
    }
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
  },

  // Alias para compatibilidad con código existente
  scanQRCode: async (dni, userId, mode = 'auto') => {
    return get().scanDNI(dni, userId, mode)
  }
}))
