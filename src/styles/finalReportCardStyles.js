import { StyleSheet } from '@react-pdf/renderer'

/**
 * Estilos para el componente de Boleta Final
 * Replicación exacta del formato oficial del MINEDU
 */
export const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 6,
    fontFamily: 'Helvetica',
  },
  // Título principal (centrado, sin logos)
  mainTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageNumber: {
    fontSize: 8,
    textAlign: 'right',
    marginBottom: 5,
  },
  // Header con logos a los lados de la tabla
  mainHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  logoLeft: {
    width: 80,
    height: 140,
    marginRight: 10,
    objectFit: 'contain',
  },
  logoRight: {
    width: 80,
    height: 140,
    marginLeft: 10,
    objectFit: 'contain',
  },
  // Tabla de información del estudiante (2 columnas) - ocupa el centro
  infoTable: {
    flex: 1,
    border: '1pt solid black',
  },
  infoRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
  },
  infoRowLast: {
    flexDirection: 'row',
  },
  infoCell: {
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 6,
  },
  infoCellNoBorder: {
    padding: 3,
    fontSize: 6,
  },
  infoCellLabel: {
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 6,
    backgroundColor: '#d9d9d9',
    fontWeight: 'bold',
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  infoValue: {
    marginLeft: 3,
  },
  // Tabla principal de competencias
  mainTable: {
    border: '1pt solid black',
  },
  // Header de la tabla
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#d9d9d9',
    borderBottom: '1pt solid black',
  },
  headerCell: {
    padding: 4,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 6,
    fontWeight: 'bold',
  },
  headerCellNoBorder: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 6,
    fontWeight: 'bold',
  },
  // Subheader de bimestres
  bimesterSubheader: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
    borderBottom: '1pt solid black',
  },
  subHeaderCell: {
    padding: 2,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 5,
    fontWeight: 'bold',
  },
  // Bloque de área (agrupa área + competencias)
  areaBlock: {
    borderBottom: '1pt solid black',
  },
  // Celda del área que ocupa toda la altura
  areaCellBlock: {
    width: 60,
    padding: 3,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  areaCellText: {
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Fila completa de datos (área + competencia + notas)
  fullDataRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #cccccc',
  },
  // Celda del área en cada fila
  areaCellRow: {
    width: 60,
    padding: 2,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  // Fila de competencia dentro del bloque
  competenciaRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #cccccc',
  },
  // Celdas internas para las competencias
  competenceCellInner: {
    width: 120,
    padding: 2,
    borderRight: '1pt solid black',
    fontSize: 5,
    lineHeight: 1.2,
    justifyContent: 'center',
  },
  gradeCellInner: {
    width: 18,
    padding: 1,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  conclusionCellInner: {
    width: 77,
    padding: 1,
    borderRight: '1pt solid black',
    fontSize: 4,
    lineHeight: 1.1,
    justifyContent: 'center',
  },
  finalGradeCellInner: {
    width: 35,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  // Estilos legacy (mantener por compatibilidad)
  dataRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
    minHeight: 25,
  },
  areaCell: {
    width: 60,
    padding: 3,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 6,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  competenceCell: {
    width: 120,
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 5,
    lineHeight: 1.3,
  },
  gradeCell: {
    width: 18,
    padding: 2,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  conclusionCell: {
    width: 77,
    padding: 2,
    borderRight: '1pt solid black',
    fontSize: 5,
    lineHeight: 1.2,
  },
  finalGradeCell: {
    width: 35,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  // Estilos para secciones adicionales (página 3)
  additionalSectionsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  leftSection: {
    flex: 2,
  },
  rightSection: {
    flex: 1,
  },
  // Tabla de logros
  achievementsTable: {
    border: '1pt solid black',
    marginBottom: 10,
  },
  achievementRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
    minHeight: 40,
  },
  achievementLevelCell: {
    width: 80,
    padding: 3,
    borderRight: '1pt solid black',
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  achievementDescCell: {
    flex: 1,
    padding: 3,
    fontSize: 6,
    lineHeight: 1.3,
  },
  // Leyenda de calificaciones
  legendBox: {
    border: '1pt solid black',
    padding: 5,
    marginBottom: 10,
  },
  legendTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 6,
  },
  legendGrade: {
    width: 25,
    fontWeight: 'bold',
  },
  // Tabla de justificaciones
  justificationsTable: {
    border: '1pt solid black',
    marginBottom: 10,
  },
  justificationRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
    padding: 3,
  },
  justificationLabel: {
    fontSize: 6,
  },
  // Tabla de asistencia
  attendanceTable: {
    border: '1pt solid black',
  },
  attendanceHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#d9d9d9',
    borderBottom: '1pt solid black',
  },
  attendanceHeaderCell: {
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 6,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceDataRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid black',
  },
  attendanceDataCell: {
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceLabelCell: {
    padding: 3,
    borderRight: '1pt solid black',
    fontSize: 6,
    backgroundColor: '#f5f5f5',
  },
})
