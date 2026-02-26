import React from 'react'
import { Users, GraduationCap, UserPlus, Check } from 'lucide-react'

/**
 * Indicador visual de progreso en el proceso de matrícula
 * Muestra los 3 pasos: Buscar Estudiante, Matrícula Académica, Asignación de Padre
 */
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, title: 'Buscar Estudiante', icon: Users },
    { id: 2, title: 'Matrícula Académica', icon: GraduationCap },
    { id: 3, title: 'Asignación de Padre', icon: UserPlus }
  ]

  return (
    <div className="flex items-center justify-center py-4 bg-gray-50 border-b">
      {steps.map((step) => {
        const Icon = step.icon
        const isActive = step.id === currentStep
        const isCompleted = step.id < currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : isActive
                ? 'border-primary-500 text-primary-500 bg-white'
                : 'border-gray-300 text-gray-400 bg-white'
            }`}>
              {isCompleted ? (
                <Check size={16} />
              ) : (
                <Icon size={16} />
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              isActive ? 'text-primary-600' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
            {step.id < steps.length && (
              <div className={`w-12 h-0.5 mx-4 ${
                step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
