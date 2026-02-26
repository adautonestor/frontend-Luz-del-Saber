import React from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useScheduleManagementState } from '../../hooks/useScheduleManagementState'
import { useScheduleUpload } from '../../hooks/useScheduleUpload'
import ScheduleFilters from '../../components/admin/ScheduleFilters'
import ScheduleImageGrid from '../../components/admin/ScheduleImageGrid'
import UploadScheduleModal from '../../components/admin/UploadScheduleModal'
import ViewScheduleModal from '../../components/admin/ViewScheduleModal'

const ScheduleManagementPage = () => {
  const { canManageSchedules, isReadOnlyMode } = useAuthStore()

  const state = useScheduleManagementState()

  const upload = useScheduleUpload(
    state.activeTab,
    state.selectedLevel,
    state.selectedGrade,
    state.selectedSection,
    state.levels,
    state.grades,
    state.sections,
    state.setScheduleImages
  )

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Horarios</h1>
        <p className="mt-2 text-gray-600">
          {isReadOnlyMode()
            ? 'Visualiza las imágenes de horarios para consulta'
            : 'Sube y gestiona las imágenes de horarios para que las vean docentes y alumnos'
          }
        </p>
        {isReadOnlyMode() && (
          <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <AlertCircle size={16} />
            <span className="text-sm">
              Tienes permisos de solo lectura. No puedes crear, editar o eliminar horarios.
            </span>
          </div>
        )}
      </div>

      {/* Pestañas */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => state.handleTabChange('alumnos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                state.activeTab === 'alumnos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Horarios de Alumnos
            </button>
            <button
              onClick={() => state.handleTabChange('docentes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                state.activeTab === 'docentes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Horarios de Docentes
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {state.activeTab === 'alumnos' ? 'Gestión de Horarios para Alumnos' : 'Gestión de Horarios para Docentes'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {state.activeTab === 'alumnos'
                  ? 'Sube y gestiona horarios organizados por grado y sección'
                  : 'Sube y gestiona horarios personalizados por profesor'
                }
              </p>
            </div>
            {canManageSchedules() && (
              <button
                onClick={upload.openUploadModal}
                className="btn btn-primary flex items-center gap-2"
              >
                <Upload size={20} />
                {state.activeTab === 'alumnos' ? 'Subir Horario de Alumnos' : 'Subir Horario de Docente'}
              </button>
            )}
          </div>

          <ScheduleFilters
            activeTab={state.activeTab}
            levels={state.levels}
            selectedLevel={state.selectedLevel}
            setSelectedLevel={state.setSelectedLevel}
            selectedGrade={state.selectedGrade}
            setSelectedGrade={state.setSelectedGrade}
            selectedSection={state.selectedSection}
            setSelectedSection={state.setSelectedSection}
            getGradesByLevel={state.getGradesByLevel}
            getSectionsByGrade={state.getSectionsByGrade}
          />
        </div>
      </div>

      {/* Vista de Imágenes de Horarios */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {state.activeTab === 'alumnos' ? 'Horarios de Alumnos' : 'Horarios de Docentes'}
            </h3>
            <div className="text-sm text-gray-600">
              {state.getFilteredImages().length} {state.getFilteredImages().length === 1 ? 'horario' : 'horarios'}
            </div>
          </div>
        </div>

        <ScheduleImageGrid
          filteredImages={state.getFilteredImages()}
          activeTab={state.activeTab}
          canManageSchedules={canManageSchedules}
          openViewModal={state.openViewModal}
          handleDelete={state.handleDelete}
          getItemName={state.getItemName}
          formatFileSize={state.formatFileSize}
          levels={state.levels}
          grades={state.grades}
          sections={state.sections}
          selectedLevel={state.selectedLevel}
          selectedGrade={state.selectedGrade}
          selectedSection={state.selectedSection}
          openUploadModal={upload.openUploadModal}
        />
      </div>

      {/* Modal de Subida */}
      <UploadScheduleModal
        showUploadModal={upload.showUploadModal}
        uploadForm={upload.uploadForm}
        setUploadForm={upload.setUploadForm}
        isDragging={upload.isDragging}
        closeUploadModal={upload.closeUploadModal}
        handleFileChange={upload.handleFileChange}
        handleDragEnter={upload.handleDragEnter}
        handleDragLeave={upload.handleDragLeave}
        handleDragOver={upload.handleDragOver}
        handleDrop={upload.handleDrop}
        handleUpload={upload.handleUpload}
        levels={state.levels}
        grades={state.grades}
        sections={state.sections}
        getGradesByLevel={state.getGradesByLevel}
        getSectionsByGrade={state.getSectionsByGrade}
      />

      {/* Modal de Visualización */}
      <ViewScheduleModal
        showViewModal={state.showViewModal}
        selectedImage={state.selectedImage}
        zoomLevel={state.zoomLevel}
        closeViewModal={state.closeViewModal}
        handleZoomIn={state.handleZoomIn}
        handleZoomOut={state.handleZoomOut}
        handleZoomReset={state.handleZoomReset}
        handleWheel={state.handleWheel}
        getItemName={state.getItemName}
        formatFileSize={state.formatFileSize}
        levels={state.levels}
        grades={state.grades}
        sections={state.sections}
      />
    </div>
  )
}

export default ScheduleManagementPage