import React from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, CreditCard, AlertTriangle, Clock, 
  DollarSign, Calendar, ArrowRight, Phone,
  Mail, MapPin, ExternalLink
} from 'lucide-react'

const PaymentBlockedAccess = ({ 
  studentName, 
  paymentStatus, 
  onPaymentRedirect 
}) => {
  const {
    blockedReason,
    pendingAmount,
    overdueCount,
    pendingPayments
  } = paymentStatus

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white text-center">
          <Lock className="mx-auto mb-4" size={64} />
          <h1 className="text-3xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-red-100 text-lg">
            No es posible acceder a las boletas de notas
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Estudiante: {studentName}
            </h2>
            <div className="flex items-center text-gray-600">
              <AlertTriangle className="mr-2" size={20} />
              <span>{blockedReason}</span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <DollarSign className="text-red-600 mr-3" size={24} />
                <h3 className="font-semibold text-red-800">Monto Pendiente</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <Clock className="text-orange-600 mr-3" size={24} />
                <h3 className="font-semibold text-orange-800">Cuotas Vencidas</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {overdueCount}
              </p>
            </div>
          </div>

          {/* Pending Payments Detail */}
          {pendingPayments && pendingPayments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Pagos Pendientes
              </h3>
              <div className="space-y-3">
                {pendingPayments.slice(0, 3).map((payment, index) => (
                  <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{payment.conceptName}</p>
                      <p className="text-sm text-gray-500">
                        Vence: {formatDate(payment.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatCurrency(payment.pending_balance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.state === 'parcial' ? 'Pago parcial' : 'Sin pagar'}
                      </p>
                    </div>
                  </div>
                ))}
                {pendingPayments.length > 3 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... y {pendingPayments.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPaymentRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center group"
            >
              <CreditCard className="mr-3" size={20} />
              Ir a Sección de Pagos
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </motion.button>

            <div className="text-center text-gray-600">
              <p className="mb-2">¿Ya realizaste tu pago?</p>
              <p className="text-sm">
                Los pagos pueden tardar hasta 24 horas en reflejarse en el sistema.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Necesitas ayuda?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="mr-2 text-blue-500" size={16} />
                <span>(01) 234-5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 text-green-500" size={16} />
                <span>pagos@luzdelsaber.edu</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 text-red-500" size={16} />
                <span>Tesorería - 1er piso</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Horarios de atención: Lunes a Viernes de 8:00 AM a 4:00 PM</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentBlockedAccess