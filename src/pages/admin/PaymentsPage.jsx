import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, Calendar, Users, CheckCircle, AlertCircle, Clock, Eye, Search, Check, X, FileCheck, Loader2 } from 'lucide-react'
import PaymentConceptsGuide from '../../components/admin/PaymentConceptsGuide'
import PaymentConceptModal from '../../components/admin/PaymentConceptModal'
import ManualPaymentModal from '../../components/admin/ManualPaymentModal'
import AlertModal from '../../components/common/AlertModal'
import Toast from '../../components/common/Toast'
import PaymentScheduleViewerModal from '../../components/admin/PaymentScheduleViewerModal'
import { usePaymentConcepts } from '../../hooks/usePaymentConcepts'
import { usePaymentObligations } from '../../hooks/usePaymentObligations'
import { usePaymentFilters } from '../../hooks/usePaymentFilters'
import { usersService } from '../../services/usersService'
import studentsService from '../../services/studentsService'
import levelsService from '../../services/levelsService'
import { getFileUrl } from '../../services/api'
import { calculateMora, calculateDaysLate } from '../../utils/payments/moraCalculator.jsx'
import { usePaymentsStore } from '../../stores/paymentsStore'

/**
 * Página principal de gestión de pagos
 * Maneja conceptos, obligaciones, historial y cronogramas
 */
const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('conceptos')

  // Hooks de gestión
  const conceptsHook = usePaymentConcepts()
  const obligationsHook = usePaymentObligations()
  const filtersHook = usePaymentFilters()
  const { moraConfig } = usePaymentsStore()

  // Meses del año (incluye Enero y Febrero para vacaciones)
  const mesesEscolares = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  // Cargar padres
  const [padres, setPadres] = useState([])
  const [students, setStudents] = useState([])
  const [levels, setLevels] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await usersService.getAll() || []
        const padresData = users.filter(u => u.rol === 'padre')
        setPadres(padresData)

        // Cargar estudiantes
        const studentsData = await studentsService.getAll() || []
        setStudents(studentsData)

        // Cargar niveles educativos
        const levelsData = await levelsService.getAll() || []
        setLevels(levelsData)

        obligationsHook.initialize()
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  // Filtrar conceptos para mostrar
  const filteredConceptos = filtersHook.filterConcepts(conceptsHook.conceptos)

  // Filtrar obligaciones
  const filteredObligations = obligationsHook.getFilteredObligations()

  // Estadísticas
  const stats = obligationsHook.getStats()

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pagos</h1>
        <p className="text-gray-600">Administra los conceptos de pago y cronogramas</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('conceptos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'conceptos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Conceptos de Pago
            </button>
            <button
              onClick={() => setActiveTab('verificar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'verificar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileCheck className="inline-block w-4 h-4 mr-2" />
              Pagos por Verificar
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Historial de Pagos
            </button>
            <button
              onClick={() => setActiveTab('cronogramas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cronogramas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline-block w-4 h-4 mr-2" />
              Cronogramas
            </button>
          </nav>
        </div>
      </div>

      {/* Content - Conceptos */}
      {activeTab === 'conceptos' && (
        <div className="space-y-6">
          <PaymentConceptsGuide />

          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar concepto..."
                    value={filtersHook.searchTerm}
                    onChange={(e) => filtersHook.setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filtersHook.filterNivel}
                  onChange={(e) => filtersHook.setFilterNivel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los niveles</option>
                  <option value="inicial">Inicial</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                </select>
              </div>
              <button
                onClick={() => conceptsHook.openConceptModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo Concepto
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aplicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Creación</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConceptos.map((concepto) => (
                    <tr key={concepto.id} className="hover:bg-gray-50">
                      {/* Nombre del concepto */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{concepto.name}</div>
                        {concepto.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{concepto.description}</div>
                        )}
                      </td>

                      {/* Tipo con Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md ${
                          concepto.type === 'unico'
                            ? 'bg-green-100 text-green-800'
                            : concepto.type === 'mensualidad'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {concepto.type === 'unico' && 'Pago Único'}
                          {concepto.type === 'mensualidad' && 'Recurrente'}
                          {concepto.type === 'matricula' && 'Matrícula'}
                        </span>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        S/. {(Number(concepto.amount) || 0).toFixed(2)}
                      </td>

                      {/* Niveles como badges */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {concepto.levels?.map((nivel, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                            >
                              {nivel}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Aplicación */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {concepto.type === 'mensualidad' && concepto.applicable_months?.length > 0 && (
                          <span>{concepto.applicable_months.length} meses</span>
                        )}
                        {concepto.type === 'unico' && concepto.unique_payment_date && (
                          <span>{new Date(concepto.unique_payment_date).toLocaleDateString('es-PE')}</span>
                        )}
                        {!concepto.applicable_months?.length && !concepto.unique_payment_date && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          concepto.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {concepto.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Fecha Creación */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {concepto.date_time_registration
                          ? new Date(concepto.date_time_registration).toLocaleDateString('es-PE')
                          : '-'}
                      </td>

                      {/* Acciones - Solo iconos */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => conceptsHook.openConceptModal(concepto)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {concepto.status === 'active' && (
                            <button
                              onClick={() => conceptsHook.regenerateObligations(concepto.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Regenerar obligaciones"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => conceptsHook.openDeleteModal(concepto.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredConceptos.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conceptos</h3>
                  <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo concepto de pago</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content - Pagos por Verificar */}
      {activeTab === 'verificar' && (
        <PagosPorVerificarContent />
      )}

      {/* Content - Historial */}
      {activeTab === 'historial' && (
        <HistorialContent
          obligationsHook={obligationsHook}
          conceptsHook={conceptsHook}
          stats={stats}
          filteredObligations={filteredObligations}
          students={students}
        />
      )}

      {/* Content - Cronogramas */}
      {activeTab === 'cronogramas' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Cronogramas de Pago</h3>
            <p className="mt-1 text-sm text-gray-500">
              Visualiza los cronogramas generados para cada estudiante
            </p>
            <button
              onClick={() => obligationsHook.setShowScheduleModal(true)}
              className="mt-4 btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Eye className="w-4 h-4" />
              Ver Cronogramas
            </button>
          </div>
        </div>
      )}

      {/* Modal de Concepto Completo */}
      <PaymentConceptModal
        isOpen={conceptsHook.showConceptModal}
        isEditing={!!conceptsHook.editingConcept}
        conceptForm={conceptsHook.conceptForm}
        onFormChange={conceptsHook.handleConceptFormChange}
        onClose={conceptsHook.closeConceptModal}
        onSubmit={conceptsHook.saveConcept}
        estudiantes={conceptsHook.estudiantes}
        levels={levels}
        onNivelChange={conceptsHook.handleNivelesChange}
        onMesChange={conceptsHook.handleMesesAplicaChange}
        onEstudianteExcluidoChange={conceptsHook.handleEstudiantesExcluidosChange}
        showSuccessAnimation={conceptsHook.showSuccessAnimation}
        showErrorAnimation={conceptsHook.showErrorAnimation}
        successMessage={conceptsHook.successMessage}
        errorMessage={conceptsHook.errorMessage}
      />

      {/* Modals */}
      {obligationsHook.showManualPaymentModal && (
        <ManualPaymentModal
          isOpen={obligationsHook.showManualPaymentModal}
          onClose={obligationsHook.closeManualPaymentModal}
          obligation={obligationsHook.selectedObligation}
          student={obligationsHook.selectedStudent}
          onPaymentSuccess={obligationsHook.handleManualPayment}
        />
      )}

      {obligationsHook.alertModal.isOpen && (
        <AlertModal
          isOpen={obligationsHook.alertModal.isOpen}
          onClose={obligationsHook.closeAlert}
          title={obligationsHook.alertModal.title}
          message={obligationsHook.alertModal.message}
          type={obligationsHook.alertModal.type}
          onConfirm={obligationsHook.alertModal.onConfirm}
          confirmText={obligationsHook.alertModal.confirmText}
          cancelText={obligationsHook.alertModal.cancelText}
        />
      )}

      {obligationsHook.showScheduleModal && (
        <PaymentScheduleViewerModal
          isOpen={obligationsHook.showScheduleModal}
          onClose={() => obligationsHook.setShowScheduleModal(false)}
        />
      )}

      {/* Success Message */}
      {obligationsHook.showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Pago registrado exitosamente
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={conceptsHook.deleteModal.isOpen}
        onClose={conceptsHook.closeDeleteModal}
        title="Eliminar Concepto de Pago"
        message={`¿Está seguro de que desea eliminar el concepto "${conceptsHook.deleteModal.conceptName}"? Esta acción no se puede deshacer.`}
        type="danger"
        onConfirm={conceptsHook.confirmDeleteConcept}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Toast Notifications */}
      <Toast
        type={conceptsHook.toast.type}
        message={conceptsHook.toast.message}
        isOpen={conceptsHook.toast.isOpen}
        onClose={conceptsHook.closeToast}
        position="top-right"
        duration={3000}
      />
    </div>
  )
}

// Componente separado para el contenido de Historial
const HistorialContent = ({ obligationsHook, conceptsHook, stats, filteredObligations, students }) => {
  // Estado para edición de fechas (fuera del map)
  const [editingDateId, setEditingDateId] = React.useState(null)
  const [editedDates, setEditedDates] = React.useState({})

  // Estado para modal de detalles
  const [showDetailsModal, setShowDetailsModal] = React.useState(false)
  const [selectedObligationDetails, setSelectedObligationDetails] = React.useState(null)

  const handleStartEdit = (obligationId, currentDate) => {
    setEditingDateId(obligationId)
    setEditedDates(prev => ({ ...prev, [obligationId]: currentDate }))
  }

  const handleSaveDate = async (obligationId) => {
    const newDate = editedDates[obligationId]
    if (newDate) {
      try {
        // Establecer la fecha en el hook y luego guardar
        obligationsHook.setNewDueDate(newDate)
        await obligationsHook.saveDueDate(obligationId)
      } catch (error) {
        console.error('Error al actualizar fecha:', error)
      }
    }
    setEditingDateId(null)
  }

  const handleCancelEdit = () => {
    setEditingDateId(null)
  }

  const handleDateChange = (obligationId, newDate) => {
    setEditedDates(prev => ({ ...prev, [obligationId]: newDate }))
  }

  const handleOpenDetailsModal = (obligation, student, concept) => {
    setSelectedObligationDetails({ obligation, student, concept })
    setShowDetailsModal(true)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedObligationDetails(null)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - ORDEN CORRECTO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 1. Total Obligaciones */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Obligaciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* 2. Pendientes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
          </div>
        </div>

        {/* 3. Pagados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagados</p>
              <p className="text-2xl font-bold text-green-600">{stats.pagadas}</p>
            </div>
          </div>
        </div>

        {/* 4. Vencidos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.vencidas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - CON BUSCADOR Y FILTRO DE NIVELES */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={obligationsHook.searchStudent || ''}
              onChange={(e) => obligationsHook.setSearchStudent && obligationsHook.setSearchStudent(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={obligationsHook.filterStatus}
            onChange={(e) => obligationsHook.setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
            <option value="parcial">Parcial</option>
          </select>
          <select
            value={obligationsHook.filterNivel || ''}
            onChange={(e) => obligationsHook.setFilterNivel && obligationsHook.setFilterNivel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los niveles</option>
            <option value="inicial">Inicial</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
          </select>
        </div>
      </div>

      {/* Obligations List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredObligations.slice(0, 50).map((obligation, index) => {
                const student = students.find(s => s.id === obligation.student_id)
                const concept = conceptsHook.conceptos.find(c => c.id === obligation.concept_id)

                // Determinar estado real (detectar vencimiento automáticamente)
                const isOverdue = obligation.due_date &&
                                 new Date(obligation.due_date) < new Date() &&
                                 obligation.estadoPago !== 'pagado'

                const realStatus = isOverdue ? 'vencido' : obligation.estadoPago
                const isEditingDate = editingDateId === obligation.id

                return (
                  <tr key={obligation.id} className="hover:bg-gray-50">
                    {/* Número de fila */}
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                      {index + 1}
                    </td>

                    {/* Estudiante con DNI */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student ? `${student.first_names} ${student.last_names}` : 'N/A'}
                      </div>
                      {student && student.dni && (
                        <div className="text-xs text-gray-500">DNI: {student.dni}</div>
                      )}
                    </td>

                    {/* Concepto */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {concept?.name || 'N/A'}
                    </td>

                    {/* Monto */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      S/. {obligation.amount?.toFixed(2) || '0.00'}
                    </td>

                    {/* Mora */}
                    <td className="px-6 py-4">
                      {isOverdue && obligation.due_date ? (
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

                    {/* Vencimiento - Fecha editable inline */}
                    <td className="px-6 py-4">
                      {isEditingDate ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editedDates[obligation.id] ? new Date(editedDates[obligation.id]).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(obligation.id, e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSaveDate(obligation.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {obligation.due_date ? (
                            <>
                              {new Date(obligation.due_date).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                              <button
                                onClick={() => handleStartEdit(obligation.id, obligation.due_date)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Editar fecha de vencimiento"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>
                            </>
                          ) : 'N/A'}
                        </div>
                      )}
                    </td>

                    {/* Estado - CON DETECCIÓN AUTOMÁTICA DE VENCIMIENTO */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        realStatus === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : realStatus === 'vencido'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {realStatus === 'pagado' && 'Pagado'}
                        {realStatus === 'vencido' && 'Vencido'}
                        {realStatus === 'pendiente' && 'Pendiente'}
                        {realStatus === 'parcial' && 'Parcial'}
                      </span>
                    </td>

                    {/* Acciones - Iconos */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {obligation.estadoPago !== 'pagado' && (
                          <button
                            onClick={() => obligationsHook.openManualPaymentModal(obligation, student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Registrar Pago"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDetailsModal(obligation, student, concept)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedObligationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detalles de la Obligación</h2>
              <button
                onClick={handleCloseDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Información del Estudiante */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">Información del Estudiante</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Nombre Completo</p>
                    <p className="text-sm text-blue-900 font-semibold">
                      {selectedObligationDetails.student ?
                        `${selectedObligationDetails.student.first_names} ${selectedObligationDetails.student.last_names}` :
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">DNI</p>
                    <p className="text-sm text-blue-900 font-semibold">
                      {selectedObligationDetails.student?.dni || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Código</p>
                    <p className="text-sm text-blue-900 font-semibold">
                      {selectedObligationDetails.student?.code || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Concepto */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-3">Concepto de Pago</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Nombre</p>
                    <p className="text-sm text-purple-900 font-semibold">
                      {selectedObligationDetails.concept?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Descripción</p>
                    <p className="text-sm text-purple-900">
                      {selectedObligationDetails.concept?.description || 'Sin descripción'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Información Financiera</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-600 font-medium">Monto Total</p>
                    <p className="text-lg text-green-900 font-bold">
                      S/. {parseFloat(selectedObligationDetails.obligation?.total_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Monto Pagado</p>
                    <p className="text-lg text-green-900 font-bold">
                      S/. {parseFloat(selectedObligationDetails.obligation?.paid_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Saldo Pendiente</p>
                    <p className="text-lg text-green-900 font-bold">
                      S/. {parseFloat(selectedObligationDetails.obligation?.pending_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas y Estado */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Fechas y Estado</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Fecha de Vencimiento</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedObligationDetails.obligation?.due_date ?
                        new Date(selectedObligationDetails.obligation.due_date).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Estado</p>
                    <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full ${
                      selectedObligationDetails.obligation?.estadoPago === 'pagado'
                        ? 'bg-green-100 text-green-800'
                        : selectedObligationDetails.obligation?.estadoPago === 'vencido'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedObligationDetails.obligation?.estadoPago === 'pagado' && 'Pagado'}
                      {selectedObligationDetails.obligation?.estadoPago === 'vencido' && 'Vencido'}
                      {selectedObligationDetails.obligation?.estadoPago === 'pendiente' && 'Pendiente'}
                      {selectedObligationDetails.obligation?.estadoPago === 'parcial' && 'Parcial'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Mes de Pago</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedObligationDetails.obligation?.due_month || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Año Académico</p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {selectedObligationDetails.obligation?.academic_year || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para Pagos por Verificar
const PagosPorVerificarContent = () => {
  const [intentions, setIntentions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIntention, setSelectedIntention] = useState(null)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [processingId, setProcessingId] = useState(null)

  // Cargar intenciones pendientes
  useEffect(() => {
    loadPendingIntentions()
  }, [])

  const loadPendingIntentions = async () => {
    try {
      setLoading(true)
      const { paymentsService } = await import('../../services/paymentsService')
      const data = await paymentsService.getAllIntentions({ status: 'pending' })
      // Filtrar solo pendientes
      const pending = (data || []).filter(i => i.status === 'pending')
      setIntentions(pending)
    } catch (error) {
      console.error('Error loading intentions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (intention) => {
    if (!window.confirm('¿Aprobar este pago? La obligación se marcará como pagada.')) return

    try {
      setProcessingId(intention.id)
      const { paymentsService } = await import('../../services/paymentsService')
      await paymentsService.approveIntention(intention.id)
      await loadPendingIntentions()
      alert('Pago aprobado exitosamente')
    } catch (error) {
      console.error('Error approving:', error)
      alert('Error al aprobar el pago')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Debes ingresar un motivo de rechazo')
      return
    }

    try {
      setProcessingId(selectedIntention.id)
      const { paymentsService } = await import('../../services/paymentsService')
      await paymentsService.rejectIntention(selectedIntention.id, rejectReason)
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedIntention(null)
      await loadPendingIntentions()
      alert('Pago rechazado')
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Error al rechazar el pago')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (intention) => {
    setSelectedIntention(intention)
    setShowRejectModal(true)
  }

  const openVoucherModal = (intention) => {
    setSelectedIntention(intention)
    setShowVoucherModal(true)
  }

  // Usar la función centralizada de api.js para construir URLs de archivos
  const getVoucherUrl = (voucherPath) => getFileUrl(voucherPath, '/api/files')

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-2 text-gray-600">Cargando pagos pendientes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-center">
          <FileCheck className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <p className="font-medium text-blue-900">
              {intentions.length} pago{intentions.length !== 1 ? 's' : ''} pendiente{intentions.length !== 1 ? 's' : ''} de verificación
            </p>
            <p className="text-sm text-blue-700">
              Los padres han enviado comprobantes que requieren tu aprobación
            </p>
          </div>
        </div>
      </div>

      {/* Lista de intenciones */}
      <div className="bg-white rounded-lg shadow-sm">
        {intentions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos pendientes</h3>
            <p className="mt-1 text-sm text-gray-500">Todos los pagos han sido verificados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Operación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intentions.map((intention) => (
                  <tr key={intention.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {intention.student_first_names} {intention.student_last_names}
                      </div>
                      <div className="text-xs text-gray-500">
                        Padre: {intention.parent_first_names} {intention.parent_last_names}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      S/. {parseFloat(intention.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {intention.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {intention.operation_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {intention.payment_date ?
                        new Date(intention.payment_date).toLocaleDateString('es-PE') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {intention.voucher ? (
                        <button
                          onClick={() => openVoucherModal(intention)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin voucher</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {processingId === intention.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(intention)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Aprobar pago"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRejectModal(intention)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Rechazar pago"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Voucher */}
      {showVoucherModal && selectedIntention && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Comprobante de Pago</h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>Estudiante:</strong> {selectedIntention.student_first_names} {selectedIntention.student_last_names}</p>
                <p><strong>Monto:</strong> S/. {parseFloat(selectedIntention.amount).toFixed(2)}</p>
                <p><strong>Método:</strong> {selectedIntention.payment_method}</p>
                <p><strong>N° Operación:</strong> {selectedIntention.operation_number || 'N/A'}</p>
                {selectedIntention.observations && (
                  <p><strong>Observaciones:</strong> {selectedIntention.observations}</p>
                )}
              </div>
              {selectedIntention.voucher && (
                (() => {
                  const voucherUrl = getVoucherUrl(selectedIntention.voucher)
                  const isPdf = selectedIntention.voucher.toLowerCase().endsWith('.pdf')

                  if (isPdf) {
                    return (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <p className="text-blue-800 font-medium mb-3">Comprobante en formato PDF</p>
                          <a
                            href={voucherUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                            Abrir PDF en nueva pestaña
                          </a>
                        </div>
                        <iframe
                          src={voucherUrl}
                          className="w-full h-96 border rounded-lg"
                          title="Comprobante PDF"
                        />
                      </div>
                    )
                  }

                  return (
                    <img
                      src={voucherUrl}
                      alt="Comprobante de pago"
                      className="max-w-full h-auto rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  )
                })()
              )}
              <div className="hidden bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">No se pudo cargar el comprobante</p>
                <a
                  href={getVoucherUrl(selectedIntention?.voucher)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Intentar abrir en nueva pestaña
                </a>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => openRejectModal(selectedIntention)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rechazar
              </button>
              <button
                onClick={() => { setShowVoucherModal(false); handleApprove(selectedIntention); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Aprobar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && selectedIntention && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Rechazar Pago</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Indica el motivo por el cual rechazas este pago:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ej: Voucher ilegible, monto incorrecto, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsPage
