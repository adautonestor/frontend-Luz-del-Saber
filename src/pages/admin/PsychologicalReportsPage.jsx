/**
 * Página de gestión de informes psicológicos
 * Sistema con distribución masiva y gestión individual
 */

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Send } from 'lucide-react'
import { academicYearService } from '@/services/academic/academicYearService'
import { DEFAULT_FILTERS } from '@/config/psychologicalReportsConstants'
import {
  filterStudents,
  hasReport,
  getStudentReport,
  getReportStatsByLevel,
  getFilterOptions,
  downloadReport
} from '@/utils/psychologicalReportsHelpers'
import { psychologicalReportsService } from '@/services/psychologicalReportsService'
import { MESSAGES } from '@/config/psychologicalReportsConstants'
import { useModal } from '@/hooks/useModal'

// Componentes
import PsychReportsStatsCards from '@/components/admin/PsychReportsStatsCards'
import PsychReportsFilters from '@/components/admin/PsychReportsFilters'
import PsychReportsTable from '@/components/admin/PsychReportsTable'
import SendMassiveReportModal from '@/components/admin/SendMassiveReportModal'
import UploadIndividualReportModal from '@/components/admin/UploadIndividualReportModal'
import ViewReportModal from '@/components/admin/ViewReportModal'
import AlertModal from '@/components/common/AlertModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import studentsService from '../../services/studentsService'
import gradesService from '../../services/gradesService'
import Pagination from '@/components/common/Pagination'
import { usePagination } from '@/hooks/usePagination'

export default function PsychologicalReportsPage() {
  // Modales
  const { alertModal, showAlert, closeAlert, confirmModal, showConfirm, closeConfirm, handleConfirm } = useModal()

  // Estado de datos
  const [reports, setReports] = useState([])
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado de filtros
  const [selectedYear, setSelectedYear] = useState('')
  const [searchTerm, setSearchTerm] = useState(DEFAULT_FILTERS.searchTerm)
  const [selectedLevel, setSelectedLevel] = useState(DEFAULT_FILTERS.selectedLevel)
  const [selectedGrade, setSelectedGrade] = useState(DEFAULT_FILTERS.selectedGrade)
  const [selectedSection, setSelectedSection] = useState(DEFAULT_FILTERS.selectedSection)

  // Estado de modales
  const [showMassiveModal, setShowMassiveModal] = useState(false)
  const [showIndividualModal, setShowIndividualModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedStudentName, setSelectedStudentName] = useState('')

  // Estadísticas
  const [stats, setStats] = useState(null)

  // Obtener datos del año académico seleccionado (fechas de inicio y fin)
  const selectedYearData = useMemo(() => {
    if (!selectedYear || academicYears.length === 0) return null
    return academicYears.find(y => y.year?.toString() === selectedYear)
  }, [selectedYear, academicYears])

  // Cargar años académicos al inicio
  useEffect(() => {
    loadAcademicYears()
  }, [])

  // Cargar datos cuando cambia el año seleccionado
  useEffect(() => {
    if (selectedYear) {
      loadData()
    }
  }, [selectedYear])

  const loadAcademicYears = async () => {
    try {
      const years = await academicYearService.getAll()
      // Filtrar solo años activos o cerrados (que tienen matrículas)
      const validYears = years.filter(y => y.state === 'activo' || y.state === 'cerrado')
      setAcademicYears(validYears)

      // Establecer el año activo como seleccionado por defecto
      const activeYear = validYears.find(y => y.state === 'activo')
      if (activeYear) {
        setSelectedYear(activeYear.year?.toString())
      } else if (validYears.length > 0) {
        // Si no hay activo, usar el más reciente
        setSelectedYear(validYears[0].year?.toString())
      }
    } catch (error) {
      console.error('Error cargando años académicos:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const allReports = await psychologicalReportsService.getAll() || []
      const rawStudents = await studentsService.getAll() || []
      // Considerar activos a los que tienen activo=true o activo=undefined
      const allStudents = rawStudents.filter(s => s.activo !== false)
      const allGrades = await gradesService.getAllCompetencyGrades() || []

      setReports(allReports)
      setStudents(allStudents)
      setGrades(allGrades)

      // Calcular estadísticas
      const statistics = getReportStatsByLevel(allStudents, allReports, selectedYear)
      setStats(statistics)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Estudiantes filtrados
  const filteredStudents = filterStudents(students, {
    searchTerm,
    selectedLevel,
    selectedGrade,
    selectedSection
  })

  // Opciones de filtros
  const { levels, grades: availableGrades, sections } = getFilterOptions(
    students,
    selectedLevel,
    selectedGrade
  )

  // Paginación de la tabla de estudiantes
  const studentsPagination = usePagination(
    filteredStudents,
    10,
    JSON.stringify({ selectedYear, searchTerm, selectedLevel, selectedGrade, selectedSection })
  )

  // Handlers
  const handleOpenMassiveModal = () => {
    setShowMassiveModal(true)
  }

  const handleUploadIndividual = async (student) => {
    setSelectedStudent(student)
    setShowIndividualModal(true)
  }

  const handleMassiveSuccess = async (count) => {
    showAlert(MESSAGES.SUCCESS_MASSIVE(count), 'success', 'Éxito')
    loadData()
  }

  const handleIndividualSuccess = async () => {
    loadData()
    setShowIndividualModal(false)
    setSelectedStudent(null)
  }

  const handleViewReport = async (studentId) => {
    const report = getStudentReport(reports, studentId, selectedYear)
    if (report) {
      // Buscar nombre del estudiante
      const student = students.find(s => s.id === parseInt(studentId))
      const studentName = student
        ? `${student.first_names} ${student.last_names || student.apellidoPaterno || ''}`
        : ''

      setSelectedReport(report)
      setSelectedStudentName(studentName)
      setShowViewModal(true)
    }
  }

  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedReport(null)
    setSelectedStudentName('')
  }

  const handleDownloadReport = async (studentId) => {
    const report = getStudentReport(reports, studentId, selectedYear)
    if (report) {
      downloadReport(report)
    }
  }

  const handleDeleteReport = async (studentId) => {
    showConfirm(
      MESSAGES.CONFIRM_DELETE,
      async () => {
        const report = getStudentReport(reports, studentId, selectedYear)
        if (report) {
          try {
            await psychologicalReportsService.remove(report.id)
            loadData()
            showAlert('Informe eliminado exitosamente', 'success')
          } catch (error) {
            console.error('Error al eliminar informe:', error)
            showAlert('Error al eliminar el informe', 'error')
          }
        }
      },
      {
        title: 'Eliminar Informe',
        confirmText: 'Eliminar',
        variant: 'danger'
      }
    )
  }

  const hasStudentReport = (studentId) => {
    return hasReport(reports, studentId, selectedYear)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="text-purple-600" size={36} />
              Informes Psicológicos
            </h1>
            <p className="text-gray-600">
              Gestión y distribución de informes psicológicos a estudiantes
            </p>
          </div>

          {/* Botón principal de envío masivo */}
          <button
            onClick={handleOpenMassiveModal}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <Send size={20} />
            Enviar Informe Psicológico
          </button>
        </div>

        {/* Estadísticas */}
        <PsychReportsStatsCards stats={stats} />

        {/* Filtros */}
        <PsychReportsFilters
          selectedYear={selectedYear}
          searchTerm={searchTerm}
          selectedLevel={selectedLevel}
          selectedGrade={selectedGrade}
          selectedSection={selectedSection}
          academicYears={academicYears.map(y => y.year)}
          levels={levels}
          grades={availableGrades}
          sections={sections}
          onYearChange={setSelectedYear}
          onSearchChange={setSearchTerm}
          onLevelChange={setSelectedLevel}
          onGradeChange={setSelectedGrade}
          onSectionChange={setSelectedSection}
        />

        {/* Tabla de estudiantes */}
        <PsychReportsTable
          students={studentsPagination.pageItems}
          loading={loading}
          hasReport={hasStudentReport}
          onViewReport={handleViewReport}
          onDownloadReport={handleDownloadReport}
          onDeleteReport={handleDeleteReport}
          onUploadReport={handleUploadIndividual}
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

        {/* Resumen */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>
      </motion.div>

      {/* Modal de envío masivo */}
      {showMassiveModal && (
        <SendMassiveReportModal
          isOpen={showMassiveModal}
          onClose={() => setShowMassiveModal(false)}
          onSuccess={handleMassiveSuccess}
          students={students}
          grades={grades}
          selectedYear={selectedYear}
          yearStartDate={selectedYearData?.fechaInicio}
          yearEndDate={selectedYearData?.fechaFin}
        />
      )}

      {/* Modal de subida individual */}
      {showIndividualModal && selectedStudent && (
        <UploadIndividualReportModal
          student={selectedStudent}
          year={selectedYear}
          yearStartDate={selectedYearData?.fechaInicio}
          yearEndDate={selectedYearData?.fechaFin}
          onClose={() => {
            setShowIndividualModal(false)
            setSelectedStudent(null)
          }}
          onSuccess={handleIndividualSuccess}
        />
      )}

      {/* Modal de visualización de informe */}
      <ViewReportModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        report={selectedReport}
        studentName={selectedStudentName}
        onDownload={() => {
          if (selectedReport) {
            downloadReport(selectedReport)
          }
        }}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
      />
    </div>
  )
}
