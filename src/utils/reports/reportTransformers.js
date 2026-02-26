/**
 * Transformadores de datos de reportes
 */

/**
 * Convierte reportes de estructura anidada a lista plana
 */
export const flattenReportsToArray = (allChildReports, periods) => {
  const allReports = []

  Object.keys(allChildReports).forEach(periodId => {
    const periodData = periods.find(p => p.id === periodId)
    const periodReports = allChildReports[periodId]

    Object.keys(periodReports).forEach(reportType => {
      allReports.push({
        ...periodReports[reportType],
        periodId,
        periodName: periodData?.name || periodId,
        reportType
      })
    })
  })

  return allReports
}
