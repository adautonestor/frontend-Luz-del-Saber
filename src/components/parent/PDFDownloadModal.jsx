import React from 'react'
import { Download, Eye } from 'lucide-react'

const PDFDownloadModal = ({ show, pdfUrl, onDownload, onClose }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">PDF Generado</h2>
        <p className="text-gray-600 mb-6">Tu boleta de notas ha sido generada exitosamente. Puedes:</p>

        <div className="space-y-3">
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="mr-2" size={20} />
            Descargar PDF
          </button>

          <a
            href={pdfUrl?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Eye className="mr-2" size={20} />
            Ver en Nueva Pestaña
          </a>

          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700 font-semibold mb-2">Descarga Manual:</p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Haz clic derecho en "Ver en Nueva Pestaña"</li>
              <li>2. Selecciona "Guardar enlace como..."</li>
              <li>3. Elige la ubicación y guarda el archivo</li>
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>

        {pdfUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Archivo: {pdfUrl.fileName}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDFDownloadModal
