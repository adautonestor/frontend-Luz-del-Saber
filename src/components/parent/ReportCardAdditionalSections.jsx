import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { styles } from '../../styles/finalReportCardStyles'

/**
 * Descripciones por defecto para niveles de logro (fallback)
 * Sincronizado con gradingScalesStore.js
 */
const DEFAULT_DESCRIPTIONS = {
  'A': 'Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia. Esto quiere decir que demuestra aprendizajes que van más allá del nivel esperado.',
  'B': 'Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio en todas las tareas propuestas y en el tiempo programado.',
  'C': 'Cuando el estudiante está próximo o cerca al nivel esperado respecto a la competencia, para lo cual requiere acompañamiento durante un tiempo razonable para lograrlo.',
  'D': 'Cuando el estudiante muestra progreso mínimo en una competencia de acuerdo al nivel esperado. Evidencia con frecuencia dificultades en el desarrollo de las tareas, por lo que necesita mayor tiempo de acompañamiento e intervención del docente.'
}

/**
 * Escala por defecto (fallback cuando no hay configuración)
 * Sincronizado con DEFAULT_LETTER_SCALE en gradingScalesStore.js
 */
const DEFAULT_SCALE = [
  { value: 'A', label: 'Logro destacado', numericValue: 4 },
  { value: 'B', label: 'Logro esperado', numericValue: 3 },
  { value: 'C', label: 'En proceso', numericValue: 2 },
  { value: 'D', label: 'En inicio', numericValue: 1 }
]

/**
 * Rangos numéricos por defecto para sistema vigesimal
 */
const DEFAULT_NUMERIC_RANGES = [
  { min: 18, max: 20, label: 'Logro destacado', description: 'Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia.' },
  { min: 14, max: 17, label: 'Logro esperado', description: 'Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio.' },
  { min: 11, max: 13, label: 'En proceso', description: 'Cuando el estudiante está próximo o cerca al nivel esperado respecto a la competencia.' },
  { min: 0, max: 10, label: 'En inicio', description: 'Cuando el estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado.' }
]

/**
 * Componente de secciones adicionales de la boleta final
 * Incluye: tabla de conclusiones descriptivas por nivel de logro,
 * leyenda de calificaciones y tabla de justificaciones
 *
 * @param {Object} gradingScale - Configuración de escala de calificación del nivel
 *   - type: 'letters' | 'numeric'
 *   - scale: Array de {value, label, numericValue, description?} para tipo letters
 *   - ranges: Array de {min, max, label, description?} para tipo numeric
 */
const ReportCardAdditionalSections = ({ gradingScale }) => {
  // Determinar el tipo de escala y los datos a mostrar
  const isNumeric = gradingScale?.type === 'numeric'
  const scale = gradingScale?.scale || DEFAULT_SCALE
  const ranges = gradingScale?.ranges || DEFAULT_NUMERIC_RANGES

  // Renderizar tabla de logros para sistema de letras
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
            <Text>{item.description || DEFAULT_DESCRIPTIONS[item.value] || ''}</Text>
          </View>
        </View>
      ))}
    </View>
  )

  // Renderizar tabla de logros para sistema numérico (vigesimal)
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
      {/* Tabla de logros con descripciones - formato SIAGIE */}
      {isNumeric ? renderNumericAchievements() : renderLetterAchievements()}
    </View>
  )
}

export default ReportCardAdditionalSections
