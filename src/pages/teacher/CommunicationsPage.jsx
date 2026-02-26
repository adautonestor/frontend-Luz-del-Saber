import React from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import {
  useTeacherCommunicationsState,
  useMessageForm,
  useFileUpload,
  useStudentSelection
} from '@/hooks'
import {
  getDefaultExpirationDate,
  filterCommunications
} from '@/utils/teacherCommunications'
import { communicationsService } from '../../services/communicationsService'
import {
  CommunicationsHeader,
  CommunicationsFiltersBar,
  CommunicationsList,
  MessageComposerModal,
  MessageDetailModal
} from '@/components/teacherCommunications'

const CommunicationsPage = () => {
  const { user } = useAuthStore()
  const { communications, initialize, getUserCommunications } = useCommunicationsStore()

  // Custom hooks para manejo de estado
  const {
    loading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    showComposer,
    setShowComposer,
    selectedMessage,
    setSelectedMessage,
    isEditing,
    setIsEditing
  } = useTeacherCommunicationsState()

  const { messageForm, setMessageForm, resetForm } = useMessageForm()

  const {
    imageZoom,
    handleImageUpload,
    handleFileUpload,
    removeImage,
    removeFile,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset
  } = useFileUpload(messageForm, setMessageForm)

  const {
    filtroGrado,
    setFiltroGrado,
    filtroSeccion,
    setFiltroSeccion,
    grados,
    secciones,
    estudiantesFiltrados,
    toggleEstudiante,
    seleccionarTodos,
    deseleccionarTodos
  } = useStudentSelection(messageForm, setMessageForm)

  // Obtener el rol del usuario para filtrar comunicaciones
  const userRole = user?.rol || user?.role || ''

  // Primero filtrar por destinatarios/rol del usuario, luego aplicar filtros adicionales
  const userCommunications = getUserCommunications(user?.id, userRole)

  // Filtrar comunicaciones (búsqueda, tipo, tab)
  const filteredCommunications = filterCommunications(
    userCommunications,
    searchTerm,
    filterType,
    activeTab
  )

  // Handlers
  const handleSendMessage = async () => {
    if (!messageForm.asunto || !messageForm.contenido) {
      alert('Por favor completa el asunto y contenido del mensaje')
      return
    }

    const fechaEnvio = new Date().toISOString()
    let totalDestinatarios = 0
    let destinatariosObj = {}

    if (messageForm.destinatarios === 'curso') {
      const enrollments = mockDb.getTable('enrollments') || []
      const courseEnrollments = enrollments.filter(e => e.course_id === messageForm.cursoSeleccionado)
      totalDestinatarios = courseEnrollments.length || estudiantesFiltrados.length || 1

      destinatariosObj = {
        type: 'curso',
        curso: messageForm.cursoSeleccionado,
        total: totalDestinatarios,
        padres: totalDestinatarios * 2
      }
    } else if (messageForm.destinatarios === 'personalizada') {
      totalDestinatarios = messageForm.estudiantesSeleccionados.length
      destinatariosObj = {
        type: 'personalizada',
        total: totalDestinatarios,
        estudiantes: messageForm.estudiantesSeleccionados
      }
    } else {
      totalDestinatarios = 1
      destinatariosObj = {
        type: messageForm.destinatarios,
        total: totalDestinatarios
      }
    }

    const newMessage = {
      id: isEditing || `comm${Date.now()}`,
      type: messageForm.type,
      asunto: messageForm.asunto,
      contenido: messageForm.contenido,
      destinatarios: destinatariosObj,
      fechaEnvio: fechaEnvio,
      due_date: messageForm.due_date || getDefaultExpirationDate(fechaEnvio),
      state: 'enviado',
      estadisticas: {
        enviados: totalDestinatarios,
        leidos: 0,
        confirmados: 0,
        pendientes: totalDestinatarios
      },
      prioridad: messageForm.prioridad,
      imagen: messageForm.imagen,
      archivo: messageForm.archivo
    }

    const currentComms = await communicationsService.getAll() || []

    if (isEditing) {
      const updatedComms = currentComms.filter(c => c.id !== isEditing)
      mockDb.setTable('communications', [newMessage, ...updatedComms])
    } else {
      mockDb.setTable('communications', [newMessage, ...currentComms])
    }

    initialize()
    resetForm()
    setShowComposer(false)
    setIsEditing(false)
  }

  // Abrir composer
  const openComposer = () => {
    resetForm()
    setIsEditing(false)
    setShowComposer(true)
  }

  // Ver mensaje
  const viewMessage = (message) => {
    setSelectedMessage(message)
  }

  // Verificar si un comunicado es propio (creado por el usuario actual)
  const isOwnCommunication = (message) => {
    if (!message || !user) return false

    // El campo sender/remitenteId contiene el ID del usuario que creó el comunicado
    const senderId = message.sender || message.remitenteId || message.remitente || message.sender_id || message.created_by
    const userId = user.id

    // Debug para verificar los valores
    console.log('[isOwnCommunication] senderId:', senderId, 'userId:', userId, 'match:', senderId == userId)

    // Comparar como string y número para mayor compatibilidad
    return senderId == userId ||
           String(senderId) === String(userId) ||
           Number(senderId) === Number(userId)
  }

  // Manejar edición de comunicado propio
  const handleEditMessage = (message) => {
    if (!isOwnCommunication(message)) return

    // Cargar datos del mensaje en el formulario
    setMessageForm({
      ...messageForm,
      type: message.type || 'comunicado',
      asunto: message.asunto || '',
      contenido: message.contenido || '',
      destinatarios: message.destinatarios?.type === 'personalizada' ? 'personalizada' : 'curso',
      prioridad: message.prioridad || 'normal',
      imagen: message.imagen || null,
      archivo: message.archivo || null
    })
    setIsEditing(message.id)
    setSelectedMessage(null)
    setShowComposer(true)
  }

  // Manejar eliminación de comunicado propio
  const handleDeleteMessage = async (message) => {
    if (!isOwnCommunication(message)) return

    if (window.confirm('¿Estás seguro de que deseas eliminar este comunicado?')) {
      try {
        await communicationsService.remove(message.id)
        initialize()
        setSelectedMessage(null)
      } catch (error) {
        console.error('Error eliminando comunicado:', error)
        alert('Error al eliminar el comunicado')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CommunicationsHeader onNewCommunication={openComposer} />

      {/* Tabs y Filtros */}
      <CommunicationsFiltersBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
      />

      {/* Lista de Comunicaciones */}
      <div className="card">
        <CommunicationsList
          communications={filteredCommunications}
          onViewMessage={viewMessage}
          isOwnCommunication={isOwnCommunication}
        />
      </div>

      {/* Modal Composer */}
      {showComposer && (
        <MessageComposerModal
          messageForm={messageForm}
          setMessageForm={setMessageForm}
          onSend={handleSendMessage}
          onClose={() => setShowComposer(false)}
          imageZoom={imageZoom}
          onImageUpload={handleImageUpload}
          onFileUpload={handleFileUpload}
          onRemoveImage={removeImage}
          onRemoveFile={removeFile}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          filtroGrado={filtroGrado}
          setFiltroGrado={setFiltroGrado}
          filtroSeccion={filtroSeccion}
          setFiltroSeccion={setFiltroSeccion}
          grados={grados}
          secciones={secciones}
          estudiantesFiltrados={estudiantesFiltrados}
          toggleEstudiante={toggleEstudiante}
          seleccionarTodos={seleccionarTodos}
          deseleccionarTodos={deseleccionarTodos}
        />
      )}

      {/* Modal Detalle */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          isOwn={isOwnCommunication(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
        />
      )}
    </div>
  )
}

export default CommunicationsPage
