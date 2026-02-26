import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { BIMESTRES } from '../../config/reportCardConfig'

// Estilos específicos para la tabla de asistencia formato SIAGIE
const attendanceStyles = StyleSheet.create({
  table: {
    border: '1pt solid black',
    marginTop: 10,
    width: 300, // Ancho fijo proporcional
    alignSelf: 'center', // Centrar la tabla
  },
  // Primera fila: Headers principales (Período, Inasistencia, Tardanzas)
  headerRow1: {
    flexDirection: 'row',
    backgroundColor: '#d9d9d9',
    borderBottom: '1pt solid black',
  },
  // Segunda fila: Subheaders (Justificadas, Injustificadas)
  headerRow2: {
    flexDirection: 'row',
    backgroundColor: '#e9e9e9',
    borderBottom: '1pt solid black',
  },
  // Celda de período (rowspan visual)
  periodHeaderCell: {
    width: 60,
    padding: 4,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Celda header principal (Inasistencia/Tardanzas)
  mainHeaderCell: {
    width: 120,
    padding: 4,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Celda subheader (Justificadas/Injustificadas)
  subHeaderCell: {
    width: 60,
    padding: 3,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Fila de datos
  dataRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    minHeight: 20,
  },
  lastDataRow: {
    flexDirection: 'row',
    minHeight: 20,
  },
  // Celda de período en datos (B1, B2, etc)
  periodCell: {
    width: 60,
    padding: 4,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  // Celda de datos
  dataCell: {
    width: 60,
    padding: 4,
    borderRight: '1pt solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataCellLast: {
    width: 60,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  periodText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 7,
  },
})

/**
 * Componente de tabla de asistencia formato SIAGIE
 * Estructura:
 *          |     Inasistencia      |      Tardanzas       |
 * Período  | Justif. | Injustif.   | Justif. | Injustif.  |
 * ---------------------------------------------------------
 * B1       |    -    |     -       |    -    |     -      |
 * B2       |    -    |     -       |    -    |     -      |
 * B3       |    -    |     -       |    -    |     -      |
 * B4       |    -    |     -       |    -    |     -      |
 *
 * @param {Object} attendanceData - Datos de asistencia por bimestre (opcional)
 */
const ReportCardAttendanceTable = ({ attendanceData = {} }) => {
  // Obtener datos de asistencia para un bimestre
  const getAttendanceForBimester = (bimester) => {
    const data = attendanceData[bimester] || {}
    return {
      inasistenciaJustificada: data.inasistenciaJustificada ?? '-',
      inasistenciaInjustificada: data.inasistenciaInjustificada ?? '-',
      tardanzaJustificada: data.tardanzaJustificada ?? '-',
      tardanzaInjustificada: data.tardanzaInjustificada ?? '-',
    }
  }

  return (
    <View style={attendanceStyles.table} wrap={false}>
      {/* Primera fila de headers */}
      <View style={attendanceStyles.headerRow1}>
        {/* Celda vacía sobre "Período" */}
        <View style={attendanceStyles.periodHeaderCell}>
          <Text style={attendanceStyles.headerText}></Text>
        </View>
        {/* Header Inasistencia */}
        <View style={attendanceStyles.mainHeaderCell}>
          <Text style={attendanceStyles.headerText}>Inasistencia</Text>
        </View>
        {/* Header Tardanzas */}
        <View style={[attendanceStyles.mainHeaderCell, { borderRight: 'none' }]}>
          <Text style={attendanceStyles.headerText}>Tardanzas</Text>
        </View>
      </View>

      {/* Segunda fila de headers (subheaders) */}
      <View style={attendanceStyles.headerRow2}>
        {/* Período */}
        <View style={attendanceStyles.periodHeaderCell}>
          <Text style={attendanceStyles.subHeaderText}>Período</Text>
        </View>
        {/* Inasistencia - Justificadas */}
        <View style={attendanceStyles.subHeaderCell}>
          <Text style={attendanceStyles.subHeaderText}>Justificadas</Text>
        </View>
        {/* Inasistencia - Injustificadas */}
        <View style={attendanceStyles.subHeaderCell}>
          <Text style={attendanceStyles.subHeaderText}>Injustificadas</Text>
        </View>
        {/* Tardanzas - Justificadas */}
        <View style={attendanceStyles.subHeaderCell}>
          <Text style={attendanceStyles.subHeaderText}>Justificadas</Text>
        </View>
        {/* Tardanzas - Injustificadas */}
        <View style={[attendanceStyles.subHeaderCell, { borderRight: 'none' }]}>
          <Text style={attendanceStyles.subHeaderText}>Injustificadas</Text>
        </View>
      </View>

      {/* Filas de datos por bimestre */}
      {BIMESTRES.map((bimestre, index) => {
        const data = getAttendanceForBimester(bimestre)
        const isLast = index === BIMESTRES.length - 1

        return (
          <View key={bimestre} style={isLast ? attendanceStyles.lastDataRow : attendanceStyles.dataRow}>
            {/* Período */}
            <View style={attendanceStyles.periodCell}>
              <Text style={attendanceStyles.periodText}>{bimestre}</Text>
            </View>
            {/* Inasistencia Justificada */}
            <View style={attendanceStyles.dataCell}>
              <Text style={attendanceStyles.dataText}>{data.inasistenciaJustificada}</Text>
            </View>
            {/* Inasistencia Injustificada */}
            <View style={attendanceStyles.dataCell}>
              <Text style={attendanceStyles.dataText}>{data.inasistenciaInjustificada}</Text>
            </View>
            {/* Tardanza Justificada */}
            <View style={attendanceStyles.dataCell}>
              <Text style={attendanceStyles.dataText}>{data.tardanzaJustificada}</Text>
            </View>
            {/* Tardanza Injustificada */}
            <View style={attendanceStyles.dataCellLast}>
              <Text style={attendanceStyles.dataText}>{data.tardanzaInjustificada}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default ReportCardAttendanceTable
