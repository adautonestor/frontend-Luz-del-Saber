import { useState } from 'react'

/**
 * Hook para gestionar filtros y búsquedas en pagos
 */
export const usePaymentFilters = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterNivel, setFilterNivel] = useState('')
  const [searchPadres, setSearchPadres] = useState('')

  // Filtrar conceptos
  const filterConcepts = (conceptos) => {
    return conceptos.filter(concepto => {
      const matchesSearch = !searchTerm ||
        concepto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concepto.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesNivel = !filterNivel ||
        (concepto.levels && concepto.levels.includes(filterNivel))

      return matchesSearch && matchesNivel
    })
  }

  // Filtrar padres
  const filterParents = (padres) => {
    if (!searchPadres) return padres

    const searchLower = searchPadres.toLowerCase()
    return padres.filter(padre => {
      const fullName = `${padre.name} ${padre.apellidoPaterno || ''} ${padre.apellidoMaterno || ''}`.toLowerCase()
      const dni = padre.dni || ''
      return fullName.includes(searchLower) || dni.includes(searchLower)
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setFilterNivel('')
    setSearchPadres('')
  }

  return {
    searchTerm,
    setSearchTerm,
    filterNivel,
    setFilterNivel,
    searchPadres,
    setSearchPadres,
    filterConcepts,
    filterParents,
    resetFilters
  }
}
