import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { academicAreasService } from '../../services/academic/academicAreasService'

/**
 * Componente de filtros para cursos
 */
const CoursesFilters = ({
  filters,
  levels,
  academicAreas: propAreas,
  paginationInfo,
  onFilterChange,
  onClearFilters
}) => {
  const [academicAreas, setAcademicAreas] = useState([])

  // Cargar áreas académicas desde la base de datos
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const areas = await academicAreasService.getAll()
        setAcademicAreas(areas)
      } catch (error) {
        console.error('Error cargando áreas académicas:', error)
        setAcademicAreas([])
      }
    }
    loadAreas()
  }, [])

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar curso..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filtro por Nivel */}
        <select
          value={filters.nivel}
          onChange={(e) => onFilterChange('nivel', e.target.value)}
          className="input"
        >
          <option value="">Todos los niveles</option>
          {levels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
            </option>
          ))}
        </select>

        {/* Filtro por Área - Ahora usa datos dinámicos de la BD */}
        <select
          value={filters.area}
          onChange={(e) => onFilterChange('area', e.target.value)}
          className="input"
        >
          <option value="">Todas las áreas</option>
          {academicAreas.map(area => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Información y limpiar filtros */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {paginationInfo.totalItems > 0
            ? `Mostrando ${paginationInfo.startItem}-${paginationInfo.endItem} de ${paginationInfo.totalItems} curso(s)`
            : '0 cursos encontrados'}
        </span>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}

export default CoursesFilters
