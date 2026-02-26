import React from 'react'
import { Search } from 'lucide-react'

/**
 * Componente de filtros para la página de calificaciones del profesor
 * Incluye selección de curso, periodo, grado, sección y búsqueda
 */
const GradesFilters = ({
  selectedCourse,
  setSelectedCourse,
  selectedBimester,
  setSelectedBimester,
  selectedLevel,
  setSelectedLevel,
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  searchTerm,
  setSearchTerm,
  courses,
  mockCourses,
  mockLevels,
  mockGrades,
  mockSections,
  canShowGradesTable
}) => {
  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Selección de nivel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel
          </label>
          <select
            className="input w-full"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Seleccionar nivel...</option>
            {mockLevels?.map(level => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de curso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Curso *
          </label>
          <select
            className="input w-full"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Seleccionar curso...</option>
            {mockCourses?.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de bimestre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periodo *
          </label>
          <select
            className="input w-full"
            value={selectedBimester}
            onChange={(e) => setSelectedBimester(e.target.value)}
          >
            <option value="">Seleccionar periodo...</option>
            <option value="1">I Bimestre</option>
            <option value="2">II Bimestre</option>
            <option value="3">III Bimestre</option>
            <option value="4">IV Bimestre</option>
          </select>
        </div>

        {/* Selección de grado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grado *
          </label>
          <select
            className="input w-full"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Seleccionar grado...</option>
            {mockGrades.map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selección de sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sección *
          </label>
          <select
            className="input w-full"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">Seleccionar sección...</option>
            {mockSections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar estudiante
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Nombre o DNI..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!canShowGradesTable}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradesFilters
