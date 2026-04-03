import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'

/**
 * Retorna la situación final del estudiante
 * @returns {string} Situación final del estudiante
 */
const calculateFinalStatus = () => {
  return 'Pendiente de evaluación'
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
const ReportCardFooter = () => {
  const finalStatus = calculateFinalStatus()

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
