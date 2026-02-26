/**
 * Formatters y cálculos para reportes
 */

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Count failed competencies (level C)
 */
export const countFailedCompetencies = (subjects) => {
  return subjects.reduce((total, subject) => {
    if (subject.competencias) {
      const failedCompetencies = subject.competencias.filter(comp => comp.level === 'C').length
      return total + failedCompetencies
    }
    return total
  }, 0)
}

/**
 * Ordena reportes por período cronológicamente
 */
export const sortReportsByPeriod = (reports, periodOrder) => {
  return reports.sort((a, b) => {
    return periodOrder.indexOf(a.periodId) - periodOrder.indexOf(b.periodId)
  })
}
