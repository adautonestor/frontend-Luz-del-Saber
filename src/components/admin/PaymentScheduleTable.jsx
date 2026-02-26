import React from 'react'
import { getPaymentStatus, getStatusColor, getStatusIcon } from '../../utils/paymentScheduleHelpers.jsx'
import { calculateMora, calculateDaysLate } from '../../utils/payments/moraCalculator.jsx'
import { usePaymentsStore } from '../../stores/paymentsStore'

/**
 * Componente de tabla de cronograma de pagos
 */
const PaymentScheduleTable = ({
  validPayments,
  parentStudents,
  onToggleExonerado
}) => {
  const { moraConfig } = usePaymentsStore()

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
              {parentStudents.length > 1 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">F. Vencimiento</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mora</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Exonerado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">F. Pago</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {validPayments.map((payment, index) => {
              const status = getPaymentStatus(payment)
              const paymentStudent = parentStudents.find(s => s.id === payment.student_id)

              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {payment.academic_year || '-'}
                  </td>
                  {parentStudents.length > 1 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {paymentStudent ? `${paymentStudent.first_names} ${paymentStudent.last_names}` : '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.concepto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.mes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.due_date ? new Date(payment.due_date).toLocaleDateString('es-PE') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    S/. {parseFloat(payment.total_amount || payment.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {status === 'vencido' && payment.due_date ? (
                      <div>
                        <div className="font-semibold text-red-600">
                          S/. {calculateMora(payment.due_date, null, moraConfig).toFixed(2)}
                        </div>
                        <div className="text-xs text-red-500">
                          {calculateDaysLate(payment.due_date)} días
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* No mostrar checkbox para pagos realizados o en verificación */}
                    {(status === 'pagado' || status === 'en_verificacion') ? (
                      <span className="text-gray-400 text-xs">-</span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={payment.exonerado || false}
                        onChange={() => onToggleExonerado(payment.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        title="Marcar/desmarcar como exonerado"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-PE') : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentScheduleTable
