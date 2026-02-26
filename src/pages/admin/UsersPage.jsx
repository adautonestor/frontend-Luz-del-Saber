import React from 'react'
import { UserPlus, Download, Upload } from 'lucide-react'
import { useUsersPageState } from '../../hooks/useUsersPageState'
import { useUsersImport } from '../../hooks/useUsersImport'
import UsersFilters from '../../components/admin/UsersFilters'
import UsersStatsCards from '../../components/admin/UsersStatsCards'
import UsersTable from '../../components/admin/UsersTable'
import UserFormModal from '../../components/admin/UserFormModal'
import ImportUsersModal from '../../components/admin/ImportUsersModal'
import AlertModal from '../../components/common/AlertModal'
import ConfirmModal from '../../components/common/ConfirmModal'

const UsersPage = () => {
  // Custom hooks
  const state = useUsersPageState()
  const importState = useUsersImport(state.loadUsers)

  if (state.loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">Administra los usuarios del sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => importState.exportUsers(state.filteredUsers)}
            className="btn btn-outline px-4 py-2 flex items-center gap-2"
            disabled={state.filteredUsers.length === 0}
            title={state.filteredUsers.length === 0 ? 'No hay usuarios para exportar' : `Exportar ${state.filteredUsers.length} usuario(s)`}
          >
            <Download size={20} />
            Exportar Excel
          </button>
          <button
            onClick={() => importState.setIsImportModalOpen(true)}
            className="btn btn-outline px-4 py-2 flex items-center gap-2"
          >
            <Upload size={20} />
            Importar Excel
          </button>
          <button
            onClick={() => state.setIsModalOpen(true)}
            className="btn btn-primary px-4 py-2 flex items-center gap-2"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <UsersStatsCards users={state.users} />

      {/* Filters */}
      <UsersFilters
        searchTerm={state.searchTerm}
        setSearchTerm={state.setSearchTerm}
        roleFilter={state.roleFilter}
        setRoleFilter={state.setRoleFilter}
        statusFilter={state.statusFilter}
        setStatusFilter={state.setStatusFilter}
        onRefresh={state.loadUsers}
      />

      {/* Users Table */}
      <UsersTable
        users={state.filteredUsers}
        onEdit={state.handleEdit}
        onDelete={state.handleDelete}
        getRoleBadgeColor={state.getRoleBadgeColor}
        getStatusBadgeColor={state.getStatusBadgeColor}
        currentUser={state.currentUser}
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={state.isModalOpen}
        editingUser={state.editingUser}
        formData={state.formData}
        setFormData={state.setFormData}
        currentUser={state.currentUser}
        roles={state.roles}
        showPassword={state.showPassword}
        togglePasswordVisibility={state.togglePasswordVisibility}
        onSubmit={state.handleSubmit}
        onClose={state.handleCloseModal}
        isSubmitting={state.isSubmitting}
        showSuccessAnimation={state.showSuccessAnimation}
        showErrorAnimation={state.showErrorAnimation}
        successMessage={state.successMessage}
        errorMessage={state.errorMessage}
      />

      {/* Import Modal */}
      <ImportUsersModal
        isOpen={importState.isImportModalOpen}
        importFile={importState.importFile}
        importResults={importState.importResults}
        isImporting={importState.isImporting}
        onFileSelect={importState.handleImportFile}
        onProcess={importState.processExcelFile}
        onDownloadTemplate={importState.downloadTemplate}
        onClose={importState.handleCloseImportModal}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={state.alertModal.isOpen}
        onClose={state.closeAlert}
        title={state.alertModal.title}
        message={state.alertModal.message}
        type={state.alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={state.confirmModal.isOpen}
        onClose={state.closeConfirm}
        onConfirm={state.handleConfirm}
        title={state.confirmModal.title}
        message={state.confirmModal.message}
        confirmText={state.confirmModal.confirmText}
        cancelText={state.confirmModal.cancelText}
        variant={state.confirmModal.variant}
      />
    </div>
  )
}

export default UsersPage
