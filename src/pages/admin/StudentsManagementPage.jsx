import React, { useState, useEffect, useMemo } from 'react'
import { UserPlus, Upload, Download } from 'lucide-react'
import StudentCreationModal from '../../components/admin/StudentCreationModal'
import StudentEditModal from '../../components/admin/StudentEditModal'
import StudentBulkImport from '../../components/admin/StudentBulkImport'
import { useStudentsStore } from '../../stores/studentsStore'
import { useAuthStore } from '../../stores/authStore'
import { useAcademicStore } from '../../stores/academicStore'
import {
  filterAndSortStudents,
  exportStudentsToExcel,
  calculateStudentStats
} from '../../utils/studentsHelpers'
import { usersService } from '../../services/usersService'
import studentsService from '../../services/studentsService'
import StudentsStatsCards from '../../components/admin/StudentsStatsCards'
import StudentsFilters from '../../components/admin/StudentsFilters'
import StudentsTable from '../../components/admin/StudentsTable'
import DeleteStudentModal from '../../components/admin/DeleteStudentModal'
import ChangeParentModal from '../../components/admin/ChangeParentModal'
import ViewStudentModal from '../../components/enrollment/modals/ViewStudentModal'
import Pagination from '../../components/common/Pagination'
import { usePagination } from '../../hooks/usePagination'

/**
 * Página principal de gestión de estudiantes
 * Permite crear, editar, eliminar y exportar estudiantes
 */
