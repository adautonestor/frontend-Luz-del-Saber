import React from 'react'
import { Document, Page, Text, pdf } from '@react-pdf/renderer'
import { styles } from '../../styles/finalReportCardStyles'
import { organizeByArea } from '../../utils/reportCardUtils'
import ReportCardHeader from './ReportCardHeader'
import ReportCardMainTable from './ReportCardMainTable'
import ReportCardAdditionalSections from './ReportCardAdditionalSections'
import ReportCardAttendanceTable from './ReportCardAttendanceTable'
import ReportCardBehaviorSection from './ReportCardBehaviorSection'
import ReportCardFooter from './ReportCardFooter'

/**
 * Componente del documento PDF de la boleta final
 * Genera el informe de progreso de competencias del estudiante
 * Dividido en 2 páginas según formato SIAGIE
 * @param {Object} studentData - Datos del estudiante
 * @param {Array} gradesData - Array de cursos con competencias y calificaciones
 * @param {number} year - Año lectivo
 */
export const FinalReportCardDocument = ({ studentData, gradesData, year = new Date().getFullYear() }) => {
  // Organizar datos por área curricular
  const areaMap = organizeByArea(gradesData)

  // Determinar sistema de calificación
  const gradingSystem = studentData?.gradingSystem || 'literal'

  return (
    <Document>
      {/* PÁGINA 1: Header + Competencias + Leyenda + Conducta */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Número de página */}
        <Text style={styles.pageNumber}>Página 1 de 2</Text>

        {/* Título centrado */}
        <Text style={styles.mainTitle}>
          INFORME DE PROGRESO DE LAS COMPETENCIAS DEL ESTUDIANTE - {year}
        </Text>

        {/* Header con logos y tabla de información del estudiante */}
        <ReportCardHeader studentData={studentData} />

        {/* Tabla principal de competencias */}
        <ReportCardMainTable areaMap={areaMap} />

        {/* Secciones adicionales: tabla de logros con descripciones (dinámica) */}
        <ReportCardAdditionalSections gradingScale={studentData?.gradingScale} />

        {/* Sección de Conducta y Participación de Padres */}
        <ReportCardBehaviorSection studentBehaviors={studentData?.studentBehaviors || []} />
      </Page>

      {/* PÁGINA 2: Asistencia + Situación Final + Firmas + Fecha */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Número de página */}
        <Text style={styles.pageNumber}>Página 2 de 2</Text>

        {/* Tabla de asistencia formato SIAGIE */}
        <ReportCardAttendanceTable attendanceData={studentData?.attendanceData || {}} />

        {/* Footer: Situación final + Firmas + Fecha de emisión */}
        <ReportCardFooter />
      </Page>
    </Document>
  )
}

/**
 * Genera el PDF como blob para uso interno o visualización
 * @param {Object} studentData - Datos del estudiante
 * @param {Array} gradesData - Array de cursos con competencias
 * @param {number} year - Año lectivo
 * @returns {Promise<Blob>} Blob del PDF generado
 */
export const generateFinalReportCardBlob = async (studentData, gradesData, year) => {
  const doc = <FinalReportCardDocument studentData={studentData} gradesData={gradesData} year={year} />
  const blob = await pdf(doc).toBlob()
  return blob
}

/**
 * Descarga directamente el PDF de la boleta final
 * @param {Object} studentData - Datos del estudiante
 * @param {Array} gradesData - Array de cursos con competencias
 * @param {number} year - Año lectivo
 */
export const downloadFinalReportCard = async (studentData, gradesData, year) => {
  const blob = await generateFinalReportCardBlob(studentData, gradesData, year)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Boleta_Final_${studentData.first_names}_${studentData.last_names}_${year}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
