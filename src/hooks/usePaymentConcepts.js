import { useState, useEffect } from 'react'
import { usePaymentsStore } from '../stores/paymentsStore'
import { useAcademicStore } from '../stores/academicStore'
import studentsService from '../services/studentsService'
import { parseDateOnly } from '../utils/dateUtils'

/**
 * Hook para gestionar conceptos de pago
 * Maneja CRUD de conceptos, filtros y validaciones
 * Integrado con APIs reales del backend
 */
export const usePaymentConcepts = () => {
  const [showConceptModal, setShowConceptModal] = useState(false)
  const [editingConcept, setEditingConcept] = useState(null)
  const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, conceptId: null, conceptName: '' })
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [conceptForm, setConceptForm] = useState({
    name: '',
    type: '',
    amount: '',
    levels: [],
    description: '',
    due_day: 30,
    applicable_months: [],
    unique_payment_date: '',
    status: 'active',
    aplicarA: 'todos',
    nivelesEspecificos: [],
    gradosEspecificos: [],
    seccionesEspecificas: [],
    specific_students: [],
    excluded_students: []
  })

  // Academic structure data from stores
  const paymentsStore = usePaymentsStore()
  const academicStore = useAcademicStore()

  // Local state for additional data
  const [estudiantes, setEstudiantes] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Initialize stores if not already loaded
      await Promise.all([
        paymentsStore.concepts.length === 0 ? paymentsStore.initialize() : Promise.resolve(),
        academicStore.levels.length === 0 ? academicStore.initialize() : Promise.resolve()
      ])

      // Load students
      const allStudents = await studentsService.getAll()
      setEstudiantes(allStudents || [])
    } catch (error) {
      console.error('Error loading payment concepts data:', error)
    }
  }

  const openConceptModal = (concept = null) => {
    if (concept) {
      setEditingConcept(concept)

      // Convertir fecha ISO a formato YYYY-MM-DD si existe
      let formattedDate = ''
      if (concept.unique_payment_date) {
        if (typeof concept.unique_payment_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(concept.unique_payment_date)) {
          formattedDate = concept.unique_payment_date
        } else {
          const date = parseDateOnly(concept.unique_payment_date) || new Date(concept.unique_payment_date)
          if (date && !isNaN(date.getTime())) {
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, '0')
            const d = String(date.getDate()).padStart(2, '0')
            formattedDate = `${y}-${m}-${d}`
          }
        }
      }

      setConceptForm({
        name: concept.name || '',
        type: concept.type || '',
        amount: (concept.amount || '').toString(),
        levels: concept.levels || [],
        description: concept.description || '',
        due_day: concept.due_day || 30,
        applicable_months: concept.applicable_months || [],
        unique_payment_date: formattedDate,
        status: concept.status || 'active',
        aplicarA: concept.aplicar_a || 'todos',
        nivelesEspecificos: concept.niveles_especificos || [],
        gradosEspecificos: concept.grados_especificos || [],
        seccionesEspecificas: concept.secciones_especificas || [],
        specific_students: concept.specific_students || [],
        excluded_students: concept.excluded_students || []
      })
    } else {
      setEditingConcept(null)
      setConceptForm({
        name: '',
        type: '',
        amount: '',
        levels: [],
        description: '',
        due_day: 30,
        applicable_months: [],
        unique_payment_date: '',
        status: 'active',
        aplicarA: 'todos',
        nivelesEspecificos: [],
        gradosEspecificos: [],
        seccionesEspecificas: [],
        specific_students: [],
        excluded_students: []
      })
    }
    setShowConceptModal(true)
  }

  const closeConceptModal = () => {
    setShowConceptModal(false)
    setEditingConcept(null)
    setConceptForm({
      name: '',
      type: '',
      amount: '',
      levels: [],
      description: '',
      due_day: 30,
      applicable_months: [],
      fechaUnica: '',
      state: 'activo',
      aplicarA: 'todos',
      nivelesEspecificos: [],
      gradosEspecificos: [],
      seccionesEspecificas: [],
      specific_students: [],
      excluded_students: []
    })
  }

  const handleConceptFormChange = (field, value) => {
    setConceptForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNivelesChange = (nivel) => {
    const levels = conceptForm.levels || []
    const newNiveles = levels.includes(nivel)
      ? levels.filter(n => n !== nivel)
      : [...levels, nivel]

    setConceptForm(prev => ({ ...prev, levels: newNiveles }))
  }

  const handleMesesAplicaChange = (mes) => {
    const meses = conceptForm.applicable_months || []
    const newMeses = meses.includes(mes)
      ? meses.filter(m => m !== mes)
      : [...meses, mes]

    setConceptForm(prev => ({ ...prev, applicable_months: newMeses }))
  }

  const handleEstudiantesExcluidosChange = (estudianteId) => {
    const estudiantes = conceptForm.excluded_students || []
    const newEstudiantes = estudiantes.includes(estudianteId)
      ? estudiantes.filter(e => e !== estudianteId)
      : [...estudiantes, estudianteId]

    setConceptForm(prev => ({ ...prev, excluded_students: newEstudiantes }))
  }

  const showToast = (type, message) => {
    setToast({ isOpen: true, type, message })
  }

  const closeToast = () => {
    setToast({ isOpen: false, type: 'info', message: '' })
  }

  const saveConcept = async () => {
    // Validation
    if (!conceptForm.name || !conceptForm.type || !conceptForm.amount) {
      showToast('warning', 'Complete todos los campos requeridos')
      return
    }

    if (conceptForm.levels.length === 0) {
      showToast('warning', 'Seleccione al menos un nivel educativo')
      return
    }

    if (conceptForm.type === 'mensualidad' && conceptForm.applicable_months.length === 0) {
      showToast('warning', 'Para mensualidades, debe seleccionar al menos un mes')
      return
    }

    if (conceptForm.type === 'unico' && !conceptForm.unique_payment_date) {
      showToast('warning', 'Para pagos únicos, debe especificar la fecha')
      return
    }

    try {
      // Obtener el año académico activo desde el store (ya viene seleccionado correctamente)
      // O buscarlo por status 'active' o state 'activo'
      const activeYear = academicStore.selectedAcademicYear ||
                         academicStore.academicYears.find(y => y.status === 'active' || y.state === 'activo') ||
                         academicStore.academicYears[0]

      console.log('[usePaymentConcepts] Año académico seleccionado:', {
        id: activeYear?.id,
        name: activeYear?.name,
        status: activeYear?.status,
        state: activeYear?.state
      })

      if (!activeYear) {
        showToast('error', 'No hay un año académico activo. Por favor, configure uno primero.')
        return
      }

      // Determinar frequency basado en type
      let frequency = 'anual' // Por defecto
      if (conceptForm.type === 'mensualidad') {
        frequency = 'mensual'
      } else if (conceptForm.type === 'unico') {
        frequency = 'anual'
      }

      const conceptData = {
        name: conceptForm.name,
        type: conceptForm.type,
        frequency: frequency,
        amount: parseFloat(conceptForm.amount),
        academic_year_id: activeYear.id,
        levels: conceptForm.levels,
        description: conceptForm.description,
        due_day: conceptForm.due_day,
        applicable_months: conceptForm.applicable_months,
        unique_payment_date: conceptForm.unique_payment_date || null,
        status: conceptForm.status,
        aplicar_a: conceptForm.aplicarA,
        niveles_especificos: conceptForm.nivelesEspecificos,
        grados_especificos: conceptForm.gradosEspecificos,
        secciones_especificas: conceptForm.seccionesEspecificas,
        specific_students: conceptForm.specific_students,
        excluded_students: conceptForm.excluded_students
      }

      if (editingConcept) {
        await paymentsStore.updatePaymentConcept(editingConcept.id, conceptData)
        setSuccessMessage('Concepto actualizado exitosamente')
      } else {
        const result = await paymentsStore.createPaymentConcept(conceptData)

        // Mensaje mejorado con conteo de obligaciones generadas
        if (result && result.obligationsGenerated > 0) {
          setSuccessMessage(
            `Concepto creado exitosamente. Se generaron ${result.obligationsGenerated} obligaciones para ${result.studentsAffected} estudiantes.`
          )
        } else if (result && result.studentsAffected === 0) {
          setSuccessMessage('Concepto creado exitosamente. No hay estudiantes matriculados que apliquen a este concepto.')
        } else {
          setSuccessMessage('Concepto creado exitosamente')
        }
      }

      // Mostrar animación de éxito
      setShowSuccessAnimation(true)

      // Esperar 3 segundos para mostrar la animación con más información, luego cerrar
      setTimeout(() => {
        setShowSuccessAnimation(false)
        closeConceptModal()
      }, 3000)
    } catch (error) {
      console.error('Error saving concept:', error)
      setErrorMessage(error.message || 'Error al guardar el concepto')
      setShowErrorAnimation(true)

      // Ocultar animación de error después de 3 segundos pero mantener modal abierto
      setTimeout(() => {
        setShowErrorAnimation(false)
      }, 3000)
    }
  }

  const openDeleteModal = (conceptId) => {
    const concept = paymentsStore.concepts.find(c => c.id === conceptId)
    setDeleteModal({ isOpen: true, conceptId, conceptName: concept?.name || '' })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, conceptId: null, conceptName: '' })
  }

  const confirmDeleteConcept = async () => {
    if (!deleteModal.conceptId) return

    try {
      await paymentsStore.deletePaymentConcept(deleteModal.conceptId)
      showToast('success', 'Concepto eliminado exitosamente')
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting concept:', error)
      showToast('error', 'Error al eliminar el concepto: ' + error.message)
    }
  }

  const toggleConceptStatus = async (conceptId) => {
    try {
      const concept = paymentsStore.concepts.find(c => c.id === conceptId)
      if (!concept) return

      const currentStatus = concept.status
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

      await paymentsStore.updatePaymentConcept(conceptId, { status: newStatus })
      showToast('success', `Concepto ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`)
    } catch (error) {
      console.error('Error toggling concept status:', error)
      showToast('error', 'Error al cambiar el estado: ' + error.message)
    }
  }

  const regenerateObligations = async (conceptId) => {
    try {
      const result = await paymentsStore.regenerateObligations(conceptId)

      showToast(
        'success',
        `Obligaciones regeneradas: ${result.obligationsDeleted} eliminadas, ${result.obligationsGenerated} nuevas creadas para ${result.studentsAffected} estudiantes`
      )
    } catch (error) {
      console.error('Error regenerating obligations:', error)
      showToast('error', 'Error al regenerar obligaciones: ' + error.message)
    }
  }

  return {
    // State
    conceptos: paymentsStore.concepts,
    showConceptModal,
    editingConcept,
    conceptForm,
    levels: academicStore.levels,
    grados: academicStore.grades,
    secciones: academicStore.sections,
    estudiantes,
    toast,
    deleteModal,
    showSuccessAnimation,
    showErrorAnimation,
    successMessage,
    errorMessage,
    // Actions
    openConceptModal,
    closeConceptModal,
    handleConceptFormChange,
    closeToast,
    handleNivelesChange,
    handleMesesAplicaChange,
    handleEstudiantesExcluidosChange,
    saveConcept,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteConcept,
    toggleConceptStatus,
    regenerateObligations,
    loadConceptos: loadData
  }
}
