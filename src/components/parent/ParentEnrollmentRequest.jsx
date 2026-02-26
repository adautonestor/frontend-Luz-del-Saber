import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Send, AlertCircle, X } from 'lucide-react'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useAuthStore } from '../../stores/authStore'
import { ENROLLMENT_TABS, INITIAL_FORM_DATA } from '../../config/enrollmentConstants'
import { validateEnrollmentForm } from '../../utils/enrollmentValidation'
import EnrollmentProgressSteps from './EnrollmentProgressSteps'
import EnrollmentPersonalDataForm from './EnrollmentPersonalDataForm'
import EnrollmentAcademicForm from './EnrollmentAcademicForm'
import EnrollmentConfirmation from './EnrollmentConfirmation'
import EnrollmentRequestsList from './EnrollmentRequestsList'

/**
 * Componente principal para solicitudes de matrícula de padres
 * Permite crear nuevas solicitudes y ver el historial de solicitudes anteriores
 */
const ParentEnrollmentRequest = () => {
  const { user } = useAuthStore()
  const {
    createMatriculation,
    matriculations,
    isLoading: enrollmentLoading,
    error: enrollmentError,
    clearError,
    initialize: initializeEnrollment
  } = useEnrollmentStore()

  const {
    getAcademicTree,
    isLoading: academicLoading,
    initialize: initializeAcademic
  } = useAcademicStore()

  const [activeTab, setActiveTab] = useState('new')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [formErrors, setFormErrors] = useState({})
  const [academicTree, setAcademicTree] = useState([])
  const [parentRequests, setParentRequests] = useState([])

  useEffect(() => {
    initializeEnrollment()
    initializeAcademic()
  }, [])

  useEffect(() => {
    const tree = getAcademicTree()
    setAcademicTree(tree)
  }, [getAcademicTree])

  useEffect(() => {
    if (user?.id) {
      const requests = matriculations.filter(m => m.solicitanteId === user.id)
      setParentRequests(requests)
    }
  }, [matriculations, user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLevelChange = (levelId) => {
    const level = academicTree.find(l => l.id === levelId)
    setFormData(prev => ({
      ...prev,
      nivel: level?.name || '',
      grado: '',
      seccion: ''
    }))
  }

  const handleGradeChange = (gradeId) => {
    const selectedLevel = academicTree.find(l => l.name === formData.nivel)
    const grade = selectedLevel?.grades.find(g => g.id === gradeId)
    setFormData(prev => ({
      ...prev,
      grado: grade?.name || '',
      seccion: ''
    }))
  }

  const handleSectionChange = (sectionId) => {
    const selectedLevel = academicTree.find(l => l.name === formData.nivel)
    const selectedGrade = selectedLevel?.grades.find(g => g.name === formData.grado)
    const section = selectedGrade?.sections.find(s => s.id === sectionId)
    setFormData(prev => ({
      ...prev,
      seccion: section?.name || ''
    }))
  }

  const handleSubmitRequest = async () => {
    const errors = validateEnrollmentForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) return

    try {
      const requestData = {
        estudianteData: {
          first_names: formData.first_names,
          last_names: formData.last_names,
          dni: formData.dni,
          fechaNacimiento: formData.fechaNacimiento,
          genero: formData.genero,
          direccion: formData.direccion,
          telefono: formData.telefono,
          email: formData.email
        },
        nivel: formData.nivel,
        grado: formData.grado,
        seccion: formData.seccion,
        observations: formData.observations,
        solicitanteId: user.id,
        academic_year: new Date().getFullYear(),
        state: 'pendiente'
      }

      await createMatriculation(requestData)

      setFormData(INITIAL_FORM_DATA)
      setCurrentStep(1)
      setActiveTab('history')

      alert('Solicitud de matrícula enviada exitosamente')
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      alert('Error al enviar la solicitud: ' + error.message)
    }
  }

  const getSelectedLevel = () => academicTree.find(l => l.name === formData.nivel)
  const getSelectedGrade = () => {
    const level = getSelectedLevel()
    return level?.grades.find(g => g.name === formData.grado)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitud de Matrícula</h1>
            <p className="text-gray-600">Registra tu solicitud de matrícula para el nuevo año escolar</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {ENROLLMENT_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'new' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Progress Steps */}
              <EnrollmentProgressSteps currentStep={currentStep} />

              {/* Step Content */}
              {currentStep === 1 && (
                <EnrollmentPersonalDataForm
                  formData={formData}
                  formErrors={formErrors}
                  onInputChange={handleInputChange}
                />
              )}

              {currentStep === 2 && (
                <EnrollmentAcademicForm
                  formData={formData}
                  formErrors={formErrors}
                  academicTree={academicTree}
                  onInputChange={handleInputChange}
                  onLevelChange={handleLevelChange}
                  onGradeChange={handleGradeChange}
                  onSectionChange={handleSectionChange}
                  getSelectedLevel={getSelectedLevel}
                  getSelectedGrade={getSelectedGrade}
                />
              )}

              {currentStep === 3 && (
                <EnrollmentConfirmation formData={formData} />
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitRequest}
                    disabled={enrollmentLoading}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {enrollmentLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Enviar Solicitud
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <EnrollmentRequestsList
              requests={parentRequests}
              onCreateNew={() => setActiveTab('new')}
            />
          )}
        </div>
      </div>

      {/* Error Display */}
      {enrollmentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700">{enrollmentError}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentEnrollmentRequest
