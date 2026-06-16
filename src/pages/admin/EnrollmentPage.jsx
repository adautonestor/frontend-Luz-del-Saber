import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Users, Search, Filter, GraduationCap,
  UserCheck, UserX, Eye, Edit, Trash2, Download,
  AlertCircle, CheckCircle, Clock, XCircle, FileText, X, Paperclip, BookOpen, Calendar
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useStudentsStore } from '../../stores/studentsStore'
import { useAcademicStore } from '../../stores/academicStore'
import { matriculationService } from '../../services/matriculationService'
import { UI_TEXTS } from '../../constants/ui'
import ContractManagementModal from '../../components/admin/ContractManagementModal'
import EnrollmentModal from '../../components/admin/EnrollmentModal'
import PaymentScheduleViewerModal from '../../components/admin/PaymentScheduleViewerModal'

// Enrollment components
import StudentsTab from '../../components/enrollment/StudentsTab'
import CreateStudentModal from '../../components/enrollment/CreateStudentModal'
import EditStudentModal from '../../components/enrollment/EditStudentModal'
import EditPaymentScheduleModal from '../../components/enrollment/EditPaymentScheduleModal'
import RejectRequestModal from '../../components/enrollment/modals/RejectRequestModal'
import ViewStudentModal from '../../components/enrollment/modals/ViewStudentModal'
import ExportModal from '../../components/enrollment/modals/ExportModal'
import SuccessModal from '../../components/enrollment/modals/SuccessModal'
const EnrollmentPage = () => {
  const {
    students,
    matriculations,
    isLoading,
    error,
    filters,
    initialize,
    updateFilters,
    getEnrollmentStats,
    approveMatriculation,
    rejectMatriculation,
    clearError
  } = useEnrollmentStore()

  // Usar selector para obtener funciones específicas del studentsStore
  const updateStudent = useStudentsStore(state => state.updateStudent)

  const {
    levels,
    grades,
    sections,
    academicYears,
    getAcademicTree,
    initialize: initializeAcademic
  } = useAcademicStore()

  // Solo mostrar estudiantes, sin tabs
  const activeTab = 'students'
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleStudent, setScheduleStudent] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showContractModal, setShowContractModal] = useState(false)
  const [selectedStudentForContract, setSelectedStudentForContract] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingStudent, setViewingStudent] = useState(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showPaymentScheduleViewer, setShowPaymentScheduleViewer] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    initialize()
    initializeAcademic()
  }, [])

  // Cargar estructura académica cuando cambia el año lectivo seleccionado
  const { loadAcademicStructure } = useAcademicStore()
  useEffect(() => {
    if (filters.academic_year && academicYears.length > 0) {
      const selectedYear = academicYears.find(y => y.id === filters.academic_year)
      if (selectedYear) {
        loadAcademicStructure(selectedYear)
      }
    }
  }, [filters.academic_year, academicYears.length])

  // Función para filtrar estudiantes localmente
  const getFilteredStudents = (filters) => {
    // Solo mostrar estudiantes que tienen matrícula (academic_year_id asignado)
    let filtered = students.filter(s => s.academic_year_id)

    // Aplicar filtros
    if (filters.academic_year) {
      // Comparar con academic_year_id (ID del año lectivo)
      const yearId = parseInt(filters.academic_year)
      filtered = filtered.filter(s =>
        s.academic_year_id === yearId ||
        parseInt(s.academic_year_id) === yearId
      )
    }
    if (filters.level) {
      // Convertir a número para comparar con level_id
      const levelId = parseInt(filters.level)
      filtered = filtered.filter(s =>
        s.level_id === levelId ||
        parseInt(s.level_id) === levelId
      )
    }
    if (filters.grade) {
      const gradeId = parseInt(filters.grade)
      filtered = filtered.filter(s =>
        s.grade_id === gradeId ||
        parseInt(s.grade_id) === gradeId
      )
    }
    if (filters.section) {
      const sectionId = parseInt(filters.section)
      filtered = filtered.filter(s =>
        s.section_id === sectionId ||
        parseInt(s.section_id) === sectionId
      )
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(s =>
        s.first_names?.toLowerCase().includes(searchLower) ||
        s.last_names?.toLowerCase().includes(searchLower) ||
        s.paternal_last_name?.toLowerCase().includes(searchLower) ||
        s.maternal_last_name?.toLowerCase().includes(searchLower) ||
        s.dni?.includes(filters.search) ||
        s.code?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  // Función para enriquecer estudiantes con nombres de nivel/grado/sección
  const enrichStudentsWithNames = (students) => {
    return students.map(student => {
      // Ya vienen normalizados del servicio, solo retornar
      return {
        ...student,
        nivelNombre: student.nivelNombre || student.nivel || 'N/A',
        gradoNombre: student.gradoNombre || student.grado || 'N/A',
        seccionNombre: student.seccionNombre || student.seccion || 'N/A'
      }
    })
  }

  const rawStudents = getFilteredStudents(filters)
  const filteredStudents = enrichStudentsWithNames(rawStudents)
  const enrollmentStats = getEnrollmentStats()
  const academicTree = getAcademicTree()

  const handleSearch = (value) => {
    updateFilters({ search: value })
  }

  const handleApproveRequest = async (requestId) => {
    try {
      await approveMatriculation(requestId)
      setSuccessMessage('Solicitud aprobada exitosamente. El estudiante ha sido matriculado.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error al aprobar solicitud:', error)
      setSuccessMessage('Error al aprobar la solicitud: ' + error.message)
      setShowSuccessModal(true)
    }
  }

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await rejectMatriculation(requestId, reason)
      setShowRequestModal(false)
      setSelectedRequest(null)
      setRejectReason('')
      setSuccessMessage('Solicitud rechazada exitosamente.')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
      setSuccessMessage('Error al rechazar la solicitud: ' + error.message)
      setShowSuccessModal(true)
    }
  }

  const openRejectModal = (request) => {
    setSelectedRequest(request)
    setShowRequestModal(true)
  }

  // Filter enrollment requests (parent solicitations)
  const parentRequests = matriculations.filter(m => m.estudianteData && m.state === 'pendiente')
  const processedRequests = matriculations.filter(m => m.estudianteData && m.state !== 'pendiente')

  const getStatusColor = (status) => {
    const colors = {
      // Estados reales de estudiantes
      enrolled: 'bg-green-100 text-green-800 border-green-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      // Estados de solicitud de matrícula
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobada: 'bg-green-100 text-green-800 border-green-200',
      rechazada: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusIcon = (status) => {
    const icons = {
      // Estados reales de estudiantes
      enrolled: UserCheck,
      active: CheckCircle,
      inactive: XCircle,
      // Estados de solicitud de matrícula
      pending: Clock,
      pendiente: Clock,
      aprobada: CheckCircle,
      rechazada: XCircle
    }
    return icons[status] || CheckCircle
  }

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value })
  }

  // Abrir modal de exportación
  const handleExport = () => {
    setShowExportModal(true)
  }

  // Función para exportar estudiantes a Excel
  const doExport = () => {
    try {
      // Formatear datos para Excel
      const exportData = filteredStudents.map(student => ({
        'Código': student.code || '',
        'Apellidos': `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || '',
        'Nombres': student.first_names || '',
        'DNI': student.dni || '',
        'Fecha Nacimiento': student.fechaNacimiento ? new Date(student.fechaNacimiento).toLocaleDateString('es-PE') : '',
        'Sexo': student.sexo === 'M' ? 'Masculino' : 'Femenino',
        'Teléfono': student.telefono || '',
        'Dirección': student.direccion || '',
        'Nivel': student.nivel || '',
        'Grado': student.grado || '',
        'Sección': student.seccion || '',
        'Año Escolar': student.academic_year || filters.academic_year || '',
        'Estado': student.state ? student.state.charAt(0).toUpperCase() + student.state.slice(1) : '',
        'Contrato': student.contratoAdjunto ? 'Sí' : 'No'
      }))

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Código
        { wch: 20 }, // Apellidos
        { wch: 20 }, // Nombres
        { wch: 10 }, // DNI
        { wch: 15 }, // Fecha Nac
        { wch: 10 }, // Sexo
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Dirección
        { wch: 12 }, // Nivel
        { wch: 8 },  // Grado
        { wch: 10 }, // Sección
        { wch: 12 }, // Año Escolar
        { wch: 10 }, // Estado
        { wch: 10 }  // Contrato
      ]
      ws['!cols'] = colWidths

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0]
      const fileName = `Estudiantes_${filters.academic_year || new Date().getFullYear()}_${fecha}.xlsx`

      // Descargar archivo
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error al exportar:', error)
      alert('Error al exportar los datos. Por favor, intente nuevamente.')
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error al cargar datos</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button 
              onClick={() => { clearError(); initialize() }}
              className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
            >
              {UI_TEXTS.COMMON.TRY_AGAIN}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Obtener el año lectivo activo por defecto
  const activeYear = academicYears.find(y => y.state === 'activo' || y.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Matrícula
            </h1>
            <p className="text-gray-600 mt-1">
              Administra estudiantes, matrículas y estructura académica
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPaymentScheduleViewer(true)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Calendar size={20} />
              Ver Cronogramas
            </button>
            <button
              onClick={() => setShowEnrollmentModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <GraduationCap size={20} />
              Matricular
            </button>
            <button onClick={handleExport} className="btn btn-outline flex items-center gap-2">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Selector de Año Lectivo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-900">Año Lectivo:</span>
          </div>
          <select
            value={filters.academic_year || ''}
            onChange={(e) => handleFilterChange('academic_year', e.target.value ? parseInt(e.target.value) : '')}
            className="px-4 py-2 border border-blue-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="">Todos los años</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.year || year.año})
              </option>
            ))}
          </select>
          <div className="text-sm text-blue-700 ml-auto">
            {(() => {
              const selectedYear = academicYears.find(y => y.id === filters.academic_year)
              if (selectedYear?.state === 'activo' || selectedYear?.status === 'active') {
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">Año Activo</span>
              } else if (selectedYear) {
                return <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">{selectedYear.type || 'Regular'}</span>
              }
              return null
            })()}
          </div>
        </div>
      </div>

      {/* Cuadro Informativo del Año Lectivo */}
      {(() => {
        const selectedYear = academicYears.find(y => y.id === filters.academic_year)
        const isActive = selectedYear?.state === 'activo' || selectedYear?.status === 'active'

        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Visualizando: <span className="text-blue-600">{selectedYear ? selectedYear.name : 'Todos los años'}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedYear
                      ? `Mostrando estudiantes matriculados en ${selectedYear.name}`
                      : 'Mostrando todos los estudiantes matriculados'
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {selectedYear && (
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${
                    isActive
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-600' : 'bg-amber-600'} animate-pulse`}></div>
                    {isActive ? 'Año Activo' : selectedYear.type || 'Inactivo'}
                  </span>
                )}
                <p className="text-xs text-gray-500">
                  Estudiantes filtrados: <span className="font-semibold text-gray-700">{filteredStudents.length}</span>
                </p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredStudents.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card Inicial - siempre visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inicial</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredStudents.filter(s => {
                  const levelName = s.nivelNombre?.toLowerCase() || ''
                  return levelName === 'inicial' || levelName.includes('inicial')
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card Primaria - siempre visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Primaria</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredStudents.filter(s => {
                  const levelName = s.nivelNombre?.toLowerCase() || ''
                  return levelName === 'primaria' || levelName.includes('primaria')
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card Secundaria - siempre visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Secundaria</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredStudents.filter(s => {
                  const levelName = s.nivelNombre?.toLowerCase() || ''
                  return levelName === 'secundaria' || levelName.includes('secundaria')
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cards dinámicas para niveles adicionales (no predeterminados) */}
        {levels
          .filter(level => {
            const name = level.name?.toLowerCase() || ''
            return !name.includes('inicial') && !name.includes('primaria') && !name.includes('secundaria')
          })
          .map((level, index) => {
            const bgColors = ['bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500']
            const bgColor = bgColors[index % bgColors.length]
            const icons = [BookOpen, UserCheck, GraduationCap, Users]
            const IconComponent = icons[index % icons.length]

            const studentCount = filteredStudents.filter(s =>
              s.level_id === level.id ||
              parseInt(s.level_id) === level.id ||
              s.nivelNombre?.toLowerCase() === level.name?.toLowerCase()
            ).length

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 4) }}
                className="card p-6"
              >
                <div className="flex items-center">
                  <div className={`${bgColor} rounded-lg p-3`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{level.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {studentCount}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
      </div>

      {/* Contenido principal - Solo estudiantes */}
      <StudentsTab
        students={filteredStudents}
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        academicTree={academicTree}
        isLoading={isLoading}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
        onEditStudent={(student) => {
          setSelectedStudent(student)
          setShowEditModal(true)
        }}
        onEditSchedule={(student) => {
          setScheduleStudent(student)
          setShowScheduleModal(true)
        }}
        setSelectedStudentForContract={setSelectedStudentForContract}
        setShowContractModal={setShowContractModal}
        setViewingStudent={setViewingStudent}
        setShowViewModal={setShowViewModal}
      />


      {/* Student Edit Modal */}
      {showEditModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          academicTree={academicTree}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
            initialize() // Refresh data
          }}
        />
      )}

      {/* Payment Schedule Edit Modal */}
      {showScheduleModal && scheduleStudent && (
        <EditPaymentScheduleModal
          student={scheduleStudent}
          onClose={() => {
            setShowScheduleModal(false)
            setScheduleStudent(null)
          }}
          onSuccess={() => {
            setShowScheduleModal(false)
            setScheduleStudent(null)
            setSuccessMessage('Cronograma de pagos actualizado exitosamente')
            setShowSuccessModal(true)
            initialize()
          }}
        />
      )}

      <RejectRequestModal
        isOpen={showRequestModal}
        selectedRequest={selectedRequest}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onReject={handleRejectRequest}
        onClose={() => {
          setShowRequestModal(false)
          setSelectedRequest(null)
          setRejectReason('')
        }}
        isLoading={isLoading}
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
          setShowEditModal(true)
        }}
      />

      {/* Contract Management Modal */}
      {showContractModal && selectedStudentForContract && (
        <ContractManagementModal
          isOpen={showContractModal}
          onClose={() => {
            setShowContractModal(false)
            setSelectedStudentForContract(null)
          }}
          student={selectedStudentForContract}
          onSave={async (studentId, contractFile) => {
            try {
              // Obtener el ID del año académico del estudiante seleccionado
              const academicYearId = selectedStudentForContract.academic_year_id

              // Actualizar el contrato en la matrícula usando el servicio
              await matriculationService.updateContract(studentId, academicYearId, contractFile)

              // Recargar datos para reflejar el cambio
              await initialize()

              // Si se eliminó el contrato (contractFile === null)
              if (contractFile === null) {
                // Actualizar el estado del estudiante seleccionado para reflejar que no tiene contrato
                setSelectedStudentForContract(prev => ({
                  ...prev,
                  contratoAdjunto: null
                }))
                // Mostrar mensaje de éxito
                setSuccessMessage('Contrato eliminado exitosamente')
                setShowSuccessModal(true)
                // El modal permanece abierto para permitir subir un nuevo contrato
              } else {
                // Si se subió un archivo, cerrar el modal
                setShowContractModal(false)
                setSelectedStudentForContract(null)

                // Mostrar mensaje de éxito
                setSuccessMessage('Contrato actualizado exitosamente')
                setShowSuccessModal(true)
              }
            } catch (error) {
              console.error('Error al actualizar contrato:', error)
              throw error // Re-lanzar el error para que el modal lo maneje
            }
          }}
        />
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <EnrollmentModal
          isOpen={showEnrollmentModal}
          onClose={() => {
            setShowEnrollmentModal(false)
            initialize() // Recargar datos después de matricular
          }}
        />
      )}

      {/* Payment Schedule Viewer Modal */}
      {showPaymentScheduleViewer && (
        <PaymentScheduleViewerModal
          isOpen={showPaymentScheduleViewer}
          onClose={() => setShowPaymentScheduleViewer(false)}
        />
      )}

      <ExportModal
        isOpen={showExportModal}
        studentsCount={filteredStudents.length}
        añoEscolar={filters.academic_year}
        onExport={doExport}
        onClose={() => setShowExportModal(false)}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  )
}

export default EnrollmentPage
