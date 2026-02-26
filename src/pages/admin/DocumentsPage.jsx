import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Upload, Trash2, Eye, Download, X, AlertCircle, Plus, Search, File
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import DocumentUploadModal from '../../components/documents/DocumentUploadModal'
import DocumentViewModal from '../../components/documents/DocumentViewModal'
import DocumentCard from '../../components/documents/DocumentCard'
import ConfirmModal from '../../components/common/ConfirmModal'
import { documentsService } from '../../services/documentsService'

const DocumentsPage = () => {
  const { user } = useAuthStore()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    description: '',
    destinatario: 'padres', // 'padres', 'docentes', 'ambos'
    archivo: null,
    preview: null
  })

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 300))

      const response = await documentsService.getAll() || []

      // Mapear los datos del backend al formato que espera el frontend
      const mappedDocuments = response.map(doc => {
        const apiUrl = import.meta.env.VITE_API_URL

        // Mapear valores estandarizados del backend a español para UI
        const visibleToMapping = {
          'parents': 'padres',
          'teachers': 'docentes',
          'all': 'ambos'
        };

        // Construir URL del archivo usando el proxy del backend
        // El file_url contiene la key de Wasabi (ej: "documents/doc_2025-11-27.pdf")
        // La URL del proxy es: /api/documents/file/{key_encoded}
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

  const openUploadModal = () => {
    setUploadForm({
      titulo: '',
      description: '',
      destinatario: 'padres',
      archivo: null,
      preview: null
    })
    setShowUploadModal(true)
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadForm({
      titulo: '',
      description: '',
      destinatario: 'padres',
      archivo: null,
      preview: null
    })
  }

  const openViewModal = (document) => {
    setSelectedDocument(document)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedDocument(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Verificar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadForm(prev => ({
          ...prev,
          archivo: file,
          preview: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    try {
      if (!uploadForm.titulo || !uploadForm.archivo) {
        alert('Por favor complete el título y seleccione un archivo')
        return
      }

      const formData = new FormData()
      formData.append('file', uploadForm.archivo)
      formData.append('title', uploadForm.titulo)
      formData.append('description', uploadForm.description || '')
      formData.append('type', 'general')
      formData.append('category', '')
      formData.append('visible_to', uploadForm.destinatario)

      await documentsService.upload(formData)

      // Recargar documentos después de subir
      await loadDocuments()

      console.log('✅ Documento subido exitosamente')
      closeUploadModal()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Error al subir el documento: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleDelete = (documentId) => {
    setDocumentToDelete(documentId)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await documentsService.remove(documentToDelete)

      // Recargar documentos después de eliminar
      await loadDocuments()

      console.log('✅ Documento eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error al eliminar el documento')
    } finally {
      setDocumentToDelete(null)
    }
  }

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setDocumentToDelete(null)
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    if (isNaN(bytes)) return 'N/A'
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
    doc.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y comparte documentos importantes de la institución
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="btn btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Upload size={20} />
          Subir Documento
        </button>
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
              {searchTerm ? 'No se encontraron documentos' : 'No hay documentos'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda.'
                : 'Sube el primer documento para compartir con tu equipo.'}
            </p>
            {!searchTerm && (
              <button
                onClick={openUploadModal}
                className="btn btn-primary flex items-center gap-2 mx-auto"
              >
                <Upload size={20} />
                Subir Documento
              </button>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  openViewModal={openViewModal}
                  handleDelete={handleDelete}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        showUploadModal={showUploadModal}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        closeUploadModal={closeUploadModal}
        getFileIcon={getFileIcon}
      />

      {/* View Modal */}
      <DocumentViewModal
        showViewModal={showViewModal}
        selectedDocument={selectedDocument}
        closeViewModal={closeViewModal}
        getFileIcon={getFileIcon}
        formatFileSize={formatFileSize}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title="Eliminar Documento"
        message="¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}

export default DocumentsPage