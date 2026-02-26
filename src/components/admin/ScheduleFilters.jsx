import React from 'react'

const ScheduleFilters = ({
  activeTab,
  levels,
  selectedLevel,
  setSelectedLevel,
  selectedGrade,
  setSelectedGrade,
  selectedSection,
  setSelectedSection,
  getGradesByLevel,
  getSectionsByGrade
}) => {
  return (
    <>
      {activeTab === 'alumnos' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Filtrar por:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nivel</label>
              <select
                className="input"
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value)
                  setSelectedGrade('')
                  setSelectedSection('')
                }}
              >
                <option value="">Todos los niveles</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Grado</label>
              <select
                className="input"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value)
                  setSelectedSection('')
                }}
                disabled={!selectedLevel}
              >
                <option value="">Todos los grados</option>
                {getGradesByLevel(selectedLevel).map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Sección</label>
              <select
                className="input"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedGrade}
              >
                <option value="">Todas las secciones</option>
                {getSectionsByGrade(selectedGrade).map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docentes' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Filtrar por:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nivel</label>
              <select
                className="input"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Todos los niveles</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ScheduleFilters
