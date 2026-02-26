import { useState, useEffect } from 'react'
import studentsService from '../services/studentsService'
import { usersService } from '../services/usersService'
import { useEnrollmentStore } from '../stores/enrollmentStore'
import { CredentialGenerator } from '../utils/credentialGenerator'
import { getTodayLima } from '../utils/dateUtils'

/**
 * Hook principal para gestionar matrícula de estudiantes
 * Integrado con APIs reales del backend
 */
export const useStudentEnrollment = (academicTree) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [availableStudents, setAvailableStudents] = useState([])
  const [availableParents, setAvailableParents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [parentChildren, setParentChildren] = useState([])
  const [searchDni, setSearchDni] = useState('')
  const [foundStudent, setFoundStudent] = useState(null)
  const [studentParent, setStudentParent] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [enrollmentDetails, setEnrollmentDetails] = useState(null)
  const [parentCredentials, setParentCredentials] = useState(null)

  const enrollmentStore = useEnrollmentStore()

  const [formData, setFormData] = useState({
    studentId: '',
    first_names: '',
    last_names: '',
    dni: '',
    codigoBarras: '',
    fechaNacimiento: '',
    genero: '',
    direccion: '',
    telefono: '',
    email: '',
    nivel: '',
    grado: '',
    seccion: '',
    anoLectivo: new Date().getFullYear().toString(),
    fechaIngreso: getTodayLima(),
    padre: null,
    observations: ''
  })

  const [parentForm, setParentForm] = useState({
    name: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    dni: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
    relacion: 'padre'
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      // Cargar padres
      await refreshAvailableParents()

      // Cargar estudiantes sin matricular
      const allStudents = await studentsService.getAll()
      const unenrolledStudents = allStudents.filter(s => !s.nivel && !s.grado)
      setAvailableStudents(unenrolledStudents)
    } catch (error) {
      console.error('Error loading initial data:', error)
    }
  }

  // Función para refrescar la lista de padres disponibles
  const refreshAvailableParents = async () => {
    try {
      const parents = await usersService.getByRole('padre')
      setAvailableParents(parents.filter(p => (p.state || p.status) === 'activo'))
      return parents
    } catch (error) {
      console.error('Error refreshing parents:', error)
      throw error
    }
  }

  const handleSearchByDni = async (dni) => {
    setSearchDni(dni)
    if (dni.length >= 8) {
      try {
        const students = await studentsService.getByDni(dni)
        const student = students && students[0]

        if (student && !student.nivel && !student.grado) {
          setFoundStudent(student)
          setSelectedStudentId(student.id)

          // Combinar apellidos
          const apellidosCompletos = student.last_names ||
            [student.apellido_paterno || student.apellidoPaterno,
             student.apellido_materno || student.apellidoMaterno]
              .filter(Boolean)
              .join(' ') || ''

          setFormData(prev => ({
            ...prev,
            studentId: student.id,
            first_names: student.first_names || student.names || '',
            last_names: apellidosCompletos,
            dni: student.dni || '',
            codigoBarras: student.codigo_barras || student.codigoBarras || '',
            fechaNacimiento: student.fecha_nacimiento || student.fechaNacimiento || '',
            genero: student.sexo || student.genero || student.gender || '',
            direccion: student.direccion || student.address || '',
            telefono: student.telefono || student.phone || '',
            email: student.email || ''
          }))

          // Buscar padre si existe
          // Primero intentar obtener del campo parents (JSON array)
          let padreId = null
          if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
            const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
            padreId = primaryParent.user_id
          }
          // Fallback a campos antiguos si existen
          if (!padreId) {
            padreId = student.parent_id || student.parentId
          }

          if (padreId) {
            try {
              const parent = await usersService.getById(padreId)
              if (parent && (parent.rol || parent.role) === 'padre') {
                setStudentParent(parent)
                setSelectedParentId(padreId)
                setFormData(prev => ({
                  ...prev,
                  padre: {
                    id: parent.id,
                    name: parent.name || parent.name,
                    apellidoPaterno: parent.apellido_paterno || parent.apellidoPaterno || '',
                    apellidoMaterno: parent.apellido_materno || parent.apellidoMaterno || '',
                    dni: parent.dni,
                    telefono: parent.telefono || parent.phone,
                    direccion: parent.direccion || parent.address,
                    ocupacion: parent.ocupacion || parent.occupation,
                    relacion: parent.parentesco || 'padre',
                    type: 'existing'
                  }
                }))
              }
            } catch (error) {
              console.error('Error loading parent:', error)
            }
          }
        } else {
          setFoundStudent(null)
          setStudentParent(null)
          setSelectedStudentId('')
        }
      } catch (error) {
        console.error('Error searching student by DNI:', error)
        setFoundStudent(null)
        setStudentParent(null)
        setSelectedStudentId('')
      }
    } else {
      setFoundStudent(null)
      setStudentParent(null)
      setSelectedStudentId('')
    }
  }

  const handleParentSelect = async (e) => {
    const parentId = e.target.value
    setSelectedParentId(parentId)
    setSelectedStudentId('')
    setParentChildren([])

    if (parentId) {
      try {
        // Buscar estudiantes del padre que no estén matriculados
        const allStudents = await studentsService.getAll()
        const children = allStudents.filter(s => {
          // Buscar en campo parents (JSON array)
          let studentParentId = null
          if (s.parents && Array.isArray(s.parents) && s.parents.length > 0) {
            const primaryParent = s.parents.find(p => p.is_primary) || s.parents[0]
            studentParentId = primaryParent.user_id
          }
          // Fallback a campos antiguos
          if (!studentParentId) {
            studentParentId = s.parent_id || s.parentId
          }

          const hasParent = studentParentId === parentId
          const notEnrolled = !s.nivel && !s.grado
          return hasParent && notEnrolled
        })
        setParentChildren(children)
      } catch (error) {
        console.error('Error loading parent children:', error)
        setParentChildren([])
      }
    } else {
      resetForm()
    }
  }

  const handleStudentSelect = async (e) => {
    const studentId = e.target.value
    setSelectedStudentId(studentId)

    if (studentId) {
      const student = parentChildren.find(s => s.id === studentId)
      if (student) {
        // Combinar apellidos
        const apellidosCompletos = student.last_names ||
          [student.apellido_paterno || student.apellidoPaterno,
           student.apellido_materno || student.apellidoMaterno]
            .filter(Boolean)
            .join(' ') || ''

        setFormData(prev => ({
          ...prev,
          studentId: student.id,
          first_names: student.first_names || student.names || '',
          last_names: apellidosCompletos,
          dni: student.dni || '',
          codigoBarras: student.codigo_barras || student.codigoBarras || '',
          fechaNacimiento: student.fecha_nacimiento || student.fechaNacimiento || '',
          genero: student.sexo || student.genero || student.gender || '',
          direccion: student.direccion || student.address || '',
          telefono: student.telefono || student.phone || '',
          email: student.email || ''
        }))

        // Cargar padre si existe
        // Primero intentar obtener del campo parents (JSON array)
        let padreId = null
        if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
          const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
          padreId = primaryParent.user_id
        }
        // Fallback a campos antiguos si existen
        if (!padreId) {
          padreId = student.parent_id || student.parentId
        }

        if (padreId) {
          try {
            const parent = await usersService.getById(padreId)
            if (parent) {
              setFormData(prev => ({
                ...prev,
                padre: {
                  id: parent.id,
                  name: parent.name || parent.name,
                  apellidoPaterno: parent.apellido_paterno || parent.apellidoPaterno || '',
                  apellidoMaterno: parent.apellido_materno || parent.apellidoMaterno || '',
                  dni: parent.dni,
                  telefono: parent.telefono || parent.phone,
                  direccion: parent.direccion || parent.address,
                  ocupacion: parent.ocupacion || parent.occupation,
                  relacion: parent.parentesco || 'padre',
                  type: 'existing'
                }
              }))
            }
          } catch (error) {
            console.error('Error loading parent:', error)
          }
        }
      }
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      first_names: '',
      last_names: '',
      dni: '',
      codigoBarras: '',
      fechaNacimiento: '',
      genero: '',
      direccion: '',
      telefono: '',
      email: '',
      nivel: '',
      grado: '',
      seccion: '',
      anoLectivo: new Date().getFullYear().toString(),
      fechaIngreso: getTodayLima(),
      padre: null,
      observations: ''
    })
  }

  const handleChange = async (e) => {
    const { name, value } = e.target

    // Para el campo DNI, solo permitir números
    if (name === 'dni') {
      const numericValue = value.replace(/\D/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue }))

      // Validación en tiempo real del DNI
      if (numericValue.length === 8) {
        try {
          const existingStudents = await studentsService.getByDni(numericValue)
          if (existingStudents && existingStudents.length > 0) {
            setErrors(prev => ({ ...prev, dni: 'Ya existe un estudiante con este DNI' }))
          } else {
            setErrors(prev => ({ ...prev, dni: '' }))
          }
        } catch (error) {
          console.error('Error validating DNI:', error)
        }
      } else if (errors.dni) {
        setErrors(prev => ({ ...prev, dni: '' }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }))
      }
    }
  }

  const handleParentFormChange = (e) => {
    const { name, value } = e.target
    setParentForm(prev => ({ ...prev, [name]: value }))
  }

  const addExistingParent = async () => {
    if (!selectedParentId) return

    try {
      const parent = await usersService.getById(selectedParentId)
      if (parent) {
        setFormData(prev => ({
          ...prev,
          padre: {
            id: parent.id,
            name: parent.name || parent.name,
            apellidoPaterno: parent.apellido_paterno || parent.apellidoPaterno,
            apellidoMaterno: parent.apellido_materno || parent.apellidoMaterno,
            telefono: parent.telefono || parent.phone,
            email: parent.email,
            relacion: 'padre',
            type: 'existing'
          }
        }))
        setSelectedParentId('')
      }
    } catch (error) {
      console.error('Error adding existing parent:', error)
    }
  }

  const addNewParent = () => {
    if (!parentForm.name || !parentForm.apellidoPaterno || !parentForm.dni) {
      alert('Complete los campos requeridos del padre/tutor')
      return
    }

    const newParent = {
      ...parentForm,
      id: `temp-${Date.now()}`,
      type: 'new'
    }

    setFormData(prev => ({
      ...prev,
      padre: newParent
    }))

    // Reset form
    setParentForm({
      name: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      dni: '',
      telefono: '',
      email: '',
      direccion: '',
      ocupacion: '',
      relacion: 'padre'
    })
  }

  const removeParent = () => {
    setFormData(prev => ({
      ...prev,
      padre: null
    }))
  }

  const getGradesForLevel = (level) => {
    const levelData = academicTree.find(l => l.name.toLowerCase() === level.toLowerCase())
    return levelData?.grades || []
  }

  const getSectionsForGrade = (level, grade) => {
    const levelData = academicTree.find(l => l.name.toLowerCase() === level.toLowerCase())
    const gradeData = levelData?.grades?.find(g => g.name === grade)
    return gradeData?.sections || []
  }

  const validateStep = (step) => {
    const newErrors = {}
    if (step === 1 && !formData.studentId) newErrors.studentId = 'Debe seleccionar un estudiante'
    if (step === 2) {
      if (!formData.nivel) newErrors.nivel = 'Nivel es requerido'
      if (!formData.grado) newErrors.grado = 'Grado es requerido'
      if (!formData.seccion) newErrors.seccion = 'Sección es requerida'
      if (!formData.codigoBarras.trim()) newErrors.codigoBarras = 'Código de barras es requerido'
    }
    if (step === 3) {
      if (!formData.padre) newErrors.padre = 'Debe asignar un tutor'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      const newStep = Math.min(currentStep + 1, 3)
      // Refrescar padres al entrar al paso 3 para mostrar padres recién creados
      if (newStep === 3) {
        await refreshAvailableParents()
      }
      setCurrentStep(newStep)
    }
  }
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return
    setIsSubmitting(true)
    try {
      let parentId = null

      // Crear padre si es nuevo
      if (formData.padre) {
        if (formData.padre.type === 'new') {
          const credentials = CredentialGenerator.generateParentCredentials({
            first_names: formData.padre.name,
            apellidoPaterno: formData.padre.apellidoPaterno,
            apellidoMaterno: formData.padre.apellidoMaterno,
            dni: formData.padre.dni
          })

          const newParentUser = await usersService.create({
            name: formData.padre.name,
            apellido_paterno: formData.padre.apellidoPaterno,
            apellido_materno: formData.padre.apellidoMaterno,
            dni: formData.padre.dni,
            telefono: formData.padre.telefono,
            email: credentials.email,
            password: credentials.password,
            direccion: formData.padre.direccion,
            ocupacion: formData.padre.ocupacion,
            rol: 'padre',
            state: 'activo',
            temporary_password: true
          })

          parentId = newParentUser.id
          setParentCredentials({
            email: credentials.email,
            password: credentials.password,
            isNew: true
          })
        } else {
          parentId = formData.padre.id
        }
      }

      // Actualizar estudiante con datos de matrícula
      const updatedStudent = await studentsService.update(formData.studentId, {
        nivel: formData.nivel.toLowerCase(),
        grado: formData.grado,
        seccion: formData.seccion,
        academic_year: parseInt(formData.anoLectivo),
        fecha_ingreso: formData.fechaIngreso,
        codigo_barras: formData.codigoBarras,
        parent_id: parentId,
        state: 'activo'
      })

      // Crear registro de matrícula usando el store
      await enrollmentStore.enrollStudent({
        studentId: formData.studentId,
        nivel: formData.nivel,
        grado: formData.grado,
        seccion: formData.seccion,
        anoLectivo: formData.anoLectivo,
        fechaIngreso: formData.fechaIngreso
      })

      setEnrollmentDetails({
        estudiante: {
          name: `${updatedStudent.first_names || updatedStudent.names} ${updatedStudent.last_names}`,
          dni: updatedStudent.dni,
          codigoBarras: updatedStudent.codigo_barras || updatedStudent.codigoBarras,
          nivel: updatedStudent.nivel,
          grado: updatedStudent.grado,
          seccion: updatedStudent.seccion,
          anoLectivo: updatedStudent.academic_year || updatedStudent.academic_year
        },
        fechaMatricula: new Date().toLocaleDateString('es-PE'),
        horaMatricula: new Date().toLocaleTimeString('es-PE'),
        code: updatedStudent.code || updatedStudent.dni,
        padre: formData.padre ? {
          name: `${formData.padre.name} ${formData.padre.apellidoPaterno} ${formData.padre.apellidoMaterno}`,
          dni: formData.padre.dni,
          relacion: formData.padre.relacion || 'Padre/Madre'
        } : null,
        parentCredentials: parentCredentials
      })

      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error al matricular:', error)
      alert('Error al matricular al estudiante: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    // State
    currentStep,
    setCurrentStep,
    availableStudents,
    availableParents,
    selectedStudentId,
    setSelectedStudentId,
    selectedParentId,
    setSelectedParentId,
    parentChildren,
    setParentChildren,
    searchDni,
    foundStudent,
    studentParent,
    formData,
    setFormData,
    parentForm,
    setParentForm,
    errors,
    setErrors,
    isSubmitting,
    showSuccessModal,
    setShowSuccessModal,
    enrollmentDetails,
    parentCredentials,
    // Handlers
    handleSearchByDni,
    handleParentSelect,
    handleStudentSelect,
    handleChange,
    handleParentFormChange,
    addExistingParent,
    addNewParent,
    removeParent,
    refreshAvailableParents,
    // Navigation
    nextStep,
    prevStep,
    validateStep,
    handleSubmit,
    // Helpers
    getGradesForLevel,
    getSectionsForGrade
  }
}
