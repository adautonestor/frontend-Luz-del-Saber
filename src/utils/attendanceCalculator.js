/**
 * Utilidades para cálculo de asistencia para boleta final
 * Calcula estadísticas de inasistencias y tardanzas por bimestre
 */

/**
 * Calcula estadísticas de asistencia para un bimestre específico
 * REGLAS:
 * - Si no hay registro para un día escolar → FALTA INJUSTIFICADA
 * - Si entry_time1 = null → FALTA (verificar absence_justified)
 * - Si entry_status1 = 'tardanza' → TARDANZA (verificar late_justified)
 * - Si entry_status1 = 'a_tiempo' o 'asistio' → ASISTENCIA
 *
 * @param {Array} attendanceRecords - Registros de asistencia del estudiante
 * @param {number} studentId - ID del estudiante
 * @param {number} quarter - Número de bimestre (1-4)
 * @returns {Object} Estadísticas del bimestre
 */
export const calculateAttendanceForReportCard = (attendanceRecords, studentId, quarter) => {
  // Filtrar registros del estudiante y bimestre
  const records = attendanceRecords.filter(r => {
    const recordStudentId = r.student_id || r.estudiante_id
    const recordQuarter = r.quarter || r.bimestre
    return recordStudentId === studentId && recordQuarter === quarter
  })

  let inasistenciaJustificada = 0
  let inasistenciaInjustificada = 0
  let tardanzaJustificada = 0
  let tardanzaInjustificada = 0

  records.forEach(record => {
    const entryTime = record.entry_time1 || record.horaEntrada
    const entryStatus = record.entry_status1 || record.estadoEntrada
    const lateJustified = record.late_justified || record.tardanzaJustificada
    const absenceJustified = record.absence_justified || record.faltaJustificada

    // Si no tiene entrada o estado es 'falta' → falta
    if (!entryTime || entryStatus === 'falta' || entryStatus === 'ausente') {
      if (absenceJustified) {
        inasistenciaJustificada++
      } else {
        inasistenciaInjustificada++
      }
    }
    // Si tiene entrada con tardanza
    else if (entryStatus === 'tardanza' || entryStatus === 'tarde') {
      if (lateJustified) {
        tardanzaJustificada++
      } else {
        tardanzaInjustificada++
      }
    }
    // Si llegó a tiempo → asistencia (no se cuenta, solo se muestran faltas y tardanzas)
  })

  return {
    inasistenciaJustificada,
    inasistenciaInjustificada,
    tardanzaJustificada,
    tardanzaInjustificada
  }
}

/**
 * Genera datos de asistencia para todos los bimestres
 * Formato compatible con ReportCardAttendanceTable.jsx
 *
 * @param {Array} attendanceRecords - Todos los registros de asistencia del estudiante
 * @param {number} studentId - ID del estudiante
 * @returns {Object} Datos de asistencia por bimestre { B1: {...}, B2: {...}, B3: {...}, B4: {...} }
 */
export const generateAttendanceDataForReportCard = (attendanceRecords, studentId) => {
  return {
    'B1': calculateAttendanceForReportCard(attendanceRecords, studentId, 1),
    'B2': calculateAttendanceForReportCard(attendanceRecords, studentId, 2),
    'B3': calculateAttendanceForReportCard(attendanceRecords, studentId, 3),
    'B4': calculateAttendanceForReportCard(attendanceRecords, studentId, 4)
  }
}

/**
 * Obtiene resumen total de asistencia del año
 * @param {Object} attendanceData - Datos de asistencia por bimestre
 * @returns {Object} Totales del año
 */
export const getYearlyAttendanceSummary = (attendanceData) => {
  const bimesters = ['B1', 'B2', 'B3', 'B4']

  return bimesters.reduce((totals, bim) => {
    const data = attendanceData[bim] || {}
    return {
      inasistenciaJustificada: totals.inasistenciaJustificada + (data.inasistenciaJustificada || 0),
      inasistenciaInjustificada: totals.inasistenciaInjustificada + (data.inasistenciaInjustificada || 0),
      tardanzaJustificada: totals.tardanzaJustificada + (data.tardanzaJustificada || 0),
      tardanzaInjustificada: totals.tardanzaInjustificada + (data.tardanzaInjustificada || 0)
    }
  }, {
    inasistenciaJustificada: 0,
    inasistenciaInjustificada: 0,
    tardanzaJustificada: 0,
    tardanzaInjustificada: 0
  })
}
