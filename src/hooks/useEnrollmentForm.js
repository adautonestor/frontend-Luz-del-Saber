import { useState, useEffect } from 'react'
import studentsService from '../services/studentsService'
import { getTodayLima } from '../utils/dateUtils'

/**
 * Hook para gestión del formulario de matrícula
 * Maneja estado del formulario, modo nuevo/existente, padres y validaciones
 * Integrado con APIs reales del backend
 */
export const useEnrollmentForm = (enrollStudent, createStudent, onSuccess, parents = []) => {
  const [isNewStudent, setIsNewStudent] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState('')
  const [parentChildren, setParentChildren] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentYear = new Date().getFullYear()
  const availableYears = [currentYear, currentYear + 1]

  const [formData, setFormData] = useState({
    studentId: '',
    nivel: '',
    grado: '',
    seccion: '',
    anoLectivo: currentYear.toString(),
    fechaIngreso: getTodayLima(),
    contratoFile: null,
    contratoNombre: '',
    contratoBase64: null
  })

  const [newStudentData, setNewStudentData] = useState({
    first_names: '',
    last_names: '',
    dni: '',
    fechaNacimiento: '',
    sexo: '',
    direccion: '',
    telefono: '',
    parent_id: ''
  })

  // Cargar hijos cuando se selecciona un padre
  useEffect(() => {
    const loadChildren = async () => {
      if (selectedParentId) {
        try {
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
            return studentParentId === selectedParentId
          })
          setParentChildren(children)
        } catch (error) {
          console.error('Error loading children:', error)
          setParentChildren([])
        }
      } else {
        setParentChildren([])
      }
    }

    loadChildren()
  }, [selectedParentId])

  // Cargar hijos para nuevo estudiante
  useEffect(() => {
    const loadChildren = async () => {
      if (isNewStudent && newStudentData.parent_id) {
        try {
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
            return studentParentId === newStudentData.parent_id
          })
          setParentChildren(children)
        } catch (error) {
          console.error('Error loading children:', error)
          setParentChildren([])
        }
      }
    }

    loadChildren()
  }, [isNewStudent, newStudentData.parent_id])

  const handleChange = (e) => {
    // Manejar tanto eventos como llamadas directas con { name, value }
    const name = e?.target?.name || e?.name
    const value = e?.target?.value !== undefined ? e.target.value : e?.value

    if (!name) {
      console.error('handleChange llamado sin nombre de campo válido', e)
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Reset grado y sección cuando cambia el nivel
    if (name === 'nivel') {
      setFormData(prev => ({
        ...prev,
        grado: '',
        seccion: ''
      }))
    }

    // Auto-completar nivel/grado/sección cuando se selecciona un hijo existente
    if (name === 'studentId' && value && !isNewStudent) {
      const selectedStudent = parentChildren.find(child => child.id === value)
      if (selectedStudent) {
        setFormData(prev => ({
          ...prev,
          nivel: selectedStudent.nivel || '',
          grado: selectedStudent.grado || '',
          seccion: selectedStudent.seccion || ''
        }))
      }
    }
  }

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target
    setNewStudentData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleParentChange = (e) => {
    const parentId = e.target.value
    setSelectedParentId(parentId)
    setFormData(prev => ({
      ...prev,
      studentId: ''
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF para el contrato')
        e.target.value = ''
        return
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError('El archivo PDF no debe superar los 10MB')
        e.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target.result
        setFormData(prev => ({
          ...prev,
          contratoFile: file,
          contratoNombre: file.name,
          contratoBase64: base64String
        }))
        setError('')
      }
      reader.onerror = () => {
        setError('Error al leer el archivo PDF')
        e.target.value = ''
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      contratoFile: null,
      contratoNombre: '',
      contratoBase64: null
    }))
  }

  const handleSubmit = async (e, paymentSchedule) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // 1. Validaciones
      if (!formData.anoLectivo) {
        setError('Debe seleccionar un año lectivo')
        return
      }
      if (!formData.nivel || !formData.grado || !formData.seccion) {
        setError('Debe completar todos los campos académicos (Nivel, Grado y Sección)')
        return
      }

      let studentId = formData.studentId

      if (isNewStudent) {
        if (!newStudentData.parent_id) {
          setError('Debe seleccionar un padre para el nuevo estudiante')
          return
        }
        if (!newStudentData.first_names || !newStudentData.last_names || !newStudentData.dni) {
          setError('Debe completar los datos del estudiante (nombres, apellidos y DNI)')
          return
        }
        if (!/^\d{8}$/.test(newStudentData.dni)) {
          setError('El DNI debe tener 8 dígitos')
          return
        }
      } else {
        if (!studentId) {
          setError('Debe seleccionar un estudiante existente')
          return
        }
        if (!selectedParentId) {
          setError('El estudiante seleccionado no tiene un padre/tutor asignado.')
          return
        }
      }

      // 2. Si es estudiante nuevo, crearlo primero
      if (isNewStudent) {
        try {
          // Preparar datos para crear estudiante
          const studentPayload = {
            barcode: newStudentData.dni, // Usar DNI como barcode inicial
            first_names: newStudentData.first_names,
            last_names: newStudentData.last_names,
            dni: newStudentData.dni,
            birth_date: newStudentData.fechaNacimiento || getTodayLima(),
            gender: newStudentData.sexo || 'M',
            address: newStudentData.direccion || '',
            phone: newStudentData.telefono || '',
            parent_id: newStudentData.parent_id
          }

          // Crear estudiante via API
          const createdStudent = await studentsService.create(studentPayload)

          if (!createdStudent || !createdStudent.id) {
            throw new Error('No se pudo crear el estudiante')
          }

          // Asignar el ID del estudiante recién creado
          studentId = createdStudent.id

        } catch (createError) {
          console.error('Error al crear nuevo estudiante:', createError)
          setError(createError.message || 'Error al crear el nuevo estudiante')
          return
        }
      }

      // 3. Construir FormData
      const data = new FormData()

      // Mapear campos del frontend al backend
      const fieldMapping = {
        nivel: 'level_id',
        grado: 'grade_id',
        seccion: 'section_id',
        anoLectivo: 'academic_year_id',
        fechaIngreso: 'enrollment_date',
        studentId: 'student_id'
      }

      // Añadir datos de matrícula con nombres correctos para el backend
      Object.keys(formData).forEach(key => {
        // Excluir studentId del loop - lo agregamos explícitamente después
        if (key !== 'contratoFile' && key !== 'contratoBase64' && key !== 'contratoNombre' && key !== 'studentId' && formData[key] !== null && formData[key] !== '') {
          const backendKey = fieldMapping[key] || key
          data.append(backendKey, formData[key])
        }
      })

      // Agregar student_id explícitamente (puede venir de estudiante existente o recién creado)
      if (studentId) {
        data.append('student_id', studentId)
      }

      // Añadir el archivo del contrato si existe
      if (formData.contratoFile) {
        data.append('contract', formData.contratoFile, formData.contratoNombre)
      }

      // Añadir cronograma de pagos personalizado
      if (paymentSchedule && paymentSchedule.length > 0) {
        data.append('paymentSchedule', JSON.stringify(paymentSchedule))
      }

      // 3. Enviar a través del servicio
      // Usamos un servicio que debe estar preparado para enviar FormData
      await studentsService.createMatriculationWithTransaction(data)

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        resetForm()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al matricular estudiante')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsNewStudent(false)
    setSelectedParentId('')
    setParentChildren([])
    setFormData({
      studentId: '',
      nivel: '',
      grado: '',
      seccion: '',
      anoLectivo: currentYear.toString(),
      fechaIngreso: getTodayLima(),
      contratoFile: null,
      contratoNombre: '',
      contratoBase64: null
    })
    setNewStudentData({
      first_names: '',
      last_names: '',
      dni: '',
      fechaNacimiento: '',
      sexo: '',
      direccion: '',
      telefono: '',
      parent_id: ''
    })
    setError('')
    setSuccess(false)
    setIsSubmitting(false)
  }

  const toggleStudentMode = () => {
    setIsNewStudent(!isNewStudent)
  }

  return {
    // Estado
    isNewStudent,
    selectedParentId,
    parents,
    parentChildren,
    formData,
    newStudentData,
    error,
    success,
    isSubmitting,
    availableYears,

    // Acciones
    setError,
    handleChange,
    handleNewStudentChange,
    handleParentChange,
    handleFileChange,
    removeFile,
    handleSubmit,
    resetForm,
    toggleStudentMode,
    setSelectedParentId
  }
}
