import React from 'react'
import { Clock, MessageSquare } from 'lucide-react'
import { getGradeColor } from '@/utils/reportCards'
import { convertNumericGradeToLetter, getLetterGradeColor, getLetterGradeDescription } from '@/utils/gradeConversion.jsx'

/**
 * Celda de nota de bimestre (reutilizable para los 4 bimestres)
 */
const BimesterGradeCell = ({
  bimestreNum,
  grade,
  notas,
  isVisible,
  showLetterGrades,
  gradingSystem
}) => {
  if (!isVisible) {
    return (
      <td className="px-6 py-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
            <Clock className="h-3 w-3" />
            Restringido
          </div>
        </div>
      </td>
    )
  }

  if (grade === null) {
    return (
      <td className="px-6 py-4">
        <div className="text-center text-gray-400">-</div>
      </td>
    )
  }

  return (
    <td className="px-6 py-4">
      <div className="space-y-2">
        {/* Main Grade */}
        <div className="text-center">
          {showLetterGrades ? (
            <div>
              <span className={`text-lg font-bold ${getLetterGradeColor(convertNumericGradeToLetter(grade))}`}>
                {convertNumericGradeToLetter(grade)}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {getLetterGradeDescription(convertNumericGradeToLetter(grade))}
              </div>
              <div className="text-xs text-gray-400">
                (Numérico: {typeof grade === 'number' ? grade.toFixed(2) : grade})
              </div>
            </div>
          ) : (
            <span className={`text-lg font-bold ${getGradeColor(grade, gradingSystem)}`}>
              {typeof grade === 'number' ? grade.toFixed(2) : grade}
            </span>
          )}
        </div>

        {/* Detailed Notes */}
        {notas && notas.length > 0 && (
          <div className="space-y-1 border-t pt-2">
            {notas.map((nota, idx) => (
              <div key={idx} className="text-xs text-left">
                <div className="flex items-start gap-1">
                  <span className="font-medium text-gray-700">{nota.description}:</span>
                  {showLetterGrades ? (
                    <span className={getLetterGradeColor(convertNumericGradeToLetter(nota.valor))}>
                      {convertNumericGradeToLetter(nota.valor)} ({typeof nota.valor === 'number' ? nota.valor.toFixed(2) : nota.valor})
                    </span>
                  ) : (
                    <span className={getGradeColor(nota.valor, gradingSystem)}>
                      {typeof nota.valor === 'number' ? nota.valor.toFixed(2) : nota.valor}
                    </span>
                  )}
                </div>
                {nota.comentario && (
                  <div className="flex items-start gap-1 mt-0.5 text-gray-600 italic">
                    <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{nota.comentario}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </td>
  )
}

export default BimesterGradeCell
