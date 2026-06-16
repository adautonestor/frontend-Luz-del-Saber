import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer'
import { parseDateOnly } from '../../utils/dateUtils'

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
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    color: '#374151',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
  },
  divider: {
    borderBottom: '1px solid #e5e7eb',
    marginVertical: 10,
  },
  totalSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  pendingStatus: {
    color: '#eab308',
    fontWeight: 'bold',
  },
  paidStatus: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  overdueStatus: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: '#e5e7eb',
    transform: 'rotate(-45deg)',
    opacity: 0.1,
    top: '40%',
    left: '20%',
  }
})

// Componente del documento PDF
export const PaymentSchedulePDF = ({ studentData, paymentSchedule, academicYear = '2024' }) => {
  // Filtrar pagos con monto mayor a 0
  const validPayments = paymentSchedule?.filter(payment => parseFloat(payment.total_amount || payment.amount || 0) > 0) || []

  // Filtrar pagos no exonerados para calcular totales
  const nonExemptPayments = validPayments.filter(p => {
    const state = p.state || p.status || ''
    return !p.exonerado && state !== 'exonerado'
  })

  // Calcular totales (solo de pagos con monto > 0 y no exonerados)
  const totalAmount = nonExemptPayments.reduce((sum, payment) => sum + parseFloat(payment.total_amount || payment.amount || 0), 0)
  const paidAmount = nonExemptPayments
    .filter(p => {
      const state = p.state || p.status || ''
      return state === 'pagado' || state === 'paid'
    })
    .reduce((sum, payment) => sum + parseFloat(payment.total_amount || payment.amount || 0), 0)
  const pendingAmount = totalAmount - paidAmount

  // Función para obtener el estado del pago (consistente con la tabla)
  const getPaymentStatus = (payment) => {
    const paymentState = payment.state || payment.status || ''

    // Verificar si está exonerado
    if (payment.exonerado || paymentState === 'exonerado') return 'Exonerado'

    // Verificar si está pagado
    if (paymentState === 'pagado' || paymentState === 'paid') return 'Pagado'

    // Verificar si está en verificación
    if (paymentState === 'en_verificacion') return 'En Verificación'

    // Verificar si está parcial
    if (paymentState === 'parcial' || paymentState === 'partial') return 'Parcial'

    // Verificar si está vencido por la fecha
    if (payment.due_date) {
      const dueDate = parseDateOnly(payment.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dueDate && dueDate.getTime() < today.getTime()) return 'Vencido'
    }

    return 'Pendiente'
  }

  const getStatusStyle = (payment) => {
    const status = getPaymentStatus(payment)
    if (status === 'Pagado') return styles.paidStatus
    if (status === 'Vencido') return styles.overdueStatus
    if (status === 'Exonerado') return { color: '#6b7280', fontWeight: 'bold' }
    if (status === 'En Verificación') return { color: '#2563eb', fontWeight: 'bold' }
    if (status === 'Parcial') return { color: '#ea580c', fontWeight: 'bold' }
    return styles.pendingStatus
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Marca de agua */}
        <Text style={styles.watermark}>CRONOGRAMA</Text>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>CRONOGRAMA DE PAGOS</Text>
          <Text style={styles.subtitle}>Institución Educativa Luz del Saber</Text>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>
            Año Académico {academicYear}
          </Text>
        </View>

        {/* Información del Estudiante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATOS DEL ESTUDIANTE</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre Completo:</Text>
            <Text style={styles.value}>{studentData?.paternal_last_name || ''} {studentData?.maternal_last_name || ''}, {studentData?.first_names}{studentData?.last_names ? ` ${studentData.last_names}` : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>DNI / Código:</Text>
            <Text style={styles.value}>{studentData?.dni || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nivel:</Text>
            <Text style={styles.value}>{studentData?.nivelNombre || studentData?.nivel || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Grado/Año:</Text>
            <Text style={styles.value}>{studentData?.gradoNombre || studentData?.grado || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sección:</Text>
            <Text style={styles.value}>{studentData?.seccion || 'N/A'}</Text>
          </View>
        </View>

        {/* Cronograma de Pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLE DE PAGOS PROGRAMADOS</Text>
          <View style={styles.table}>
            {/* Encabezado de tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>#</Text>
              <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Concepto</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>F. Vencimiento</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Monto</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>Estado</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>F. Pago</Text>
            </View>

            {/* Filas de pagos */}
            {validPayments && validPayments.length > 0 ? (
              validPayments.map((payment, index) => (
                <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }]}>
                  <Text style={[styles.tableCell, { width: '8%' }]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, { width: '30%' }]}>{payment.concepto || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>
                    {formatDate(payment.due_date)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                    S/. {parseFloat(payment.total_amount || payment.amount || 0).toFixed(2)}
                  </Text>
                  <Text style={[getStatusStyle(payment), { width: '15%', textAlign: 'center' }]}>
                    {getPaymentStatus(payment)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '12%' }]}>
                    {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { textAlign: 'center', width: '100%' }]}>
                  No se han generado pagos programados
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Resumen de Totales */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Programado:</Text>
            <Text style={styles.totalValue}>S/. {totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pagado:</Text>
            <Text style={[styles.totalValue, { color: '#16a34a' }]}>S/. {paidAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pendiente:</Text>
            <Text style={[styles.totalValue, { color: '#dc2626' }]}>S/. {pendingAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Información adicional */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 5 }}>
            INFORMACIÓN IMPORTANTE:
          </Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 3 }}>
            • Los pagos deben realizarse antes de la fecha de vencimiento
          </Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 3 }}>
            • Los pagos vencidos pueden generar cargos adicionales
          </Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 3 }}>
            • Para consultas, acérquese a la oficina de administración
          </Text>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <Text style={{ textAlign: 'center', marginBottom: 3 }}>
            Documento generado el {new Date().toLocaleDateString('es-PE')} a las {new Date().toLocaleTimeString('es-PE')}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Luz del Saber © {new Date().getFullYear()} - Sistema de Gestión Académica
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Función para generar el PDF como blob
export const generatePaymentSchedulePDFBlob = async (studentData, paymentSchedule) => {
  const doc = <PaymentSchedulePDF studentData={studentData} paymentSchedule={paymentSchedule} />
  const blob = await pdf(doc).toBlob()
  return blob
}

// Componente de botón de descarga
export const PaymentScheduleDownloadButton = ({ studentData, paymentSchedule, className, children }) => {
  const fileName = `Cronograma_Pagos_${studentData?.first_names?.replace(/\s+/g, '_')}_${(studentData?.paternal_last_name || '')?.replace(/\s+/g, '_')}_${(studentData?.maternal_last_name || '')?.replace(/\s+/g, '_')}.pdf`

  return (
    <PDFDownloadLink
      document={<PaymentSchedulePDF studentData={studentData} paymentSchedule={paymentSchedule} />}
      fileName={fileName}
      className={className}
    >
      {({ blob, url, loading, error }) =>
        loading ? 'Generando PDF...' : (children || 'Descargar Cronograma')
      }
    </PDFDownloadLink>
  )
}