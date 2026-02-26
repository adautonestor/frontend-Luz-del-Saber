import React from 'react'
import { Calendar, AlertCircle } from 'lucide-react'

/**
 * Tabla del cronograma de pagos editable
 * Muestra y permite editar montos, fechas y exoneraciones
 */
const PaymentScheduleTable = ({
  paymentSchedule,
  formData,
  handleScheduleAmountChange,
  handleScheduleDateChange,
  handleScheduleExoneradoChange
}) => {
  if (paymentSchedule.length === 0) {
    return null
  }

  const total = paymentSchedule.reduce((sum, p) => sum + (p.exonerado ? 0 : (p.total_amount || 0)), 0)
  const exoneradosCount = paymentSchedule.filter(p => p.exonerado).length

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar className="mr-2" size={20} />
        Cronograma de Pagos (Editable)
      </h3>

      {/* Cuadro informativo del año lectivo */}
      <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-800">
              Año Lectivo Activo: <span className="font-bold text-blue-900">{formData.anoLectivo}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Este cronograma corresponde al año escolar {formData.anoLectivo}
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Original
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Final
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Vencimiento
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exonerado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentSchedule.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {payment.concepto}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {payment.mes || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    S/. {parseFloat(payment.montoOriginal || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    {payment.porcentajeDescuento > 0 ? (
                      <>-{payment.porcentajeDescuento}% (S/. {parseFloat(payment.montoDescuento || 0).toFixed(2)})</>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.total_amount}
                      onChange={(e) => handleScheduleAmountChange(payment.id, e.target.value)}
                      className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={payment.due_date}
                      onChange={(e) => handleScheduleDateChange(payment.id, e.target.value)}
                      className="w-36 px-2 py-1 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={payment.exonerado || false}
                      onChange={(e) => handleScheduleExoneradoChange(payment.id, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                  Total:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-primary-600">
                  S/. {total.toFixed(2)}
                </td>
                <td colSpan="2" className="px-4 py-3 text-xs text-gray-500 italic">
                  {exoneradosCount > 0 && (
                    <span className="text-orange-600">
                      ({exoneradosCount} pago(s) exonerado(s))
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="bg-blue-50 border-t border-blue-100 px-4 py-3 space-y-1">
          <p className="text-xs text-blue-700 flex items-center">
            <AlertCircle className="mr-1" size={14} />
            <strong>Cada monto es independiente:</strong> Puedes modificar cada cuota individualmente según necesites (becas, descuentos especiales, etc.)
          </p>
          <p className="text-xs text-blue-700 flex items-center">
            <AlertCircle className="mr-1" size={14} />
            También puedes ajustar las fechas de vencimiento de forma independiente para cada pago
          </p>
          <p className="text-xs text-orange-700 flex items-center">
            <AlertCircle className="mr-1" size={14} />
            Marca "Exonerado" para los pagos que el estudiante no debe realizar (no se incluirán en el total)
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentScheduleTable
