import React, { useState, useEffect } from 'react'
import { Plus, Settings, Edit, Trash2, X } from 'lucide-react'
import { academicAreasService } from '../../../services/academic/academicAreasService'
import { useAuthStore } from '../../../stores/authStore'
import { useCoursesFilters, useAcademicAreas, useCourseManagement } from '../../../hooks'
import { structureService } from '../../../services/academic/structureService'
import {
  YearSelector,
  CoursesFilters,
  CoursesTable,
  CourseFormModal,
  CompetenciesModal,
  CourseCompetenciesModal,
  AcademicAreasModal,
  AssignmentDetailsModal
} from '../../courses'

/**
 * Tab de gestión de cursos (orquestador principal)
 * Coordina todos los componentes y hooks para la funcionalidad de cursos
 */
const CoursesTab = ({
  courses,
  competencies,
  capacities,
  grades,
  levels,
  teachers,
  loadAcademicData,
  hasPermission,
  openCreateModal,
  openEditModal,
  academicYears,
  selectedAcademicYear,
  handleAcademicYearChange,
  getGradesByLevel
}) => {
  const { user } = useAuthStore()

  // Estados locales de modales
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedLevelId, setSelectedLevelId] = useState(null)
  const [showCompetencyModal, setShowCompetencyModal] = useState(false)
  const [selectedCourseForCompetencies, setSelectedCourseForCompetencies] = useState(null)
  const [showCourseCompetencyModal, setShowCourseCompetencyModal] = useState(false)
  const [showAreasModal, setShowAreasModal] = useState(false)
  const [showAssignmentDetailsModal, setShowAssignmentDetailsModal] = useState(false)
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null)

  // Estados para gestión de áreas académicas
  const [showAreasManagementModal, setShowAreasManagementModal] = useState(false)
  const [areasFromDB, setAreasFromDB] = useState([])
  const [editingAreaItem, setEditingAreaItem] = useState(null)
  const [areaFormData, setAreaFormData] = useState({ name: '', description: '' })
  const [savingArea, setSavingArea] = useState(false)

  // Cargar áreas desde BD
  const loadAreasFromDB = async () => {
    try {
      const areas = await academicAreasService.getAll()
      setAreasFromDB(areas)
    } catch (error) {
      console.error('Error cargando áreas:', error)
    }
  }

  useEffect(() => {
    loadAreasFromDB()
  }, [])

  // Handlers para CRUD de áreas
  const handleOpenAreasModal = () => {
    loadAreasFromDB()
    setShowAreasManagementModal(true)
    setEditingAreaItem(null)
    setAreaFormData({ name: '', description: '' })
  }

  const handleEditAreaItem = (area) => {
    setEditingAreaItem(area)
    setAreaFormData({
      name: area.name,
      description: area.description || ''
    })
  }

  const handleCancelEditArea = () => {
    setEditingAreaItem(null)
    setAreaFormData({ name: '', description: '' })
  }

  const handleSaveAreaItem = async () => {
    if (!areaFormData.name.trim()) {
      alert('El nombre del área es requerido')
      return
    }
    setSavingArea(true)
    try {
      if (editingAreaItem) {
        await academicAreasService.update(editingAreaItem.id, areaFormData)
      } else {
        await academicAreasService.create(areaFormData)
      }
      await loadAreasFromDB()
      setEditingAreaItem(null)
      setAreaFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Error guardando área:', error)
      alert('Error al guardar el área')
    } finally {
      setSavingArea(false)
    }
  }

  const handleDeleteAreaItem = async (area) => {
    if (!window.confirm(`¿Estás seguro de eliminar el área "${area.name}"?`)) return
    try {
      await academicAreasService.delete(area.id)
      await loadAreasFromDB()
    } catch (error) {
      console.error('Error eliminando área:', error)
      alert('Error al eliminar el área')
    }
  }

  // Hooks personalizados
  const {
    filters,
    filteredCourses,
    paginatedCourses,
    paginationInfo,
    currentPage,
    handleFilterChange,
    clearFilters,
    goToPage
  } = useCoursesFilters(courses, selectedAcademicYear)

  const {
    academicAreas,
    editingArea,
    areaForm,
    setAreaForm,
    handleCreateArea,
    handleEditArea,
    handleSaveArea,
    handleDeleteArea
  } = useAcademicAreas()

  const {
    selectedCourse,
    showCourseModal,
    isSaving,
    courseForm,
    setCourseForm,
    handleCloseCourseModal,
    handleCreateCourse,
    handleEditCourse,
    handleSaveCourse
  } = useCourseManagement(selectedAcademicYear, user?.id, loadAcademicData, levels)

  // Handlers de competencias
  const handleViewCompetencies = (course) => {
    // Usar el nuevo modal de competencias del curso
    setSelectedCourseForCompetencies(course)
    setShowCourseCompetencyModal(true)
  }

  // Handler legacy para competencias por área (mantener por compatibilidad)
  const handleViewCompetenciesByArea = (courseArea, courseLevelId) => {
    setSelectedArea(courseArea)
    setSelectedLevelId(courseLevelId)
    setShowCompetencyModal(true)
  }

  const handleCreateCompetency = (area) => {
    openCreateModal('competency', null, area, selectedLevelId)
  }

  const handleEditCompetency = (competency) => {
    // Cerrar modal de competencias y abrir modal de edición
    setShowCompetencyModal(false)
    // Mapear academic_area_id a valor de área
    const areaIdToValue = {
      1: 'comunicación',
      2: 'matemáticas',
      3: 'ciencias',
      4: 'sociales',
      5: 'educación física',
      6: 'arte',
      7: 'inglés',
      8: 'religión'
    }
    const areaValue = areaIdToValue[competency.academic_area_id] || ''
    openEditModal({
      ...competency,
      area: areaValue
    }, 'competency')
  }

  const handleDeleteCompetency = async (competency) => {
    if (window.confirm(`¿Estás seguro de eliminar la competencia "${competency.name}"?`)) {
      try {
        await structureService.deleteCompetency(competency.id)
        await loadAcademicData()
        setShowCompetencyModal(false)
      } catch (error) {
        console.error('Error al eliminar competencia:', error)
        alert('Error al eliminar la competencia')
      }
    }
  }

  // Handlers de asignaciones
  const handleViewAssignments = (course) => {
    setSelectedCourseForDetails(course)
    setShowAssignmentDetailsModal(true)
  }

  // Handler de cambio de form de área
  const handleAreaFormChange = (field, value) => {
    setAreaForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Cursos</h2>
          <p className="text-gray-600">Administra cursos, competencias y capacidades</p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('manage_academic_structure') && (
            <button
              onClick={handleOpenAreasModal}
              className="btn btn-outline px-4 py-2 flex items-center gap-2"
            >
              <Settings size={20} />
              Áreas Académicas
            </button>
          )}
          {hasPermission('manage_academic_structure') && (
            <button
              onClick={handleCreateCourse}
              className="btn btn-primary px-4 py-2 flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Curso
            </button>
          )}
        </div>
      </div>

      {/* Selector de Año Lectivo */}
      <YearSelector
        academicYears={academicYears}
        selectedAcademicYear={selectedAcademicYear}
        onYearChange={handleAcademicYearChange}
      />

      {/* Filtros */}
      <CoursesFilters
        filters={filters}
        levels={levels}
        academicAreas={academicAreas}
        paginationInfo={paginationInfo}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Tabla de Cursos */}
      <CoursesTable
        paginatedCourses={paginatedCourses}
        filteredCourses={filteredCourses}
        grades={grades}
        levels={levels}
        competencies={competencies}
        selectedAcademicYear={selectedAcademicYear}
        paginationInfo={paginationInfo}
        onEditCourse={handleEditCourse}
        onViewCompetencies={handleViewCompetencies}
        onViewAssignments={handleViewAssignments}
        onPageChange={goToPage}
      />

      {/* Modal de Creación/Edición de Curso */}
      <CourseFormModal
        show={showCourseModal}
        selectedCourse={selectedCourse}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        isSaving={isSaving}
        levels={levels}
        courses={courses}
        teachers={teachers}
        getGradesByLevel={getGradesByLevel}
        onClose={handleCloseCourseModal}
        onSave={handleSaveCourse}
      />

      {/* Modal de Competencias del Curso (Nuevo) */}
      <CourseCompetenciesModal
        show={showCourseCompetencyModal}
        selectedCourse={selectedCourseForCompetencies}
        grades={grades}
        onClose={() => {
          setShowCourseCompetencyModal(false)
          setSelectedCourseForCompetencies(null)
        }}
      />

      {/* Modal de Competencias por Área (Legacy) */}
      <CompetenciesModal
        show={showCompetencyModal}
        selectedArea={selectedArea}
        competencies={competencies}
        capacities={capacities}
        courses={courses}
        grades={grades}
        onClose={() => setShowCompetencyModal(false)}
        onCreateCompetency={handleCreateCompetency}
        onEditCompetency={handleEditCompetency}
        onDeleteCompetency={handleDeleteCompetency}
      />

      {/* Modal de Gestión de Áreas Académicas */}
      <AcademicAreasModal
        show={showAreasModal}
        academicAreas={academicAreas}
        editingArea={editingArea}
        areaForm={areaForm}
        onAreaFormChange={handleAreaFormChange}
        onCreateArea={handleCreateArea}
        onEditArea={handleEditArea}
        onSaveArea={handleSaveArea}
        onDeleteArea={handleDeleteArea}
        onClose={() => setShowAreasModal(false)}
      />

      {/* Modal de Detalles de Asignaciones */}
      <AssignmentDetailsModal
        show={showAssignmentDetailsModal}
        course={selectedCourseForDetails}
        selectedAcademicYear={selectedAcademicYear}
        grades={grades}
        teachers={teachers}
        onClose={() => setShowAssignmentDetailsModal(false)}
      />

      {/* Modal de Gestión de Áreas Académicas (CRUD) */}
      {showAreasManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Gestionar Áreas Académicas</h3>
              <button
                onClick={() => setShowAreasManagementModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Formulario para crear/editar */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">
                  {editingAreaItem ? 'Editar Área' : 'Nueva Área'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del área *"
                    value={areaFormData.name}
                    onChange={(e) => setAreaFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={areaFormData.description}
                    onChange={(e) => setAreaFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveAreaItem}
                    disabled={savingArea}
                    className="btn btn-primary px-4 py-2"
                  >
                    {savingArea ? 'Guardando...' : (editingAreaItem ? 'Actualizar' : 'Crear')}
                  </button>
                  {editingAreaItem && (
                    <button
                      onClick={handleCancelEditArea}
                      className="btn btn-outline px-4 py-2"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de áreas */}
              <div>
                <h4 className="font-medium mb-3">Áreas Existentes ({areasFromDB.length})</h4>
                <div className="space-y-2">
                  {areasFromDB.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay áreas registradas</p>
                  ) : (
                    areasFromDB.map(area => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <span className="font-medium">{area.name}</span>
                          {area.description && (
                            <span className="text-sm text-gray-500 ml-2">- {area.description}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAreaItem(area)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAreaItem(area)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowAreasManagementModal(false)}
                className="btn btn-outline px-4 py-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesTab
