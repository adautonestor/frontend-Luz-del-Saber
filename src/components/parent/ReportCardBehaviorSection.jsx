import React from 'react'
import { View, Text } from '@react-pdf/renderer'

/**
 * Componente de sección de conducta para la boleta final PDF
 * Muestra disciplina, calificación de padres y comentarios por bimestre
 */
const ReportCardBehaviorSection = ({ studentBehaviors = [] }) => {
  const styles = {
    container: {
      marginTop: 10,
      border: '1pt solid #000',
    },
    header: {
      backgroundColor: '#d9d9d9',
      padding: 5,
      borderBottom: '1pt solid #000',
    },
    headerText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#000',
      textAlign: 'center',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#e9e9e9',
      borderBottom: '1pt solid #000',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '0.5pt solid #ccc',
      minHeight: 18,
    },
    cellBimestre: {
      width: '15%',
      padding: 3,
      borderRight: '0.5pt solid #ccc',
      justifyContent: 'center',
    },
    cellDisciplina: {
      width: '15%',
      padding: 3,
      borderRight: '0.5pt solid #ccc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellPadres: {
      width: '15%',
      padding: 3,
      borderRight: '0.5pt solid #ccc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellComentarios: {
      width: '55%',
      padding: 3,
      justifyContent: 'center',
    },
    headerCellText: {
      fontSize: 7,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cellText: {
      fontSize: 7,
      textAlign: 'center',
    },
    cellTextLeft: {
      fontSize: 7,
      textAlign: 'left',
    },
  }

  // Obtener datos por bimestre
  const getBehaviorByQuarter = (quarter) => {
    return studentBehaviors.find(b => b.quarter === quarter) || null
  }

  return (
    <View style={styles.container} wrap={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>CONDUCTA Y PARTICIPACION DE PADRES</Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={styles.cellBimestre}>
          <Text style={styles.headerCellText}>BIMESTRE</Text>
        </View>
        <View style={styles.cellDisciplina}>
          <Text style={styles.headerCellText}>DISCIPLINA</Text>
        </View>
        <View style={styles.cellPadres}>
          <Text style={styles.headerCellText}>CALIF. PADRES</Text>
        </View>
        <View style={styles.cellComentarios}>
          <Text style={styles.headerCellText}>COMENTARIOS / OBSERVACIONES</Text>
        </View>
      </View>

      {/* Rows for each bimestre */}
      {[1, 2, 3, 4].map(bim => {
        const behavior = getBehaviorByQuarter(bim)
        return (
          <View key={bim} style={styles.tableRow}>
            <View style={styles.cellBimestre}>
              <Text style={styles.cellText}>Bimestre {bim}</Text>
            </View>
            <View style={styles.cellDisciplina}>
              <Text style={styles.cellText}>
                {behavior?.discipline || behavior?.disciplina || '-'}
              </Text>
            </View>
            <View style={styles.cellPadres}>
              <Text style={styles.cellText}>
                {behavior?.parent_rating || behavior?.calificacionPadres || '-'}
              </Text>
            </View>
            <View style={styles.cellComentarios}>
              <Text style={styles.cellTextLeft}>
                {behavior?.comments || behavior?.comentarios || '-'}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default ReportCardBehaviorSection
