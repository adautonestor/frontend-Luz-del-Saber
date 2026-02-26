import { create } from 'zustand'
import { schedulesService } from '../services/schedulesService'

/**
 * Schedule Store - Gestión de Horarios
 * Integrado con APIs reales del backend
 */
export const useScheduleStore = create((set, get) => ({
  // State
  schedules: [],
  teacherSchedules: {},
  loading: false,
  error: null,

  // ==================== INITIALIZE ====================
  initialize: async () => {
    set({ loading: true, error: null })

    try {
      // Cargar horarios desde API real
      const schedules = await schedulesService.getAll()

      // Organize schedules by teacher
      const teacherSchedules = {}
      schedules.forEach(schedule => {
        const teacherId = schedule.teacher_id
        if (!teacherSchedules[teacherId]) {
          teacherSchedules[teacherId] = []
        }
        teacherSchedules[teacherId].push(schedule)
      })

      set({
        schedules: schedules || [],
        teacherSchedules,
        loading: false
      })

      return schedules
    } catch (error) {
      console.error('Error loading schedules:', error)
      set({
        error: error.message || 'Error al cargar horarios',
        loading: false
      })
      throw error
    }
  },

  // ==================== CRUD OPERATIONS ====================
  createSchedule: async (scheduleData) => {
    set({ loading: true, error: null })

    try {
      const newSchedule = await schedulesService.create(scheduleData)

      set(state => {
        const teacherId = newSchedule.teacher_id
        const updatedTeacherSchedules = { ...state.teacherSchedules }

        if (!updatedTeacherSchedules[teacherId]) {
          updatedTeacherSchedules[teacherId] = []
        }
        updatedTeacherSchedules[teacherId].push(newSchedule)

        return {
          schedules: [...state.schedules, newSchedule],
          teacherSchedules: updatedTeacherSchedules,
          loading: false
        }
      })

      return newSchedule
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  updateSchedule: async (scheduleId, updates) => {
    set({ loading: true, error: null })

    try {
      const updatedSchedule = await schedulesService.update(scheduleId, updates)

      set(state => {
        const updatedSchedules = state.schedules.map(schedule =>
          schedule.id === scheduleId ? updatedSchedule : schedule
        )

        // Reorganize teacher schedules
        const teacherSchedules = {}
        updatedSchedules.forEach(schedule => {
          const teacherId = schedule.teacher_id
          if (!teacherSchedules[teacherId]) {
            teacherSchedules[teacherId] = []
          }
          teacherSchedules[teacherId].push(schedule)
        })

        return {
          schedules: updatedSchedules,
          teacherSchedules,
          loading: false
        }
      })

      return updatedSchedule
    } catch (error) {
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  deleteSchedule: async (scheduleId) => {
    set({ loading: true, error: null })

    try {
      await schedulesService.remove(scheduleId)

      set(state => {
        const updatedSchedules = state.schedules.filter(schedule => schedule.id !== scheduleId)

        // Reorganize teacher schedules
        const teacherSchedules = {}
        updatedSchedules.forEach(schedule => {
          const teacherId = schedule.teacher_id
          if (!teacherSchedules[teacherId]) {
            teacherSchedules[teacherId] = []
          }
          teacherSchedules[teacherId].push(schedule)
        })

        return {
          schedules: updatedSchedules,
          teacherSchedules,
          loading: false
        }
      })

      console.log('✅ Schedule deleted:', scheduleId)
      return true
    } catch (error) {
      console.error('❌ Error deleting schedule:', error)
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // ==================== IMAGE OPERATIONS ====================
  uploadScheduleImage: async (scheduleId, imageFile) => {
    set({ loading: true, error: null })

    try {
      const updatedSchedule = await schedulesService.uploadImage(scheduleId, imageFile)

      set(state => ({
        schedules: state.schedules.map(s =>
          s.id === scheduleId ? updatedSchedule : s
        ),
        loading: false
      }))

      console.log('✅ Schedule image uploaded:', scheduleId)
      return updatedSchedule
    } catch (error) {
      console.error('❌ Error uploading schedule image:', error)
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  removeScheduleImage: async (scheduleId) => {
    set({ loading: true, error: null })

    try {
      const updatedSchedule = await schedulesService.removeImage(scheduleId)

      set(state => ({
        schedules: state.schedules.map(s =>
          s.id === scheduleId ? updatedSchedule : s
        ),
        loading: false
      }))

      console.log('✅ Schedule image removed:', scheduleId)
      return updatedSchedule
    } catch (error) {
      console.error('❌ Error removing schedule image:', error)
      set({
        error: error.message,
        loading: false
      })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  // Get schedules for a specific teacher
  getTeacherSchedules: (teacherId) => {
    return get().teacherSchedules[teacherId] || []
  },

  // Get schedules for a specific grade/section
  getGradeSchedules: (gradeId, sectionId = null) => {
    const schedules = get().schedules
    return schedules.filter(schedule => {
      if (sectionId) {
        return schedule.grade_id === gradeId && schedule.section_id === sectionId
      }
      return schedule.grade_id === gradeId
    })
  },

  // Get schedule conflicts
  getScheduleConflicts: (scheduleData, excludeId = null) => {
    const schedules = get().schedules.filter(s => s.id !== excludeId)
    const teacher_id = scheduleData.teacher_id
    const day = scheduleData.day
    const classroom = scheduleData.classroom
    const start_time = scheduleData.start_time
    const end_time = scheduleData.end_time

    return schedules.filter(schedule => {
      // Check if same teacher has overlapping time on same day
      if (schedule.teacher_id === teacher_id && schedule.day === day) {
        return get().timeOverlaps(
          schedule.start_time, schedule.end_time,
          start_time, end_time
        )
      }

      // Check if same classroom has overlapping time on same day
      if (schedule.classroom === classroom && schedule.day === day && classroom) {
        return get().timeOverlaps(
          schedule.start_time, schedule.end_time,
          start_time, end_time
        )
      }

      return false
    })
  },

  // Helper function to check time overlaps
  timeOverlaps: (start1, end1, start2, end2) => {
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const start1Min = timeToMinutes(start1)
    const end1Min = timeToMinutes(end1)
    const start2Min = timeToMinutes(start2)
    const end2Min = timeToMinutes(end2)

    return start1Min < end2Min && start2Min < end1Min
  },

  // Get weekly schedule for a teacher (formatted for display)
  getTeacherWeeklySchedule: (teacherId) => {
    const teacherSchedules = get().getTeacherSchedules(teacherId)
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

    // Organize by days
    const weeklySchedule = weekDays.map((day, dayIndex) => {
      const daySchedules = teacherSchedules
        .filter(schedule => schedule.day === dayIndex)
        .sort((a, b) => {
          const timeA = a.start_time.split(':').map(Number)
          const timeB = b.start_time.split(':').map(Number)
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
        })

      return {
        day,
        dayIndex,
        schedules: daySchedules
      }
    })

    return weeklySchedule
  },

  // Get statistics
  getStatistics: () => {
    const schedules = get().schedules
    const teacherSchedules = get().teacherSchedules

    return {
      totalSchedules: schedules.length,
      activeTeachers: Object.keys(teacherSchedules).filter(teacherId =>
        teacherSchedules[teacherId].length > 0
      ).length,
      uniqueCourses: new Set(schedules.map(s => s.course_id).filter(Boolean)).size,
      uniqueClassrooms: new Set(schedules.map(s => s.classroom).filter(Boolean)).size,
      averageSchedulesPerTeacher: schedules.length > 0 ?
        (schedules.length / Object.keys(teacherSchedules).length).toFixed(1) : 0
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))
