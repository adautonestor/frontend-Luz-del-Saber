import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, CreditCard, Clock, Download, Eye, User, AlertCircle, X, CheckCircle, FileText, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { PaymentSchedulePDF } from '../admin/PaymentSchedulePDF'
import { PaymentHistoryPDF, PaymentReceiptPDF } from './PaymentPDFs'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useFamilyPaymentScheduleState } from '../../hooks/useFamilyPaymentScheduleState.jsx'
import PaymentModal from './PaymentModal'
import {
  getMonthName,
  getStatusColor,
  getStatusIcon,
  flattenPaymentSchedule,
  extractUniqueFilterValues,
  filterPayments
} from '../../utils/paymentScheduleUtils.jsx'
import {
  calculateMora,
  calculateDaysLate,
  calculateTotalWithMora
} from '../../utils/payments/moraCalculator.jsx'

const FamilyPaymentSchedule = () => {
  const { user } = useAuthStore()
  const { moraConfig } = usePaymentsStore()

  // Usar el custom hook para manejar todo el estado
  const {
    familySchedule,
    isLoading,
    paymentMethods,
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterConcept,
    setFilterConcept,
    filterStudent,
    setFilterStudent,
    searchTerm,
    setSearchTerm,
    showPaymentModal,
    paymentStep,
    selectedPayment,
    selectedMethod,
    setSelectedMethod,
    voucherFile,
    setVoucherFile,
    operationNumber,
    setOperationNumber,
    openPaymentModal,
    closePaymentModal,
    handleConfirmMethod,
    goBackToMethodSelection,
    handleFileUpload,
    handleSubmitPayment,
    refreshSchedule
  } = useFamilyPaymentScheduleState(user?.id)

  // Estado para modal de detalles de pago
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState(null)

  const openDetailsModal = (payment) => {
    setPaymentDetails(payment)
    setShowDetailsModal(true)
  }

  // Procesar datos usando utilidades
  const allPayments = Array.isArray(familySchedule) ? familySchedule : []
  const { concepts: uniqueConcepts, months: uniqueMonths, students: uniqueStudents } = extractUniqueFilterValues(allPayments)

  // Extract unique students from payment data
  const studentsMap = new Map()
  allPayments.forEach(payment => {
    if (payment.student_id && !studentsMap.has(payment.student_id)) {
      studentsMap.set(payment.student_id, {
        id: payment.student_id,
        first_names: payment.student_name?.split(' ')[0] || '',
        last_names: payment.student_name?.split(' ').slice(1).join(' ') || payment.student_name || '',
        fullName: payment.student_name || payment.estudiante,
        // Datos adicionales para PDF
        dni: payment.student_dni,
        code: payment.student_code,
        nivelNombre: payment.student_nivel,
        gradoNombre: payment.student_grado,
        seccion: payment.student_seccion
      })
    }
  })
  const students = Array.from(studentsMap.values())
  const totalStudents = students.length

  // Seleccionar primer hijo por defecto si no hay selección
  const selectedStudentId = filterStudent !== 'all' ? filterStudent : (students[0]?.id || null)
  const selectedStudent = students.find(s => String(s.id) === String(selectedStudentId)) || students[0]

  // Filtrar pagos solo del hijo seleccionado
  const studentPayments = allPayments.filter(p => String(p.student_id) === String(selectedStudentId))
  const filteredStudentPayments = filterPayments(studentPayments, {
    status: filterStatus,
    month: filterMonth,
    concept: filterConcept,
    student: 'all',
    search: searchTerm
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!allPayments || allPayments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500">No hay cronograma de pagos disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de hijo */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cronograma de Pagos
            </h2>

            {/* Selector de hijos */}
            {totalStudents > 1 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Selecciona un hijo para ver sus obligaciones:</p>
                <div className="flex flex-wrap gap-2">
                  {students?.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setFilterStudent(String(student.id))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        String(selectedStudentId) === String(student.id)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <User className="inline-block w-4 h-4 mr-2" />
                      {student.fullName || `${student.first_names} ${student.last_names}`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Estudiante:</span>
                <span className="font-semibold text-blue-600">
                  {selectedStudent?.fullName || `${selectedStudent?.first_names} ${selectedStudent?.last_names}`}
                </span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={refreshSchedule}
              disabled={isLoading}
              className="btn btn-secondary flex items-center gap-2"
              title="Refrescar cronograma"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <PDFDownloadLink
              document={
                <PaymentSchedulePDF
                  studentData={selectedStudent}
                  paymentSchedule={studentPayments}
                />
              }
              fileName={`Cronograma_Pagos_${selectedStudent?.first_names}_${selectedStudent?.last_names}_${new Date().getFullYear()}.pdf`}
              className="btn btn-primary flex items-center gap-2"
            >
              {({ loading }) => (
                <>
                  <Download size={16} />
                  {loading ? 'Generando PDF...' : 'Descargar PDF'}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidos</option>
              <option value="pagado">Pagados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concepto
            </label>
            <select
              value={filterConcept}
              onChange={(e) => setFilterConcept(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              {uniqueConcepts.map(concept => (
                <option key={concept} value={concept}>
                  {concept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(() => {
              const paidPayments = studentPayments.filter(p => p.state === 'pagado')
              if (paidPayments.length === 0) {
                return (
                  <button
                    onClick={() => alert('No hay pagos completados en el historial.')}
                    className="w-full flex items-center justify-center px-4 py-2 text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
                    disabled
                  >
                    <Download className="mr-2" size={16} />
                    Historial
                  </button>
                )
              }
              return (
                <PDFDownloadLink
                  document={
                    <PaymentHistoryPDF
                      studentData={selectedStudent}
                      payments={paidPayments}
                      academicYear={new Date().getFullYear()}
                    />
                  }
                  fileName={`Historial_Pagos_${selectedStudent?.first_names || 'Estudiante'}_${new Date().getFullYear()}.pdf`}
                  className="w-full flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {({ loading }) => (
                    <>
                      <Download className="mr-2" size={16} />
                      {loading ? 'Generando...' : 'Historial'}
                    </>
                  )}
                </PDFDownloadLink>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Resumen de totales del hijo seleccionado */}
      {(() => {
        // Calcular mora total de todos los pagos vencidos
        const overduePayments = studentPayments.filter(p => p.state === 'vencido')
        const totalMora = overduePayments.reduce((sum, payment) => {
          const mora = calculateMora(payment.due_date, null, moraConfig)
          return sum + mora
        }, 0)
        const totalPendiente = studentPayments.filter(p => p.state !== 'pagado').reduce((sum, item) => sum + parseFloat(item.pending_balance || 0), 0)
        const totalConMora = totalPendiente + totalMora

        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Saldo Pendiente</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    S/. {totalPendiente.toFixed(2)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mora Acumulada</p>
                  <p className="text-2xl font-semibold text-red-600">
                    S/. {totalMora.toFixed(2)}
                  </p>
                  {moraConfig?.enabled && (
                    <p className="text-xs text-gray-400">S/. {moraConfig.dailyRate?.toFixed(2) || '0.80'} por día</p>
                  )}
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div className="card p-4 bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total a Pagar</p>
                  <p className="text-2xl font-bold text-red-700">
                    S/. {totalConMora.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">(Saldo + Mora)</p>
                </div>
                <CreditCard className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Vencidos</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {overduePayments.length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Tabla de Pagos del hijo seleccionado */}
      <div className="card overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Obligaciones de Pago - {selectedStudent?.fullName || `${selectedStudent?.first_names} ${selectedStudent?.last_names}`}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mora
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudentPayments.map((payment, index) => {
                const isOverdue = payment.state === 'vencido'
                // Calcular mora para este pago si está vencido
                const paymentMora = isOverdue ? calculateMora(payment.due_date, null, moraConfig) : 0
                const daysLate = isOverdue ? calculateDaysLate(payment.due_date) : 0
                const saldoPendiente = parseFloat(payment.pending_balance || payment.saldo || 0)
                const totalConMora = saldoPendiente + paymentMora

                return (
                  <motion.tr
                    key={`${payment.id}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{payment.concepto}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{payment.monthName}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        S/. {parseFloat(payment.amount || 0).toFixed(2)}
                      </div>
                      {saldoPendiente > 0 && saldoPendiente < parseFloat(payment.amount) && (
                        <div className="text-xs text-orange-600">
                          Saldo: S/. {saldoPendiente.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Columna de Mora */}
                    <td className="px-6 py-4 text-center">
                      {isOverdue && paymentMora > 0 ? (
                        <div>
                          <div className="text-sm font-semibold text-red-600">
                            S/. {paymentMora.toFixed(2)}
                          </div>
                          <div className="text-xs text-red-500">
                            {daysLate} día{daysLate !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-red-700 font-medium mt-1">
                            Total: S/. {totalConMora.toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.due_date).toLocaleDateString('es-PE')}
                      </div>
                      {isOverdue && (
                        <div className="text-xs text-red-600 font-medium">
                          Vencido hace {daysLate} día{daysLate !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(payment.state)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.state)}`}>
                          {payment.state.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {payment.state === 'pagado' ? (
                          <>
                            <button
                              onClick={() => openDetailsModal(payment)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Ver detalles del pago"
                            >
                              <Eye size={16} />
                            </button>
                            <PDFDownloadLink
                              document={
                                <PaymentReceiptPDF
                                  studentData={selectedStudent}
                                  payment={payment}
                                />
                              }
                              fileName={`Recibo_${payment.concepto?.replace(/\s+/g, '_') || 'Pago'}_${payment.monthName || 'Unico'}.pdf`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Descargar recibo PDF"
                            >
                              {({ loading }) => (
                                loading ? <Clock size={16} className="animate-spin" /> : <Download size={16} />
                              )}
                            </PDFDownloadLink>
                          </>
                        ) : payment.state === 'en_verificacion' ? (
                          <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                            <Clock className="mr-1 animate-pulse" size={12} />
                            En verificación
                          </span>
                        ) : payment.state === 'exonerado' ? (
                          <span className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-300">
                            <CheckCircle className="mr-1" size={12} />
                            Exonerado
                          </span>
                        ) : (
                          <button
                            onClick={() => openPaymentModal({
                              ...payment,
                              period: payment.monthName,
                              dueDate: payment.due_date,
                              // Incluir mora calculada para mostrar en el modal
                              mora: paymentMora,
                              daysLate: daysLate,
                              totalConMora: totalConMora
                            })}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <CreditCard className="mr-1" size={12} />
                            Pagar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filteredStudentPayments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay pagos que coincidan con los filtros seleccionados</p>
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Información Importante</p>
            <p>
              {totalStudents > 1
                ? 'Selecciona cada hijo para ver y gestionar sus obligaciones de pago por separado.'
                : 'Los pagos deben realizarse antes de la fecha de vencimiento para evitar mora.'
              }
            </p>
            {moraConfig?.enabled && (
              <p className="mt-1 text-blue-600">
                <strong>Política de mora:</strong> Se aplica S/. {moraConfig.dailyRate?.toFixed(2) || '0.80'} por día de retraso, hasta un máximo de S/. {moraConfig.maxAmount?.toFixed(2) || '24.00'} ({moraConfig.maxDays || 30} días).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        paymentStep={paymentStep}
        selectedPayment={selectedPayment}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        voucherFile={voucherFile}
        setVoucherFile={setVoucherFile}
        operationNumber={operationNumber}
        setOperationNumber={setOperationNumber}
        paymentMethods={paymentMethods}
        onClose={closePaymentModal}
        onConfirmMethod={handleConfirmMethod}
        onGoBack={goBackToMethodSelection}
        onFileUpload={handleFileUpload}
        onSubmit={handleSubmitPayment}
      />

      {/* Modal de Detalles de Pago */}
      {showDetailsModal && paymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Pago Completado</h3>
                    <p className="text-green-100 text-sm">Detalles del pago realizado</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Concepto */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Concepto</p>
                  <p className="text-gray-900 font-semibold">{paymentDetails.concepto}</p>
                </div>
              </div>

              {/* Grid de detalles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Periodo</p>
                  <p className="text-gray-900 font-semibold">{paymentDetails.monthName || 'Pago único'}</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 uppercase font-medium">Monto Pagado</p>
                  <p className="text-green-700 font-bold text-lg">
                    S/. {parseFloat(paymentDetails.paid_amount || paymentDetails.amount || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Fecha de Pago</p>
                  <p className="text-gray-900 font-semibold">
                    {paymentDetails.payment_date
                      ? new Date(paymentDetails.payment_date).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'No registrada'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-medium">Fecha Vencimiento</p>
                  <p className="text-gray-900 font-semibold">
                    {paymentDetails.due_date
                      ? new Date(paymentDetails.due_date).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-center p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-semibold">PAGADO</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default FamilyPaymentSchedule
