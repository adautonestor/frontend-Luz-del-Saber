import React from 'react'
import { CheckCircle } from 'lucide-react'
import { TOTAL_STEPS } from '../../config/enrollmentConstants'

/**
 * Componente de indicador de progreso por pasos
 * Muestra visualmente en qué paso del proceso de matrícula se encuentra el usuario
 * @param {number} currentStep - Paso actual (1, 2, o 3)
 */
const EnrollmentProgressSteps = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[...Array(TOTAL_STEPS)].map((_, index) => {
          const step = index + 1
          return (
            <div key={step} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${currentStep >= step
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                  }
                `}
              >
                {currentStep > step ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              {step < TOTAL_STEPS && (
                <div
                  className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EnrollmentProgressSteps
