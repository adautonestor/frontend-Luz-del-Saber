import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X, CheckCircle, QrCode, Upload, AlertCircle, ArrowLeft,
  Smartphone, Building2, Banknote
} from 'lucide-react'

/**
 * Modal para mostrar código QR
 */
const QRModal = ({ isOpen, onClose, qrImage, methodName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-sm w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Código QR - {methodName}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex justify-center">
          <img
            src={qrImage}
            alt={`QR ${methodName}`}
            className="max-w-full h-auto rounded-lg border border-gray-200"
            style={{ maxHeight: '300px' }}
          />
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Escanea este código con tu app {methodName}
        </p>
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Cerrar
        </button>
      </motion.div>
    </div>
  )
}

// Iconos por tipo de método
const getMethodIcon = (type) => {
  switch (type) {
    case 'digital': return Smartphone
    case 'bank': return Building2
    case 'physical': return Banknote
    default: return Banknote
  }
}

// Colores por tipo de método
const getMethodColor = (type) => {
  switch (type) {
    case 'digital': return 'bg-purple-500'
    case 'bank': return 'bg-green-500'
    case 'physical': return 'bg-gray-500'
    default: return 'bg-blue-500'
  }
}

/**
 * Modal para realizar pagos de obligaciones
 * Maneja el flujo de 3 pasos: selección de método, adjuntar voucher, confirmación
 */
