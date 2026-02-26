import React from 'react'
import { Download } from 'lucide-react'

/**
 * Componente de filtros para la lista de pagos
 * Permite filtrar por estudiante, estado, mes y concepto
 */
const PaymentFilters = ({
  children,
  selectedChild,
  filterStatus,
  filterMonth,
  filterConcept,
  uniqueMonths,
  uniqueConcepts,
  onChildChange,
  onStatusChange,
  onMonthChange,
  onConceptChange,
  onDownload
}) => {
  return (
    <div className="card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtro por estudiante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estudiante
          </label>
          <select
            value={selectedChild}
            onChange={(e) => onChildChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos los estudiantes</option>
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.grade}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidos</option>
            <option value="verifying">Por Verificar</option>
            <option value="paid">Pagados</option>
            <option value="processing">En proceso</option>
            <option value="exonerado">Exonerados</option>
          </select>
        </div>

        {/* Filtro por mes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes
          </label>
          <select
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            {uniqueMonths.map(month => {
              const date = new Date(month + '-01')
              const monthName = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
              return (
                <option key={month} value={month}>
                  {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                </option>
              )
            })}
          </select>
        </div>

        {/* Filtro por concepto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Concepto
          </label>
          <select
            value={filterConcept}
            onChange={(e) => onConceptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            {uniqueConcepts.map(concept => (
              <option key={concept} value={concept}>
                {concept}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de descargar historial */}
        <div className="flex items-end">
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Historial
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentFilters
