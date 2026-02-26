import React from 'react'
import { getGradeColor, getSubjectStatusColor, getCompetenciaColor, getCompetenciaLabel } from '@/utils/reports'

/**
 * Tabla de calificaciones finales por materia con competencias
 */
const FinalGradesTable = ({ subjects }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Calificaciones Finales por Materia y Competencias</h3>
      <div className="space-y-6">
        {subjects.map((subject, index) => (
          <div key={index} className={`border rounded-lg p-4 ${subject.status === 'desaprobado' ? 'border-red-200 bg-red-25' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{subject.name}</h4>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(subject.finalGrade)}`}>
                  Nota Final: {subject.finalGrade}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase ${getSubjectStatusColor(subject.status)}`}>
                  {subject.status}
                </span>
              </div>
            </div>

            {/* Bimester grades */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">1° Bim</div>
                <div className="font-semibold">{subject.bimester1}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">2° Bim</div>
                <div className="font-semibold">{subject.bimester2}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">3° Bim</div>
                <div className="font-semibold">{subject.bimester3}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">4° Bim</div>
                <div className="font-semibold">{subject.bimester4}</div>
              </div>
            </div>

            {/* Competencies */}
            {subject.competencias && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Competencias:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subject.competencias.map((competencia, compIndex) => (
                    <div key={compIndex} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded">
                      <span className="text-sm text-gray-700 flex-1">{competencia.name}</span>
                      <div className="ml-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCompetenciaColor(competencia.level)}`}>
                          {competencia.level} - {getCompetenciaLabel(competencia.level)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinalGradesTable
