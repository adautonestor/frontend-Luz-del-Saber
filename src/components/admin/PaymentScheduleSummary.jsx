import React from 'react'
import { DollarSign } from 'lucide-react'

/**
 * Componente de resumen de totales de pagos
 */
const PaymentScheduleSummary = ({
  totalAmount,
  paidAmount,
  pendingAmount,
  exemptCount
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg p-6 no-export">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign size={20} />
          Resumen de Pagos
        </h4>
        {exemptCount > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            {exemptCount} pago(s) exonerado(s)
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Programado</p>
          <p className="text-2xl font-bold text-gray-900">S/. {totalAmount.toFixed(2)}</p>
          {exemptCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              (Excluye {exemptCount} exonerado{exemptCount > 1 ? 's' : ''})
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600">S/. {paidAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Total Pendiente</p>
          <p className="text-2xl font-bold text-red-600">S/. {pendingAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentScheduleSummary
