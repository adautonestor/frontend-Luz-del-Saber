import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Eye, Download } from 'lucide-react'
import { formatDate, formatCurrency, getStatusColor, getStatusIcon, getStatusText } from '../../utils/paymentHelpers.jsx'
import { calculateMora, calculateDaysLate } from '../../utils/payments/moraCalculator.jsx'
import { usePaymentsStore } from '../../stores/paymentsStore'

/**
 * Componente de tabla de pagos
 * Muestra la lista de pagos con acciones disponibles
 */
const PaymentsTable = ({ payments, onPayClick, onViewProof }) => {
  const { moraConfig } = usePaymentsStore()

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Obligaciones de Pago
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Concepto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mora
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment, index) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.childName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.childGrade}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.concept}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.description}
                    </div>
                    {payment.daysOverdue > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {payment.daysOverdue} días vencido
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  {payment.daysOverdue > 0 && payment.dueDate ? (
                    <div>
                      <div className="text-sm font-semibold text-red-600">
                        S/. {calculateMora(payment.dueDate, null, moraConfig).toFixed(2)}
                      </div>
                      <div className="text-xs text-red-500">
                        {calculateDaysLate(payment.dueDate)} días
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-900">
                    {formatDate(payment.dueDate)}
                  </div>
                  {payment.paymentDate && (
                    <div className="text-xs text-green-600">
                      Pagado: {formatDate(payment.paymentDate)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">{getStatusText(payment.status)}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {payment.status === 'paid' ? (
                      <>
                        <button
                          onClick={() => onViewProof(payment)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Ver comprobante"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                      </>
                    ) : payment.status === 'exonerado' ? (
                      <span className="text-xs text-gray-500 italic">Sin acción</span>
                    ) : (
                      <button
                        onClick={() => onPayClick(payment)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <CreditCard className="mr-1" size={12} />
                        Pagar
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentsTable
