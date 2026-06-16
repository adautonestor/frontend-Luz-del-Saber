import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { getAverageGradingScale } from '@/utils/gradeConversion.jsx'

/**
 * Estilos para el PDF de boleta del profesor
 */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 3,
  },
  quarterBadge: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '4 12',
    borderRadius: 4,
    fontSize: 11,
    marginTop: 8,
    alignSelf: 'center',
  },
  studentInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
  },
  studentInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  studentLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#374151',
  },
  studentValue: {
    flex: 1,
    color: '#111827',
  },
  courseSection: {
    marginBottom: 15,
    borderRadius: 4,
    overflow: 'hidden',
  },
  courseHeader: {
    backgroundColor: '#2563eb',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  courseAverage: {
    backgroundColor: 'white',
    color: '#2563eb',
    padding: '2 8',
    borderRadius: 3,
    fontWeight: 'bold',
    fontSize: 10,
  },
  gradeTable: {
    border: '1px solid #e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #f3f4f6',
    padding: 6,
    minHeight: 24,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  categoryCell: {
    width: '25%',
    fontSize: 9,
    color: '#4b5563',
  },
  subcategoryCell: {
    width: '30%',
    fontSize: 9,
    color: '#111827',
  },
  gradeCell: {
    width: '10%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
  },
  observationCell: {
    width: '35%',
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  gradeExcellent: {
    color: '#16a34a',
  },
  gradeGood: {
    color: '#2563eb',
  },
  gradeRegular: {
    color: '#ca8a04',
  },
  gradePoor: {
    color: '#dc2626',
  },
  noGrades: {
    padding: 20,
    textAlign: 'center',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  legend: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  legendTitle: {
    fontWeight: 'bold',
    fontSize: 9,
    marginBottom: 5,
    color: '#374151',
  },
  legendRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 8,
  },
  legendItem: {
    marginRight: 15,
  },
  observationsSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    borderLeft: '3px solid #f59e0b',
  },
  observationsTitle: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#92400e',
    marginBottom: 4,
  },
  observationItem: {
    fontSize: 8,
    color: '#78350f',
    marginBottom: 3,
    paddingLeft: 8,
  },
})

/**
 * Determina el estilo de color según la nota
 */
const getGradeStyle = (value, gradingSystem) => {
  if (!value) return {}

  if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria') {
    const numValue = parseFloat(value)
    if (numValue >= 18) return styles.gradeExcellent
    if (numValue >= 14) return styles.gradeGood
    if (numValue >= 11) return styles.gradeRegular
    return styles.gradePoor
  }

  // Sistema literal
  const letter = String(value).toUpperCase()
  if (letter === 'A' || letter === 'AD') return styles.gradeExcellent
  if (letter === 'B') return styles.gradeGood
  if (letter === 'C') return styles.gradeRegular
  if (letter === 'D') return styles.gradePoor
  return {}
}

/**
 * Documento PDF de la boleta
 */
const TeacherReportCardDocument = ({ reportData }) => {
  if (!reportData || !reportData.student) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>No hay datos disponibles</Text>
            <Text style={styles.subtitle}>Por favor, selecciona un estudiante y un bimestre</Text>
          </View>
        </Page>
      </Document>
    )
  }

  const { student, quarter, courses } = reportData

  // Recopilar todas las observaciones
  const allObservations = []
  courses.forEach(course => {
    course.grades.forEach(grade => {
      if (grade.observation && grade.observation.trim()) {
        allObservations.push({
          course: course.course_name,
          category: grade.category_name,
          subcategory: grade.subcategory_name,
          observation: grade.observation
        })
      }
    })
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>BOLETA DE NOTAS</Text>
          <Text style={styles.subtitle}>Luz del Saber - Sistema de Gestion Escolar</Text>
          <View style={styles.quarterBadge}>
            <Text>{quarter}° Bimestre - {new Date().getFullYear()}</Text>
          </View>
        </View>

        {/* Informacion del estudiante */}
        <View style={styles.studentInfo}>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentLabel}>Estudiante:</Text>
            <Text style={styles.studentValue}>{student.full_name}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentLabel}>DNI:</Text>
            <Text style={styles.studentValue}>{student.dni}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentLabel}>Grado/Seccion:</Text>
            <Text style={styles.studentValue}>{student.grade} - {student.section}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentLabel}>Nivel:</Text>
            <Text style={styles.studentValue}>{student.level}</Text>
          </View>
        </View>

        {/* Notas por curso */}
        {courses.length === 0 ? (
          <View style={styles.noGrades}>
            <Text>No hay notas registradas para este bimestre</Text>
          </View>
        ) : (
          courses.map((course, courseIndex) => (
            <View key={courseIndex} style={styles.courseSection} wrap={false}>
              {/* Header del curso */}
              <View style={styles.courseHeader}>
                <Text style={styles.courseName}>{course.course_name}</Text>
                {course.average && (
                  <Text style={styles.courseAverage}>Prom: {course.average}</Text>
                )}
              </View>

              {/* Tabla de notas */}
              <View style={styles.gradeTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.categoryCell]}>Categoria</Text>
                  <Text style={[styles.tableHeaderCell, styles.subcategoryCell]}>Evaluacion</Text>
                  <Text style={[styles.tableHeaderCell, styles.gradeCell]}>Nota</Text>
                  <Text style={[styles.tableHeaderCell, styles.observationCell]}>Comentario</Text>
                </View>

                {course.grades.map((grade, gradeIndex) => (
                  <View
                    key={gradeIndex}
                    style={[
                      styles.tableRow,
                      gradeIndex % 2 === 1 && styles.tableRowAlt
                    ]}
                  >
                    <Text style={styles.categoryCell}>{grade.category_name}</Text>
                    <Text style={styles.subcategoryCell}>{grade.subcategory_name}</Text>
                    <Text style={[styles.gradeCell, getGradeStyle(grade.value, grade.grading_system)]}>
                      {grade.value || '--'}
                    </Text>
                    <Text style={styles.observationCell}>
                      {grade.observation || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        {/* Seccion de observaciones importantes (si hay comentarios) */}
        {allObservations.length > 0 && (
          <View style={styles.observationsSection} wrap={false}>
            <Text style={styles.observationsTitle}>Observaciones del Docente:</Text>
            {allObservations.slice(0, 5).map((obs, index) => (
              <Text key={index} style={styles.observationItem}>
                - {obs.course} ({obs.subcategory}): {obs.observation}
              </Text>
            ))}
            {allObservations.length > 5 && (
              <Text style={styles.observationItem}>
                ... y {allObservations.length - 5} observaciones adicionales
              </Text>
            )}
          </View>
        )}

        {/* Leyenda dinámica */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Escala de Calificacion:</Text>
          {(() => {
            const scale = getAverageGradingScale(student?.level_id)
            const colorStyles = [styles.gradeExcellent, styles.gradeGood, styles.gradeRegular, styles.gradePoor]
            const rows = []
            for (let i = 0; i < scale.length; i += 2) {
              rows.push(
                <View key={i} style={styles.legendRow}>
                  <Text style={[styles.legendItem, colorStyles[i] || styles.gradePoor]}>
                    {scale[i].letter}: {scale[i].description}
                  </Text>
                  {scale[i + 1] && (
                    <Text style={[styles.legendItem, colorStyles[i + 1] || styles.gradePoor]}>
                      {scale[i + 1].letter}: {scale[i + 1].description}
                    </Text>
                  )}
                </View>
              )
            }
            return rows
          })()}
        </View>

        {/* Pie de pagina */}
        <View style={styles.footer}>
          <Text>Documento generado el {new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</Text>
          <Text>Luz del Saber - Sistema de Gestion Escolar</Text>
        </View>
      </Page>
    </Document>
  )
}

/**
 * Genera el PDF como blob para descarga
 * @param {Object} reportData - Datos de la boleta
 * @returns {Promise<Blob>} Blob del PDF
 */
export const generateReportCardPDFBlob = async (reportData) => {
  const doc = <TeacherReportCardDocument reportData={reportData} />
  const blob = await pdf(doc).toBlob()
  return blob
}

/**
 * Descarga la boleta como PDF
 * @param {Object} reportData - Datos de la boleta
 */
export const downloadReportCardPDF = async (reportData) => {
  try {
    const blob = await generateReportCardPDFBlob(reportData)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const studentName = reportData?.student?.full_name?.replace(/[,\s]+/g, '_') || 'Estudiante'
    const quarter = reportData?.quarter || 1

    link.href = url
    link.download = `Boleta_${studentName}_Bimestre${quarter}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar PDF de boleta:', error)
    throw error
  }
}

export default TeacherReportCardDocument
