import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useParentDataStore } from '../../stores/parentDataStore'
import { PAYMENT_METHODS } from '../../config/paymentConstants'
import {
  calculatePaymentStats,
  filterPayments,
  getUniqueConcepts,
  getUniqueMonths
} from '../../utils/paymentHelpers.jsx'
import PaymentFilters from './PaymentFilters'
import PaymentSummaryCards from './PaymentSummaryCards'
import PaymentsTable from './PaymentsTable'
import PaymentMethodModal from './PaymentMethodModal'
import PaymentProofModal from './PaymentProofModal'
import { paymentsService } from '../../services/paymentsService'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Componente principal de pagos para padres
 * Usa store centralizado para compartir datos con otras pantallas
 */
const ParentPayments = () => {
  const { user } = useAuthStore()

  // Store centralizado para datos del padre
  const {
    children: storeChildren,
    paymentsByChild: storePayments,
    loading: storeLoading,
    error: storeError,
    loadParentData,
    forceRefresh
  } = useParentDataStore()

  const [selectedChild, setSelectedChild] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterConcept, setFilterConcept] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showProofModal, setShowProofModal] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  // Mapear hijos del store al formato esperado
  const children = useMemo(() => {
    return storeChildren.map(child => ({
      id: child.id,
      name: `${child.first_name || child.nombre || ''} ${child.last_names || child.apellidos || ''}`.trim(),
      grade: child.grado || child.grade_name || child.grade || 'Sin grado',
      section: child.seccion || child.section_name || '',
      level: child.nivel || child.level_name || ''
    }))
  }, [storeChildren])

  // Mapear pagos del store al formato esperado
  const paymentsByChild = useMemo(() => {
    const mapped = {}
    Object.entries(storePayments).forEach(([childId, obligations]) => {
      mapped[childId] = (obligations || []).map(obl => ({
        id: obl.id,
        concept: obl.concept_name || obl.concepto || obl.description || 'Concepto no especificado',
        conceptId: obl.concept_id || obl.concepto_id,
        amount: parseFloat(obl.amount || obl.monto || 0),
        dueDate: obl.due_date || obl.fecha_vencimiento,
        status: mapPaymentStatus(obl.status || obl.estado),
        exonerado: obl.exonerado || obl.status === 'exonerado', // Campo para identificar exonerados
        month: obl.month || obl.mes || getMonthFromDate(obl.due_date || obl.fecha_vencimiento),
        year: obl.year || obl.año || new Date().getFullYear(),
        paidAmount: parseFloat(obl.paid_amount || obl.monto_pagado || 0),
        paidDate: obl.paid_date || obl.fecha_pago,
        proofUrl: obl.proof_url || obl.comprobante_url,
        childId: parseInt(childId)
      }))
    })
    return mapped
  }, [storePayments])

  // Cargar datos usando store centralizado
  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLocalLoading(true)
    try {
      await loadParentData(user.id)
    } finally {
      setLocalLoading(false)
    }
  }, [user?.id, loadParentData])

  // Forzar recarga de datos
  const handleRefresh = useCallback(async () => {
    if (!user?.id) return
    setLocalLoading(true)
    try {
      await forceRefresh(user.id)
    } finally {
      setLocalLoading(false)
    }
  }, [user?.id, forceRefresh])

  // Cargar datos al montar
  useEffect(() => {
    loadData()
  }, [loadData])

  // Estado de carga combinado
  const loading = storeLoading || localLoading
  const error = storeError

  // Mapear estado de pago del backend al formato del frontend
  const mapPaymentStatus = (status) => {
    const statusMap = {
      'pending': 'pending',
      'paid': 'paid',
      'partial': 'partial',
      'overdue': 'overdue',
      'cancelled': 'cancelled',
      'exonerado': 'exonerado',
      'exonerated': 'exonerado',
      'pendiente': 'pending',
      'pagado': 'paid',
      'parcial': 'partial',
      'vencido': 'overdue'
    }
    return statusMap[status?.toLowerCase()] || 'pending'
  }

  // Obtener mes de una fecha
  const getMonthFromDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString('es-PE', { month: 'long' })
  }

  // Combinar todos los pagos de todos los hijos
  const allPayments = useMemo(() => {
    return children.flatMap(child =>
      (paymentsByChild[child.id] || []).map(payment => ({
        ...payment,
        childId: child.id,
        childName: child.name,
        childGrade: child.grade
      }))
    )
  }, [children, paymentsByChild])

  // Extraer conceptos y meses únicos
  const uniqueConcepts = useMemo(() => getUniqueConcepts(allPayments), [allPayments])
  const uniqueMonths = useMemo(() => getUniqueMonths(allPayments), [allPayments])

  // Filtrar pagos
  const filteredPayments = useMemo(() => {
    return filterPayments(allPayments, {
      childId: selectedChild,
      status: filterStatus,
      month: filterMonth,
      concept: filterConcept
    })
  }, [allPayments, selectedChild, filterStatus, filterMonth, filterConcept])

  // Calcular estadísticas
  const stats = useMemo(() => calculatePaymentStats(allPayments), [allPayments])

  // Handlers para modales
  const openPaymentModal = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPayment(null)
  }

  const openProofModal = (payment) => {
    setSelectedPayment(payment)
    setShowProofModal(true)
  }

  const closeProofModal = () => {
    setShowProofModal(false)
    setSelectedPayment(null)
  }

  const handleDownloadHistory = () => {
    // TODO: Implementar descarga de historial
    alert('Función de descarga de historial en desarrollo')
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los pagos y obligaciones financieras de tus hijos
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-gray-600">Cargando información de pagos...</p>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los pagos y obligaciones financieras de tus hijos
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  // Sin hijos registrados
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los pagos y obligaciones financieras de tus hijos
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-yellow-700">
            No se encontraron hijos matriculados. Por favor, contacte con la administración del colegio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los pagos y obligaciones financieras de tus hijos
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <PaymentFilters
        children={children}
        selectedChild={selectedChild}
        filterStatus={filterStatus}
        filterMonth={filterMonth}
        filterConcept={filterConcept}
        uniqueMonths={uniqueMonths}
        uniqueConcepts={uniqueConcepts}
        onChildChange={setSelectedChild}
        onStatusChange={setFilterStatus}
        onMonthChange={setFilterMonth}
        onConceptChange={setFilterConcept}
        onDownload={handleDownloadHistory}
      />

      {/* Tarjetas de Resumen */}
      <PaymentSummaryCards
        totalPending={stats.totalPending}
        overdueCount={stats.overdueCount}
        paidThisMonth={stats.paidThisMonth}
        totalPayments={filteredPayments.length}
      />

      {/* Tabla de Pagos */}
      <PaymentsTable
        payments={filteredPayments}
        onPayClick={openPaymentModal}
        onViewProof={openProofModal}
      />

      {/* Modal de Métodos de Pago */}
      {showPaymentModal && (
        <PaymentMethodModal
          payment={selectedPayment}
          paymentMethods={PAYMENT_METHODS}
          onClose={closePaymentModal}
        />
      )}

      {/* Modal de Comprobante */}
      {showProofModal && (
        <PaymentProofModal
          payment={selectedPayment}
          onClose={closeProofModal}
        />
      )}
    </div>
  )
}

export default ParentPayments
