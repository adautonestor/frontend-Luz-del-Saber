import React from 'react'
import { AlertCircle, DollarSign, Activity } from 'lucide-react'
import { formatDateSafe } from '../../../utils/dateUtils'
import Pagination from '../../common/Pagination'
import { usePagination } from '../../../hooks/usePagination'

/**
 * Vista de reporte de padres morosos
 * Muestra estadísticas, tabla detallada y compromisos de pago
 */
const DelinquentParentsView = ({
  reportData,
  paymentCommitments,
  togglePaymentCommitment
}) => {
  // Paginación del lado del cliente sobre la tabla de padres morosos
  const pg = usePagination(reportData.data, 10, reportData.data?.length)

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Total Padres Morosos</p>
              <p className="text-2xl font-semibold text-red-900">{reportData.stats.totalDelinquentParents}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">Deuda Total</p>
              <p className="text-2xl font-semibold text-orange-900">S/. {reportData.stats.totalDebt.toLocaleString('es-PE')}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">Deuda Promedio</p>
              <p className="text-2xl font-semibold text-yellow-900">S/. {parseFloat(reportData.stats.averageDebt).toLocaleString('es-PE')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de padres morosos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {reportData.headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pg.pageItems.map((parent, index) => (
              <tr key={index} className={`hover:bg-gray-50 ${
                parent.totalDebt > 1000 ? 'bg-red-25' :
                parent.totalDebt > 500 ? 'bg-orange-25' : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{parent.parentName}</div>
                  <div className="text-sm text-gray-500">{parent.parentEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parent.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    parent.level?.toLowerCase() === 'inicial' ? 'bg-blue-100 text-blue-800' :
                    parent.level?.toLowerCase() === 'primaria' ? 'bg-green-100 text-green-800' :
                    parent.level?.toLowerCase() === 'secundaria' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {parent.level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {parent.grade}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {parent.section}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div>{parent.parentPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <span className={`${
                    parent.totalDebt > 1000 ? 'text-red-600' :
                    parent.totalDebt > 500 ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    S/. {parent.totalDebt.toLocaleString('es-PE')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {parent.obligationsCount}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(parent.oldestDebt).toLocaleDateString('es-PE')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {parent.concepts.slice(0, 2).map((concept, conceptIndex) => (
                      <span key={conceptIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {concept}
                      </span>
                    ))}
                    {parent.concepts.length > 2 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{parent.concepts.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={paymentCommitments[parent.parentEmail]?.hasCommitment || false}
                      onChange={() => togglePaymentCommitment(parent.parentEmail)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      title={paymentCommitments[parent.parentEmail]?.hasCommitment
                        ? `Compromiso firmado el ${formatDateSafe(paymentCommitments[parent.parentEmail]?.date)}`
                        : 'Marcar compromiso de pago'}
                    />
                    {paymentCommitments[parent.parentEmail]?.hasCommitment && (
                      <span className="text-xs text-green-600 font-medium">
                        Firmado
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={pg.page}
          totalPages={pg.totalPages}
          total={pg.total}
          from={pg.from}
          to={pg.to}
          pageSize={pg.pageSize}
          onPageChange={pg.setPage}
          onPrev={pg.prev}
          onNext={pg.next}
          onPageSizeChange={pg.setPageSize}
        />
      </div>
    </div>
  )
}

export default DelinquentParentsView
