/**
 * Filtros para informes psicológicos
 */

import { Search, Filter, Calendar } from 'lucide-react'

const PsychReportsFilters = ({
  selectedYear,
  searchTerm,
  selectedLevel,
  selectedGrade,
  selectedSection,
  academicYears,
  levels,
  grades,
  sections,
  onYearChange,
  onSearchChange,
  onLevelChange,
  onGradeChange,
  onSectionChange
}) => {
  // Asegurar que los arrays no sean undefined
  const safeAcademicYears = academicYears || []
  const safeLevels = levels || []
  const safeGrades = grades || []
  const safeSections = sections || []

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Año lectivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Año Lectivo
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {safeAcademicYears.map((year, index) => (
              <option key={`year-${year}-${index}`} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search size={16} className="inline mr-1" />
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter size={16} className="inline mr-1" />
            Nivel
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => {
              onLevelChange(e.target.value)
              onGradeChange('todos')
              onSectionChange('todos')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="todos">Todos los niveles</option>
            {safeLevels.map((level) => (
              <option key={`level-${level.id}`} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grado
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => {
              onGradeChange(e.target.value)
              onSectionChange('todos')
            }}
            disabled={selectedLevel === 'todos'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="todos">Todos los grados</option>
            {safeGrades.map((grade) => (
              <option key={`grade-${grade.id}`} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sección
          </label>
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            disabled={selectedGrade === 'todos'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="todos">Todas las secciones</option>
            {safeSections.map((section) => (
              <option key={`section-${section.id}`} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default PsychReportsFilters
