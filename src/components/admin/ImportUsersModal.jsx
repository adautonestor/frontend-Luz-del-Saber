import React from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, Download, Upload, Check, AlertCircle } from 'lucide-react'

const ImportUsersModal = ({
  isOpen,
  importFile,
  importResults,
  isImporting,
  onFileSelect,
  onProcess,
  onDownloadTemplate,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      ></div>

      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileSpreadsheet className="mr-2" size={24} />
              Importar Usuarios desde Excel
            </h3>

            {!importResults ? (
              <div className="space-y-4">
                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>El archivo debe ser formato Excel (.xlsx o .xls)</li>
                    <li>Debe contener las columnas: <strong>first_name, last_names, dni, email, rol, phone, address, state, relationship</strong></li>
                    <li>Los campos <strong>first_name, last_names y dni</strong> son obligatorios</li>
                    <li>La contraseña será automáticamente el DNI del usuario (solo para nuevos)</li>
                    <li>Los roles válidos son: <strong>director, profesor, padre, secretaria</strong></li>
                    <li><strong>Si el DNI existe</strong>, se actualizarán los datos del usuario</li>
                    <li><strong>Si el DNI no existe</strong>, se creará un nuevo usuario</li>
                  </ul>
                </div>

                {/* Botón descargar plantilla */}
                <div className="flex justify-center">
                  <button
                    onClick={onDownloadTemplate}
                    className="btn btn-outline px-4 py-2 flex items-center gap-2"
                  >
                    <Download size={18} />
                    Descargar Plantilla Excel
                  </button>
                </div>

                {/* File upload */}
                <div>
                  <label className="label">Seleccionar Archivo Excel</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onFileSelect}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {importFile && (
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <Check size={16} className="mr-1" />
                      Archivo seleccionado: {importFile.name}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline px-4 py-2"
                    disabled={isImporting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onProcess}
                    disabled={!importFile || isImporting}
                    className="btn btn-primary px-4 py-2 flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Importar Usuarios
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Resultados de importación */
              <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Creados</span>
                      <span className="text-2xl font-bold text-green-900">
                        {importResults.created?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Actualizados</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {importResults.updated?.length || 0}
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">Errores</span>
                      <span className="text-2xl font-bold text-red-900">
                        {importResults.errors.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de creados */}
                {importResults.created?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-green-900 mb-2">✅ Usuarios Creados:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      {importResults.created.map((item, index) => (
                        <li key={index}>
                          ✓ Fila {item.row}: {item.name} (DNI: {item.dni})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lista de actualizados */}
                {importResults.updated?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-blue-900 mb-2">🔄 Usuarios Actualizados:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {importResults.updated.map((item, index) => (
                        <li key={index}>
                          ↻ Fila {item.row}: {item.name} (DNI: {item.dni})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lista de errores */}
                {importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-red-900 mb-2">Errores Encontrados:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {importResults.errors.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
                          <span>Fila {item.row}: {item.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón cerrar */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={onClose}
                    className="btn btn-primary px-4 py-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default ImportUsersModal
