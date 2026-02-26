import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { teacherTasksService } from '../services/teacherTasksService'

export const useTasksStore = create(
  devtools(
    (set, get) => ({
      teacherTasks: [],
      isLoading: false,
      error: null,

      // Cargar tareas desde el servidor
      loadTasks: async () => {
        set({ isLoading: true, error: null }, false, 'loadTasks/pending')
        try {
          const tasks = await teacherTasksService.getAll()
          set({ teacherTasks: tasks, isLoading: false }, false, 'loadTasks/fulfilled')
        } catch (error) {
          console.error('Error al cargar tareas:', error)
          set({ error: error.message, isLoading: false }, false, 'loadTasks/rejected')
        }
      },

      // Acciones
      setTeacherTasks: (tasks) => set(
        { teacherTasks: tasks },
        false,
        'setTeacherTasks'
      ),

      addTeacherTask: async (description) => {
        try {
          const newTask = await teacherTasksService.create(description)
          set(
            (state) => ({
              teacherTasks: [newTask, ...state.teacherTasks]
            }),
            false,
            'addTeacherTask'
          )
          return newTask
        } catch (error) {
          console.error('Error al agregar tarea:', error)
          throw error
        }
      },

      updateTeacherTask: async (taskId, updates) => {
        try {
          const updatedTask = await teacherTasksService.update(taskId, updates)
          set(
            (state) => ({
              teacherTasks: state.teacherTasks.map(task =>
                task.id === taskId ? updatedTask : task
              )
            }),
            false,
            'updateTeacherTask'
          )
          return updatedTask
        } catch (error) {
          console.error('Error al actualizar tarea:', error)
          throw error
        }
      },

      deleteTeacherTask: async (taskId) => {
        try {
          await teacherTasksService.remove(taskId)
          set(
            (state) => ({
              teacherTasks: state.teacherTasks.filter(task => task.id !== taskId)
            }),
            false,
            'deleteTeacherTask'
          )
        } catch (error) {
          console.error('Error al eliminar tarea:', error)
          throw error
        }
      },

      toggleTaskCompleted: async (taskId) => {
        try {
          const updatedTask = await teacherTasksService.toggle(taskId)
          set(
            (state) => ({
              teacherTasks: state.teacherTasks.map(task =>
                task.id === taskId ? updatedTask : task
              )
            }),
            false,
            'toggleTaskCompleted'
          )
          return updatedTask
        } catch (error) {
          console.error('Error al toggle tarea:', error)
          throw error
        }
      },

      // Getters
      getPendingTasks: () => {
        const { teacherTasks } = get()
        return teacherTasks.filter(task => !task.completed)
      }
    }),
    {
      name: 'tasks-store',
    }
  )
)