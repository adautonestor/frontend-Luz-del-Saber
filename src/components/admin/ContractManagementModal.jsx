import React, { useState } from 'react'
import { X, FileText, Upload, Download, Eye, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ContractManagementModal = ({ isOpen, onClose, student, onSave }) => {
  const [contractFile, setContractFile] = useState(null)
  const [hasContract, setHasContract] = useState(!!student?.contratoAdjunto)
  // Adaptado para manejar tanto objetos como strings del contrato
  const [contractName, setContractName] = useState(
    typeof student?.contratoAdjunto === 'string'
      ? student.contratoAdjunto
      : student?.contratoAdjunto?.name || ''
  )
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten archivos PDF, JPG o PNG')
        return
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB')
        return
      }

      setContractFile(file)
      setContractName(file.name)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!contractFile) {
      setError('Por favor seleccione un archivo para subir')
      return
    }

    setUploading(true)
    try {
      // Guardar el contrato usando el callback onSave
      await onSave(student.id, contractFile)

      // Actualizar el estado local
      setHasContract(true)
      setSuccess(true)

      setTimeout(() => {
        onClose()
        setSuccess(false)
        setContractFile(null)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al guardar el contrato')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveContract = async () => {
    setUploading(true)
    try {
      await onSave(student.id, null)
      setHasContract(false)
      setContractName('')
      setContractFile(null)
      setSuccess(true)
      setError('')
      setShowDeleteConfirm(false)
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError('Error al eliminar el contrato')
      setShowDeleteConfirm(false)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    // Descargar el contrato desde el servidor con autenticación
    if (contractName) {
      try {
        const token = localStorage.getItem('authToken')
        const encodedPath = encodeURIComponent(contractName)
        const contractUrl = `${import.meta.env.VITE_API_URL}/matriculation/contract/${encodedPath}`

        // Hacer fetch con token de autorización
        const response = await fetch(contractUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Error al descargar el contrato')
        }

        // Convertir respuesta a blob y descargar
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        // Extraer nombre del archivo para el atributo download
        const filename = contractName.includes('/')
          ? contractName.split('/').pop()
          : contractName

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        setError('Error al descargar el contrato')
        console.error('Error descargando contrato:', err)
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-md w-full"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Contrato de Matrícula
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Student Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {student?.first_names} {student?.last_names}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                DNI: {student?.dni} | Código: {student?.code}
              </p>
              <p className="text-xs text-gray-600">
                {student?.nivel} - {student?.grado}° {student?.seccion}
              </p>
            </div>

            {/* Si HAY contrato: Mostrar solo opciones de descarga y eliminación */}
            {hasContract ? (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Contrato Actual
                </p>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <FileText className="text-green-600 mt-1 mr-3" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contractName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Adjuntado durante la matrícula
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Descargar"
                        disabled={uploading}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                        disabled={uploading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Si NO HAY contrato: Mostrar área de subida */
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">
                    No hay contrato adjunto actualmente
                  </p>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {contractFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="text-primary-600 mr-2" size={20} />
                        <span className="text-sm text-gray-700">{contractName}</span>
                      </div>
                      <button
                        onClick={() => {
                          setContractFile(null)
                          setContractName('')
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="contract-upload-modal"
                      />
                      <label
                        htmlFor="contract-upload-modal"
                        className="cursor-pointer inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                      >
                        Seleccionar Archivo
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        PDF, JPG o PNG (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-2" size={18} />
                  <p className="text-sm text-green-700">¡Contrato guardado exitosamente!</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              {hasContract ? 'Cerrar' : 'Cancelar'}
            </button>

            {/* Solo mostrar botón de guardar si NO hay contrato */}
            {!hasContract && (
              <button
                onClick={handleUpload}
                disabled={!contractFile || uploading}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center ${
                  !contractFile || uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={16} />
                    Guardar Contrato
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg max-w-md w-full mx-4"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Eliminación
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-2">
                  ¿Está seguro de que desea eliminar el contrato?
                </p>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer. El archivo será eliminado permanentemente del sistema.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRemoveContract}
                  disabled={uploading}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar Contrato
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}

export default ContractManagementModal