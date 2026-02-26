import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  FileText, Users, Download, GraduationCap, BookOpen,
  Edit
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useReportCardsAdmin } from '../../hooks/useReportCardsAdmin'
import { useBehaviorEditor } from '../../hooks/useBehaviorEditor'
import { generateBoletaData } from '../../utils/reportCards'
import { downloadFinalReportCard } from '../../components/parent/FinalReportCardPDF'
import BehaviorModal from '../../components/reportCards/BehaviorModal'
import BoletaPreviewModal from '../../components/reportCards/BoletaPreviewModal'
import studentBehaviorsService from '../../services/studentBehaviorsService'

/**
 * Página de gestión de boletas de notas y conducta
 * Permite ver, exportar y gestionar comportamiento de estudiantes
 */
const ReportCardsManagementPage = () => {
  const { user } = useAuthStore()
  const location = useLocation()

  // Detectar si estamos en la ruta de conducta
  const isConductaRoute = location.pathname.includes('/conducta')

  // Hook para datos y filtros
  const {
    students,
    academicYears,
    allGrades,
    filters,
    setFilters,
    getFilteredStudents
  } = useReportCardsAdmin()

  // Hook para editor de comportamiento
  const {
    selectedStudent,
    showBehaviorModal,
    behaviorData,
    saveSuccess,
    validationErrors,
    openBehaviorModal,
    closeBehaviorModal,
    handleBimesterChange,
    handleBehaviorDataChange,
    saveBehaviorData
  } = useBehaviorEditor(filters, user)

  // Estados para modal de boleta
  const [showBoletaModal, setShowBoletaModal] = React.useState(false)
  const [boletaPreviewData, setBoletaPreviewData] = React.useState(null)

  // Estados para paginación
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  // Obtener estudiantes filtrados
  const filteredStudents = getFilteredStudents()

  // Calcular paginación
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Resetear página cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.academicYear, filters.nivel, filters.grade])

  // Get levels from store for the selected year
  const storeLevels = useAcademicStore(state => state.levels) || []
  const uniqueGrades = filters.nivel
    ? allGrades.filter(g => Number(g.level_id) === Number(filters.nivel))
    : allGrades

  // Abrir modal de boleta
  const openBoletaPreview = async (student) => {
    const year = parseInt(filters.academicYear) || new Date().getFullYear()
    const boletaData = generateBoletaData(student, year) || []

    // Cargar datos de conducta del estudiante
    const behaviors = await studentBehaviorsService.getAll() || []
    const studentBehaviors = behaviors.filter(
      b => b.student_id === student.id && b.academic_year === year
    )

    // Enriquecer el objeto student con los comportamientos
    const enrichedStudent = {
      ...student,
      studentBehaviors
    }

    // Mostrar boleta aunque no tenga calificaciones (puede tener conducta, asistencias, etc.)
    setBoletaPreviewData({ student: enrichedStudent, boletaData, year })
    setShowBoletaModal(true)
  }

  // Exportar boleta a PDF
  const exportStudentBoleta = async (student) => {
    const year = parseInt(filters.academicYear) || new Date().getFullYear()
    const boletaData = generateBoletaData(student, year) || []

    // Cargar datos de conducta del estudiante para incluir en la exportación
    const behaviors = await studentBehaviorsService.getAll() || []
    const studentBehaviors = behaviors.filter(
      b => b.student_id === student.id && b.academic_year === year
    )

    // Preparar datos del estudiante para el PDF
    const studentData = {
      first_names: student.first_names,
      last_names: student.last_names,
      gradeName: student.gradeName,
      code: student.code || '',
      dni: student.dni || '',
      studentBehaviors
    }

    // Descargar el PDF
    await downloadFinalReportCard(studentData, boletaData, year)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isConductaRoute ? 'Gestión de Conducta' : 'Gestión de Boletas'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isConductaRoute
            ? 'Registra y gestiona la disciplina y el comportamiento de los estudiantes'
            : 'Consulta, exporta boletas y registra datos de conducta de todos los estudiantes'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Grados</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueGrades.length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Año Actual</p>
              <p className="text-2xl font-semibold text-gray-900">{filters.academicYear}</p>
            </div>
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="input"
          />

          <select
            value={filters.academicYear}
            onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value, nivel: '', grade: '' }))}
            className="input"
          >
            <option value="">Año académico</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.año}>{year.name || year.año}</option>
            ))}
          </select>

          <select
            value={filters.nivel}
            onChange={(e) => setFilters(prev => ({ ...prev, nivel: e.target.value, grade: '' }))}
            className="input"
          >
            <option value="">Todos los niveles</option>
            {storeLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>

          <select
            value={filters.grade}
            onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
            className="input"
            disabled={!filters.nivel}
          >
            <option value="">Todos los grados</option>
            {uniqueGrades.map(grade => (
              <option key={grade.id} value={grade.name}>{grade.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sección
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.first_names} {student.last_names}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.dni}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.nivel ? student.nivel.charAt(0).toUpperCase() + student.nivel.slice(1) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.gradeName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.seccion || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {isConductaRoute ? (
                        <>
                          {/* Vista de Conducta - Botón principal es Registrar Conducta */}
                          <button
                            onClick={() => openBehaviorModal(student)}
                            className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                            title="Registrar conducta"
                          >
                            <Edit size={14} />
                            Registrar Conducta
                          </button>
                          <button
                            onClick={() => openBoletaPreview(student)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Ver boleta"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => exportStudentBoleta(student)}
                            className="text-green-600 hover:text-green-900"
                            title="Exportar a PDF"
                          >
                            <Download size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Vista de Boletas - Los botones de boleta son principales */}
                          <button
                            onClick={() => openBoletaPreview(student)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver boleta"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            onClick={() => exportStudentBoleta(student)}
                            className="text-green-600 hover:text-green-900"
                            title="Exportar a PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => openBehaviorModal(student)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Editar conducta"
                          >
                            <Edit size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron estudiantes con los filtros seleccionados
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredStudents.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> de{' '}
                  <span className="font-medium">{filteredStudents.length}</span> estudiantes
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    ‹
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNumber = idx + 1
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                    }
                    return null
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBehaviorModal && (
        <BehaviorModal
          isOpen={showBehaviorModal}
          onClose={closeBehaviorModal}
          student={selectedStudent}
          behaviorData={behaviorData}
          onBimesterChange={handleBimesterChange}
          onDataChange={handleBehaviorDataChange}
          onSave={saveBehaviorData}
          saveSuccess={saveSuccess}
          validationErrors={validationErrors}
        />
      )}

      {showBoletaModal && boletaPreviewData && (
        <BoletaPreviewModal
          isOpen={showBoletaModal}
          onClose={() => setShowBoletaModal(false)}
          student={boletaPreviewData.student}
          boletaData={boletaPreviewData.boletaData}
          year={boletaPreviewData.year}
        />
      )}
    </div>
  )
}

export default ReportCardsManagementPage
