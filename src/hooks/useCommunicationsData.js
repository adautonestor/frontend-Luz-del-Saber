import { useState, useEffect } from 'react'
import { useCommunicationsStore } from '@/stores/communicationsStore'
import { useAcademicStore } from '@/stores/academicStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { usersService } from '@/services/usersService'

/**
 * Hook personalizado para cargar datos académicos necesarios en comunicaciones
 * Integrado con APIs reales del backend
 * @returns {Object} Datos y estado de carga
 */
export const useCommunicationsData = () => {
  const [loading, setLoading] = useState(true)
  const [availableUsers, setAvailableUsers] = useState([])
  const [areas, setAreas] = useState([])

  const communicationsStore = useCommunicationsStore()
  const academicStore = useAcademicStore()
  const coursesStore = useCoursesStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Initialize stores
      await Promise.all([
        communicationsStore.initialize(),
        academicStore.initialize(),
        coursesStore.initialize()
      ])

      // Cargar usuarios disponibles (profesores y padres, excluyendo estudiantes)
      try {
        const users = await usersService.getAll()
        const filteredUsers = (users || []).filter(user => {
          const rol = (user.rol || user.role || '').toLowerCase()
          const status = user.status
          // Excluir estudiantes, incluir activos
          return rol !== 'estudiante' && status === 'active'
        })
        setAvailableUsers(filteredUsers)
      } catch (error) {
        console.error('Error loading users:', error)
        setAvailableUsers([])
      }

      // Extraer áreas únicas de los cursos
      const allCourses = coursesStore.courses || []
      const uniqueAreas = [...new Set(allCourses.map(course => course.area).filter(Boolean))]
      setAreas(uniqueAreas)

    } catch (error) {
      console.error('Error loading communications data:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    availableUsers,
    levels: academicStore.levels || [],
    grades: academicStore.grades || [],
    sections: academicStore.sections || [],
    areas,
    loadData
  }
}