const PaymentModal = ({
  isOpen,
  paymentStep,
  selectedPayment,
  selectedMethod,
  setSelectedMethod,
  voucherFile,
  setVoucherFile,
  operationNumber,
  setOperationNumber,
  paymentMethods = [],
  onClose,
  onConfirmMethod,
  onGoBack,
  onFileUpload,
  onSubmit
}) => {
  if (!isOpen || !selectedPayment) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header - Fijo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {paymentStep === 1 ? 'Seleccionar Método de Pago' :
                 paymentStep === 2 ? 'Adjuntar Comprobante' :
                 'Pago Enviado'}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedPayment.concepto} - {selectedPayment.estudiante || selectedPayment.student_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Periodo: {selectedPayment.monthName || selectedPayment.period || '-'}
              </p>
              {paymentStep === 2 && selectedMethod && (
                <p className="text-sm text-blue-600 mt-1">
                  Método: {selectedMethod.name}
                </p>
              )}

              {/* Mostrar desglose de monto con mora si aplica */}
              <div className="mt-2">
                <p className="text-lg font-semibold text-gray-700">
                  Saldo: S/. {parseFloat(selectedPayment.pending_balance || selectedPayment.saldo || selectedPayment.amount || 0).toFixed(2)}
                </p>
                {selectedPayment.mora > 0 && (
                  <>
                    <p className="text-sm text-red-600 font-medium">
                      + Mora ({selectedPayment.daysLate} días): S/. {parseFloat(selectedPayment.mora || 0).toFixed(2)}
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      Total a pagar: S/. {parseFloat(selectedPayment.totalConMora || 0).toFixed(2)}
                    </p>
                  </>
                )}
                {!selectedPayment.mora && (
                  <p className="text-2xl font-bold text-blue-600">
                    Total: S/. {parseFloat(selectedPayment.pending_balance || selectedPayment.saldo || selectedPayment.amount || 0).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body - Con scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {paymentStep === 1 ? (
            <MethodSelectionStep
              paymentMethods={paymentMethods}
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />
          ) : paymentStep === 2 ? (
            <VoucherUploadStep
              selectedMethod={selectedMethod}
              voucherFile={voucherFile}
              setVoucherFile={setVoucherFile}
              operationNumber={operationNumber}
              setOperationNumber={setOperationNumber}
              onFileUpload={onFileUpload}
            />
          ) : (
            <ConfirmationStep />
          )}
        </div>

        {/* Footer - Fijo */}
        {paymentStep !== 3 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between">
              <div>
                {paymentStep === 2 && (
                  <button
                    onClick={onGoBack}
                    className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cambiar método
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>

                {paymentStep === 1 ? (
                  <button
                    onClick={() => onConfirmMethod(selectedMethod)}
                    disabled={!selectedMethod}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedMethod
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={onSubmit}
                    disabled={!voucherFile}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                      voucherFile
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Pago
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer para confirmación - Fijo */}
        {paymentStep === 3 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Paso 1: Selección de método de pago (dinámico desde BD)
 */
const MethodSelectionStep = ({ paymentMethods, selectedMethod, onSelectMethod }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrModalData, setQrModalData] = useState({ image: '', name: '' })

  const handleShowQR = (e, method) => {
    e.stopPropagation() // Evitar que seleccione el método
    setQrModalData({ image: method.qr_code, name: method.name })
    setQrModalOpen(true)
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
        <p className="text-gray-600">No hay métodos de pago disponibles.</p>
        <p className="text-sm text-gray-500 mt-1">Contacta al administrador del colegio.</p>
      </div>
    )
  }

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Selecciona tu método de pago
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map(method => {
          const IconComponent = getMethodIcon(method.type)
          const colorClass = getMethodColor(method.type)

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethod?.id === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className={`${colorClass} rounded-lg p-2`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  {selectedMethod?.id === method.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>

                  {method.type === 'digital' && (
                    <div className="mt-2 space-y-1">
                      {method.holder && (
                        <p className="text-sm text-gray-600 font-medium">
                          Titular: {method.holder}
                        </p>
                      )}
                      {method.phone_number && (
                        <p className="text-sm text-gray-600">
                          Teléfono: {method.phone_number}
                        </p>
                      )}
                      {method.qr_code && (
                        <button
                          onClick={(e) => handleShowQR(e, method)}
                          className="flex items-center space-x-2 hover:bg-blue-100 rounded px-2 py-1 -ml-2 transition-colors"
                        >
                          <QrCode size={16} className="text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">
                            Ver código QR
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {method.type === 'bank' && (
                    <div className="mt-2 space-y-1">
                      {method.bank && (
                        <p className="text-sm text-gray-600">
                          Banco: {method.bank}
                        </p>
                      )}
                      {method.account_number && (
                        <p className="text-sm text-gray-600">
                          Cuenta: {method.account_number}
                        </p>
                      )}
                      {method.cci && (
                        <p className="text-sm text-gray-600">
                          CCI: {method.cci}
                        </p>
                      )}
                      {method.holder && (
                        <p className="text-sm text-gray-600">
                          Titular: {method.holder}
                        </p>
                      )}
                    </div>
                  )}

                  {method.type === 'physical' && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Pago en efectivo en oficina
                      </p>
                    </div>
                  )}

                  {method.instructions && (
                    <p className="text-xs text-gray-500 mt-2">
                      {method.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones importantes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Conserva tu comprobante de pago</li>
          <li>• Sube la foto del voucher en el siguiente paso</li>
          <li>• La confirmación del pago puede tardar hasta 24 horas</li>
          <li>• Indica el nombre del estudiante al realizar el pago</li>
        </ul>
      </div>

      {/* Modal para mostrar QR */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrImage={qrModalData.image}
        methodName={qrModalData.name}
      />
    </>
  )
}

/**
 * Paso 2: Subida de voucher y número de operación
 */
const VoucherUploadStep = ({
  selectedMethod,
  voucherFile,
  setVoucherFile,
  operationNumber,
  setOperationNumber,
  onFileUpload
}) => {
  const IconComponent = selectedMethod ? getMethodIcon(selectedMethod.type) : Banknote
  const colorClass = selectedMethod ? getMethodColor(selectedMethod.type) : 'bg-gray-500'
  const showOperationNumber = selectedMethod?.type === 'digital' || selectedMethod?.type === 'bank'

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Adjuntar comprobante de pago
      </h3>

      <div className="space-y-6">
        {/* Información del método seleccionado */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Método de pago seleccionado:</h4>
          <div className="flex items-center space-x-3">
            <div className={`${colorClass} rounded-lg p-2`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium">{selectedMethod?.name}</span>
              {selectedMethod?.type === 'digital' && selectedMethod?.phone_number && (
                <p className="text-sm text-gray-600">Tel: {selectedMethod.phone_number}</p>
              )}
              {selectedMethod?.type === 'bank' && selectedMethod?.account_number && (
                <p className="text-sm text-gray-600">Cuenta: {selectedMethod.account_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Número de operación (para métodos digitales y bancarios) */}
        {showOperationNumber && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de operación *
            </label>
            <input
              type="text"
              value={operationNumber}
              onChange={(e) => setOperationNumber(e.target.value)}
              placeholder="Ingresa el número de operación"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este número aparece en tu comprobante de transferencia
            </p>
          </div>
        )}

        {/* Upload de voucher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voucher/Comprobante de pago *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="voucher-upload"
              accept="image/*,.pdf"
              onChange={onFileUpload}
              className="hidden"
            />
            <label
              htmlFor="voucher-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              {voucherFile ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{voucherFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(voucherFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setVoucherFile(null)
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Cambiar archivo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Haz clic para subir tu voucher
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP o PDF (máx. 5MB)
                  </p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Instrucciones finales */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Importante:
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Asegúrate de que el voucher sea legible</li>
            <li>• La verificación puede tardar hasta 24 horas</li>
            <li>• Recibirás una notificación cuando se confirme el pago</li>
          </ul>
        </div>
      </div>
    </>
  )
}

/**
 * Paso 3: Confirmación
 */
const ConfirmationStep = () => {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        ¡Pago enviado correctamente!
      </h3>
      <p className="text-gray-600 mb-4">
        Tu pago ha sido registrado y está pendiente de verificación.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 text-left">
        <h4 className="font-medium text-blue-900 mb-2">¿Qué sigue?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• El administrador revisará tu comprobante</li>
          <li>• Recibirás una notificación cuando se apruebe</li>
          <li>• El estado del pago se actualizará automáticamente</li>
        </ul>
      </div>
    </div>
  )
}

export default PaymentModal
