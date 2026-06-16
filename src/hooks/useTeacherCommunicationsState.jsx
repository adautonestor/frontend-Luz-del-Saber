import { useState, useEffect } from 'react'
import { useCommunicationsStore } from '../stores/communicationsStore'
import { useAuthStore } from '../stores/authStore'
import { communicationsService } from '../services/communicationsService'
import studentsService from '../services/studentsService'
import {
  AlertCircle, Clock, CheckCircle, Bell,
  FileText, Users, Paperclip, MessageSquare
} from 'lucide-react'

/**
 * Hook para gestión de estado y lógica de negocio de comunicaciones del profesor
 * Maneja tabs, modales, notificaciones, CRUD de comunicaciones y filtros
 * Integrado con APIs reales del backend
 */
export const useTeacherCommunicationsState = () => {
  const { user } = useAuthStore()
  const {
    communications: storeCommunications,
    createCommunication,
    initialize
  } = useCommunicationsStore()

  // Estado de tabs y modales
  const [activeTab, setActiveTab] = useState('sent')
  const [showNewCommunication, setShowNewCommunication] = useState(false)
  const [selectedCommunication, setSelectedCommunication] = useState(null)

  // Estado de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')

  // Estado del zoom de imágenes
  const [imageZoom, setImageZoom] = useState(1)

  // Estado de notificaciones
  const [notification, setNotification] = useState(null)

  // Inicializar store de comunicaciones
  useEffect(() => {
    initialize()
  }, [initialize])

  // Calcular fecha de vencimiento por defecto (7 días desde la fecha especificada o desde hoy)
  const getDefaultExpirationDate = (baseDate = null) => {
    const date = baseDate ? new Date(baseDate) : new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }

  // Estado del formulario de nuevo comunicado
  const [newCommunication, setNewCommunication] = useState({
    title: '',
    content: '',
    recipients: 'all',
    priority: 'medium',
    type: 'general',
    attachments: [],
    expirationDate: getDefaultExpirationDate()
  })

  // Estudiantes reales desde backend
  const [mockStudents, setMockStudents] = useState([])

  // Cargar estudiantes del docente al montar
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const filters = user?.id ? { teacher_id: user.id } : {}
        const students = await studentsService.getAll(filters)
        setMockStudents(students || [])
      } catch (error) {
        console.error('Error loading students:', error)
        setMockStudents([])
      }
    }
    loadStudents()
  }, [user?.id])

  // Opciones de destinatarios (count dinámico desde estudiantes cargados)
  const recipients = [
    { id: 'all', name: 'Todos los Padres', count: mockStudents.length },
    { id: 'custom', name: 'Selección personalizada', count: mockStudents.length }
  ]

  // Estado de selección de estudiantes
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showStudentSelector, setShowStudentSelector] = useState(false)

  // Estado del modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [communicationToDelete, setCommunicationToDelete] = useState(null)

  // Filtrar comunicaciones según destinatarios y rol del profesor
  const userRole = user?.rol || user?.role || 'Profesor'

  const communications = storeCommunications.filter(comm => {
    const dest = comm.destinatarios || {}
    const destType = dest.type || ''
    const destValores = dest.valores || []
    const rolLower = userRole.toLowerCase()
    const estado = comm.state || comm.status || ''

    // =========================================================
    // IMPORTANTE: Comunicados programados NO son visibles
    // Solo se muestran cuando el estado es 'sent' o 'enviado'
    // =========================================================
    if (estado === 'scheduled' || estado === 'programado') {
      return false
    }

    // Solo mostrar comunicados enviados
    if (estado !== 'sent' && estado !== 'enviado') {
      return false
    }

    // Si el comunicado fue creado por este docente, siempre mostrarlo
    const senderId = comm.sender || comm.remitenteId || comm.remitente || comm.sender_id || comm.created_by
    if (senderId != null && user?.id != null &&
        (senderId == user.id || String(senderId) === String(user.id))) {
      return true
    }

    // Si es para "todos", el profesor lo ve
    if (destType === 'todos') return true

    // Si es para "profesores_y_padres", el profesor lo ve
    if (destType === 'profesores_y_padres') return true

    // Si es para "profesores", el profesor lo ve
    if (destType === 'profesores' || destType === 'docentes') return true

    // Si es para "padres" SOLAMENTE, el profesor NO lo ve
    if (destType === 'padres') return false

    // Si es "especifico", verificar si el ID del usuario está en valores
    if (destType === 'especifico') {
      return destValores.includes(user?.id) || destValores.includes(String(user?.id)) || destValores.includes(Number(user?.id))
    }

    // Por defecto, no mostrar
    return false
  })

  // Función para ordenamiento de comunicaciones
  const sortLocalCommunications = (comms) => {
    return [...comms].sort((a, b) => {
      // 1. Ordenar por fecha (más recientes primero)
      const dateA = a.sentDate ? new Date(a.sentDate) : new Date(0)
      const dateB = b.sentDate ? new Date(b.sentDate) : new Date(0)

      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime()
      }

      // 2. Si misma fecha, ordenar por prioridad (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[a.priority] || 0
      const priorityB = priorityOrder[b.priority] || 0

      return priorityB - priorityA
    })
  }

  // Comunicaciones filtradas y ordenadas
  const filteredCommunications = sortLocalCommunications(
    communications.filter(comm => {
      const title = comm.titulo || ''
      const content = comm.contenido || ''
      const priority = comm.prioridad || ''
      const status = comm.state || ''

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.toLowerCase().includes(searchTerm.toLowerCase())

      // Map priority values for filter
      const priorityMap = { 'alta': 'high', 'media': 'medium', 'baja': 'low' }
      const mappedPriority = priorityMap[priority] || priority

      const matchesFilter = filterPriority === 'all' || mappedPriority === filterPriority || priority === filterPriority

      // Aceptar tanto 'sent' como 'enviado' para el estado
      const matchesTab = activeTab === 'sent' && (status === 'enviado' || status === 'sent')

      return matchesSearch && matchesFilter && matchesTab
    })
  )

  // ========== Handlers de comunicaciones ==========

  // ========== Verificación de propiedad de comunicados ==========

  /**
   * Verifica si el comunicado fue creado por el usuario actual
   * Solo los comunicados propios pueden ser editados/eliminados
   */
  const isOwnCommunication = (communication) => {
    if (!communication || !user) return false

    // El campo sender/remitenteId contiene el ID del usuario que creó el comunicado
    const senderId = communication.sender || communication.remitenteId || communication.remitente || communication.sender_id || communication.created_by
    const userId = user.id

    // Comparar como string y número para mayor compatibilidad
    return senderId == userId ||
           String(senderId) === String(userId) ||
           Number(senderId) === Number(userId)
  }

  const handleViewCommunication = (communication) => {
    setSelectedCommunication(communication)
  }

  const handleEditCommunication = async (communication) => {
    // Solo permitir editar comunicados propios
    if (!isOwnCommunication(communication)) {
      showNotification('Solo puedes editar tus propios comunicados', 'error')
      return
    }
    // Map schema values back to form values
    const typeMap = {
      'general': 'general',
      'informativo': 'academic',
      'urgente': 'urgent'
    }

    const priorityMap = {
      'alta': 'high',
      'media': 'medium',
      'baja': 'low'
    }

    // Convert adjuntos back to attachments format
    const attachments = (communication.adjuntos || []).map(adj => ({
      name: adj.name,
      data: adj.url,
      type: adj.type,
      size: adj.tamaño
    }))

    const isCustomRecipients = communication.destinatarios?.type === 'estudiantes' || communication.destinatarios?.type === 'especifico'

    setNewCommunication({
      title: communication.titulo || '',
      content: communication.contenido || '',
      recipients: isCustomRecipients ? 'custom' : 'all',
      priority: priorityMap[communication.prioridad] || 'medium',
      type: typeMap[communication.type] || 'general',
      attachments: attachments,
      expirationDate: communication.due_date || getDefaultExpirationDate()
    })

    // If custom recipients, set selected students
    if (isCustomRecipients && communication.destinatarios?.valores) {
      setSelectedStudents(communication.destinatarios.valores)
      setShowStudentSelector(true)
    }

    setShowNewCommunication(true)
  }

  const handleDeleteCommunication = (communication) => {
    // Solo permitir eliminar comunicados propios
    if (!isOwnCommunication(communication)) {
      showNotification('Solo puedes eliminar tus propios comunicados', 'error')
      return
    }
    setCommunicationToDelete(communication)
    setShowDeleteModal(true)
  }

  const confirmDeleteCommunication = async (communication) => {
    try {
      await communicationsService.remove(communication.id)

      // Reload from store
      await initialize()

      showNotification('Comunicado eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error eliminando comunicado:', error)
      showNotification('Error al eliminar el comunicado: ' + error.message, 'error')
    }
  }

  const handleSendCommunication = async () => {
    if (newCommunication.title.trim() && newCommunication.content.trim()) {
      try {
        // Map form type to schema type
        const tipoMap = {
          'general': 'general',
          'academic': 'informativo',
          'meeting': 'informativo',
          'materials': 'informativo',
          'urgent': 'urgente',
          'announcement': 'general'
        }

        // Map form priority to schema priority
        const prioridadMap = {
          'high': 'alta',
          'medium': 'media',
          'low': 'baja'
        }

        // Prepare destinatarios object based on selected recipients
        let destinatarios = {}

        if (newCommunication.recipients === 'custom' && selectedStudents.length > 0) {
          destinatarios = {
            type: 'estudiantes',
            valores: selectedStudents // Array of student IDs (backend resolves to parent user_ids)
          }
        } else {
          // For now, send to all parents
          destinatarios = {
            type: 'todos',
            valores: []
          }
        }

        // Prepare attachments in the correct format (incluir file para Wasabi)
        const adjuntos = newCommunication.attachments.map(att => ({
          id: `att-${Date.now()}-${Math.random()}`,
          name: att.name,
          url: att.data || att.url,
          type: att.type,
          tamaño: att.size,
          file: att.file, // Archivo original para subir a Wasabi
          fechaSubida: new Date().toISOString()
        }))

        // Prepare communication data in the format expected by the store
        const communicationData = {
          titulo: newCommunication.title,
          contenido: newCommunication.content,
          type: tipoMap[newCommunication.type] || 'general',
          remitente: user?.id || 'teacher-1', // Use current user ID
          destinatarios: destinatarios,
          prioridad: prioridadMap[newCommunication.priority] || 'media',
          due_date: newCommunication.expirationDate || getDefaultExpirationDate(),
          requiereConfirmacion: false,
          adjuntos: adjuntos
        }

        // Create communication using the store
        await createCommunication(communicationData)

        // Reset form and close modal
        setShowNewCommunication(false)
        setNewCommunication({
          title: '',
          content: '',
          recipients: 'all',
          priority: 'medium',
          type: 'general',
          attachments: [],
          expirationDate: getDefaultExpirationDate()
        })
        setSelectedStudents([])
        setShowStudentSelector(false)

        // Show success notification
        showNotification('Comunicado enviado exitosamente', 'success')

        // Reload communications from store
        await initialize()
      } catch (error) {
        console.error('Error enviando comunicado:', error)
        showNotification('Error al enviar el comunicado', 'error')
      }
    }
  }

  // ========== Notificaciones ==========

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // ========== Handlers de destinatarios ==========

  const handleRecipientTypeChange = (recipientType) => {
    setNewCommunication({...newCommunication, recipients: recipientType})

    if (recipientType === 'custom') {
      setShowStudentSelector(true)
    } else {
      setShowStudentSelector(false)
      setSelectedStudents([])
    }
  }

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const selectAllFromGrade = (grado, seccion = null) => {
    if (grado === null) {
      setSelectedStudents([])
      return
    }
    const studentsToSelect = mockStudents
      .filter(s => {
        const studentGrado = s.grado || s.grade_name
        const studentSeccion = s.seccion || s.section_name
        return studentGrado === grado && (seccion === null || studentSeccion === seccion)
      })
      .map(s => s.id)
    setSelectedStudents(prev => [...new Set([...prev, ...studentsToSelect])])
  }

  // ========== Helpers para formato ==========

  const getPriorityColor = (priority) => {
    // Map both Spanish and English priority values
    const normalizedPriority = {
      'alta': 'high',
      'media': 'medium',
      'baja': 'low',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    }[priority] || priority

    switch (normalizedPriority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority) => {
    // Map both Spanish and English priority values
    const normalizedPriority = {
      'alta': 'high',
      'media': 'medium',
      'baja': 'low',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    }[priority] || priority

    switch (normalizedPriority) {
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'low': return <CheckCircle className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type) => {
    // Map both Spanish and English type values
    const normalizedType = {
      'general': 'general',
      'informativo': 'academic',
      'urgente': 'urgent',
      'academic': 'academic',
      'meeting': 'meeting',
      'materials': 'materials'
    }[type] || type

    switch (normalizedType) {
      case 'academic': return <FileText className="w-4 h-4" />
      case 'meeting': return <Users className="w-4 h-4" />
      case 'materials': return <Paperclip className="w-4 h-4" />
      case 'urgent': return <AlertCircle className="w-4 h-4" />
      case 'general': return <MessageSquare className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ========== Handlers de zoom de imagen ==========

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleZoomReset = () => {
    setImageZoom(1)
  }

  return {
    // Estado
    activeTab,
    showNewCommunication,
    selectedCommunication,
    searchTerm,
    filterPriority,
    imageZoom,
    notification,
    newCommunication,
    selectedStudents,
    showStudentSelector,
    communications,
    filteredCommunications,
    recipients,
    mockStudents,
    showDeleteModal,
    communicationToDelete,

    // Setters
    setActiveTab,
    setShowNewCommunication,
    setSelectedCommunication,
    setSearchTerm,
    setFilterPriority,
    setImageZoom,
    setNewCommunication,
    setShowDeleteModal,
    setCommunicationToDelete,

    // Handlers de comunicaciones
    handleViewCommunication,
    handleEditCommunication,
    handleDeleteCommunication,
    confirmDeleteCommunication,
    handleSendCommunication,
    isOwnCommunication,

    // Handlers de destinatarios
    handleRecipientTypeChange,
    toggleStudentSelection,
    selectAllFromGrade,

    // Handlers de zoom
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,

    // Helpers
    getPriorityColor,
    getPriorityIcon,
    getTypeIcon,
    formatDate,
    showNotification,
    getDefaultExpirationDate
  }
}
