import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'

/**
 * Calcula la situación final del estudiante basándose en sus notas
 * @param {Array} gradesData - Array de cursos con competencias y promedios
 * @param {string} gradingSystem - Sistema de calificación ('literal' o 'vigesimal')
 * @returns {string} Situación final del estudiante
 */
const calculateFinalStatus = (gradesData, gradingSystem = 'literal') => {
  if (!gradesData || gradesData.length === 0) {
    return 'Sin calificaciones'
  }

  // Contar áreas aprobadas y desaprobadas
  let areasAprobadas = 0
  let areasDesaprobadas = 0

  gradesData.forEach(course => {
    const promedio = course.promedioFinal

    if (promedio === null || promedio === undefined) return

    let aprobado = false

    if (gradingSystem === 'vigesimal' || gradingSystem === 'secundaria' || gradingSystem === 'numeric') {
      // Sistema vigesimal: aprobado si promedio >= 11
      aprobado = typeof promedio === 'number' ? promedio >= 11 : parseFloat(promedio) >= 11
    } else {
      // Sistema literal: aprobado si es AD, A o B
      if (typeof promedio === 'string') {
        aprobado = ['AD', 'A', 'B'].includes(promedio.toUpperCase())
      } else {
        // Si es número en sistema literal, convertir
        aprobado = promedio >= 2 // B = 2, A = 3, AD = 4
      }
    }

    if (aprobado) {
      areasAprobadas++
    } else {
      areasDesaprobadas++
    }
  })

  const totalAreas = areasAprobadas + areasDesaprobadas

  if (totalAreas === 0) {
    return 'Sin calificaciones'
  }

  // Determinar situación final
  if (areasDesaprobadas === 0) {
    return 'Promovido de Grado'
  } else if (areasDesaprobadas <= 2) {
    return 'Requiere Recuperación'
  } else {
    return 'Permanece en el Grado'
  }
}

/**
 * Formatea la fecha actual en español
 * @returns {string} Fecha formateada
 */
const formatDate = () => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  const date = new Date()
  return date.toLocaleDateString('es-PE', options)
}

// Estilos para el footer
const footerStyles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  statusTable: {
    border: '1pt solid black',
    marginBottom: 30,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusLabelCell: {
    width: '50%',
    padding: 8,
    borderRight: '1pt solid black',
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
  },
  statusValueCell: {
    width: '50%',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    marginBottom: 20,
  },
  signatureBox: {
    width: 200,
    alignItems: 'center',
  },
  signatureLine: {
    width: 180,
    borderBottom: '1pt solid black',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 7,
    textAlign: 'center',
  },
  dateContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  dateText: {
    fontSize: 7,
  },
  versionText: {
    fontSize: 6,
    marginTop: 5,
    color: '#666',
  },
})

/**
 * Componente de footer para la boleta final
 * Incluye: Situación final, firmas y fecha de emisión
 * @param {Array} gradesData - Datos de calificaciones del estudiante
 * @param {string} gradingSystem - Sistema de calificación
 */
const ReportCardFooter = ({ gradesData = [], gradingSystem = 'literal' }) => {
  const finalStatus = calculateFinalStatus(gradesData, gradingSystem)

  return (
    <View style={footerStyles.container}>
      {/* Tabla de Situación Final */}
      <View style={footerStyles.statusTable}>
        <View style={footerStyles.statusRow}>
          <View style={footerStyles.statusLabelCell}>
            <Text style={footerStyles.statusLabel}>Situación al finalizar el período lectivo</Text>
          </View>
          <View style={footerStyles.statusValueCell}>
            <Text style={footerStyles.statusValue}>{finalStatus}</Text>
          </View>
        </View>
      </View>

      {/* Sección de Firmas */}
      <View style={footerStyles.signaturesContainer}>
        <View style={footerStyles.signatureBox}>
          <View style={footerStyles.signatureLine} />
          <Text style={footerStyles.signatureLabel}>Firma del Docente o Tutor(a)</Text>
        </View>
        <View style={footerStyles.signatureBox}>
          <View style={footerStyles.signatureLine} />
          <Text style={footerStyles.signatureLabel}>Firma y sello del Director(a)</Text>
        </View>
      </View>

      {/* Fecha de Emisión */}
      <View style={footerStyles.dateContainer}>
        <Text style={footerStyles.dateText}>Fecha de Emisión: {formatDate()}</Text>
        <Text style={footerStyles.versionText}>Versión del Sistema: 2024.1</Text>
      </View>
    </View>
  )
}

export default ReportCardFooter
