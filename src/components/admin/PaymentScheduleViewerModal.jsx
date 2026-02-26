import React, { useState, useEffect, useMemo } from 'react'
import { X, Calendar, AlertCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  loadEnrolledStudents,
  searchStudentByDni,
  filterStudentsByDni,
  filterStudentsByName,
  loadFamilyPaymentSchedule,
  loadParentInfo,
  getValidPayments,
  calculatePaymentTotals,
  togglePaymentExemption,
  exportScheduleToExcel,
  formatStudentFullName
} from '../../utils/paymentScheduleHelpers.jsx'
import { INFO_MESSAGES } from '../../config/paymentScheduleConstants'
import PaymentScheduleSearch from './PaymentScheduleSearch'
import PaymentScheduleStudentInfo from './PaymentScheduleStudentInfo'
import PaymentScheduleTable from './PaymentScheduleTable'
import PaymentScheduleSummary from './PaymentScheduleSummary'
import PaymentExemptionConfirmModal from './PaymentExemptionConfirmModal'
import { studentsService } from '../../services/studentsService'
import { paymentsService } from '../../services/paymentsService'
import { usersService } from '../../services/usersService'

/**
 * Modal principal de visualización de cronogramas de pago
 * Permite buscar estudiantes y ver/exportar sus cronogramas familiares
 */
const PaymentScheduleViewerModal = ({ isOpen, onClose }) => {
  // Estados de datos
  const [students, setStudents] = useState([])
  const [allObligations, setAllObligations] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentSchedule, setPaymentSchedule] = useState([])
  const [parentStudents, setParentStudents] = useState([])
  const [studentParent, setStudentParent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Estados de búsqueda
  const [searchDni, setSearchDni] = useState('')
  const [searchName, setSearchName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDniDropdown, setShowDniDropdown] = useState(false)

  // Estados de modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPayment, setPendingPayment] = useState(null)

  // Cargar estudiantes y obligaciones al abrir el modal
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        setIsLoading(true)
        try {
          // Cargar todas las obligaciones de pago primero
          const obligationsResponse = await paymentsService.getAllObligations()
          const obligations = obligationsResponse?.data || obligationsResponse || []
          setAllObligations(obligations)

          // Cargar TODOS los estudiantes (incluidos históricos)
          // Para cronogramas necesitamos ver deudas de años cerrados también
          const studentsResponse = await studentsService.getAll()
          const allStudents = studentsResponse?.data || studentsResponse || []

          // Obtener IDs de estudiantes que tienen obligaciones de pago
          const studentIdsWithObligations = new Set(obligations.map(o => o.student_id))

          // Incluir todos los estudiantes que:
          // 1. Están activos/matriculados O
          // 2. Tienen obligaciones de pago (deudas históricas)
          const studentsForSchedule = allStudents.filter(s => {
            const isActive = s.status === 'active' || s.status === 'activo' || s.estado === 'activo'
            const hasObligations = studentIdsWithObligations.has(s.id)
            return isActive || hasObligations
          })

          setStudents(studentsForSchedule)
        } catch (error) {
          console.error('Error al cargar datos:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadData()
  }, [isOpen])

  // Filtrar estudiantes por nombre usando useMemo
  const filteredStudents = useMemo(() => {
    return filterStudentsByName(students, searchName)
  }, [students, searchName])

  // Filtrar estudiantes por DNI usando useMemo
  const filteredByDni = useMemo(() => {
    return filterStudentsByDni(students, searchDni)
  }, [students, searchDni])

  // Calcular pagos válidos y totales usando useMemo
  const validPayments = useMemo(() => {
    return getValidPayments(paymentSchedule)
  }, [paymentSchedule])

  const { totalAmount, paidAmount, pendingAmount, exemptCount } = useMemo(() => {
    return calculatePaymentTotals(validPayments)
  }, [validPayments])

  // Manejadores de búsqueda
  const handleSearchByDni = async (dni) => {
    setSearchDni(dni)
    setSearchName('')
    setShowDropdown(false)

    if (dni.length >= 1) {
      // Mostrar dropdown con opciones filtradas
      setShowDniDropdown(true)

      // Si el DNI coincide exactamente con un estudiante, seleccionarlo automáticamente
      const exactMatch = searchStudentByDni(students, dni)
      if (exactMatch) {
        await selectStudent(exactMatch)
        setShowDniDropdown(false)
      }
    } else {
      setShowDniDropdown(false)
      clearSelection()
    }
  }

  const handleSearchByName = (name) => {
    setSearchName(name)
    setSearchDni('')
    setShowDropdown(true)
    setShowDniDropdown(false)
  }

  // Función común para seleccionar un estudiante
  const selectStudent = async (student) => {
    setSelectedStudent(student)

    const { schedule, siblings } = loadFamilyPaymentSchedule(students, allObligations, student.id)
    setPaymentSchedule(schedule)
    setParentStudents(siblings)

    // Cargar info del padre si existe
    let parentId = null

    if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
      parentId = student.parents[0]?.id || student.parents[0]?.user_id
    }

    if (parentId) {
      try {
        const parentInfo = await usersService.getById(parentId)
        setStudentParent(parentInfo?.data || parentInfo || null)
      } catch (error) {
        console.error('Error al cargar info del padre:', error)
        setStudentParent(null)
      }
    } else {
      setStudentParent(null)
    }
  }

  const handleSelectStudent = async (student) => {
    setSearchName(formatStudentFullName(student))
    setShowDropdown(false)
    setShowDniDropdown(false)
    await selectStudent(student)
  }

  const handleSelectStudentByDni = async (student) => {
    setSearchDni(student.dni)
    setShowDropdown(false)
    setShowDniDropdown(false)
    await selectStudent(student)
  }

  const handleClearSearch = () => {
    setSearchName('')
    setSearchDni('')
    clearSelection()
    setShowDropdown(false)
    setShowDniDropdown(false)
  }

  const clearSelection = () => {
    setSelectedStudent(null)
    setPaymentSchedule([])
    setParentStudents([])
    setStudentParent(null)
  }

  // Manejadores de exoneración
  const handleToggleExonerado = (paymentId) => {
    const payment = paymentSchedule.find(p => p.id === paymentId)
    if (!payment) return

    setPendingPayment(payment)
    setShowConfirmModal(true)
  }

  const confirmToggleExonerado = async () => {
    if (!pendingPayment) return

    try {
      // Actualizar en el backend
      const newExoneradoStatus = !pendingPayment.exonerado
      await paymentsService.updateObligation(pendingPayment.id, {
        exonerado: newExoneradoStatus,
        status: newExoneradoStatus ? 'exonerado' : 'pending'
      })

      // Actualizar estado local
      setPaymentSchedule(prev =>
        prev.map(p =>
          p.id === pendingPayment.id
            ? { ...p, exonerado: newExoneradoStatus, status: newExoneradoStatus ? 'exonerado' : 'pending' }
            : p
        )
      )
    } catch (error) {
      console.error('Error al actualizar exoneración:', error)
      alert('Error al actualizar el estado de exoneración')
    }

    setShowConfirmModal(false)
    setPendingPayment(null)
  }

  const cancelToggleExonerado = () => {
    setShowConfirmModal(false)
    setPendingPayment(null)
  }

  // Manejador de exportación a Excel
  const handleExportExcel = () => {
    exportScheduleToExcel({
      selectedStudent,
      validPayments,
      parentStudents,
      studentParent,
      totalAmount,
      paidAmount,
      pendingAmount,
      exemptCount
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <Calendar className="text-white" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">Cronogramas de Pagos</h2>
                <p className="text-blue-100 text-sm">Visualiza y exporta cronogramas de estudiantes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Cargando datos...</p>
              </div>
            )}

            {/* Search Component */}
            {!isLoading && (
              <>
                <PaymentScheduleSearch
                  searchDni={searchDni}
                  searchName={searchName}
                  filteredStudents={filteredStudents}
                  filteredByDni={filteredByDni}
                  showDropdown={showDropdown}
                  showDniDropdown={showDniDropdown}
                  students={students}
                  onSearchByDni={handleSearchByDni}
                  onSearchByName={handleSearchByName}
                  onSelectStudent={handleSelectStudent}
                  onSelectStudentByDni={handleSelectStudentByDni}
                  onClearSearch={handleClearSearch}
                  setShowDropdown={setShowDropdown}
                  setShowDniDropdown={setShowDniDropdown}
                />

                {/* No student found message */}
                {!selectedStudent && (
                  (searchDni.length >= 3 && filteredByDni.length === 0) ||
                  (searchName.length >= 2 && filteredStudents.length === 0)
                ) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <AlertCircle className="mx-auto text-yellow-600 mb-2" size={32} />
                <p className="text-sm text-yellow-800">
                  {searchDni.length >= 3 ? (
                    <>No se encontró ningún estudiante con el DNI <strong>{searchDni}</strong></>
                  ) : (
                    <>No se encontró ningún estudiante con el nombre <strong>{searchName}</strong></>
                  )}
                </p>
              </div>
            )}

            {/* Student Info and Schedule */}
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Info Component */}
                <PaymentScheduleStudentInfo
                  selectedStudent={selectedStudent}
                  studentParent={studentParent}
                  parentStudents={parentStudents}
                  validPayments={validPayments}
                  onExportExcel={handleExportExcel}
                />

                {/* Payment Schedule Table or Empty State */}
                {validPayments.length > 0 ? (
                  <>
                    <PaymentScheduleTable
                      validPayments={validPayments}
                      parentStudents={parentStudents}
                      onToggleExonerado={handleToggleExonerado}
                    />

                    <PaymentScheduleSummary
                      totalAmount={totalAmount}
                      paidAmount={paidAmount}
                      pendingAmount={pendingAmount}
                      exemptCount={exemptCount}
                    />
                  </>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay cronograma de pagos
                    </h3>
                    <p className="text-gray-600">
                      {INFO_MESSAGES.noSchedule}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State - No student selected */}
            {!selectedStudent && searchDni.length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <User className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Busca un estudiante
                </h3>
                <p className="text-gray-600">
                  {INFO_MESSAGES.searchPrompt}
                </p>
              </div>
            )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>

        {/* Confirmation Modal Component */}
        <PaymentExemptionConfirmModal
          isOpen={showConfirmModal}
          payment={pendingPayment}
          onConfirm={confirmToggleExonerado}
          onCancel={cancelToggleExonerado}
        />
      </div>
    </AnimatePresence>
  )
}

export default PaymentScheduleViewerModal
