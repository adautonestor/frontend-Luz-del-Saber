/**
 * Modal para visualizar informes psicológicos
 * Muestra el PDF embebido sin abrir nueva pestaña
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ExternalLink, FileText } from 'lucide-react'

const ViewReportModal = ({
  isOpen,
  onClose,
  report,
  studentName,
  onDownload
}) => {
  if (!isOpen || !report) return null

  // Obtener URL del documento
  const getDocumentUrl = () => {
    if (report.file_url) {
      return report.file_url
    }
    if (report.archivoBase64) {
      // Convertir base64 a blob URL
      const binStr = atob(report.archivoBase64.split(',')[1] || report.archivoBase64)
      const len = binStr.length
      const arr = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i)
      }
      const blob = new Blob([arr], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    }
    if (report.archivoUrl) {
      return report.archivoUrl
    }
    return null
  }

  const documentUrl = getDocumentUrl()

  const handleOpenInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-xl">
            <div className="flex items-center gap-3 text-white">
              <FileText size={24} />
              <div>
                <h3 className="font-bold text-lg">Informe Psicologico</h3>
                {studentName && (
                  <p className="text-sm text-purple-100">{studentName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownload}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Descargar"
              >
                <Download size={20} />
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Abrir en nueva pestana"
              >
                <ExternalLink size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 p-4 bg-gray-100">
            {documentUrl ? (
              <iframe
                src={documentUrl}
                className="w-full h-full rounded-lg border-0 shadow-inner"
                title="Informe Psicologico"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No se pudo cargar el documento</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Ano academico: {report.academic_year || 'N/A'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ViewReportModal
