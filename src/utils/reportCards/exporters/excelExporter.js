/**
 * Exportador de boletas de notas a Excel
 * Funciones puras - los datos deben ser provistos por el llamador desde servicios/stores
 */

import * as XLSX from 'xlsx'
import { generateAttendanceDataForReportCard, getYearlyAttendanceSummary } from '@/utils/attendanceCalculator'
import { getAttendanceSummaryForStudent } from '@/services/mock/schemas/parentMeetings'

/**
 * Formatea una nota con comentario para Excel
 * @param {Object} nota - Nota con descripción, valor y comentario
 * @returns {string} Nota formateada
 */
const formatNota = (nota) => {
  if (!nota) return ''
  let text = `${nota.description}: ${nota.valor}`
  if (nota.comentario) {
    text += ` | ${nota.comentario}`
  }
  return text
}

/**
 * Genera los datos de un curso para Excel
 * @param {Object} curso - Datos del curso
 * @param {Object} child - Estudiante
 * @param {number} year - Año escolar
 * @param {string} bimestreFilter - Filtro de bimestre ('anual' o número)
 * @returns {Array} Array de arrays con datos para Excel
 */
const generateCourseSheetData = (curso, child, year, bimestreFilter) => {
  const sheetData = []
  const isAnual = bimestreFilter === 'anual'
  const bimNum = parseInt(bimestreFilter)

  // Header
  const titleSuffix = isAnual ? '' : ` - BIMESTRE ${bimNum}`
  sheetData.push([`BOLETA DE NOTAS - ${curso.cursoNombre}${titleSuffix}`])
  sheetData.push([`Estudiante: ${child.first_names} ${child.last_names}`])
  sheetData.push([`Grado: ${child.gradeName}`])
  sheetData.push([`Año: ${year}`])
  sheetData.push([])

  // Table headers
  if (isAnual) {
    sheetData.push(['Competencia', 'Bim I', 'Bim II', 'Bim III', 'Bim IV', 'Promedio'])
  } else {
    sheetData.push(['Competencia', `Bimestre ${bimNum}`, 'Notas Detalladas'])
  }

  // Competencies
  curso.competencias.forEach(comp => {
    if (isAnual) {
      sheetData.push([
        comp.name,
        comp.bimestre1 !== null ? comp.bimestre1 : '-',
        comp.bimestre2 !== null ? comp.bimestre2 : '-',
        comp.bimestre3 !== null ? comp.bimestre3 : '-',
        comp.bimestre4 !== null ? comp.bimestre4 : '-',
        comp.promedio !== null ? comp.promedio : '-'
      ])
    } else {
      const notaBimestre = comp[`bimestre${bimNum}`]
      sheetData.push([
        comp.name,
        notaBimestre !== null ? notaBimestre : '-',
        ''
      ])
    }

    // Detailed notes
    if (isAnual) {
      const maxNotas = Math.max(
        comp.notas1?.length || 0,
        comp.notas2?.length || 0,
        comp.notas3?.length || 0,
        comp.notas4?.length || 0
      )

      if (maxNotas > 0) {
        for (let i = 0; i < maxNotas; i++) {
          sheetData.push([
            '',
            formatNota(comp.notas1?.[i]),
            formatNota(comp.notas2?.[i]),
            formatNota(comp.notas3?.[i]),
            formatNota(comp.notas4?.[i]),
            ''
          ])
        }
        sheetData.push([])
      }
    } else {
      const notasBimestre = comp[`notas${bimNum}`]
      if (notasBimestre && notasBimestre.length > 0) {
        notasBimestre.forEach(nota => {
          sheetData.push(['', '', formatNota(nota)])
        })
        sheetData.push([])
      }
    }
  })

  return sheetData
}

/**
 * Genera la hoja de conducta para Excel
 * @param {Object} child - Estudiante
 * @param {number} year - Año escolar
 * @param {string} bimestreFilter - Filtro de bimestre
 * @param {Array} behaviors - Lista de comportamientos (desde servicio/store)
 * @param {Array} meetings - Lista de reuniones de padres (desde servicio/store)
 * @param {Array} attendances - Lista de asistencias a reuniones (desde servicio/store)
 * @returns {Array|null} Array de arrays con datos o null si no hay datos
 */
const generateBehaviorSheet = (child, year, bimestreFilter, behaviors = [], meetings = [], attendances = []) => {
  const studentBehaviors = behaviors.filter(b => {
    const student_id = b.student_id || b.student_id
    const academic_year = b.academic_year || b.academic_year
    return estudianteId === child.id && añoEscolar === year
  })

  if (studentBehaviors.length === 0) return null

  const behaviorSheetData = []
  const isAnual = bimestreFilter === 'anual'
  const bimNum = parseInt(bimestreFilter)

  behaviorSheetData.push(['CONDUCTA Y PARTICIPACIÓN DE PADRES'])
  behaviorSheetData.push([`Estudiante: ${child.first_names} ${child.last_names}`])
  behaviorSheetData.push([`Año: ${year}`])
  if (!isAnual) {
    behaviorSheetData.push([`Bimestre: ${bimNum}`])
  }
  behaviorSheetData.push([])
  behaviorSheetData.push(['Bimestre', 'Disciplina', 'Calificación Padres'])

  if (isAnual) {
    for (let bim = 1; bim <= 4; bim++) {
      const behavior = studentBehaviors.find(b => b.quarter === bim)
      const disciplina = behavior?.disciplina || behavior?.discipline
      const calificacionPadres = behavior?.calificacionPadres || behavior?.calificacion_padres || behavior?.parentRating
      behaviorSheetData.push([
        `Bimestre ${bim}`,
        disciplina || '-',
        calificacionPadres || '-'
      ])
    }
    const meetingAttendance = getAttendanceSummaryForStudent(meetings, attendances, child.id, year)
    behaviorSheetData.push([])
    behaviorSheetData.push(['Asistencia a Reuniones de Padres (Año Completo)', '', meetingAttendance.formato])
  } else {
    const behavior = studentBehaviors.find(b => b.quarter === bimNum)
    const disciplina = behavior?.disciplina || behavior?.discipline
    const calificacionPadres = behavior?.calificacionPadres || behavior?.calificacion_padres || behavior?.parentRating
    behaviorSheetData.push([
      `Bimestre ${bimNum}`,
      disciplina || '-',
      calificacionPadres || '-'
    ])
  }

  return behaviorSheetData
}

/**
 * Genera la hoja de asistencias para Excel
 * @param {Object} child - Estudiante
 * @param {number} year - Año escolar
 * @param {string} bimestreFilter - Filtro de bimestre
 * @param {Array} attendanceRecords - Registros de asistencia (desde servicio/store)
 * @returns {Array|null} Array de arrays con datos o null si no hay datos
 */
const generateAttendanceSheet = (child, year, bimestreFilter, attendanceRecords = []) => {
  const attendanceByBimester = generateAttendanceDataForReportCard(attendanceRecords, child.id)
  const yearSummary = getYearlyAttendanceSummary(attendanceByBimester)

  // Verificar si hay datos
  const hasData = Object.values(attendanceByBimester).some(bim =>
    bim.inasistenciaJustificada > 0 ||
    bim.inasistenciaInjustificada > 0 ||
    bim.tardanzaJustificada > 0 ||
    bim.tardanzaInjustificada > 0
  )
  if (!hasData) return null

  const attendanceSheetData = []
  const isAnual = bimestreFilter === 'anual'
  const bimNum = parseInt(bimestreFilter)

  attendanceSheetData.push(['REPORTE DE ASISTENCIAS'])
  attendanceSheetData.push([`Estudiante: ${child.first_names} ${child.last_names}`])
  attendanceSheetData.push([`Año: ${year}`])
  if (!isAnual) {
    attendanceSheetData.push([`Bimestre: ${bimNum}`])
  }
  attendanceSheetData.push([])
  attendanceSheetData.push(['Bimestre', 'Inasist. Justificada', 'Inasist. Injustificada', 'Tard. Justificada', 'Tard. Injustificada'])

  if (isAnual) {
    for (let bim = 1; bim <= 4; bim++) {
      const bimKey = `B${bim}`
      const bimData = attendanceByBimester[bimKey] || {}
      attendanceSheetData.push([
        `Bimestre ${bim}`,
        bimData.inasistenciaJustificada || 0,
        bimData.inasistenciaInjustificada || 0,
        bimData.tardanzaJustificada || 0,
        bimData.tardanzaInjustificada || 0
      ])
    }
    attendanceSheetData.push([])
    attendanceSheetData.push([
      'TOTAL ANUAL',
      yearSummary.inasistenciaJustificada || 0,
      yearSummary.inasistenciaInjustificada || 0,
      yearSummary.tardanzaJustificada || 0,
      yearSummary.tardanzaInjustificada || 0
    ])
  } else {
    const bimKey = `B${bimNum}`
    const bimData = attendanceByBimester[bimKey] || {}
    attendanceSheetData.push([
      `Bimestre ${bimNum}`,
      bimData.inasistenciaJustificada || 0,
      bimData.inasistenciaInjustificada || 0,
      bimData.tardanzaJustificada || 0,
      bimData.tardanzaInjustificada || 0
    ])
  }

  return attendanceSheetData
}

/**
 * Exporta la boleta de un estudiante a Excel
 * @param {Object} child - Estudiante
 * @param {Array} childBoletaData - Datos de la boleta
 * @param {number} year - Año escolar
 * @param {string} bimestreFilter - Filtro de bimestre ('anual' o número)
 * @param {Array} behaviors - Lista de comportamientos (desde servicio/store)
 * @param {Array} meetings - Lista de reuniones de padres (desde servicio/store)
 * @param {Array} attendances - Lista de asistencias a reuniones (desde servicio/store)
 * @param {Array} attendanceRecords - Registros de asistencia (desde servicio/store)
 */
export const exportChildBoletaToExcel = (
  child,
  childBoletaData,
  year,
  bimestreFilter = 'anual',
  behaviors = [],
  meetings = [],
  attendances = [],
  attendanceRecords = []
) => {
  if (!childBoletaData || childBoletaData.length === 0) return

  const wb = XLSX.utils.book_new()

  // Add course sheets
  childBoletaData.forEach(curso => {
    const sheetData = generateCourseSheetData(curso, child, year, bimestreFilter)
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    XLSX.utils.book_append_sheet(wb, ws, curso.cursoNombre.substring(0, 30))
  })

  // Add behavior sheet
  const behaviorSheetData = generateBehaviorSheet(child, year, bimestreFilter, behaviors, meetings, attendances)
  if (behaviorSheetData) {
    const behaviorWs = XLSX.utils.aoa_to_sheet(behaviorSheetData)
    XLSX.utils.book_append_sheet(wb, behaviorWs, 'Conducta')
  }

  // Add attendance sheet
  const attendanceSheetData = generateAttendanceSheet(child, year, bimestreFilter, attendanceRecords)
  if (attendanceSheetData) {
    const attendanceWs = XLSX.utils.aoa_to_sheet(attendanceSheetData)
    XLSX.utils.book_append_sheet(wb, attendanceWs, 'Asistencias')
  }

  // Save file
  const isAnual = bimestreFilter === 'anual'
  const bimestralSuffix = isAnual ? '' : `_Bim${bimestreFilter}`
  const fileName = `Boleta_${child.first_names}_${child.last_names}_${year}${bimestralSuffix}.xlsx`
  XLSX.writeFile(wb, fileName)
}
