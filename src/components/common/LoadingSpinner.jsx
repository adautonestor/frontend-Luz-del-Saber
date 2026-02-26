import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Componente reutilizable para mostrar estado de carga
 */
const LoadingSpinner = ({
  message = 'Cargando...',
  size = 'default', // 'small' | 'default' | 'large'
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {message && (
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  )
}

export default LoadingSpinner
