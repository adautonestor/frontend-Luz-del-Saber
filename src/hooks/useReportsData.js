import { useMemo } from 'react'
import { getMockReports, PERIODS, PERIOD_ORDER } from '@/constants/reports'
import { flattenReportsToArray, sortReportsByPeriod } from '@/utils/reports'

/**
 * Custom hook para gestionar datos de reportes
 */
export const useReportsData = (selectedChild) => {
  const reports = getMockReports()
  const allChildReports = reports[selectedChild] || {}

  // Convertir reportes anidados a array plano
  const allReports = useMemo(() => {
    return flattenReportsToArray(allChildReports, PERIODS)
  }, [allChildReports])

  // Ordenar reportes cronológicamente
  const orderedReports = useMemo(() => {
    return sortReportsByPeriod([...allReports], PERIOD_ORDER)
  }, [allReports])

  // Calcular estadísticas
  const stats = useMemo(() => {
    const finalReport = orderedReports.find(r => r.type === 'final')
    const academicReports = orderedReports.filter(r => r.type === 'academic')
    const lastAcademicReport = academicReports[academicReports.length - 1]

    return {
      totalReports: orderedReports.length,
      averageGrade: finalReport?.overallGrade || lastAcademicReport?.overallGrade || 'N/A',
      totalPeriods: Object.keys(allChildReports).length,
      finalStatus: finalReport?.passed === true ? 'Aprobado' :
                   finalReport?.passed === false ? 'Desaprobado' : 'Pendiente'
    }
  }, [orderedReports, allChildReports])

  return {
    allReports: orderedReports,
    stats,
    allChildReports
  }
}
