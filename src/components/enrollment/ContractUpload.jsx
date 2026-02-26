import React from 'react'
import { FileText, Upload as UploadIcon } from 'lucide-react'

/**
 * Componente de carga de contrato de matrícula
 * Permite adjuntar un PDF del contrato firmado
 */
const ContractUpload = ({
  formData,
  handleFileChange,
  removeFile
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FileText className="mr-2" size={20} />
        Contrato de Matrícula (Opcional)
      </h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {formData.contratoNombre ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="text-primary-600 mr-2" size={20} />
              <span className="text-sm text-gray-700">{formData.contratoNombre}</span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <div className="text-center">
            <UploadIcon className="mx-auto text-gray-400 mb-2" size={32} />
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="contrato-upload"
            />
            <label
              htmlFor="contrato-upload"
              className="cursor-pointer text-sm text-primary-600 hover:text-primary-700"
            >
              Haz clic para adjuntar contrato firmado (PDF)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Solo archivos PDF. Tamaño máximo: 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContractUpload
