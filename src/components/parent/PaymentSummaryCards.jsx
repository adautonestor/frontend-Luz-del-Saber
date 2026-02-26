import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '../../utils/paymentHelpers.jsx'

/**
 * Componente de tarjetas de resumen de pagos
 * Muestra total pendiente, vencidos, pagado este mes y total de pagos
 */
const PaymentSummaryCards = ({ totalPending, overdueCount, paidThisMonth, totalPayments }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-red-500 rounded-lg p-3">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Pendiente</p>
            <p className="text-2xl font-semibold text-red-600">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-yellow-500 rounded-lg p-3">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Vencidos</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {overdueCount}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-green-500 rounded-lg p-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pagado Este Mes</p>
            <p className="text-2xl font-semibold text-green-600">
              {formatCurrency(paidThisMonth)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-lg p-3">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Pagos</p>
            <p className="text-2xl font-semibold text-gray-900">
              {totalPayments}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentSummaryCards
