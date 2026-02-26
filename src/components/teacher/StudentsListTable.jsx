import React from 'react'
import { Eye, Users, Loader2 } from 'lucide-react'

const StudentsListTable = ({
  students,
  selectedStudents,
  onSelectAll,
  onSelectStudent,
  onViewDetail,
  // Nuevas props para competencias
  courseCompetencies = [],
  selectedBimester = 1,
  setSelectedBimester,
  getCompetencyAverage,
  formatGradeValue,
  getGradeColorFromAvg,
  isLoadingCompetencies = false,
  isLoadingAverages = false
}) => {
  return (
    <div className="space-y-4">
      {/* Selector de Bimestre */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Bimestre:</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(bim => (
            <button
              key={bim}
              onClick={() => setSelectedBimester(bim)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedBimester === bim
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              {bim}° Bimestre
            </button>
          ))}
        </div>
        {(isLoadingCompetencies || isLoadingAverages) && (
          <div className="flex items-center gap-2 ml-auto text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            <span>Cargando...</span>
          </div>
        )}
      </div>

      {/* Tabla de estudiantes */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={onSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              {/* Columnas dinámicas por competencia */}
              {courseCompetencies.length > 0 ? (
                courseCompetencies.map(comp => (
                  <th
                    key={comp.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    title={comp.description || comp.name}
                  >
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[100px]">{comp.name}</span>
                      {comp.code && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          {comp.code}
                        </span>
                      )}
                    </div>
                  </th>
                ))
              ) : (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {isLoadingCompetencies ? 'Cargando competencias...' : 'Sin competencias'}
                </th>
              )}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => onSelectStudent(student.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-lg">
                          {student.first_names?.charAt(0)}{student.last_names?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">
                        {student.last_names}, {student.first_names}
                      </p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </td>
                {/* Celdas con nota por competencia */}
                {courseCompetencies.length > 0 ? (
                  courseCompetencies.map(comp => {
                    const avgData = getCompetencyAverage(student.id, comp.id, selectedBimester)
                    const displayValue = formatGradeValue(avgData)
                    const colorClass = getGradeColorFromAvg(avgData)

                    return (
                      <td key={comp.id} className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${colorClass}`}>
                          {displayValue}
                        </span>
                      </td>
                    )
                  })
                ) : (
                  <td className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                    --
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onViewDetail(student)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Ver perfil del estudiante"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500">No se encontraron estudiantes</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsListTable
