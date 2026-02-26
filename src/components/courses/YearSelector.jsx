import React from 'react'

/**
 * Selector de año lectivo para cursos
 */
const YearSelector = ({ academicYears, selectedAcademicYear, onYearChange }) => {
  const handleChange = (e) => {
    const yearId = parseInt(e.target.value)
    const year = academicYears.find(y => y.id === yearId)
    if (year) {
      onYearChange(year)
    }
  }

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Año Lectivo</h3>
          <p className="text-sm text-gray-600">Selecciona el año para gestionar sus cursos</p>
        </div>
        <select
          value={selectedAcademicYear?.id || ''}
          onChange={handleChange}
          className="input w-64"
        >
          {academicYears
            .sort((a, b) => b.año - a.año)
            .map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.año})
                {year.state === 'activo' ? ' - Activo' : ''}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

export default YearSelector
