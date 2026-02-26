import React from 'react'
import { Star, CheckCircle, X } from 'lucide-react'
import { getGradeColor, getBehaviorGradeColor } from '@/utils/reports'

/**
 * Vista de Reporte Académico
 */
const AcademicReportView = ({ selectedReport }) => {
  return (
    <div className="space-y-8">
      {/* Overall Grade */}
      <div className="text-center">
        <div className={`inline-flex items-center px-6 py-3 rounded-full text-3xl font-bold ${getGradeColor(selectedReport.overallGrade)}`}>
          Promedio General: {selectedReport.overallGrade}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calificaciones por Materia</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materia</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nota</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Docente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedReport.subjects.map((subject, index) => {
                const isApproved = subject.grade >= 11
                return (
                  <tr key={index} className={!isApproved ? 'bg-red-25' : ''}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase ${
                        isApproved ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}>
                        {isApproved ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aprobado
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Desaprobado
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subject.teacher}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subject.observations}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Behavior */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluación de Comportamiento</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(selectedReport.behavior).map(([aspect, grade]) => (
            <div key={aspect} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 capitalize">
                {aspect.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getBehaviorGradeColor(grade)}`}>
                {grade}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asistencia</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedReport.attendance.totalDays}</div>
            <div className="text-sm text-gray-600">Días Totales</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{selectedReport.attendance.presentDays}</div>
            <div className="text-sm text-gray-600">Presentes</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{selectedReport.attendance.absentDays}</div>
            <div className="text-sm text-gray-600">Ausentes</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{selectedReport.attendance.percentage}%</div>
            <div className="text-sm text-gray-600">Porcentaje</div>
          </div>
        </div>
      </div>

      {/* Achievements and Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros Destacados</h3>
          <div className="space-y-2">
            {selectedReport.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <Star className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">{achievement}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendaciones</h3>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">{selectedReport.recommendations}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademicReportView
