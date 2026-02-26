import React from 'react'
import { CheckCircle, X } from 'lucide-react'
import { getGradeColor, getPassFailColor } from '@/utils/reports'

/**
 * Banner de estado final (APROBADO/DESAPROBADO)
 */
const FinalStatusBanner = ({ isApproved, finalStatus, overallGrade, nextGrade }) => {
  return (
    <div className="text-center">
      <div className={`inline-flex items-center px-8 py-4 rounded-lg text-2xl font-bold border-2 ${getPassFailColor(isApproved)}`}>
        {isApproved ? (
          <CheckCircle className="w-8 h-8 mr-3" />
        ) : (
          <X className="w-8 h-8 mr-3" />
        )}
        {finalStatus}
      </div>
      <div className="mt-4">
        <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${getGradeColor(overallGrade)}`}>
          Promedio Final: {overallGrade}
        </div>
      </div>
      <div className="mt-3 text-lg text-gray-700">
        <strong>Próximo grado:</strong> {nextGrade}
      </div>
    </div>
  )
}

export default FinalStatusBanner
