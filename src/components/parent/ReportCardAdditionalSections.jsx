import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../../styles/finalReportCardStyles'

/**
 * Componente de secciones adicionales de la boleta final (PDF)
 * Incluye: tabla de conclusiones descriptivas por nivel de logro
 *
 * @param {Object} gradingScale - Configuración de escala de calificación del nivel
 *   - type: 'letters' | 'numeric'
 *   - scale: Array de {value, label, numericValue, description?} para tipo letters
 *   - ranges: Array de {min, max, label, description?} para tipo numeric
 */
const ReportCardAdditionalSections = ({ gradingScale }) => {
  const isNumeric = gradingScale?.type === 'numeric'
  const scale = gradingScale?.scale || []
  const ranges = gradingScale?.ranges || []

  // Si no hay datos, no renderizar
  if ((!isNumeric && scale.length === 0) || (isNumeric && ranges.length === 0)) {
    return null
  }

  const renderLetterAchievements = () => (
    <View style={styles.achievementsTable}>
      <View style={[styles.achievementRow, { backgroundColor: '#d9d9d9', minHeight: 20 }]}>
        <Text style={{ padding: 3, fontSize: 7, fontWeight: 'bold' }}>
          CONCLUSIONES DESCRIPTIVAS POR NIVEL DE LOGRO
        </Text>
      </View>

      {scale.map((item, index) => (
        <View
          key={item.value}
          style={[
            styles.achievementRow,
            index === scale.length - 1 ? { borderBottom: 'none' } : {}
          ]}
        >
          <View style={styles.achievementLevelCell}>
            <Text>{item.label?.toUpperCase() || item.value}{'\n'}({item.value})</Text>
          </View>
          <View style={styles.achievementDescCell}>
            <Text>{item.description || ''}</Text>
          </View>
        </View>
      ))}
    </View>
  )

  const renderNumericAchievements = () => (
    <View style={styles.achievementsTable}>
      <View style={[styles.achievementRow, { backgroundColor: '#d9d9d9', minHeight: 20 }]}>
        <Text style={{ padding: 3, fontSize: 7, fontWeight: 'bold' }}>
          CONCLUSIONES DESCRIPTIVAS POR NIVEL DE LOGRO
        </Text>
      </View>

      {ranges.map((range, index) => (
        <View
          key={`${range.min}-${range.max}`}
          style={[
            styles.achievementRow,
            index === ranges.length - 1 ? { borderBottom: 'none' } : {}
          ]}
        >
          <View style={styles.achievementLevelCell}>
            <Text>{range.label?.toUpperCase() || ''}{'\n'}({range.min}-{range.max})</Text>
          </View>
          <View style={styles.achievementDescCell}>
            <Text>{range.description || ''}</Text>
          </View>
        </View>
      ))}
    </View>
  )

  return (
    <View style={{ marginTop: 15 }} wrap={false}>
      {isNumeric ? renderNumericAchievements() : renderLetterAchievements()}
    </View>
  )
}

export default ReportCardAdditionalSections
