import { get, post, put, patch, del } from './api'

/**
 * Servicio para gestión de tareas del profesor
 */
export const teacherTasksService = {
  /**
   * Obtener todas las tareas del profesor autenticado
   */
  async getAll() {
    try {
      const response = await get('/teacher-tasks')
      return response.tasks || []
    } catch (error) {
      console.error('Error al obtener tareas:', error)
      throw error
    }
  },

  /**
   * Crear una nueva tarea
   */
  async create(description) {
    try {
      const response = await post('/teacher-tasks', { description })
      return response.task
    } catch (error) {
      console.error('Error al crear tarea:', error)
      throw error
    }
  },

  /**
   * Actualizar una tarea
   */
  async update(id, data) {
    try {
      const response = await put(`/teacher-tasks/${id}`, data)
      return response.task
    } catch (error) {
      console.error('Error al actualizar tarea:', error)
      throw error
    }
  },

  /**
   * Toggle completado de una tarea
   */
  async toggle(id) {
    try {
      const response = await patch(`/teacher-tasks/${id}/toggle`)
      return response.task
    } catch (error) {
      console.error('Error al toggle tarea:', error)
      throw error
    }
  },

  /**
   * Eliminar una tarea
   */
  async remove(id) {
    try {
      await del(`/teacher-tasks/${id}`)
      return true
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
      throw error
    }
  }
}

export default teacherTasksService
