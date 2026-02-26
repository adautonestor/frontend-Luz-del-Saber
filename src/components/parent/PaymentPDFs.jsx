import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Estilos compartidos para los PDFs
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
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 3,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
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
    width: 130,
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 10,
  },
  value: {
    flex: 1,
    color: '#000',
    fontSize: 10,
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
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    color: '#374151',
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9ca3af',
  },
  divider: {
    borderBottom: '1px solid #e5e7eb',
    marginVertical: 10,
  },
  totalSection: {
    marginTop: 15,
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
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  paidStatus: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  // Estilos específicos para recibo
  receiptBox: {
    border: '2px solid #2563eb',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  receiptAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginVertical: 15,
  },
  receiptBadge: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'center',
  },
  receiptBadgeText: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    fontSize: 50,
    color: '#e5e7eb',
    transform: 'rotate(-45deg)',
    opacity: 0.1,
    top: '40%',
    left: '25%',
  }
})

// Función auxiliar para formatear fecha
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateLong = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// =====================================================
// COMPONENTE: PDF de Historial de Pagos
// =====================================================
export const PaymentHistoryPDF = ({ studentData, payments, academicYear = new Date().getFullYear() }) => {
  // Ordenar pagos por fecha de pago (más reciente primero)
  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = a.payment_date ? new Date(a.payment_date) : new Date(0)
    const dateB = b.payment_date ? new Date(b.payment_date) : new Date(0)
    return dateB - dateA
  })

  // Calcular total pagado
  const totalPaid = sortedPayments.reduce((sum, p) => sum + parseFloat(p.paid_amount || p.amount || 0), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>HISTORIAL</Text>

        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>HISTORIAL DE PAGOS</Text>
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
            <Text style={styles.value}>
              {studentData?.fullName || `${studentData?.first_names || ''} ${studentData?.last_names || ''}`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>DNI:</Text>
            <Text style={styles.value}>{studentData?.dni || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Código:</Text>
            <Text style={styles.value}>{studentData?.code || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nivel / Grado / Sección:</Text>
            <Text style={styles.value}>
              {studentData?.nivelNombre || '-'} / {studentData?.gradoNombre || '-'} / {studentData?.seccion || '-'}
            </Text>
          </View>
        </View>

        {/* Tabla de Pagos Completados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAGOS REALIZADOS ({sortedPayments.length})</Text>
          <View style={styles.table}>
            {/* Encabezado de tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '6%' }]}>#</Text>
              <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Concepto</Text>
              <Text style={[styles.tableHeaderCell, { width: '16%' }]}>Periodo</Text>
              <Text style={[styles.tableHeaderCell, { width: '16%' }]}>F. Vencimiento</Text>
              <Text style={[styles.tableHeaderCell, { width: '16%' }]}>F. Pago</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Monto</Text>
            </View>

            {/* Filas de pagos */}
            {sortedPayments.map((payment, index) => (
              <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }]}>
                <Text style={[styles.tableCell, { width: '6%' }]}>{index + 1}</Text>
                <Text style={[styles.tableCell, { width: '28%' }]}>{payment.concepto || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: '16%' }]}>{payment.monthName || '-'}</Text>
                <Text style={[styles.tableCell, { width: '16%' }]}>{formatDate(payment.due_date)}</Text>
                <Text style={[styles.tableCell, { width: '16%' }]}>{formatDate(payment.payment_date)}</Text>
                <Text style={[styles.tableCell, { width: '18%', textAlign: 'right' }]}>
                  S/. {parseFloat(payment.paid_amount || payment.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total de Pagos Realizados:</Text>
            <Text style={[styles.totalValue, { color: '#16a34a' }]}>S/. {totalPaid.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>Cantidad de pagos:</Text>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>{sortedPayments.length}</Text>
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <View style={styles.divider} />
          <Text style={{ textAlign: 'center', marginBottom: 3 }}>
            Documento generado el {formatDate(new Date())} a las {new Date().toLocaleTimeString('es-PE')}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            Luz del Saber © {new Date().getFullYear()} - Sistema de Gestión Académica
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// =====================================================
// COMPONENTE: PDF de Recibo de Pago Individual
// =====================================================
export const PaymentReceiptPDF = ({ studentData, payment }) => {
  return (
    <Document>
      <Page size="A5" style={[styles.page, { padding: 25 }]}>
        <Text style={[styles.watermark, { fontSize: 40, top: '35%', left: '20%' }]}>PAGADO</Text>

        {/* Encabezado */}
        <View style={[styles.header, { marginBottom: 15 }]}>
          <Text style={[styles.title, { fontSize: 16 }]}>RECIBO DE PAGO</Text>
          <Text style={[styles.subtitle, { fontSize: 10 }]}>Institución Educativa Luz del Saber</Text>
        </View>

        {/* Caja principal del recibo */}
        <View style={styles.receiptBox}>
          {/* Concepto y periodo */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' }}>Concepto</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e40af' }}>
              {payment.concepto || 'Pago'}
            </Text>
            {payment.monthName && (
              <Text style={{ fontSize: 10, color: '#6b7280' }}>Periodo: {payment.monthName}</Text>
            )}
          </View>

          {/* Monto */}
          <Text style={styles.receiptAmount}>
            S/. {parseFloat(payment.paid_amount || payment.amount || 0).toFixed(2)}
          </Text>

          {/* Badge de pagado */}
          <View style={styles.receiptBadge}>
            <Text style={styles.receiptBadgeText}>PAGADO</Text>
          </View>
        </View>

        {/* Datos del estudiante */}
        <View style={[styles.section, { marginBottom: 10 }]}>
          <Text style={[styles.sectionTitle, { fontSize: 10 }]}>DATOS DEL ESTUDIANTE</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { width: 100, fontSize: 9 }]}>Nombre:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>
              {studentData?.fullName || `${studentData?.first_names || ''} ${studentData?.last_names || ''}`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { width: 100, fontSize: 9 }]}>DNI:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>{studentData?.dni || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { width: 100, fontSize: 9 }]}>Nivel / Grado:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>
              {studentData?.nivelNombre || '-'} / {studentData?.gradoNombre || '-'}
            </Text>
          </View>
        </View>

        {/* Detalles del pago */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 10 }]}>DETALLES DEL PAGO</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { width: 100, fontSize: 9 }]}>Fecha de pago:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>
              {formatDateLong(payment.payment_date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { width: 100, fontSize: 9 }]}>Vencimiento:</Text>
            <Text style={[styles.value, { fontSize: 9 }]}>
              {formatDateLong(payment.due_date)}
            </Text>
          </View>
        </View>

        {/* Pie de página */}
        <View style={[styles.footer, { bottom: 20 }]}>
          <View style={styles.divider} />
          <Text style={{ textAlign: 'center', fontSize: 7 }}>
            Documento generado el {formatDate(new Date())} - Luz del Saber © {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
