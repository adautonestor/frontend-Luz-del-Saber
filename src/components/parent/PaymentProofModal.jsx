import React from 'react'
import { motion } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor, getStatusIcon, getStatusText } from '../../utils/paymentHelpers.jsx'

const PaymentProofModal = ({ payment, onClose }) => {
  if (!payment) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Comprobante de Pago</h2>
              <p className="text-gray-600 mt-1">{payment.concept}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monto:</span>
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fecha de pago:</span>
              <span className="font-semibold">{formatDate(payment.paymentDate)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Método:</span>
              <span className="font-semibold capitalize">{payment.paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">N° Comprobante:</span>
              <span className="font-semibold">{payment.voucher}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                {getStatusIcon(payment.status)}
                <span className="ml-1">{getStatusText(payment.status)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="mr-2" size={16} />
              Descargar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentProofModal
