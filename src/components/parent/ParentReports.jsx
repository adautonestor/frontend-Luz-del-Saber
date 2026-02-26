import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, X, Printer, Mail, Download, Users } from 'lucide-react'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { CHILDREN as CHILDREN_FALLBACK } from '@/constants/reports'
import parentProfileService from '@/services/parentProfileService'
import {
  ReportsSummaryCards,
  ReportCard,
  FinalReportView,
  AcademicReportView,
  ProgressReportView
} from '@/components/reports'
import { useReportsData, useReportsPDF } from '@/hooks'
import { formatDate } from '@/utils/reports'

const ParentReports = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    initialize: initializePayments,
    isLoading: paymentsLoading
  } = usePaymentsStore()

  const [children, setChildren] = useState(CHILDREN_FALLBACK)
  const [childrenLoading, setChildrenLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { allReports, stats } = useReportsData(selectedChild)
  const { downloadPDF } = useReportsPDF()

  // Cargar hijos desde API
  useEffect(() => {
    const loadChildren = async () => {
      try {
        setChildrenLoading(true)
        const childrenData = await parentProfileService.getMyChildren()

        if (childrenData && childrenData.length > 0) {
          // Formatear datos de hijos para el selector
          const formattedChildren = childrenData.map(child => ({
            id: child.id?.toString() || `child-${child.id}`,
            name: `${child.first_names || ''} ${child.last_names || ''}`.trim(),
            grade: child.gradeName || child.grade?.name || 'Sin grado asignado'
          }))
          setChildren(formattedChildren)

          // Seleccionar el primer hijo si no hay ninguno seleccionado
          if (!selectedChild && formattedChildren.length > 0) {
            setSelectedChild(formattedChildren[0].id)
          }
        }
      } catch (error) {
        console.error('Error loading children:', error)
        // Mantener fallback si hay error
      } finally {
        setChildrenLoading(false)
      }
    }

    loadChildren()
  }, [])

  useEffect(() => {
    initializePayments()
  }, [])

  const openReport = (report) => {
    setSelectedReport(report)
    setShowModal(true)
  }

  const closeReport = () => {
    setShowModal(false)
    setSelectedReport(null)
  }

  const handleDownloadPDF = () => {
    downloadPDF(selectedReport)
  }

  const handlePaymentRedirect = () => {
    navigate('/parent/payments')
  }

  // Show loading state
  if (paymentsLoading || childrenLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Empty state if no children
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boletas y Reportes</h1>
          <p className="mt-2 text-gray-600">
            Accede a las boletas de calificaciones y reportes académicos de tus hijos
          </p>
        </div>
        <div className="card p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay estudiantes registrados
          </h3>
          <p className="text-gray-600">
            No se encontraron estudiantes asociados a tu cuenta.
            Contacta con la administración del colegio si crees que esto es un error.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Boletas y Reportes</h1>
        <p className="mt-2 text-gray-600">
          Accede a las boletas de calificaciones y reportes académicos de tus hijos
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - {child.grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <ReportsSummaryCards stats={stats} />

      {/* Reports List */}
      <div className="space-y-6">
        {allReports.length > 0 ? (
          allReports.map((report, index) => (
            <ReportCard
              key={`${report.periodId}-${report.reportType}`}
              report={report}
              index={index}
              onOpen={openReport}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reportes disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los reportes para este estudiante aún no están disponibles.
            </p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedReport.student} - {selectedReport.period}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Generado el {formatDate(selectedReport.generatedDate)}
                  </p>
                </div>
                <button
                  onClick={closeReport}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div id="report-content" className="p-6">
              {selectedReport.type === 'final' && (
                <FinalReportView selectedReport={selectedReport} />
              )}

              {selectedReport.type === 'academic' && (
                <AcademicReportView selectedReport={selectedReport} />
              )}

              {selectedReport.type === 'progress' && (
                <ProgressReportView selectedReport={selectedReport} />
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="modal-buttons flex justify-end space-x-3">
                <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  <Printer className="mr-2" size={16} />
                  Imprimir
                </button>
                <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  <Mail className="mr-2" size={16} />
                  Enviar por Email
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="mr-2" size={16} />
                  Descargar PDF
                </button>
                <button
                  onClick={closeReport}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ParentReports
