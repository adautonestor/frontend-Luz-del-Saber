import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, Calendar, FileText, CheckCircle,
  AlertCircle, Clock, TrendingUp, Download, Search,
  Filter, Eye, Plus, CreditCard, Receipt
} from 'lucide-react'
import { usePaymentsStore } from '../../stores/paymentsStore'
import ManualPaymentModal from '../../components/admin/ManualPaymentModal'
import studentsService from '../../services/studentsService'
import { calculateMora, calculateDaysLate } from '../../utils/payments/moraCalculator.jsx'
import { parseDateOnly, formatDateSafe } from '../../utils/dateUtils'

const PaymentManagementPage = () => {
  const [activeTab, setActiveTab] = useState('obligations')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterLevel, setFilterLevel] = useState('')
  const [selectedObligation, setSelectedObligation] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const {
    obligations,
    paymentRecords,
    concepts,
    methods,
    initialize,
    registerManualPayment,
    moraConfig
  } = usePaymentsStore()

  const [students, setStudents] = useState([])

  useEffect(() => {
    initialize()
    loadStudents()
  }, [])

  // Cargar datos de estudiantes
  const loadStudents = async () => {
    const studentsData = await studentsService.getAll() || []
    setStudents(studentsData)
  }

  // Función para obtener nombre del estudiante
  const getStudentData = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student || null
  }

  // Función para obtener nombre del concepto
  const getConceptName = (conceptId) => {
    const concept = concepts.find(c => c.id === conceptId)
    return concept?.name || 'N/A'
  }

  // Estadísticas
  const overdueObligationsList = obligations.filter(o => {
    const dueDate = parseDateOnly(o.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate && dueDate.getTime() < today.getTime() && o.state === 'pendiente'
  })

  const stats = {
    totalObligations: obligations.length,
    pendingObligations: obligations.filter(o => o.state === 'pendiente').length,
    paidObligations: obligations.filter(o => o.state === 'pagado').length,
    overdueObligations: overdueObligationsList.length,
    totalPending: obligations
      .filter(o => o.state === 'pendiente')
      .reduce((sum, o) => sum + (o.pending_balance || o.total_amount || 0), 0),
    totalCollected: paymentRecords
      .filter(p => p.state === 'confirmado')
      .reduce((sum, p) => sum + p.paid_amount, 0),
    totalMora: overdueObligationsList.reduce((sum, o) => sum + calculateMora(o.due_date, null, moraConfig), 0)
  }

  // Filtrar obligaciones
  const filteredObligations = obligations.filter(obligation => {
    const student = getStudentData(obligation.student_id)
    if (!student) return false

    const matchesSearch = student.first_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.last_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.dni?.includes(searchTerm)

    const matchesStatus = filterStatus === 'todos' || obligation.state === filterStatus

    const matchesLevel = !filterLevel || student.nivel === filterLevel

    return matchesSearch && matchesStatus && matchesLevel
  })

  // Manejar registro de pago manual
  const handleManualPayment = (obligation) => {
    const student = getStudentData(obligation.student_id)
    setSelectedObligation(obligation)
    setSelectedStudent(student)
    setShowManualPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentData) => {
    setShowManualPaymentModal(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
    initialize() // Recargar datos
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'parcial':
        return 'bg-blue-100 text-blue-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (obligation) => {
    const dueDate = parseDateOnly(obligation.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dueDate && dueDate.getTime() < today.getTime() && obligation.state === 'pendiente'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <p className="mt-2 text-gray-600">
          Administra y registra los pagos de los estudiantes
        </p>
      </div>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-l-4 border-green-400 p-4 rounded"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700 font-medium">
              Pago registrado exitosamente
            </p>
          </div>
        </motion.div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Obligaciones</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalObligations}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {stats.pendingObligations}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pagados</p>
              <p className="text-2xl font-semibold text-green-600">
                {stats.paidObligations}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-2xl font-semibold text-red-600">
                {stats.overdueObligations}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Mora</p>
              <p className="text-xl font-semibold text-red-600">
                S/. {stats.totalMora.toFixed(2)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pendiente</p>
              <p className="text-xl font-semibold text-gray-900">
                S/. {stats.totalPending.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recaudado</p>
              <p className="text-xl font-semibold text-green-600">
                S/. {stats.totalCollected.toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="input w-full md:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagado">Pagados</option>
            <option value="parcial">Pago Parcial</option>
          </select>

          <select
            className="input w-full md:w-48"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            <option value="inicial">Inicial</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
          </select>
        </div>
      </div>

      {/* Tabla de obligaciones */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredObligations.map((obligation) => {
                const student = getStudentData(obligation.student_id)
                const conceptName = getConceptName(obligation.concept_id)
                const overdue = isOverdue(obligation)

                return (
                  <tr key={obligation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student?.first_names} {student?.last_names}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {student?.dni || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conceptName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                        {formatDateSafe(obligation.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        S/. {parseFloat(obligation.total_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        S/. {parseFloat(obligation.paid_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        S/. {parseFloat(obligation.pending_balance || obligation.total_amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {overdue ? (
                        <div>
                          <div className="text-sm font-medium text-red-600">
                            S/. {calculateMora(obligation.due_date, null, moraConfig).toFixed(2)}
                          </div>
                          <div className="text-xs text-red-500">
                            {calculateDaysLate(obligation.due_date)} días
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(overdue && obligation.state === 'pendiente' ? 'vencido' : obligation.state)
                      }`}>
                        {overdue && obligation.state === 'pendiente' ? 'Vencido' : obligation.state}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {obligation.state !== 'pagado' && (
                          <button
                            onClick={() => handleManualPayment(obligation)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Registrar Pago Manual"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye size={18} />
                        </button>
                        {obligation.voucher && (
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Ver Voucher"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredObligations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron obligaciones de pago</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pago Manual */}
      {showManualPaymentModal && selectedObligation && selectedStudent && (
        <ManualPaymentModal
          obligation={{
            ...selectedObligation,
            concepto: getConceptName(selectedObligation.concept_id),
            amount: selectedObligation.pending_balance || selectedObligation.total_amount
          }}
          student={selectedStudent}
          onClose={() => setShowManualPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default PaymentManagementPage