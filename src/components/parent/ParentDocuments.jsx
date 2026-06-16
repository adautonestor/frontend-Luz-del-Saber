import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Eye, Download, X, Search, File, AlertCircle
} from 'lucide-react'
import { documentsService } from '../../services/documentsService'
import { formatDateSafe } from '../../utils/dateUtils'

const ParentDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Cargar documentos - el backend ya filtra automáticamente según el rol del usuario
      const response = await documentsService.getAll() || []

      // Mapear valores estandarizados del backend a español para UI
      const visibleToMapping = {
        'parents': 'padres',
        'teachers': 'docentes',
        'all': 'ambos'
      };

      const apiUrl = import.meta.env.VITE_API_URL

      const mappedDocuments = response.map(doc => {
        // Construir URL del archivo usando el proxy del backend
        const fileUrl = doc.file_url
          ? `${apiUrl}/documents/file/${encodeURIComponent(doc.file_url)}`
          : null;

        return {
          id: doc.id,
          titulo: doc.title,
          description: doc.description,
          destinatario: visibleToMapping[doc.visible_to] || 'ambos',
          fileType: doc.file_type,
          fileName: doc.file_name,
          fileSize: doc.file_size,
          fileData: fileUrl,
          uploadDate: doc.upload_date,
          uploadedBy: doc.subido_por_nombre && doc.subido_por_apellidos
            ? `${doc.subido_por_nombre} ${doc.subido_por_apellidos}`
            : 'Desconocido'
        }
      })

      setDocuments(mappedDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const openViewModal = (document) => {
    setSelectedDocument(document)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedDocument(null)
  }

  const handleDownload = async (doc) => {
    try {
      const response = await fetch(doc.fileData)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar:', error)
      // Fallback: abrir en nueva pestaña
      window.open(doc.fileData, '_blank')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <File className="w-8 h-8 text-blue-500" />
    }
    if (fileType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />
    }
    return <File className="w-8 h-8 text-gray-500" />
  }

  const filteredDocuments = documents.filter(doc =>
    doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documentos Institucionales</h1>
        <p className="mt-2 text-gray-600">
          Documentos importantes compartidos por la institución
        </p>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar documentos por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Estos documentos son compartidos por la dirección del colegio.
            Puedes visualizarlos y descargarlos para tu referencia.
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Documentos Disponibles
            </h3>
            <div className="text-sm text-gray-600">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento' : 'documentos'}
            </div>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron documentos' : 'No hay documentos disponibles'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda.'
                : 'Aún no hay documentos compartidos por la institución.'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Icon */}
                  <div className="relative bg-gray-50 p-8 flex items-center justify-center">
                    {getFileIcon(document.fileType)}
                  </div>

                  {/* Information */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 truncate">
                      {document.titulo}
                    </h4>

                    {document.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {document.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Tamaño:</span>
                        <span className="font-medium">{formatFileSize(document.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Publicado:</span>
                        <span className="font-medium">
                          {formatDateSafe(document.uploadDate)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => openViewModal(document)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownload(document)}
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Download size={16} />
                        Descargar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDocument.titulo}
                </h2>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                {selectedDocument.fileType?.startsWith('image/') ? (
                  <img
                    src={selectedDocument.fileData}
                    alt={selectedDocument.titulo}
                    className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                  />
                ) : selectedDocument.fileType === 'application/pdf' ? (
                  <div className="w-full">
                    <iframe
                      src={selectedDocument.fileData}
                      className="w-full h-[70vh] border border-gray-300 rounded-lg"
                      title={selectedDocument.titulo}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12">
                    {getFileIcon(selectedDocument.fileType)}
                    <p className="mt-4 text-lg font-medium text-gray-900">{selectedDocument.fileName}</p>
                    <p className="mt-2 text-sm text-gray-600">Haz clic en descargar para ver el contenido completo</p>
                  </div>
                )}
              </div>

              {selectedDocument.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-600">{selectedDocument.description}</p>
                </div>
              )}

              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Tamaño:</span>
                    <p className="text-gray-600">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Tipo:</span>
                    <p className="text-gray-600">{selectedDocument.fileType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Publicado el {formatDateSafe(selectedDocument.uploadDate)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ParentDocuments