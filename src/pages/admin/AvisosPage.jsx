import React from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAvisosPageState } from '../../hooks/useAvisosPageState'
import { useAvisoFileUpload } from '../../hooks/useAvisoFileUpload'
import AvisosStats from '../../components/admin/AvisosStats'
import AvisoCard from '../../components/admin/AvisoCard'
import CreateAvisoModal from '../../components/admin/CreateAvisoModal'
import ViewAvisoModal from '../../components/admin/ViewAvisoModal'
import Pagination from '../../components/common/Pagination'
import { usePagination } from '../../hooks/usePagination'

const AvisosPage = () => {
  const { user } = useAuthStore()
  const state = useAvisosPageState(user)
  const uploadHandlers = useAvisoFileUpload(state.formData, state.setFormData)

  // Paginación del lado del cliente sobre la lista de avisos
  const pg = usePagination(state.avisos, 10, state.avisos.length)

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
          <h1 className="text-3xl font-bold text-gray-900">Avisos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona avisos generales visibles para padres y docentes
          </p>
        </div>
        <button
          onClick={() => state.setIsModalOpen(true)}
          className="btn btn-primary px-4 py-2 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Aviso
        </button>
      </div>

      {/* Stats */}
      <AvisosStats stats={state.stats} />

      {/* Avisos List */}
      <div className="card p-6">
        {state.avisos.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay avisos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer aviso para la comunidad educativa.
            </p>
            <button
              onClick={() => state.setIsModalOpen(true)}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Crear Primer Aviso
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {pg.pageItems.map((aviso) => (
                <AvisoCard
                  key={aviso.id}
                  aviso={aviso}
                  setSelectedAviso={state.setSelectedAviso}
                  handleToggleActive={state.handleToggleActive}
                  handleDelete={state.handleDelete}
                  handleDownload={state.handleDownload}
                  formatFileSize={state.formatFileSize}
                  isPDF={state.isPDF}
                />
              ))}
            </div>
            <Pagination
              page={pg.page}
              totalPages={pg.totalPages}
              total={pg.total}
              from={pg.from}
              to={pg.to}
              pageSize={pg.pageSize}
              onPageChange={pg.setPage}
              onPrev={pg.prev}
              onNext={pg.next}
              onPageSizeChange={pg.setPageSize}
            />
          </>
        )}
      </div>

      {/* Modal Crear Aviso */}
      <CreateAvisoModal
        isModalOpen={state.isModalOpen}
        formData={state.formData}
        setFormData={state.setFormData}
        handleSubmit={state.handleSubmit}
        handleCloseModal={state.handleCloseModal}
        uploadHandlers={uploadHandlers}
        formatFileSize={state.formatFileSize}
      />

      {/* Modal Ver Detalle */}
      <ViewAvisoModal
        selectedAviso={state.selectedAviso}
        setSelectedAviso={state.setSelectedAviso}
        imageZoom={state.imageZoom}
        handleZoomIn={state.handleZoomIn}
        handleZoomOut={state.handleZoomOut}
        handleZoomReset={state.handleZoomReset}
        handleDownload={state.handleDownload}
        isPDF={state.isPDF}
        formatFileSize={state.formatFileSize}
      />
    </div>
  )
}

export default AvisosPage
