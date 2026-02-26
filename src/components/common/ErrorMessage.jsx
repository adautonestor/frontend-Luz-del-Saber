import React from 'react'
import { AlertCircle, RefreshCw, WifiOff, ServerCrash, FileQuestion } from 'lucide-react'

/**
 * Componente reutilizable para mostrar mensajes de error amigables
 * Detecta el tipo de error y muestra un mensaje apropiado
 */
const ErrorMessage = ({
  error,
  onRetry,
  className = '',
  variant = 'default' // 'default' | 'compact' | 'inline'
}) => {
  // Detectar tipo de error y mostrar mensaje apropiado
  const getErrorInfo = (error) => {
    const errorStr = typeof error === 'string' ? error.toLowerCase() : ''
    const errorMessage = error?.message?.toLowerCase() || errorStr

    // Error de conexión/red
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('internet')
    ) {
      return {
        icon: WifiOff,
        title: 'Sin conexión a internet',
        message: 'Verifica tu conexión a internet e intenta nuevamente.',
        color: 'yellow'
      }
    }

    // Error del servidor
    if (
      errorMessage.includes('500') ||
      errorMessage.includes('server') ||
      errorMessage.includes('internal')
    ) {
      return {
        icon: ServerCrash,
        title: 'Error del servidor',
        message: 'El servidor está experimentando problemas. Intenta de nuevo en unos minutos.',
        color: 'red'
      }
    }

    // No encontrado
    if (
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('no encontr')
    ) {
      return {
        icon: FileQuestion,
        title: 'No se encontraron datos',
        message: 'No se encontró la información solicitada.',
        color: 'yellow'
      }
    }

    // Error genérico
    return {
      icon: AlertCircle,
      title: 'Ocurrió un error',
      message: typeof error === 'string' ? error : 'Hubo un problema al cargar los datos. Por favor, intenta nuevamente.',
      color: 'red'
    }
  }

  const { icon: Icon, title, message, color } = getErrorInfo(error)

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    }
  }

  const colors = colorClasses[color]

  // Variante compacta (para usar en línea)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${colors.bg} ${colors.border} border ${className}`}>
        <Icon className={`h-5 w-5 ${colors.icon} flex-shrink-0`} />
        <span className={`text-sm ${colors.message}`}>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  // Variante inline (muy pequeña)
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${colors.message} ${className}`}>
        <Icon className="h-4 w-4" />
        {message}
      </span>
    )
  }

  // Variante default (tarjeta completa)
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-6 text-center ${className}`}>
      <Icon className={`h-12 w-12 ${colors.icon} mx-auto mb-3`} />
      <h3 className={`font-semibold ${colors.title} mb-2`}>{title}</h3>
      <p className={`${colors.message} mb-4`}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`inline-flex items-center gap-2 px-4 py-2 ${colors.button} text-white rounded-lg transition-colors`}
        >
          <RefreshCw size={16} />
          Intentar nuevamente
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
