import { useState } from 'react'
import studentsService from '../services/studentsService'
import { usersService } from '../services/usersService'
import { matriculationService } from '../services/matriculationService'

/**
 * Hook para búsqueda y selección de estudiantes
 * Maneja búsqueda, dropdown, selección y asignación de padre
 * Integrado con APIs reales del backend
 * @param {Function} getSelectedAcademicYearId - Función para obtener el año lectivo seleccionado
 */
export const useStudentSearch = (students, formData, handleChange, setSelectedParentId, setParentChildren, setError, getSelectedAcademicYearId) => {
  const [searchStudent, setSearchStudent] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  const [foundStudent, setFoundStudent] = useState(null)
  const [studentParent, setStudentParent] = useState(null)

  // Filtrar estudiantes disponibles (sin matrícula activa)
  const availableStudents = students.filter(student => {
    const state = student.state || student.status
    return !student.matriculado || state !== 'activo'
  })

  // Filtrar estudiantes según búsqueda
  const filteredStudents = availableStudents.filter(student => {
    if (!searchStudent) return true
    const searchLower = searchStudent.toLowerCase()
    const apellidos = `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || ''
    const fullName = `${student.first_names} ${apellidos}`.toLowerCase()
    return fullName.includes(searchLower) || apellidos.toLowerCase().includes(searchLower)
  })

  const handleSelectStudent = async (studentId) => {
    try {
      const allStudents = await studentsService.getAll()
      const student = allStudents.find(s => s.id === studentId)

      if (student) {
        // Verificar si el estudiante ya tiene matrícula en el año lectivo seleccionado
        const selectedYearId = getSelectedAcademicYearId ? getSelectedAcademicYearId() : null
        if (selectedYearId) {
          try {
            const matriculations = await matriculationService.getAll()
            const existingMatriculation = matriculations.find(m =>
              m.student_id === studentId &&
              (m.academic_year_id === selectedYearId || parseInt(m.academic_year_id) === parseInt(selectedYearId))
            )

            if (existingMatriculation) {
              if (setError) {
                const apellidosStr = `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || ''
                setError(`El estudiante "${student.first_names} ${apellidosStr}" ya tiene una matrícula activa en el año lectivo seleccionado.\n\nNo es posible crear otra matrícula para el mismo año.`)
              }
              return // No continuar con la selección
            }
          } catch (err) {
            console.error('Error verificando matrícula existente:', err)
          }
        }

        setFoundStudent(student)
        const searchApellidos = `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || ''
        setSearchStudent(`${searchApellidos}, ${student.first_names}`)
        setShowStudentDropdown(false)

        // Actualizar formData usando handleChange
        handleChange({ name: 'studentId', value: student.id })
        handleChange({ name: 'nivel', value: student.nivel || '' })
        handleChange({ name: 'grado', value: student.grado || '' })
        handleChange({ name: 'seccion', value: student.seccion || '' })

        // Buscar y cargar el padre asignado
        // Primero intentar obtener del campo parents (JSON array)
        let parentId = null
        if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
          const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
          parentId = primaryParent.user_id
        }
        // Fallback a campos antiguos si existen
        if (!parentId) {
          parentId = student.parent_id || student.parentId
        }

        if (parentId) {
          const allUsers = await usersService.getAll()
          const parent = allUsers.find(p => {
            // Buscar por role_id = 3 (Padre) o por nombre de rol
            const rol = p.rol || p.role || p.role_name
            return p.id === parentId && (p.role_id === 3 || rol === 'padre' || rol === 'Padre')
          })

          if (parent) {
            // Normalizar el objeto padre para compatibilidad
            const normalizedParent = {
              ...parent,
              name: parent.name || `${parent.first_name || ''} ${parent.last_names || ''}`.trim(),
              telefono: parent.telefono || parent.phone
            }
            setStudentParent(normalizedParent)
            // Convertir a string para asegurar compatibilidad
            const parentIdString = String(parentId)
            setSelectedParentId(parentIdString)

            // Cargar hijos del padre
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
              return studentParentId === parentId
            })
            setParentChildren(children)
          } else {
            setStudentParent(null)
            setSelectedParentId('')
            setParentChildren([])
          }
        } else {
          setStudentParent(null)
          setSelectedParentId('')
          setParentChildren([])
        }
      }
    } catch (error) {
      console.error('Error selecting student:', error)
      if (setError) {
        setError('❌ Error al seleccionar estudiante\n\n' +
                 'No se pudo cargar la información del estudiante.\n\n' +
                 'Detalles: ' + (error.message || 'Error desconocido'))
      }
    }
  }

  const handleClearStudent = () => {
    setFoundStudent(null)
    setSearchStudent('')
    setStudentParent(null)
    setSelectedParentId('')
    setParentChildren([])

    // Limpiar formData usando handleChange
    handleChange({ name: 'studentId', value: '' })
    handleChange({ name: 'nivel', value: '' })
    handleChange({ name: 'grado', value: '' })
    handleChange({ name: 'seccion', value: '' })
  }

  const handleSearchChange = (newValue) => {
    setSearchStudent(newValue)
    setShowStudentDropdown(true)

    // Si el usuario está escribiendo y el texto no coincide con el estudiante seleccionado,
    // limpiar la selección para permitir nueva búsqueda
    const foundApellidos = foundStudent ? (`${foundStudent.paternal_last_name || ''} ${foundStudent.maternal_last_name || ''}`.trim() || foundStudent.last_names || '') : ''
    if (foundStudent && newValue !== `${foundApellidos}, ${foundStudent.first_names}`) {
      setFoundStudent(null)
      setStudentParent(null)
      setSelectedParentId('')
      setParentChildren([])

      // Limpiar formData usando handleChange
      handleChange({ name: 'studentId', value: '' })
      handleChange({ name: 'nivel', value: '' })
      handleChange({ name: 'grado', value: '' })
      handleChange({ name: 'seccion', value: '' })
    }
  }

  return {
    searchStudent,
    showStudentDropdown,
    foundStudent,
    studentParent,
    filteredStudents,
    setShowStudentDropdown,
    handleSelectStudent,
    handleClearStudent,
    handleSearchChange,
    setSearchStudent,
    setFoundStudent,
    setStudentParent
  }
}
