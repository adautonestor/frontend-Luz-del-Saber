import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'

/**
 * Modal de confirmación para exonerar/reactivar un pago
 */
const PaymentExemptionConfirmModal = ({
  isOpen,
  payment,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !payment) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="text-orange-600" size={24} />
                Confirmar {payment.exonerado ? 'Reactivación' : 'Exoneración'}
              </h3>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                {payment.exonerado ? (
                  <>
                    ¿Estás seguro de que deseas <strong className="text-blue-600">reactivar</strong> este pago?
                  </>
                ) : (
                  <>
                    ¿Estás seguro de que deseas <strong className="text-orange-600">exonerar</strong> este pago?
                  </>
                )}
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Detalles del pago:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Concepto:</strong> {payment.concepto}</p>
                  {payment.mes && <p><strong>Mes:</strong> {payment.mes}</p>}
                  <p><strong>Monto:</strong> S/. {parseFloat(payment.total_amount || payment.amount || 0).toFixed(2)}</p>
                </div>
              </div>

              {!payment.exonerado && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-800">
                    <strong>Nota:</strong> Al exonerar este pago, no se incluirá en el total a pagar del estudiante.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  payment.exonerado
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {payment.exonerado ? 'Reactivar Pago' : 'Exonerar Pago'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PaymentExemptionConfirmModal
