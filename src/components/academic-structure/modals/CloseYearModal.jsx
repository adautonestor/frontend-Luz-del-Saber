import React, { useState } from 'react'
import { Archive, AlertCircle } from 'lucide-react'
import { formatDateSafe } from '../../../utils/dateUtils'

/**
 * Modal para cerrar año lectivo con workflow de 3 pasos
 */
const CloseYearModal = ({ currentYear, onClose, onConfirm, onError }) => {
  const [formData, setFormData] = useState({
    motivo: '',
    observations: '',
    crearSiguienteAño: true
  })

  const [step, setStep] = useState(1) // 1: confirmation, 2: details, 3: processing
  const [error, setError] = useState(null)

  const handleSubmit = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      if (!formData.motivo.trim()) {
        setError('El motivo de cierre es requerido')
        return
      }
      setStep(3)
      onConfirm(formData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Archive className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Cerrar Año Lectivo
            </h3>
            <p className="text-gray-600">{currentYear?.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm">Confirmación</span>
        </div>
        <div className="w-12 h-px bg-gray-300"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm">Detalles</span>
        </div>
        <div className="w-12 h-px bg-gray-300"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 3 ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            3
          </div>
          <span className="ml-2 text-sm">Procesando</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">¿Está seguro de cerrar este año lectivo?</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta acción creará un archivo histórico completo y marcará el año como cerrado.
                  No podrá realizar modificaciones posteriores a los datos del año.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Período:</span>
              <p className="text-gray-600">
                {formatDateSafe(currentYear?.start_date)} - {formatDateSafe(currentYear?.end_date)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Estado actual:</span>
              <p className="text-green-600 font-medium">ACTIVO</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">¿Qué sucederá al cerrar el año?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Se creará un archivo histórico completo con todos los datos</li>
              <li>• Se preservarán las notas finales de todos los estudiantes</li>
              <li>• Se guardará el historial de pagos y comunicados</li>
              <li>• La estructura académica se archivará</li>
              <li>• Opcionalmente se creará el siguiente año lectivo</li>
            </ul>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {/* Mostrar error si existe */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del cierre *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.motivo}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, motivo: e.target.value }))
                setError(null) // Limpiar error al cambiar
              }}
            >
              <option value="">Seleccionar motivo</option>
              <option value="fin-periodo-regular">Fin del período académico regular</option>
              <option value="fin-anticipado">Cierre anticipado por circunstancias especiales</option>
              <option value="restructuracion">Reestructuración académica</option>
              <option value="otro">Otro motivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones adicionales
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="4"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Describa cualquier observación importante sobre el cierre del año lectivo..."
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="crearSiguiente"
              checked={formData.crearSiguienteAño}
              onChange={(e) => setFormData(prev => ({ ...prev, crearSiguienteAño: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="crearSiguiente" className="text-sm text-gray-700">
              Crear automáticamente el siguiente año lectivo ({currentYear?.año + 1})
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Cerrando año lectivo...</h4>
          <p className="text-gray-600">
            Creando archivo histórico y procesando datos. Esto puede tomar unos momentos.
          </p>
        </div>
      )}

      {/* Footer */}
      {step < 3 && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => step === 1 ? onClose() : setStep(1)}
            className="btn btn-outline px-4 py-2"
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          <button
            onClick={handleSubmit}
            className={`btn px-4 py-2 ${
              step === 1
                ? 'btn-outline text-orange-600 border-orange-200 hover:bg-orange-50'
                : 'btn-primary'
            }`}
          >
            {step === 1 ? 'Continuar' : 'Cerrar Año Lectivo'}
          </button>
        </div>
      )}
    </div>
  )
}

export default CloseYearModal
