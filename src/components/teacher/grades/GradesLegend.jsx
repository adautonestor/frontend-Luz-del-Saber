import React from 'react'

/**
 * Leyenda de calificación y ayuda de navegación
 * Muestra la escala de notas y atajos de teclado
 */
const GradesLegend = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Ayuda de Navegación */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Navegación Rápida</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Tab</kbd>
            <span>Siguiente estudiante (abajo)</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Shift + Tab</kbd>
            <span>Estudiante anterior (arriba)</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">↓</kbd>
            <span>Siguiente estudiante en la misma competencia</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">↑</kbd>
            <span>Estudiante anterior en la misma competencia</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">→</kbd>
            <span>Siguiente competencia (derecha)</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">←</kbd>
            <span>Competencia anterior (izquierda)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GradesLegend
