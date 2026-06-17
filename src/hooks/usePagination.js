import { useState, useEffect, useMemo } from 'react'

/**
 * Hook de paginación del lado del cliente reutilizable.
 * Pagina un arreglo ya cargado/filtrado en memoria.
 *
 * @param {Array} items - Arreglo completo a paginar
 * @param {number} pageSize - Tamaño de página inicial (default 10)
 * @param {any} resetKey - Cuando cambia, vuelve a la página 1 (útil al cambiar filtros/búsqueda)
 * @returns {Object} { page, setPage, pageSize, setPageSize, total, totalPages, pageItems, from, to, next, prev, reset }
 */
export function usePagination(items, pageSize = 10, resetKey = null) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(pageSize)

  const list = Array.isArray(items) ? items : []
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / size))

  // Volver a página 1 cuando cambian los filtros/búsqueda
  useEffect(() => {
    setPage(1)
  }, [resetKey, size])

  // Mantener la página dentro de rango si el total se reduce
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
    else if (page < 1) setPage(1)
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * size
    return list.slice(start, start + size)
  }, [list, page, size, totalPages])

  const from = total === 0 ? 0 : (Math.min(page, totalPages) - 1) * size + 1
  const to = Math.min(Math.min(page, totalPages) * size, total)

  return {
    page,
    setPage,
    pageSize: size,
    setPageSize: setSize,
    total,
    totalPages,
    pageItems,
    from,
    to,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
    reset: () => setPage(1)
  }
}

export default usePagination
