import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import BimesterGradeCell from './BimesterGradeCell'
import { getGradeColor, getGradeIcon, checkBimesterVisibility } from '@/utils/reportCards'
import { convertNumericGradeToLetter, getLetterGradeColor } from '@/utils/gradeConversion.jsx'
import { BIMESTRES } from '@/constants/reportCards'

/**
 * Tabla de calificaciones de un curso
 */
const CourseGradesTable = ({
  curso,
  cursoIndex,
  showLetterGrades,
  selectedChild,
  selectedYear,
  visibilityConfigs
}) => {
  return (
    <motion.div
      key={cursoIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: cursoIndex * 0.1 }}
      className="card"
    >
      {/* Course Header */}
      <div className="p-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            {curso.cursoNombre}
          </h3>
        </div>
      </div>

      {/* Grades Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competencia
              </th>
              {BIMESTRES.map(bim => (
                <th key={bim} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bim {['I', 'II', 'III', 'IV'][bim - 1]}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                Promedio Anual
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Competencies Rows */}
            {curso.competencias.map((comp, compIndex) => (
              <tr key={compIndex} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {comp.name}
                  </div>
                </td>

                {/* Bimester Cells */}
                {BIMESTRES.map(bim => (
                  <BimesterGradeCell
                    key={bim}
                    bimestreNum={bim}
                    grade={comp[`bimestre${bim}`]}
                    notas={comp[`notas${bim}`]}
                    isVisible={checkBimesterVisibility(bim, selectedChild, selectedYear, visibilityConfigs)}
                    showLetterGrades={showLetterGrades}
                    gradingSystem={selectedChild.gradingSystem}
                  />
                ))}

                {/* Average Cell */}
                <td className="px-6 py-4 text-center bg-blue-50">
                  <div className="flex items-center justify-center gap-2">
                    {comp.promedio !== null && getGradeIcon(comp.promedio, selectedChild.gradingSystem)}
                    {showLetterGrades ? (
                      <div>
                        <span className={`text-sm font-semibold ${
                          comp.promedio !== null
                            ? getLetterGradeColor(typeof comp.promedio === 'string' ? comp.promedio : convertNumericGradeToLetter(comp.promedio))
                            : 'text-gray-400'
                        }`}>
                          {comp.promedio !== null ? (typeof comp.promedio === 'string' ? comp.promedio : convertNumericGradeToLetter(comp.promedio)) : '-'}
                        </span>
                        {comp.promedio !== null && typeof comp.promedio === 'number' && (
                          <div className="text-xs text-gray-400">
                            ({comp.promedio.toFixed(2)})
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className={`text-sm font-semibold ${
                        comp.promedio !== null
                          ? getGradeColor(comp.promedio, selectedChild.gradingSystem)
                          : 'text-gray-400'
                      }`}>
                        {comp.promedio !== null ? (typeof comp.promedio === 'number' ? comp.promedio.toFixed(2) : comp.promedio) : '-'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* Course Average Row */}
            <tr className="bg-green-100 font-bold">
              <td className="px-6 py-4 text-sm text-gray-900">
                PROMEDIO FINAL DEL CURSO
              </td>
              <td colSpan="4" className="px-6 py-4"></td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-700" />
                  {showLetterGrades ? (
                    <div>
                      <span className={`text-lg ${
                        curso.promedioFinal !== null
                          ? getLetterGradeColor(typeof curso.promedioFinal === 'string' ? curso.promedioFinal : convertNumericGradeToLetter(curso.promedioFinal))
                          : 'text-gray-400'
                      }`}>
                        {curso.promedioFinal !== null ? (typeof curso.promedioFinal === 'string' ? curso.promedioFinal : convertNumericGradeToLetter(curso.promedioFinal)) : '-'}
                      </span>
                      {curso.promedioFinal !== null && typeof curso.promedioFinal === 'number' && (
                        <div className="text-xs text-gray-600">
                          ({curso.promedioFinal.toFixed(2)})
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className={`text-lg ${
                      curso.promedioFinal !== null
                        ? getGradeColor(curso.promedioFinal, selectedChild.gradingSystem)
                        : 'text-gray-400'
                    }`}>
                      {curso.promedioFinal !== null ? (typeof curso.promedioFinal === 'number' ? curso.promedioFinal.toFixed(2) : curso.promedioFinal) : '-'}
                    </span>
                  )}
                </div>
              </td>
            </tr>

            {/* Failed Competencies Row */}
            <tr className={`${curso.competenciasDesaprobadas > 0 ? 'bg-red-50' : 'bg-blue-50'} font-semibold`}>
              <td className="px-6 py-4 text-sm text-gray-900">
                N° DE COMPETENCIAS DESAPROBADAS
              </td>
              <td colSpan="4" className="px-6 py-4"></td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {curso.competenciasDesaprobadas > 0 ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-lg font-bold text-red-600">
                        {curso.competenciasDesaprobadas}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        0
                      </span>
                    </>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default CourseGradesTable
