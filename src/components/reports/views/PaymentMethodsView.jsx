import React from 'react'
import { DollarSign, BarChart3, PieChart, Activity, AlertCircle } from 'lucide-react'

/**
 * Vista de análisis detallado de métodos de pago
 * Muestra estadísticas, distribución por categoría y tabla detallada
 */
const PaymentMethodsView = ({ reportData }) => {
  // Manejar caso de datos vacios o estructura diferente
  const methods = reportData?.data?.methods || reportData?.methods || []
  const totalAmount = reportData?.data?.totalAmount || reportData?.totalAmount || 0
  const totalTransactions = reportData?.data?.totalTransactions || reportData?.totalTransactions || 0
  const message = reportData?.data?.message || reportData?.message || null

  // Si no hay metodos de pago registrados
  if (methods.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Pagos Registrados</h3>
        <p className="text-gray-600">{message || 'No hay pagos registrados en el sistema todavia.'}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Transacciones</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monto Total</p>
            <p className="text-2xl font-bold text-gray-900">S/ 0.00</p>
          </div>
        </div>
      </div>
    )
  }

  // Calcular estadisticas
  const averagePayment = totalTransactions > 0 ? totalAmount / totalTransactions : 0
  const mostUsedMethod = methods.length > 0 ? methods[0]?.name : 'N/A'
  const leastUsedMethod = methods.length > 0 ? methods[methods.length - 1]?.name : 'N/A'

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Total Pagos</p>
              <p className="text-2xl font-semibold text-green-900">{totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">Monto Total</p>
              <p className="text-2xl font-semibold text-blue-900">S/ {totalAmount.toLocaleString('es-PE')}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800">Pago Promedio</p>
              <p className="text-2xl font-semibold text-purple-900">S/ {averagePayment.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-indigo-800">Metodos Usados</p>
              <p className="text-2xl font-semibold text-indigo-900">{methods.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Método más y menos usado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">Metodo Mas Usado</h4>
          <p className="text-xl font-semibold text-green-900">{mostUsedMethod}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Metodo Menos Usado</h4>
          <p className="text-xl font-semibold text-orange-900">{leastUsedMethod}</p>
        </div>
      </div>

      {/* Tabla detallada de métodos de pago */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metodo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porcentaje</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularidad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {methods.map((method, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      (method.name || '').toLowerCase().includes('yape') ? 'bg-purple-500' :
                      (method.name || '').toLowerCase().includes('efectivo') ? 'bg-green-500' :
                      (method.name || '').toLowerCase().includes('transferencia') ? 'bg-blue-500' :
                      (method.name || '').toLowerCase().includes('tarjeta') ? 'bg-red-500' :
                      (method.name || '').toLowerCase().includes('plin') ? 'bg-pink-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{method.name || 'No especificado'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {method.transactionsCount || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  S/ {parseFloat(method.totalAmount || 0).toLocaleString('es-PE')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${method.percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{method.percentage || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  S/ {parseFloat(method.averageAmount || 0).toLocaleString('es-PE')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    parseFloat(method.percentage || 0) > 20 ? 'bg-green-100 text-green-800' :
                    parseFloat(method.percentage || 0) > 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {parseFloat(method.percentage || 0) > 20 ? 'Muy Popular' :
                     parseFloat(method.percentage || 0) > 10 ? 'Popular' :
                     'Poco Usado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentMethodsView
