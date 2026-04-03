import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import BimesterGradeCell from './BimesterGradeCell'
import { checkBimesterVisibility } from '@/utils/reportCards'
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

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default CourseGradesTable
