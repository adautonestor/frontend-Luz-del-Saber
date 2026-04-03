import React, { useState, useEffect } from 'react'
import { X, GraduationCap, AlertCircle, User, UserPlus, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useStudentsStore } from '../../stores/studentsStore'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useEnrollmentForm } from '../../hooks/useEnrollmentForm'
import { usePaymentSchedule } from '../../hooks/usePaymentSchedule'
import { useStudentSearch } from '../../hooks/useStudentSearch'
import StudentSearchSection from '../enrollment/StudentSearchSection'
import NewStudentForm from '../enrollment/NewStudentForm'
import AcademicAssignment from '../enrollment/AcademicAssignment'
import PaymentScheduleTable from '../enrollment/PaymentScheduleTable'
import ContractUpload from '../enrollment/ContractUpload'
import { usersService } from '../../services/usersService'

const EnrollmentModal = ({ isOpen, onClose }) => {
  const { students, enrollStudent } = useEnrollmentStore()
  const { createStudent } = useStudentsStore()
  const { initialize: initializePayments } = usePaymentsStore()
  const { initialize: initializeAcademic } = useAcademicStore()
  const [parents, setParents] = useState([])

  // Cargar padres, conceptos de pago y estructura académica cuando el modal se abre
  useEffect(() => {
    const loadData = async () => {
      if (isOpen) {
        try {
          // Cargar padres usando el endpoint específico por rol
          const parentsData = await usersService.getByRole('Padre') || []
          setParents(parentsData)

          // Inicializar store de pagos (carga conceptos, métodos, etc.)
          await initializePayments()

          // Inicializar store académico (carga niveles, grados, secciones, años lectivos)
          await initializeAcademic()
        } catch (error) {
          console.error('Error cargando datos:', error)
        }
      }
    }
    loadData()
  }, [isOpen, initializePayments, initializeAcademic])

  // Hook principal del formulario
  const formState = useEnrollmentForm(enrollStudent, createStudent, onClose, parents)

  // Función para obtener el año lectivo seleccionado del formulario
  const getSelectedAcademicYearId = () => {
    return formState.formData.anoLectivo ? parseInt(formState.formData.anoLectivo) : null
  }

  // Hook de búsqueda de estudiantes
  const searchState = useStudentSearch(
    students,
    formState.formData,
    formState.handleChange,
    formState.setSelectedParentId,
    () => {}, // setParentChildren se maneja en formState
    formState.setError, // Pasar setError para mostrar errores profesionales
    getSelectedAcademicYearId // Función para obtener año lectivo seleccionado
  )

  // Hook de cronograma de pagos
  // Obtener studentId: si es estudiante existente usa foundStudent.id, si es nuevo no tiene ID aún
  const studentIdForSchedule = formState.isNewStudent ? null : searchState.foundStudent?.id

  const scheduleState = usePaymentSchedule(
    formState.formData,
    formState.selectedParentId,
    formState.isNewStudent,
    formState.newStudentData,
    formState.parentChildren,
    studentIdForSchedule, // Pasar studentId para validar conceptos específicos
    searchState.foundStudent // Pasar foundStudent para generar cronograma incluso sin padre
  )

  // Validar si todos los campos requeridos están completos para habilitar el botón
  const isFormComplete = () => {
    const { anoLectivo, nivel, grado, seccion, fechaIngreso } = formState.formData

    // Campos académicos requeridos
    const academicFieldsComplete = anoLectivo && nivel && grado && seccion && fechaIngreso

    // Para estudiante existente: debe tener estudiante seleccionado y padre asignado
    if (!formState.isNewStudent) {
      return academicFieldsComplete && searchState.foundStudent && formState.selectedParentId
    }

    // Para estudiante nuevo: debe tener datos básicos del estudiante y padre seleccionado
    const { first_names, last_names, dni, parent_id } = formState.newStudentData
    const newStudentFieldsComplete = first_names && last_names && dni && parent_id

    return academicFieldsComplete && newStudentFieldsComplete
  }

  const handleClose = () => {
    onClose()
    formState.resetForm()
    searchState.setSearchStudent('')
    searchState.setFoundStudent(null)
    searchState.setStudentParent(null)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header - Fijo */}
          <div className="flex-shrink-0 border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="mr-2" size={24} />
              Matricular Estudiante
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content - Con scroll */}
          <form onSubmit={(e) => formState.handleSubmit(e, scheduleState.paymentSchedule)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Alerts */}
              {formState.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-red-700 whitespace-pre-line">{formState.error}</span>
                </div>
              )}

              {formState.success && (
                <div className="mb-4 p-6 bg-green-50 border-2 border-green-400 rounded-lg shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-800">¡Matrícula Exitosa!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        El estudiante ha sido matriculado correctamente. El modal se cerrará automáticamente...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ocultar formulario cuando hay éxito */}
              {!formState.success && (
                <>
                  {/* Selección de Estudiante */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        {formState.isNewStudent ? <UserPlus className="mr-2" size={20} /> : <User className="mr-2" size={20} />}
                        {formState.isNewStudent ? 'Datos del Nuevo Estudiante' : 'Buscar Estudiante'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          formState.toggleStudentMode()
                          searchState.setSearchStudent('')
                          searchState.setFoundStudent(null)
                          searchState.setStudentParent(null)
                        }}
                        className="text-sm px-3 py-1.5 border border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center"
                      >
                        {formState.isNewStudent ? (
                          <>
                            <User className="mr-1" size={16} />
                            Buscar Existente
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1" size={16} />
                            Crear Nuevo
                          </>
                        )}
                      </button>
                    </div>

                    {formState.isNewStudent ? (
                      <NewStudentForm
                        newStudentData={formState.newStudentData}
                        parents={parents}
                        parentChildren={formState.parentChildren}
                        handleNewStudentChange={formState.handleNewStudentChange}
                      />
                    ) : (
                      <StudentSearchSection
                        searchStudent={searchState.searchStudent}
                        showStudentDropdown={searchState.showStudentDropdown}
                        foundStudent={searchState.foundStudent}
                        studentParent={searchState.studentParent}
                        filteredStudents={searchState.filteredStudents}
                        parentChildren={formState.parentChildren}
                        setShowStudentDropdown={searchState.setShowStudentDropdown}
                        handleSelectStudent={searchState.handleSelectStudent}
                        handleClearStudent={searchState.handleClearStudent}
                        handleSearchChange={searchState.handleSearchChange}
                      />
                    )}
                  </div>

                  {/* Información Académica */}
                  <AcademicAssignment
                    formData={formState.formData}
                    availableYears={formState.availableYears}
                    handleChange={formState.handleChange}
                    studentId={searchState.foundStudent?.id}
                    studentName={searchState.foundStudent ? `${searchState.foundStudent.first_names} ${`${searchState.foundStudent.paternal_last_name || ''} ${searchState.foundStudent.maternal_last_name || ''}`.trim() || searchState.foundStudent.last_names || ''}` : null}
                  />

                  {/* Cronograma de Pagos */}
                  <PaymentScheduleTable
                    paymentSchedule={scheduleState.paymentSchedule}
                    formData={formState.formData}
                    handleScheduleAmountChange={scheduleState.handleScheduleAmountChange}
                    handleScheduleDateChange={scheduleState.handleScheduleDateChange}
                    handleScheduleExoneradoChange={scheduleState.handleScheduleExoneradoChange}
                  />

                  {/* Contrato de Matrícula */}
                  <ContractUpload
                    formData={formState.formData}
                    handleFileChange={formState.handleFileChange}
                    removeFile={formState.removeFile}
                  />
                </>
              )}
            </div>

            {/* Footer Buttons - Fijo */}
            {!formState.success && (
              <div className="flex-shrink-0 border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={formState.isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    formState.isSubmitting || !isFormComplete()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  disabled={formState.isSubmitting || !isFormComplete()}
                  title={!isFormComplete() ? 'Complete todos los campos requeridos (Año Lectivo, Nivel, Grado, Sección, Fecha de Ingreso)' : ''}
                >
                  {formState.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Matriculando...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="mr-2" size={18} />
                      Matricular Estudiante
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default EnrollmentModal