const StudentsManagementPage = () => {
  const { user } = useAuthStore()
  const { students, loadStudents, deleteStudent, searchStudents } = useStudentsStore()
  const { selectedAcademicYear, initialize: initializeAcademic } = useAcademicStore()

  // Estados de modales
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showChangeParentModal, setShowChangeParentModal] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [statusAction, setStatusAction] = useState(null) // 'activate' | 'deactivate'
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingStudent, setViewingStudent] = useState(null)

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNivel, setFilterNivel] = useState('')
  const [filterGrado, setFilterGrado] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showAllStudents, setShowAllStudents] = useState(false) // Ver todos los estudiantes (sin filtro de año)

  // Estados de datos
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [parents, setParents] = useState([])
  const [selectedNewParent, setSelectedNewParent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Inicializar estructura académica si no está cargada
  useEffect(() => {
    if (!selectedAcademicYear) {
      initializeAcademic()
    }
  }, [selectedAcademicYear, initializeAcademic])

  // Cargar datos cuando cambie el año académico o el toggle de ver todos
  useEffect(() => {
    loadData()
  }, [selectedAcademicYear, showAllStudents])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Filtrar estudiantes por año académico activo, excepto si showAllStudents está activo
      const filters = (!showAllStudents && selectedAcademicYear?.id)
        ? { academic_year_id: selectedAcademicYear.id }
        : {}
      await loadStudents(filters)
      const parentsData = await usersService.getByRole('padre')
      setParents(parentsData || [])
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Extraer niveles únicos de los estudiantes cargados (dinámico)
  const nivelesDisponibles = useMemo(() => {
    const nivelesSet = new Set()
    students.forEach(s => {
      if (s.level_name) {
        nivelesSet.add(s.level_name)
      }
    })
    const nivelesArray = Array.from(nivelesSet).sort()
    return [
      { value: '', label: 'Todos los niveles' },
      ...nivelesArray.map(nivel => ({
        value: nivel.toLowerCase(),
        label: nivel
      }))
    ]
  }, [students])

  // Extraer grados únicos de los estudiantes (filtrados por nivel si aplica)
  const gradosDisponibles = useMemo(() => {
    let estudiantesParaGrados = students

    // Si hay un nivel seleccionado, filtrar solo grados de ese nivel
    if (filterNivel) {
      estudiantesParaGrados = students.filter(
        s => s.level_name?.toLowerCase() === filterNivel.toLowerCase()
      )
    }

    const gradosSet = new Set()
    estudiantesParaGrados.forEach(s => {
      if (s.grade_name) {
        gradosSet.add(s.grade_name)
      }
    })

    // Ordenar grados numéricamente
    const gradosArray = Array.from(gradosSet).sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.match(/\d+/)?.[0] || '0')
      return numA - numB
    })

    return [
      { value: '', label: 'Todos los grados' },
      ...gradosArray.map(grado => ({
        value: grado,
        label: grado
      }))
    ]
  }, [students, filterNivel])

  // Resetear grado cuando cambie el nivel
  const handleNivelChange = (nuevoNivel) => {
    setFilterNivel(nuevoNivel)
    setFilterGrado('') // Reset grado al cambiar nivel
  }

  // Filtrar y ordenar estudiantes usando useMemo
  const filteredStudents = useMemo(() => {
    return filterAndSortStudents(
      students,
      searchStudents,
      searchTerm,
      filterNivel,
      filterGrado,
      sortOrder
    )
  }, [students, searchStudents, searchTerm, filterNivel, filterGrado, sortOrder])

  // Calcular estadísticas
  const stats = useMemo(() => calculateStudentStats(students), [students])

  // Paginación de la tabla de estudiantes
  const studentsPagination = usePagination(
    filteredStudents,
    10,
    JSON.stringify({ searchTerm, filterNivel, filterGrado, sortOrder, showAllStudents })
  )

  // Handlers
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return

    try {
      await deleteStudent(selectedStudent.id)
      setShowDeleteConfirm(false)
      setSelectedStudent(null)
      await loadData()
    } catch (error) {
      console.error('Error deleting student:', error)
    }
  }

  const handleToggleStatus = (student, newStatus) => {
    setSelectedStudent(student)
    setStatusAction(newStatus === 'active' ? 'activate' : 'deactivate')
    setShowStatusConfirm(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedStudent || !statusAction) return

    try {
      const newStatus = statusAction === 'activate' ? 'active' : 'inactive'
      await studentsService.update(selectedStudent.id, { status: newStatus })
      setShowStatusConfirm(false)
      setSelectedStudent(null)
      setStatusAction(null)
      await loadData()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar el estado. Por favor, intente nuevamente.')
    }
  }

  const handleChangeParent = async () => {
    if (!selectedStudent || !selectedNewParent) return

    const newParent = parents.find(p => p.id === parseInt(selectedNewParent))
    const parentName = newParent?.first_names || newParent?.name || newParent?.email || 'Desconocido'
    const confirmMsg = `¿Está seguro de cambiar el apoderado del estudiante ${selectedStudent.first_names} ${selectedStudent.apellidoPaterno || selectedStudent.last_names}?\n\nNuevo apoderado: ${parentName}\n\nEsta acción quedará registrada en la auditoría del sistema.`

    if (!confirm(confirmMsg)) return

    try {
      await studentsService.changeParent(selectedStudent.id, parseInt(selectedNewParent))
      setShowChangeParentModal(false)
      setSelectedStudent(null)
      setSelectedNewParent('')
      await loadData()
      alert('Apoderado cambiado exitosamente')
    } catch (error) {
      console.error('Error al cambiar apoderado:', error)
      alert('Error al cambiar el apoderado. Por favor, intente nuevamente.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return

    try {
      await studentsService.update(selectedStudent.id, { status: 'deleted' })
      setShowDeleteConfirm(false)
      setSelectedStudent(null)
      await loadData()
    } catch (error) {
      console.error('Error al eliminar estudiante:', error)
      alert('Error al eliminar el estudiante. Por favor, intente nuevamente.')
    }
  }

  const handleExportStudents = () => {
    exportStudentsToExcel(filteredStudents)
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h1>
            {selectedAcademicYear && !showAllStudents && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800">
                {selectedAcademicYear.nombre || selectedAcademicYear.name || `Año ${selectedAcademicYear.año || selectedAcademicYear.year}`}
              </span>
            )}
            {showAllStudents && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
                Todos los años
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Administra los estudiantes del colegio</p>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAllStudents}
                onChange={(e) => setShowAllStudents(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ms-2 text-sm text-gray-600">Ver todos</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {(user?.rol === 'Director' || user?.rol === 'Secretaria') && (
            <button
              onClick={handleExportStudents}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="mr-2" size={18} />
              Exportar Excel
            </button>
          )}

          {(user?.rol === 'Director' || user?.rol === 'Secretaria') && (
            <>
              <button
                onClick={() => setShowStudentModal(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <UserPlus className="mr-2" size={18} />
                Crear Estudiante
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload className="mr-2" size={18} />
                Importar por Lote
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StudentsStatsCards stats={stats} />

      {/* Search and Filters - Niveles y grados dinámicos del año activo */}
      <StudentsFilters
        searchTerm={searchTerm}
        filterNivel={filterNivel}
        filterGrado={filterGrado}
        sortOrder={sortOrder}
        niveles={nivelesDisponibles}
        grados={gradosDisponibles}
        onSearchChange={setSearchTerm}
        onNivelChange={handleNivelChange}
        onGradoChange={setFilterGrado}
        onToggleSort={toggleSortOrder}
      />

      {/* Students Table */}
      <StudentsTable
        students={studentsPagination.pageItems}
        userRole={user?.rol}
        onView={(student) => {
          setViewingStudent(student)
          setShowViewModal(true)
        }}
        onEdit={(student) => {
          setSelectedStudent(student)
          setShowEditModal(true)
        }}
        onChangeParent={(student) => {
          setSelectedStudent(student)
          setSelectedNewParent('')
          setShowChangeParentModal(true)
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(student) => {
          setSelectedStudent(student)
          setShowDeleteConfirm(true)
        }}
      />

      <Pagination
        page={studentsPagination.page}
        totalPages={studentsPagination.totalPages}
        total={studentsPagination.total}
        from={studentsPagination.from}
        to={studentsPagination.to}
        pageSize={studentsPagination.pageSize}
        onPageChange={studentsPagination.setPage}
        onPrev={studentsPagination.prev}
        onNext={studentsPagination.next}
        onPageSizeChange={studentsPagination.setPageSize}
      />

      {/* Modals */}
      <StudentCreationModal
        isOpen={showStudentModal}
        onClose={() => {
          setShowStudentModal(false)
          loadData()
        }}
      />

      <StudentEditModal
        isOpen={showEditModal}
        student={selectedStudent}
        onClose={() => {
          setShowEditModal(false)
          setSelectedStudent(null)
          loadData()
        }}
      />

      <StudentBulkImport
        isOpen={showBulkImport}
        onClose={() => {
          setShowBulkImport(false)
          loadData()
        }}
      />

      <DeleteStudentModal
        isOpen={showDeleteConfirm}
        student={selectedStudent}
        onClose={() => {
          setShowDeleteConfirm(false)
          setSelectedStudent(null)
        }}
        onConfirm={handleConfirmDelete}
      />

      <ChangeParentModal
        isOpen={showChangeParentModal}
        student={selectedStudent}
        parents={parents}
        selectedNewParent={selectedNewParent}
        onClose={() => {
          setShowChangeParentModal(false)
          setSelectedStudent(null)
          setSelectedNewParent('')
        }}
        onParentChange={setSelectedNewParent}
        onConfirm={handleChangeParent}
      />

      <ViewStudentModal
        isOpen={showViewModal}
        student={viewingStudent}
        onClose={() => {
          setShowViewModal(false)
          setViewingStudent(null)
        }}
        onEdit={() => {
          setShowViewModal(false)
          setSelectedStudent(viewingStudent)
          setViewingStudent(null)
          setShowEditModal(true)
        }}
      />

      {/* Modal de confirmación de cambio de estado */}
      {showStatusConfirm && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {statusAction === 'activate' ? '¿Activar estudiante?' : '¿Desactivar estudiante?'}
            </h3>

            <p className="text-gray-600 mb-2">
              Estudiante: <span className="font-semibold">{selectedStudent.first_names} {selectedStudent.apellidoPaterno || selectedStudent.last_names}</span>
            </p>

            <p className="text-sm text-gray-500 mb-6">
              {statusAction === 'activate'
                ? 'El estudiante volverá a estar activo en el sistema y podrá acceder a todos los servicios.'
                : 'El estudiante quedará inactivo y no podrá acceder a los servicios hasta que sea reactivado.'
              }
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowStatusConfirm(false)
                  setSelectedStudent(null)
                  setStatusAction(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  statusAction === 'activate'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {statusAction === 'activate' ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentsManagementPage
