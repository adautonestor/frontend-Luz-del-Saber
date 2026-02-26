import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCommunicationsStore } from '@/stores/communicationsStore'
import { useCommunicationsData } from '@/hooks/useCommunicationsData'
import { useCommunicationsForm } from '@/hooks/useCommunicationsForm'
import { COMMUNICATIONS_TABS } from '@/constants/communications'
import {
  formatFileSize,
  handleFileUpload,
  removeAttachment,
  getRecipientCount,
  getEstimatedRecipientCount,
  getFilterDescription,
  getGradesByLevel,
  getSectionsByGrade,
  updateFiltros,
  handleCommunicationSubmit,
  calculateCommunicationsStats
} from '@/utils/communications'
import CreateCommunicationModal from '@/components/communications/CreateCommunicationModal'
import MessageDetailModal from '@/components/communications/MessageDetailModal'
import CommunicationsStatsCards from '@/components/communications/CommunicationsStatsCards'
import MessagesList from '@/components/communications/MessagesList'
import CommunicationsFilters from '@/components/communications/CommunicationsFilters'
import CommunicationsTemplates from '@/components/communications/CommunicationsTemplates'
const CommunicationsPage = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('messages')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [priorityFilter, setPriorityFilter] = useState('todos')

  const {
    communications,
    readConfirmations,
    createCommunication,
    updateCommunication,
    deleteCommunication,
    markAsAttended
  } = useCommunicationsStore()

  const {
    loading,
    availableUsers,
    levels,
    grades,
    sections,
    areas,
    loadData
  } = useCommunicationsData()

  const {
    formData,
    setFormData,
    userSearchTerm,
    setUserSearchTerm,
    isModalOpen,
    setIsModalOpen,
    selectedMessage,
    setSelectedMessage,
    handleCloseModal
  } = useCommunicationsForm()

  // Handlers
  const handleSubmit = (e) => {
    handleCommunicationSubmit(
      e,
      formData,
      user,
      createCommunication,
      updateCommunication,
      loadData,
      handleCloseModal,
      'sent' // Enviar como comunicado
    )
  }

  const handleSaveDraft = (e) => {
    handleCommunicationSubmit(
      e,
      formData,
      user,
      createCommunication,
      updateCommunication,
      loadData,
      handleCloseModal,
      'draft' // Guardar como borrador
    )
  }

  const handleFileUploadWrapper = (event) => {
    handleFileUpload(event, setFormData)
  }

  const removeAttachmentWrapper = (adjuntoId) => {
    removeAttachment(adjuntoId, setFormData)
  }

  const updateFiltrosWrapper = (key, value) => {
    updateFiltros(key, value, setFormData)
  }

  const getGradesByLevelWrapper = (levelId) => {
    return getGradesByLevel(levelId, grades)
  }

  const getSectionsByGradeWrapper = (gradeId) => {
    return getSectionsByGrade(gradeId, sections)
  }

  const getEstimatedRecipientCountWrapper = () => {
    return getEstimatedRecipientCount(formData, levels, grades)
  }

  const getFilterDescriptionWrapper = () => {
    return getFilterDescription(formData, levels, grades, sections)
  }

  const getRecipientCountWrapper = (comm) => {
    return getRecipientCount(comm, levels, grades, sections, availableUsers)
  }

  // Stats
  const stats = calculateCommunicationsStats(communications)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comunicaciones</h1>
          <p className="mt-2 text-gray-600">Gestiona mensajes y notificaciones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Send size={20} />
          Nuevo Mensaje
        </button>
      </div>

      {/* Stats */}
      <CommunicationsStatsCards stats={stats} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {COMMUNICATIONS_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'messages' && (
          <div className="card">
            <div className="p-6">
              {/* Filters and Quick Actions */}
              <CommunicationsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
                setIsModalOpen={setIsModalOpen}
              />

              {/* Messages List */}
              <div className="space-y-4">
                <MessagesList
                  communications={communications}
                  searchTerm={searchTerm}
                  typeFilter={typeFilter}
                  statusFilter={statusFilter}
                  priorityFilter={priorityFilter}
                  setSelectedMessage={setSelectedMessage}
                  setIsModalOpen={setIsModalOpen}
                  setFormData={setFormData}
                  formData={formData}
                  user={user}
                  markAsAttended={markAsAttended}
                  loadData={loadData}
                  getRecipientCount={getRecipientCountWrapper}
                  onDelete={deleteCommunication}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <CommunicationsTemplates
            setFormData={setFormData}
            formData={formData}
            setIsModalOpen={setIsModalOpen}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {/* Modal de Creación de Comunicación */}
      <CreateCommunicationModal
        isOpen={isModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        handleSaveDraft={handleSaveDraft}
        handleCloseModal={handleCloseModal}
        handleFileUpload={handleFileUploadWrapper}
        removeAttachment={removeAttachmentWrapper}
        formatFileSize={formatFileSize}
        availableUsers={availableUsers}
        userSearchTerm={userSearchTerm}
        setUserSearchTerm={setUserSearchTerm}
        levels={levels}
        grades={grades}
        sections={sections}
        areas={areas}
        getGradesByLevel={getGradesByLevelWrapper}
        getSectionsByGrade={getSectionsByGradeWrapper}
        updateFiltros={updateFiltrosWrapper}
        getEstimatedRecipientCount={getEstimatedRecipientCountWrapper}
        getFilterDescription={getFilterDescriptionWrapper}
      />

      {/* Modal de Detalle de Comunicación */}
      <MessageDetailModal
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        formatFileSize={formatFileSize}
        getRecipientCount={getRecipientCountWrapper}
        readConfirmations={readConfirmations}
        user={user}
        markAsAttended={markAsAttended}
        loadData={loadData}
      />
    </div>
  )
}

export default CommunicationsPage
