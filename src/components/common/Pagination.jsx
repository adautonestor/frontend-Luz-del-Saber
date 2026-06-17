import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Componente de paginación reutilizable.
 * Muestra "Mostrando X–Y de Z", selector de tamaño de página y navegación por números.
 *
 * Props:
 *  - page, totalPages, total, from, to (de usePagination)
 *  - onPageChange(n), onPrev, onNext
 *  - pageSize, onPageSizeChange(n) [opcional]
 *  - pageSizeOptions [opcional]
 */
const Pagination = ({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  onPrev,
  onNext,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) => {
  if (!total || total === 0) return null

  // Ventana de números de página (máximo 5 visibles, centrados en la actual)
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 ${className}`}>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          Mostrando <span className="font-medium text-gray-900">{from}</span>–
          <span className="font-medium text-gray-900">{to}</span> de{' '}
          <span className="font-medium text-gray-900">{total}</span>
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-primary-500"
            title="Filas por página"
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt} / pág.</option>
            ))}
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={page <= 1}
            className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Anterior"
          >
            <ChevronLeft size={16} />
          </button>

          {start > 1 && (
            <>
              <button type="button" onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">1</button>
              {start > 2 && <span className="px-1 text-gray-400">…</span>}
            </>
          )}

          {pages.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 rounded border text-sm ${
                p === page
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
              <button type="button" onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">{totalPages}</button>
            </>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={page >= totalPages}
            className="p-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Pagination
