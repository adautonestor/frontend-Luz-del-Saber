import React from 'react'
import { Filter } from 'lucide-react'

/**
 * Sección de filtros para reportes
 * Permite filtrar por año lectivo o rango de fechas
 */
const ReportFiltersSection = ({
  filterMode,
  setFilterMode,
  selectedYear,
  setSelectedYear,
  dateRange,
  setDateRange,
  availableYears
}) => {
  return (
    <div className="card p-4">
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-4">
          <label className="label mb-0">Filtrar por:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode('year')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterMode === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Año Lectivo
            </button>
            <button
              onClick={() => setFilterMode('dateRange')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterMode === 'dateRange'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rango de Fechas
            </button>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {filterMode === 'year' ? (
            <div className="flex-1">
              <label className="label">Año Lectivo</label>
              <select
                className="input"
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {!selectedYear && <option value="">Seleccione un año</option>}
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <label className="label">Fecha Inicio</label>
                <input
                  type="date"
                  className="input"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="label">Fecha Fin</label>
                <input
                  type="date"
                  className="input"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </>
          )}
          <button className="btn btn-primary px-6 py-2 flex items-center gap-2">
            <Filter size={18} />
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportFiltersSection
