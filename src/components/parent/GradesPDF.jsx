import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 3,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#000',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderBottom: '2px solid #2563eb',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#1e40af',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    color: '#374151',
  },
  gradeExcellent: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  gradeGood: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  gradeRegular: {
    color: '#ca8a04',
    fontWeight: 'bold',
  },
  gradePoor: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  behaviorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  behaviorItem: {
    width: '50%',
    marginBottom: 8,
    flexDirection: 'row',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
  divider: {
    borderBottom: '1px solid #e5e7eb',
    marginVertical: 10,
  },
  promedio: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  promedioText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }
})

// Componente del documento PDF
export const GradesPDFDocument = ({ studentData, gradesData, periodData }) => {
  // Validación: Si no hay datos, no generar PDF
  if (!studentData || !gradesData || !periodData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>No hay datos disponibles</Text>
            <Text style={styles.subtitle}>Por favor, selecciona un estudiante y un período</Text>
          </View>
        </Page>
      </Document>
    )
  }

  // Obtener levelId del estudiante para usar configuración dinámica
  const levelId = studentData?.level_id || null

  // Determinar estilo según el tipo de calificación usando store SSOT
  const getGradeStyle = (grade, gradingSystem) => {
    if (grade === null || grade === undefined || grade === '--') {
      return styles.tableCell
    }

    const store = getGradingScalesStore()
    const hexColor = store.getGradeColor(grade, levelId)

    // Mapear color hex a estilos de PDF
    const styleMap = {
      '#22c55e': styles.gradeExcellent,
      '#3b82f6': styles.gradeGood,
      '#eab308': styles.gradeRegular,
      '#ef4444': styles.gradePoor
    }

    return styleMap[hexColor] || styles.tableCell
  }

  // Determinar estado según el tipo de calificación usando store SSOT
  const getEstado = (grade, gradingSystem) => {
    if (grade === null || grade === undefined || grade === '--') {
      return 'Sin Calificar'
    }

    const store = getGradingScalesStore()
    const levelConfig = store.getScaleForLevel(levelId)

    // Si es sistema literal y hay configuración personalizada
    if (gradingSystem === 'literal' && levelConfig?.type === 'letters' && levelConfig?.scale) {
      // Si grade es una letra, buscar la etiqueta
      if (typeof grade === 'string') {
        const gradeItem = levelConfig.scale.find(
          item => item.value.toUpperCase() === grade.toUpperCase()
        )
        if (gradeItem?.label) {
          return gradeItem.label
        }
      }
      // Si es número, convertir a letra primero
      if (typeof grade === 'number') {
        const letter = store.convertNumericToLetter(grade, levelId)
        const gradeItem = levelConfig.scale.find(
          item => item.value.toUpperCase() === letter.toUpperCase()
        )
        if (gradeItem?.label) {
          return gradeItem.label
        }
      }
    }

    // Para sistema numérico o fallback
    if (levelConfig?.type === 'numeric' && levelConfig?.ranges) {
      const numGrade = typeof grade === 'number' ? grade : parseFloat(grade)
      if (!isNaN(numGrade)) {
        for (const range of levelConfig.ranges) {
          if (numGrade >= range.min && numGrade <= range.max) {
            return range.label
          }
        }
      }
    }

    // Fallback a etiquetas por defecto
    if (typeof grade === 'string') {
      const defaultLabels = {
        'A': 'Logro Destacado', 'AD': 'Logro Destacado',
        'B': 'Logro Esperado',
        'C': 'En Proceso',
        'D': 'En Inicio'
      }
      return defaultLabels[grade.toUpperCase()] || 'Sin Calificar'
    }

    // Fallback para números
    const numGrade = parseFloat(grade)
    if (!isNaN(numGrade)) {
      if (numGrade >= 18) return 'Excelente'
      if (numGrade >= 14) return 'Bueno'
      if (numGrade >= 11) return 'Regular'
      return 'Necesita Mejorar'
    }

    return 'Sin Calificar'
  }

  // Obtener el valor de nota a mostrar (preferir averageDisplay sobre average)
  const getDisplayGrade = (competencia) => {
    if (competencia.averageDisplay !== null && competencia.averageDisplay !== undefined) {
      return competencia.averageDisplay
    }
    if (competencia.average !== null && competencia.average !== undefined) {
      return competencia.average
    }
    return '--'
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>BOLETA DE NOTAS</Text>
          <Text style={styles.subtitle}>Luz del Saber - Año Lectivo {new Date().getFullYear()}</Text>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>
            {new Date().toLocaleDateString('es-PE')}
          </Text>
        </View>

        {/* Información del Estudiante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL ESTUDIANTE</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre Completo:</Text>
            <Text style={styles.value}>{studentData.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Grado y Sección:</Text>
            <Text style={styles.value}>{studentData.grade}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Período Académico:</Text>
            <Text style={styles.value}>{periodData.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado del Período:</Text>
            <Text style={styles.value}>{periodData.status === 'current' ? 'En Curso' : 'Completado'}</Text>
          </View>
        </View>

        {/* Calificaciones por Competencias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CALIFICACIONES POR COMPETENCIAS</Text>

          {(gradesData.subjects || []).map((subject, subjectIndex) => (
            <View key={subjectIndex} style={{ marginBottom: 15 }}>
              {/* Encabezado de materia */}
              <View style={[styles.tableHeader, { backgroundColor: '#2563eb' }]}>
                <Text style={[styles.tableHeaderCell, { width: '70%', color: 'white' }]}>
                  {subject.name || 'N/A'}
                </Text>
                <Text style={[styles.tableHeaderCell, { width: '30%', color: 'white', fontSize: 9 }]}>
                  Prof. {subject.teacher || 'N/A'}
                </Text>
              </View>

              {/* Tabla de competencias con evaluaciones detalladas */}
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Competencia</Text>
                  <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Evaluacion</Text>
                  <Text style={[styles.tableHeaderCell, { width: '12%', textAlign: 'center' }]}>Nota</Text>
                  <Text style={[styles.tableHeaderCell, { width: '33%' }]}>Comentario</Text>
                </View>

                {(subject.competencias || []).map((competencia, compIndex) => {
                  const displayGrade = getDisplayGrade(competencia)
                  const gradingSystem = competencia.gradingSystem || 'vigesimal'

                  // Obtener las evaluaciones de esta competencia
                  const competenciaEvaluations = (subject.evaluations || []).filter(
                    ev => ev.competenciaId === competencia.id
                  )

                  // Si no hay evaluaciones individuales, mostrar solo el promedio
                  if (competenciaEvaluations.length === 0) {
                    return (
                      <View key={compIndex} style={[styles.tableRow, { backgroundColor: compIndex % 2 === 0 ? '#fafafa' : 'white' }]}>
                        <Text style={[styles.tableCell, { width: '35%', fontSize: 10, fontWeight: 'bold' }]}>
                          {competencia.name || 'N/A'}
                        </Text>
                        <Text style={[styles.tableCell, { width: '20%', fontSize: 9, color: '#6b7280' }]}>
                          (Promedio)
                        </Text>
                        <Text style={[getGradeStyle(displayGrade, gradingSystem), { width: '12%', textAlign: 'center' }]}>
                          {displayGrade}
                        </Text>
                        <Text style={[styles.tableCell, { width: '33%', fontSize: 8, color: '#6b7280' }]}>
                          -
                        </Text>
                      </View>
                    )
                  }

                  // Mostrar cada evaluación individual
                  return competenciaEvaluations.map((evaluation, evalIndex) => (
                    <View
                      key={`${compIndex}-${evalIndex}`}
                      style={[
                        styles.tableRow,
                        { backgroundColor: evalIndex % 2 === 0 ? '#fafafa' : 'white' },
                        evalIndex === 0 && { borderTop: '1px solid #d1d5db' }
                      ]}
                    >
                      {/* Mostrar nombre de competencia solo en la primera fila */}
                      <Text style={[styles.tableCell, { width: '35%', fontSize: 10, fontWeight: evalIndex === 0 ? 'bold' : 'normal' }]}>
                        {evalIndex === 0 ? (competencia.name || 'N/A') : ''}
                      </Text>
                      <Text style={[styles.tableCell, { width: '20%', fontSize: 9 }]}>
                        {evaluation.name || '-'}
                      </Text>
                      <Text style={[getGradeStyle(evaluation.gradeDisplay || evaluation.grade, evaluation.gradingSystem || gradingSystem), { width: '12%', textAlign: 'center' }]}>
                        {evaluation.gradeDisplay || evaluation.grade || '-'}
                      </Text>
                      <Text style={[styles.tableCell, { width: '33%', fontSize: 8, color: '#4b5563', fontStyle: evaluation.comment ? 'normal' : 'italic' }]}>
                        {evaluation.comment || '-'}
                      </Text>
                    </View>
                  ))
                })}

                {/* Fila de promedio general de la materia */}
                {(() => {
                  // Calcular promedio de la materia basado en las competencias
                  const competenciasConPromedio = (subject.competencias || []).filter(
                    c => c.average !== null && c.average !== undefined
                  )
                  if (competenciasConPromedio.length === 0) return null

                  // Determinar el sistema de calificación predominante
                  const gradingSystem = competenciasConPromedio[0]?.gradingSystem || 'vigesimal'
                  const isLiteral = gradingSystem === 'literal'

                  // Calcular promedio numérico
                  const promedioNumerico = competenciasConPromedio.reduce((acc, c) => acc + (c.average || 0), 0) / competenciasConPromedio.length

                  // Formatear para mostrar usando store SSOT
                  let promedioDisplay
                  if (isLiteral) {
                    // Convertir a letra usando configuración dinámica del store
                    const store = getGradingScalesStore()
                    promedioDisplay = store.convertNumericToLetter(promedioNumerico, levelId)
                  } else {
                    promedioDisplay = promedioNumerico.toFixed(1)
                  }

                  return (
                    <View style={[styles.tableRow, { backgroundColor: '#e0f2fe', borderTop: '2px solid #2563eb' }]}>
                      <Text style={[styles.tableCell, { width: '55%', fontSize: 10, fontWeight: 'bold', color: '#1e40af' }]}>
                        PROMEDIO DE LA MATERIA
                      </Text>
                      <Text style={[styles.tableCell, { width: '12%', textAlign: 'center', fontWeight: 'bold', color: '#1e40af', fontSize: 12 }]}>
                        {promedioDisplay}
                      </Text>
                      <Text style={[styles.tableCell, { width: '33%', fontSize: 9, color: '#1e40af' }]}>
                        {getEstado(isLiteral ? promedioDisplay : promedioNumerico, gradingSystem)}
                      </Text>
                    </View>
                  )
                })()}
              </View>
            </View>
          ))}
        </View>

        {/* Observaciones del Docente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBSERVACIONES DEL DOCENTE</Text>
          {(() => {
            // Recopilar todas las evaluaciones con comentarios
            const allComments = []
            ;(gradesData.subjects || []).forEach(subject => {
              ;(subject.evaluations || []).forEach(evaluation => {
                if (evaluation.comment && evaluation.comment.trim()) {
                  allComments.push({
                    subject: subject.name,
                    evaluation: evaluation.name,
                    grade: evaluation.gradeDisplay || evaluation.grade,
                    comment: evaluation.comment
                  })
                }
              })
            })

            if (allComments.length === 0) {
              return (
                <Text style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>
                  No hay observaciones registradas para este periodo.
                </Text>
              )
            }

            return allComments.slice(0, 8).map((item, index) => (
              <View key={index} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #f59e0b' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 9, color: '#92400e' }}>
                  {item.subject} - {item.evaluation} ({item.grade}):
                </Text>
                <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 1 }}>
                  {item.comment}
                </Text>
              </View>
            ))
          })()}
          {(() => {
            const totalComments = (gradesData.subjects || []).reduce((acc, subject) => {
              return acc + (subject.evaluations || []).filter(e => e.comment && e.comment.trim()).length
            }, 0)
            if (totalComments > 8) {
              return (
                <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4 }}>
                  ... y {totalComments - 8} observaciones adicionales
                </Text>
              )
            }
            return null
          })()}
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <Text>Este documento es un reporte oficial del sistema académico</Text>
          <Text>Luz del Saber © {new Date().getFullYear()} - Todos los derechos reservados</Text>
        </View>
      </Page>
    </Document>
  )
}

// Función para generar el PDF como blob
export const generatePDFBlob = async (studentData, gradesData, periodData) => {
  const doc = <GradesPDFDocument studentData={studentData} gradesData={gradesData} periodData={periodData} />
  const blob = await pdf(doc).toBlob()
  return blob
}

// Componente de botón de descarga
export const PDFDownloadButton = ({ studentData, gradesData, periodData, className }) => {
  // Validar que existan los datos antes de generar el nombre del archivo
  if (!studentData || !periodData) {
    return <span className={className}>No disponible</span>
  }

  const fileName = `Boleta_${(studentData.name || 'Estudiante').replace(/\s+/g, '_')}_${(periodData.name || 'Periodo').replace(/\s+/g, '_')}.pdf`

  return (
    <PDFDownloadLink
      document={<GradesPDFDocument studentData={studentData} gradesData={gradesData} periodData={periodData} />}
      fileName={fileName}
      className={className}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generando PDF...' : 'Descargar PDF'
      }
    </PDFDownloadLink>
  )
}