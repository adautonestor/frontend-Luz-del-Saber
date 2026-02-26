/**
 * Utilidades para informes psicológicos
 * Funciones para manejar años académicos y filtrado de reportes
 */

/**
 * Obtener el año académico actual
 * @returns {number} Año académico actual
 */
export const getCurrentAcademicYear = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // Los meses en JS van de 0-11

  // Si estamos entre enero y febrero, el año lectivo es el anterior
  // Si estamos de marzo en adelante, el año lectivo es el actual
  return currentMonth <= 2 ? currentYear - 1 : currentYear
}

/**
 * Obtener lista de años académicos (últimos 5 años)
 * @returns {Array<number>} Lista de años académicos
 */
export const getAcademicYearsList = () => {
  const currentYear = getCurrentAcademicYear()
  const years = []

  // Generar últimos 5 años académicos
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i)
  }

  return years
}

/**
 * Formatear tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Obtener todos los reportes de un estudiante específico
 * @param {Array} reports - Lista de todos los reportes
 * @param {string} studentId - ID del estudiante
 * @returns {Array} Reportes del estudiante ordenados por año (más reciente primero)
 */
export const getReportsByStudent = (reports, studentId) => {
  if (!reports || !Array.isArray(reports)) return []

  return reports
    .filter(report => {
      // Manejar diferentes formatos de campo student_id
      const reportStudentId = report.student_id || report.studentId || report.estudianteId
      return reportStudentId === studentId && report.activo !== false
    })
    .sort((a, b) => {
      // Ordenar por año lectivo descendente (más reciente primero)
      const yearA = a.añoLectivo || a.año_lectivo || a.academicYear || 0
      const yearB = b.añoLectivo || b.año_lectivo || b.academicYear || 0
      return yearB - yearA
    })
}

/**
 * Obtener reporte de un estudiante para un año específico
 * @param {Array} reports - Lista de todos los reportes
 * @param {string} studentId - ID del estudiante
 * @param {string|number} year - Año lectivo
 * @returns {Object|null} Reporte encontrado o null
 */
export const getReportByStudentAndYear = (reports, studentId, year) => {
  if (!reports || !Array.isArray(reports)) return null

  return reports.find(report => {
    const reportStudentId = report.student_id || report.studentId || report.estudianteId
    const reportYear = report.añoLectivo || report.año_lectivo || report.academicYear

    return reportStudentId === studentId &&
           reportYear.toString() === year.toString() &&
           report.activo !== false
  }) || null
}
