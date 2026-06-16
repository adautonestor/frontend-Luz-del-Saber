import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Bell } from 'lucide-react'
import { useTeacherCommunicationsState } from '../../hooks/useTeacherCommunicationsState.jsx'
import { useFileManagement } from '../../hooks/useFileManagement.jsx'
import CommunicationsStatsCards from './CommunicationsStatsCards'
import CommunicationsSearchFilters from './CommunicationsSearchFilters'
import TeacherCommunicationsList from './TeacherCommunicationsList'
import NewCommunicationModal from './NewCommunicationModal'
import ViewCommunicationModal from './ViewCommunicationModal'
import DeleteCommunicationModal from './DeleteCommunicationModal'

/**
 * Vista principal de comunicaciones del profesor
 * Permite crear, ver, editar y eliminar comunicados a padres
 */
const TeacherCommunications = () => {
  // Hook principal con estado y lógica de negocio
  const state = useTeacherCommunicationsState()

  // Hook de gestión de archivos
  const fileManagement = useFileManagement(
    state.newCommunication,
    state.setNewCommunication
  )

  // Handlers para el modal de nuevo comunicado
  const handleSelectGrade = (grado, seccion) => {
    state.selectAllFromGrade(grado, seccion)
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {state.notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            state.notification.type === 'success'
              ? 'bg-green-500 text-white'
              : state.notification.type === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            {state.notification.type === 'success' && <CheckCircle size={20} />}
            {state.notification.type === 'info' && <Bell size={20} />}
            {state.notification.type === 'error' && <AlertCircle size={20} />}
            <span>{state.notification.message}</span>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
        <p className="mt-2 text-gray-600">
          Gestiona la comunicación con tutores y estudiantes
        </p>
      </div>

      {/* Stats Cards */}
      <CommunicationsStatsCards communications={state.communications} />

      {/* Search and Filters */}
      <CommunicationsSearchFilters
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        searchTerm={state.searchTerm}
        setSearchTerm={state.setSearchTerm}
        filterPriority={state.filterPriority}
        setFilterPriority={state.setFilterPriority}
        onNewCommunication={() => state.setShowNewCommunication(true)}
      />

      {/* Communications List */}
      <TeacherCommunicationsList
        communications={state.filteredCommunications}
        getPriorityColor={state.getPriorityColor}
        getPriorityIcon={state.getPriorityIcon}
        getTypeIcon={state.getTypeIcon}
        formatDate={state.formatDate}
        onView={state.handleViewCommunication}
        onEdit={state.handleEditCommunication}
        onDelete={state.handleDeleteCommunication}
        isOwnCommunication={state.isOwnCommunication}
      />

      {/* New Communication Modal */}
      <NewCommunicationModal
        isOpen={state.showNewCommunication}
        onClose={() => state.setShowNewCommunication(false)}
        newCommunication={state.newCommunication}
        setNewCommunication={state.setNewCommunication}
        recipients={state.recipients}
        mockStudents={state.mockStudents}
        selectedStudents={state.selectedStudents}
        showStudentSelector={state.showStudentSelector}
        fileHandlers={{
          handleFilesSelect: fileManagement.handleFilesSelect,
          handleFilesDrop: fileManagement.handleFilesDrop,
          removeAttachment: fileManagement.removeAttachment
        }}
        onRecipientChange={state.handleRecipientTypeChange}
        onStudentToggle={state.toggleStudentSelection}
        onSelectGrade={handleSelectGrade}
        onSend={state.handleSendCommunication}
        getFileIcon={fileManagement.getFileIcon}
        formatFileSize={fileManagement.formatFileSize}
      />

      {/* View Communication Modal */}
      <ViewCommunicationModal
        communication={state.selectedCommunication}
        onClose={() => state.setSelectedCommunication(null)}
        imageZoom={state.imageZoom}
        onZoomIn={state.handleZoomIn}
        onZoomOut={state.handleZoomOut}
        onZoomReset={state.handleZoomReset}
        getTypeIcon={state.getTypeIcon}
        getPriorityColor={state.getPriorityColor}
        getPriorityIcon={state.getPriorityIcon}
        formatDate={state.formatDate}
        formatFileSize={fileManagement.formatFileSize}
        isPDF={fileManagement.isPDF}
        handleDownload={fileManagement.handleDownload}
      />

      {/* Delete Communication Modal */}
      <DeleteCommunicationModal
        isOpen={state.showDeleteModal}
        onClose={() => state.setShowDeleteModal(false)}
        onConfirm={state.confirmDeleteCommunication}
        communication={state.communicationToDelete}
      />
    </div>
  )
}

export default TeacherCommunications