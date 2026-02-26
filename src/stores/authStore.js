import { create } from 'zustand'
import { authService } from '../services/authService'

// Authentication Store
export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials) => {
    set({ isLoading: true, error: null })

    try {
      const { email, password } = credentials

      // Llamar a la API real de login
      const { token, user } = await authService.login({ email, password })

      // Guardar el token en localStorage
      localStorage.setItem('authToken', token)

      // Mapear los datos del usuario del backend al formato del frontend
      // Mantener el rol con la capitalización correcta de la base de datos
      let rolNormalizado = user.rol || ''

      // Mapear roles del backend al formato esperado por el frontend (corregido según DB real)
      const rolesMap = {
        'Director': 'Director',
        'Profesor': 'Profesor',
        'Padre': 'Padre',
        'Secretaria': 'Secretaria',
        // Compatibilidad con versiones antiguas en minúsculas
        'director': 'Director',
        'profesor': 'Profesor',
        'padre': 'Padre',
        'secretaria': 'Secretaria'
      }

      rolNormalizado = rolesMap[rolNormalizado] || rolNormalizado

      const userData = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_names: user.last_names,
        dni: user.dni,
        document_type: user.document_type,
        rol: rolNormalizado, // Rol normalizado a minúsculas
        role_id: user.role_id,
        relationship: user.relationship,
        phone: user.phone,
        address: user.address,
        status: user.status,
        specialty: user.specialty,
        level: user.level,
        entry_date: user.entry_date,
        last_login: user.last_login,
        permisos: user.permisos || []
      }

      // Update store
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false
      })

    } catch (error) {
      console.error('❌ Login failed:', error.message)
      set({
        error: error.message,
        isLoading: false,
        user: null,
        isAuthenticated: false
      })
      throw error
    }
  },
  
  logout: async () => {
    set({ isLoading: true })

    try {
      // Llamar al servicio de logout
      await authService.logout()

      // Limpiar estado
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error('❌ Logout error:', error.message)
      // Still clear state even if there's an error
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      })
    }
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('authToken')

    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      // Verificar el token con el backend y obtener datos del usuario
      const user = await authService.verifyToken()

      // Mapear el rol del usuario (igual que en login) - CORREGIDO
      let rolNormalizado = user.rol || ''

      const rolesMap = {
        'Director': 'Director',
        'Profesor': 'Profesor',
        'Padre': 'Padre',
        'Secretaria': 'Secretaria',
        // Compatibilidad con versiones antiguas en minúsculas
        'director': 'Director',
        'profesor': 'Profesor',
        'padre': 'Padre',
        'secretaria': 'Secretaria'
      }

      rolNormalizado = rolesMap[rolNormalizado] || rolNormalizado

      const userData = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_names: user.last_names,
        dni: user.dni,
        document_type: user.document_type,
        rol: rolNormalizado,
        role_id: user.role_id,
        relationship: user.relationship,
        phone: user.phone,
        address: user.address,
        status: user.status,
        specialty: user.specialty,
        level: user.level,
        entry_date: user.entry_date,
        last_login: user.last_login,
        permisos: user.permisos || []
      }

      set({
        user: userData,
        isAuthenticated: true
      })

    } catch (error) {
      console.error('❌ Auth check failed:', error.message)
      localStorage.removeItem('authToken')
      set({ isAuthenticated: false, user: null })
    }
  },
  
  clearError: () => set({ error: null }),
  
  // Utility functions
  hasRole: (role) => {
    const { user } = get()
    return user?.rol === role
  },
  
  hasAnyRole: (roles) => {
    const { user } = get()
    return roles.includes(user?.rol)
  },
  
  isAdmin: () => {
    const { user } = get()
    return user?.rol === 'Director'
  },

  isTeacher: () => {
    const { user } = get()
    return user?.rol === 'Profesor'
  },

  isParent: () => {
    const { user } = get()
    return user?.rol === 'Padre'
  },

  isSecretary: () => {
    const { user } = get()
    return user?.rol === 'Secretaria'
  },

  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false

    // Secretary has specific permissions
    const permissions = {
      'manage_schedules': true, // Secretaria puede gestionar horarios
      'manage_grades': user.rol !== 'Secretaria',
      'manage_academic_structure': user.rol !== 'Secretaria',
      'view_schedules': true,
      'view_grades': true,
      'view_academic_structure': true
    }

    return permissions[permission] || false
  },

  canManageSchedules: () => {
    const { user } = get()
    // Secretaria y Director pueden gestionar horarios
    return user?.rol === 'Secretaria' || user?.rol === 'Director'
  },

  canManageGrades: () => {
    const { user } = get()
    return user?.rol !== 'Secretaria'
  },

  canManageAcademicStructure: () => {
    const { user } = get()
    return user?.rol !== 'Secretaria'
  },

  isReadOnlyMode: () => {
    const { user } = get()
    // Secretaria NO está en modo solo lectura para horarios
    // Solo tiene modo lectura para notas y estructura académica
    return false
  }
}))

// Auto refresh session every 5 minutes
setInterval(() => {
  if (useAuthStore.getState().isAuthenticated) {
    useAuthStore.getState().checkAuth()
  }
}, 5 * 60 * 1000)