import React from 'react'
import { motion } from 'framer-motion'
import { X, QrCode } from 'lucide-react'
import { formatCurrency } from '../../utils/paymentHelpers.jsx'

const PaymentMethodModal = ({ payment, paymentMethods, onClose }) => {
  if (!payment) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Realizar Pago</h2>
              <p className="text-gray-600 mt-1">{payment.concept}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selecciona tu método de pago
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map(method => {
              const IconComponent = method.icon
              return (
                <div
                  key={method.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`${method.color} rounded-lg p-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{method.name}</h4>

                      {method.type === 'digital' && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Teléfono: {method.phone}</p>
                          <div className="flex items-center space-x-2">
                            <QrCode size={16} className="text-gray-400" />
                            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                              Ver código QR
                            </span>
                          </div>
                        </div>
                      )}

                      {method.type === 'bank' && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Cuenta: {method.account}</p>
                          <p className="text-sm text-gray-600">CCI: {method.cci}</p>
                          <p className="text-sm text-gray-600">Titular: {method.holder}</p>
                        </div>
                      )}

                      {method.type === 'physical' && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">Ubicación: {method.location}</p>
                          <p className="text-sm text-gray-600">Horario: {method.hours}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">{method.instructions}</p>
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
              <li>• Envía la foto del voucher al WhatsApp: 987-654-321</li>
              <li>• La confirmación del pago puede tardar hasta 24 horas</li>
              <li>• Para pagos en efectivo, solicita tu recibo oficial</li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Confirmar Método
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentMethodModal
