import React from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Sección de plan de reforzamiento
 */
const RemedialPlanSection = ({ passed, remedialPlan }) => {
  if (passed || !remedialPlan) return null

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Reforzamiento</h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium mb-3">
              Para la recuperación académica se requiere:
            </p>
            <ul className="space-y-2">
              {remedialPlan.map((item, index) => (
                <li key={index} className="flex items-start text-yellow-700">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemedialPlanSection
