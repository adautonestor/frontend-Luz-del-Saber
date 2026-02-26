/**
 * Helpers para el módulo de Informes Psicológicos
 * Helpers puros - los datos deben ser provistos por el llamador desde servicios/stores
 */

import { REPORT_SCOPES } from '@/config/psychologicalReportsConstants'

/**
 * Obtener estudiantes según el alcance seleccionado
 * @param {Array} allStudents - Lista de todos los estudiantes
 * @param {string} scope - Alcance (all, level, grade, individual)
 * @param {string|number} scopeDetail - Detalle del alcance (levelId, gradeId, o studentId)
 * @returns {Array} Lista de estudiantes filtrados
 */
export const getStudentsByScope = (allStudents, scope, scopeDetail) => {
  // Filtrar solo estudiantes activos
  const activeStudents = allStudents.filter(s => s.status === 'active' || s.activo !== false)

  switch (scope) {
    case REPORT_SCOPES.ALL:
      return activeStudents

    case REPORT_SCOPES.LEVEL:
      return activeStudents.filter(s => {
        const levelId = parseInt(s.level_id)
        const scopeId = parseInt(scopeDetail)
        return levelId === scopeId
      })

    case REPORT_SCOPES.GRADE:
      return activeStudents.filter(s => {
        const gradeId = parseInt(s.grade_id)
        const scopeId = parseInt(scopeDetail)
        return gradeId === scopeId
      })

    case REPORT_SCOPES.INDIVIDUAL:
      const student = activeStudents.find(s => s.id === parseInt(scopeDetail))
      return student ? [student] : []

    default:
      return []
  }
}

/**
 * Obtener preview de distribución
 */
export const getDistributionPreview = (allStudents, scope, scopeDetail, levels = []) => {
  const targetStudents = getStudentsByScope(allStudents, scope, scopeDetail)
  const count = targetStudents.length

  if (count === 0) return { count: 0, message: 'No hay estudiantes seleccionados' }

  let message = ''
  switch (scope) {
    case REPORT_SCOPES.ALL:
      message = `todos los estudiantes del colegio (${count})`
      break
    case REPORT_SCOPES.LEVEL:
      // Buscar nombre del nivel
      const level = levels.find(l => l.id === parseInt(scopeDetail))
      const levelName = level?.name || `Nivel ${scopeDetail}`
      message = `todos los estudiantes de ${levelName} (${count})`
      break
    case REPORT_SCOPES.GRADE:
      message = `todos los estudiantes del grado seleccionado (${count})`
      break
    case REPORT_SCOPES.INDIVIDUAL:
      const student = targetStudents[0]
      if (student) {
        message = `${student.first_names} ${student.last_names}`
      }
      break
    default:
      message = `${count} estudiante${count !== 1 ? 's' : ''}`
  }

  return { count, message }
}

/**
 * Filtrar estudiantes según criterios de búsqueda
 * Solo muestra estudiantes que tienen nivel, grado y sección asignados
 * @param {Array} students - Lista de estudiantes
 * @param {Object} filters - Criterios de filtrado
 * @returns {Array} Estudiantes filtrados
 */
export const filterStudents = (students, filters) => {
  const { searchTerm, selectedLevel, selectedGrade, selectedSection } = filters

  return students.filter(student => {
    // PRIMERO: Solo mostrar estudiantes que tienen nivel, grado y sección asignados
    if (!student.level_id || !student.grade_id || !student.section_id) {
      return false
    }

    // Filtro por búsqueda
    const fullName = `${student.first_names || ''} ${student.last_names || ''}`.toLowerCase()
    const matchesSearch = !searchTerm ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (student.dni || '').includes(searchTerm)

    // Filtro por nivel (comparar como números)
    const studentLevelId = parseInt(student.level_id)
    const filterLevelId = selectedLevel === 'todos' ? null : parseInt(selectedLevel)
    const matchesLevel = !filterLevelId || studentLevelId === filterLevelId

    // Filtro por grado (comparar como números)
    const studentGradeId = parseInt(student.grade_id)
    const filterGradeId = selectedGrade === 'todos' ? null : parseInt(selectedGrade)
    const matchesGrade = !filterGradeId || studentGradeId === filterGradeId

    // Filtro por sección (comparar como números)
    const studentSectionId = parseInt(student.section_id)
    const filterSectionId = selectedSection === 'todos' ? null : parseInt(selectedSection)
    const matchesSection = !filterSectionId || studentSectionId === filterSectionId

    return matchesSearch && matchesLevel && matchesGrade && matchesSection
  })
}

/**
 * Verificar si un estudiante tiene informe en un año específico
 * @param {Array} reports - Lista de informes
 * @param {number} studentId - ID del estudiante
 * @param {string|number} year - Año lectivo
 * @returns {boolean} true si tiene informe
 */
export const hasReport = (reports, studentId, year) => {
  return reports.some(r => {
    const reportStudentId = parseInt(r.student_id)
    const reportYear = r.academic_year?.toString()
    const searchYear = year?.toString()
    const isActive = r.status === 'active'

    return reportStudentId === parseInt(studentId) &&
           reportYear === searchYear &&
           isActive
  })
}

/**
 * Obtener informe de un estudiante en un año específico
 * @param {Array} reports - Lista de informes
 * @param {number} studentId - ID del estudiante
 * @param {string|number} year - Año lectivo
 * @returns {Object|undefined} Informe del estudiante
 */
export const getStudentReport = (reports, studentId, year) => {
  return reports.find(r => {
    const reportStudentId = parseInt(r.student_id)
    const reportYear = r.academic_year?.toString()
    const searchYear = year?.toString()
    const isActive = r.status === 'active'

    return reportStudentId === parseInt(studentId) &&
           reportYear === searchYear &&
           isActive
  })
}

/**
 * Calcular estadísticas de informes por nivel
 * Solo considera estudiantes con nivel, grado y sección asignados
 * @param {Array} students - Lista de estudiantes
 * @param {Array} reports - Lista de informes
 * @param {string|number} year - Año lectivo
 * @param {Array} levels - Lista de niveles con {id, name}
 * @returns {Object} Estadísticas por nivel
 */
export const getReportStatsByLevel = (students, reports, year, levels = []) => {
  // Solo estudiantes activos CON nivel, grado y sección asignados
  const activeStudents = students.filter(s =>
    (s.status === 'active' || s.activo !== false) &&
    s.level_id && s.grade_id && s.section_id
  )

  // Obtener IDs únicos de niveles de los estudiantes válidos
  const levelIds = [...new Set(activeStudents.map(s => s.level_id).filter(Boolean))]

  const stats = {}

  levelIds.forEach(levelId => {
    const levelStudents = activeStudents.filter(s => parseInt(s.level_id) === parseInt(levelId))
    const total = levelStudents.length

    if (total === 0) return

    const withReport = levelStudents.filter(s =>
      hasReport(reports, s.id, year)
    ).length

    const percentage = total > 0 ? Math.round((withReport / total) * 100) : 0

    // Buscar nombre del nivel desde los estudiantes
    const sampleStudent = levelStudents[0]
    const levelName = sampleStudent?.nivelNombre || sampleStudent?.level_name || sampleStudent?.nivel || `Nivel ${levelId}`

    stats[levelName.toLowerCase()] = {
      total,
      withReport,
      percentage,
      levelId: parseInt(levelId)
    }
  })

  return stats
}

/**
 * Obtener listas únicas para filtros
 * Solo considera estudiantes con nivel, grado y sección asignados
 * @param {Array} students - Lista de estudiantes
 * @param {string|number} selectedLevel - Nivel seleccionado
 * @param {string|number} selectedGrade - Grado seleccionado
 * @returns {Object} Opciones de filtro {levels, grades, sections}
 */
export const getFilterOptions = (students, selectedLevel = 'todos', selectedGrade = 'todos') => {
  // Solo estudiantes con datos completos
  const validStudents = students.filter(s => s.level_id && s.grade_id && s.section_id)

  // Obtener niveles únicos con ID y nombre
  const levelMap = new Map()
  validStudents.forEach(s => {
    if (!levelMap.has(s.level_id)) {
      levelMap.set(s.level_id, {
        id: s.level_id,
        name: s.nivelNombre || s.level_name || s.nivel || `Nivel ${s.level_id}`
      })
    }
  })
  const levels = Array.from(levelMap.values())

  // Obtener grados del nivel seleccionado
  const gradeMap = new Map()
  if (selectedLevel !== 'todos') {
    const levelId = parseInt(selectedLevel)
    validStudents
      .filter(s => parseInt(s.level_id) === levelId)
      .forEach(s => {
        if (!gradeMap.has(s.grade_id)) {
          gradeMap.set(s.grade_id, {
            id: s.grade_id,
            name: s.gradoNombre || s.grade_name || s.grado || `Grado ${s.grade_id}`
          })
        }
      })
  }
  const grades = Array.from(gradeMap.values())

  // Obtener secciones del grado seleccionado
  const sectionMap = new Map()
  if (selectedGrade !== 'todos') {
    const gradeId = parseInt(selectedGrade)
    validStudents
      .filter(s => parseInt(s.grade_id) === gradeId)
      .forEach(s => {
        if (!sectionMap.has(s.section_id)) {
          sectionMap.set(s.section_id, {
            id: s.section_id,
            name: s.seccionNombre || s.section_name || s.seccion || `Sección ${s.section_id}`
          })
        }
      })
  }
  const sections = Array.from(sectionMap.values())

  return { levels, grades, sections }
}

/**
 * Convertir Base64 a Blob
 */
export const base64ToBlob = (base64, type = 'application/pdf') => {
  const binStr = atob(base64.split(',')[1])
  const len = binStr.length
  const arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i)
  }
  return new Blob([arr], { type })
}

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Ver informe en nueva ventana
 */
export const viewReport = (report) => {
  // Priorizar file_url del backend (proxy)
  if (report.file_url) {
    window.open(report.file_url, '_blank')
  } else if (report.archivoBase64) {
    const blob = base64ToBlob(report.archivoBase64, 'application/pdf')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } else if (report.archivoUrl) {
    window.open(report.archivoUrl, '_blank')
  }
}

/**
 * Descargar informe
 */
export const downloadReport = async (report) => {
  try {
    if (report.file_url) {
      // Descargar desde URL del backend
      const response = await fetch(report.file_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.file_name || `informe_psicologico_${report.academic_year}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } else if (report.archivoBase64) {
      const blob = base64ToBlob(report.archivoBase64, 'application/pdf')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.nombreArchivo || report.file_name || 'informe.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error al descargar:', error)
    // Fallback: abrir en nueva pestaña
    if (report.file_url) {
      window.open(report.file_url, '_blank')
    }
  }
}
