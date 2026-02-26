import { useState } from 'react'
import gradesService from '../services/gradesService'

/**
 * Hook para gestionar el editor de comportamiento/disciplina del estudiante
 */
export const useBehaviorEditor = (filters, user) => {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showBehaviorModal, setShowBehaviorModal] = useState(false)
  const [behaviorData, setBehaviorData] = useState({
    quarter: 1,
    disciplina: '',
    calificacionPadres: '',
    comentarios: ''
  })
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  const openBehaviorModal = async (student) => {
    setSelectedStudent(student)

    try {
      // Load existing behavior data for this student
      const behaviors = await gradesService.getAllBehaviors({
        student_id: student.id,
        academic_year: filters.academicYear
      })

      const existing = behaviors.find(b => b.quarter === 1)

      if (existing) {
        setBehaviorData({
          quarter: 1,
          disciplina: existing.discipline || existing.disciplina || '',
          calificacionPadres: existing.parent_rating || existing.calificacion_padres || '',
          comentarios: existing.comments || existing.comentarios || ''
        })
      } else {
        setBehaviorData({
          quarter: 1,
          disciplina: '',
          calificacionPadres: '',
          comentarios: ''
        })
      }
    } catch (error) {
      console.error('Error loading behavior data:', error)
      setBehaviorData({
        quarter: 1,
        disciplina: '',
        calificacionPadres: '',
        comentarios: ''
      })
    }

    setShowBehaviorModal(true)
    setValidationErrors([])
    setSaveSuccess(false)
  }

  const closeBehaviorModal = () => {
    setShowBehaviorModal(false)
    setSelectedStudent(null)
    setBehaviorData({
      quarter: 1,
      disciplina: '',
      calificacionPadres: '',
      comentarios: ''
    })
    setValidationErrors([])
    setSaveSuccess(false)
  }

  const handleBimesterChange = async (bimestre) => {
    try {
      const behaviors = await gradesService.getAllBehaviors({
        student_id: selectedStudent.id,
        academic_year: filters.academicYear,
        quarter: parseInt(bimestre)
      })

      const existing = behaviors.find(b => b.quarter === parseInt(bimestre))

      if (existing) {
        setBehaviorData({
          quarter: parseInt(bimestre),
          disciplina: existing.discipline || existing.disciplina || '',
          calificacionPadres: existing.parent_rating || existing.calificacion_padres || '',
          comentarios: existing.comments || existing.comentarios || ''
        })
      } else {
        setBehaviorData({
          quarter: parseInt(bimestre),
          disciplina: '',
          calificacionPadres: '',
          comentarios: ''
        })
      }
    } catch (error) {
      console.error('Error loading behavior for bimester:', error)
      setBehaviorData({
        quarter: parseInt(bimestre),
        disciplina: '',
        calificacionPadres: '',
        comentarios: ''
      })
    }
  }

  const handleBehaviorDataChange = (newData) => {
    setBehaviorData(newData)
  }

  const saveBehaviorData = async () => {
    if (!selectedStudent) return

    setValidationErrors([])

    try {
      // Obtener año académico actual si no está en filters
      const currentYear = parseInt(filters.academicYear) || new Date().getFullYear()

      // Prepare data to save
      const dataToSave = {
        student_id: selectedStudent.id,
        quarter: behaviorData.quarter || 1,
        academic_year: currentYear,
        disciplina: behaviorData.disciplina || null,
        calificacion_padres: behaviorData.calificacionPadres || null,
        comentarios: behaviorData.comentarios || null,
        grading_system: selectedStudent.gradingSystem || 'literal',
        registrado_por: user?.id || null
      }

      console.log('📤 Enviando datos de conducta:', dataToSave)

      // Check if record already exists
      const behaviors = await gradesService.getAllBehaviors({
        student_id: selectedStudent.id,
        quarter: dataToSave.quarter,
        academic_year: currentYear
      })

      const existing = behaviors.find(b =>
        b.student_id === selectedStudent.id &&
        b.quarter === dataToSave.quarter &&
        b.academic_year === currentYear
      )

      if (existing) {
        // Update existing record
        console.log('📝 Actualizando registro existente:', existing.id)
        await gradesService.updateBehavior(existing.id, dataToSave)
      } else {
        // Create new record
        console.log('📝 Creando nuevo registro')
        await gradesService.createBehavior(dataToSave)
      }

      // Show success message briefly then close modal
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        closeBehaviorModal()
      }, 1500)
    } catch (error) {
      console.error('Error saving behavior data:', error)
      setValidationErrors([error.message || 'Error al guardar los datos de comportamiento'])
    }
  }

  return {
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
  }
}
