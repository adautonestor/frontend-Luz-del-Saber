import React from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Sección de estado académico - Muestra competencias desaprobadas y requisitos
 */
const AcademicStatusSection = ({ failedCompetencies, subjects }) => {
  if (failedCompetencies === 0) return null

  const failedSubjects = subjects.filter(subject => subject.status === 'desaprobado')

  return (
    <div>
      {failedCompetencies >= 13 ? (
        // Must repeat year - 13 or more failed competencies
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Repetición de Año Académico
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-3 mb-4">
              <h4 className="text-red-900 font-semibold">
                Competencias Desaprobadas: {failedCompetencies} (Requiere repetir año)
              </h4>
              {failedSubjects.map((subject, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">{subject.name}</h4>
                    <p className="text-sm text-red-700">
                      Nota Final: <span className="font-bold">{subject.finalGrade}</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    DESAPROBADO
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-red-900 font-bold mb-2">REPETICIÓN DE AÑO ACADÉMICO</h4>
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Con {failedCompetencies} competencias desaprobadas (13 o más),
                    el estudiante debe repetir el año académico según el reglamento escolar.</strong>
                  </p>
                  <p className="text-xs text-red-700">
                    <strong>NO HAY OPCIÓN DE RECUPERACIÓN.</strong> La institución educativa contactará a los padres
                    para coordinar la matrícula en el mismo grado para el siguiente año lectivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Can recover - 12 or less failed competencies
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Competencias que Requieren Recuperación
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="mb-4">
              <h4 className="text-red-900 font-semibold">
                Total de Competencias Desaprobadas: {failedCompetencies} (Requiere recuperación)
              </h4>
            </div>
            <div className="space-y-3">
              {failedSubjects.map((subject, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">{subject.name}</h4>
                    <p className="text-sm text-red-700">
                      Nota Final: <span className="font-bold">{subject.finalGrade}</span>
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    REQUIERE RECUPERACIÓN
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Las competencias desaprobadas (En Proceso - nivel C) requieren recuperación antes del inicio del siguiente año lectivo.
                Contacte a la institución para conocer las fechas y modalidades de recuperación.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademicStatusSection
