import React from 'react'
import { motion } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useStudentEnrollment } from '../../hooks/useStudentEnrollment'
import {
  StepIndicator,
  StudentSearchStep,
  AcademicEnrollmentStep,
  ParentAssignmentStep,
  EnrollmentSuccessModal
} from '../enrollment'

/**
 * Modal principal de matrícula de estudiantes
 * Proceso de 3 pasos: Búsqueda, Matrícula Académica y Asignación de Padre
 */
const StudentEnrollmentModal = ({ academicTree, onClose, onSuccess }) => {
  // Hook centralizado con toda la lógica de matrícula
  const {
    // State
    currentStep,
    searchDni,
    foundStudent,
    studentParent,
    formData,
    parentForm,
    availableParents,
    selectedParentId,
    setSelectedParentId,
    errors,
    isSubmitting,
    showSuccessModal,
    setShowSuccessModal,
    enrollmentDetails,
    // Handlers
    handleSearchByDni,
    handleChange,
    handleParentFormChange,
    addExistingParent,
    addNewParent,
    removeParent,
    // Navigation
    nextStep,
    prevStep,
    handleSubmit,
    // Helpers
    getGradesForLevel,
    getSectionsForGrade
  } = useStudentEnrollment(academicTree)

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StudentSearchStep
            searchDni={searchDni}
            handleSearchByDni={handleSearchByDni}
            foundStudent={foundStudent}
            studentParent={studentParent}
            formData={formData}
            errors={errors}
          />
        )

      case 2:
        return (
          <AcademicEnrollmentStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            academicTree={academicTree}
            getGradesForLevel={getGradesForLevel}
            getSectionsForGrade={getSectionsForGrade}
          />
        )

      case 3:
        return (
          <ParentAssignmentStep
            formData={formData}
            parentForm={parentForm}
            availableParents={availableParents}
            selectedParentId={selectedParentId}
            setSelectedParentId={setSelectedParentId}
            handleParentFormChange={handleParentFormChange}
            addExistingParent={addExistingParent}
            addNewParent={addNewParent}
            removeParent={removeParent}
            errors={errors}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Registro de Nuevo Estudiante</h2>
              <p className="text-gray-600 text-sm mt-1">
                Paso {currentStep} de 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps Indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Anterior
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancelar
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="btn btn-primary flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check size={16} />
                  )}
                  Registrar Estudiante
                </button>
              )}
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mb-6 rounded">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <EnrollmentSuccessModal
          enrollmentDetails={enrollmentDetails}
          onClose={() => {
            setShowSuccessModal(false)
            onSuccess()
          }}
        />
      )}
    </>
  )
}

export default StudentEnrollmentModal
