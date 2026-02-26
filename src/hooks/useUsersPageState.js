import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useModal } from './useModal'
import { usersService } from '../services/usersService'
import { rolesService } from '../services/rolesService'

export const useUsersPageState = () => {
  // Hooks externos primero (orden consistente)
  const { user: currentUser } = useAuthStore()

  // Estados locales
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_names: '',
    document_type: 'DNI',
    dni: '',
    email: '',
    password: '',
    rol: 'profesor',
    phone: '',
    address: '',
    status: 'active',
    relationship: ''
  })

  // Refs
  const isSubmittingRef = useRef(false)
  const lastSubmitTime = useRef(0)

  // Modal hook (después de todos los useState y useRef)
  const { alertModal, showAlert, closeAlert, confirmModal, showConfirm, closeConfirm, handleConfirm } = useModal()

  // Effects
  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await usersService.getAll()
      setUsers(allUsers || [])
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const allRoles = await rolesService.getAll()
      setRoles(allRoles || [])
    } catch (error) {
      console.error('Error loading roles:', error)
      setRoles([])
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.last_names && user.last_names.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Role filter
    if (roleFilter !== 'todos') {
      filtered = filtered.filter(user => user.rol === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleSubmit = async (e) => {
    console.log('🚨 handleSubmit LLAMADO - Timestamp:', Date.now())
    e.preventDefault()

    // Prevenir múltiples envíos
    const now = Date.now()
    if (now - lastSubmitTime.current < 500) {
      console.log('⚠️ Envío bloqueado - throttle')
      return
    }

    if (isSubmitting || isSubmittingRef.current) {
      console.log('⚠️ Envío bloqueado - ya en proceso')
      return
    }

    console.log('✅ Iniciando envío - DNI:', formData.dni)
    lastSubmitTime.current = now
    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      // Validar documento
      if (!formData.dni) {
        showAlert('Debe ingresar un número de documento de identidad.', 'error', 'Campo Requerido')
        isSubmittingRef.current = false
        setIsSubmitting(false)
        return
      }

      // Validar según tipo de documento
      if (formData.rol === 'padre' && formData.document_type === 'CE') {
        if (formData.dni.length < 9 || formData.dni.length > 12) {
          showAlert('El Carnet de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos.', 'error', 'Error de Validación')
          isSubmittingRef.current = false
          setIsSubmitting(false)
          return
        }
      } else {
        if (formData.dni.length !== 8) {
          showAlert('El DNI debe tener exactamente 8 dígitos.', 'error', 'Error de Validación')
          isSubmittingRef.current = false
          setIsSubmitting(false)
          return
        }
      }

      // Validar teléfono
      if (formData.phone && (formData.phone.length !== 9 || !formData.phone.startsWith('9'))) {
        showAlert('El teléfono debe iniciar con 9 y tener exactamente 9 dígitos.', 'error', 'Error de Validación')
        isSubmittingRef.current = false
        setIsSubmitting(false)
        return
      }

      // Mapeo de roles string a role_id (números) - CORREGIDO según DB real
      const roleToIdMap = {
        'director': 1,
        'profesor': 2,
        'padre': 3,
        'secretaria': 4
      }

      const userEmail = formData.email || `${formData.first_name.toLowerCase().replace(/\s+/g, '.')}@luzdelsaber.edu.pe`

      if (editingUser) {
        // Update existing user
        const updateData = {
          first_name: formData.first_name,
          last_names: formData.last_names,
          document_type: formData.document_type,
          dni: formData.dni,
          email: userEmail,
          role_id: roleToIdMap[formData.rol],
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
          relationship: formData.relationship
        }

        // Solo incluir password si fue proporcionada
        if (formData.password.trim()) {
          updateData.password = formData.password
        }

        const updatedUser = await usersService.update(editingUser.id, updateData)
        setUsers(currentUsers =>
          currentUsers.map(user =>
            user.id === editingUser.id ? updatedUser : user
          )
        )
      } else {
        // Verificar duplicado
        const allUsers = await usersService.getAll()
        const existingUserWithDni = allUsers.find(u => u.dni === formData.dni)

        if (existingUserWithDni) {
          const docType = formData.rol === 'padre' && formData.document_type === 'CE' ? 'Carnet de Extranjería' : 'DNI'
          showAlert(`Ya existe un usuario con el ${docType}: ${formData.dni}`, 'warning', 'Usuario Duplicado')
          isSubmittingRef.current = false
          setIsSubmitting(false)
          return
        }

        console.log('📝 Creando nuevo usuario con DNI:', formData.dni)

        const newUser = {
          first_name: formData.first_name,
          last_names: formData.last_names,
          document_type: formData.document_type,
          dni: formData.dni,
          email: userEmail,
          password: formData.dni,
          role_id: roleToIdMap[formData.rol],
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
          relationship: formData.relationship
        }

        const createdUser = await usersService.create(newUser)
        console.log('✅ Usuario creado con ID:', createdUser.id)

        // Recargar lista completa de usuarios
        const updatedUsers = await usersService.getAll()
        setUsers(updatedUsers)
      }

      console.log('✅ Usuario guardado exitosamente')

      // Mostrar animación de éxito
      setSuccessMessage(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
      setShowSuccessAnimation(true)

      // Esperar 2 segundos para mostrar la animación, luego cerrar
      setTimeout(() => {
        setShowSuccessAnimation(false)
        handleCloseModal()
      }, 2000)
    } catch (error) {
      console.error('❌ Error saving user:', error)

      // Mostrar animación de error con el mensaje del backend
      const mensajeError = error.message || 'No se pudo guardar el usuario'
      setErrorMessage(mensajeError)
      setShowErrorAnimation(true)

      // Ocultar animación de error después de 3 segundos (más tiempo para leer mensajes largos)
      setTimeout(() => {
        setShowErrorAnimation(false)
      }, 3000)
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)

    // Mapeo de roles de la BD (con mayúscula) al formato del frontend (minúscula) - CORREGIDO
    const roleDbToFormMap = {
      'Director': 'director',
      'Profesor': 'profesor',
      'Padre': 'padre',
      'Secretaria': 'secretaria'
    }

    const newFormData = {
      first_name: user.first_name || '',
      last_names: user.last_names || '',
      document_type: user.document_type || 'DNI',
      dni: user.dni || '',
      email: user.email || '',
      password: '',
      rol: roleDbToFormMap[user.rol] || 'profesor',
      phone: user.phone || '',
      address: user.address || '',
      status: user.status || 'active',
      relationship: user.relationship || ''
    }
    setFormData(newFormData)
    setIsModalOpen(true)
  }

  const handleDelete = async (userId) => {
    showConfirm(
      '¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.',
      async () => {
        try {
          await usersService.remove(userId)
          setUsers(currentUsers => currentUsers.filter(user => user.id !== userId))
          showAlert('Usuario eliminado exitosamente', 'success')
        } catch (error) {
          console.error('Error deleting user:', error)
          const mensajeError = error.message || 'No se pudo eliminar el usuario'
          showAlert(mensajeError, 'error', 'No se puede eliminar')
        }
      },
      {
        title: 'Eliminar Usuario',
        confirmText: 'Eliminar',
        variant: 'danger'
      }
    )
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    isSubmittingRef.current = false
    setIsSubmitting(false)
    setShowSuccessAnimation(false)
    setShowErrorAnimation(false)
    setSuccessMessage('')
    setErrorMessage('')
    setFormData({
      first_name: '',
      last_names: '',
      document_type: 'DNI',
      dni: '',
      email: '',
      password: '',
      rol: 'profesor',
      phone: '',
      address: '',
      status: 'active',
      relationship: ''
    })
  }

  const togglePasswordVisibility = (userId) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const getRoleBadgeColor = (rol) => {
    switch(rol) {
      case 'Director': return 'bg-purple-100 text-purple-800'
      case 'Secretaria': return 'bg-pink-100 text-pink-800'
      case 'Profesor': return 'bg-blue-100 text-blue-800'
      case 'Padre': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return {
    // State
    users,
    filteredUsers,
    roles,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    loading,
    showPassword,
    isSubmitting,
    formData,
    setFormData,
    currentUser,

    // Animation states
    showSuccessAnimation,
    showErrorAnimation,
    successMessage,
    errorMessage,

    // Modals
    alertModal,
    closeAlert,
    confirmModal,
    closeConfirm,
    handleConfirm,

    // Functions
    loadUsers,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCloseModal,
    togglePasswordVisibility,
    getRoleBadgeColor,
    getStatusBadgeColor
  }
}
