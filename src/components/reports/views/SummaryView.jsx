import React from 'react'

/**
 * Vista de resumen general para reportes
 * Muestra métricas clave en formato de tarjetas
 */
const SummaryView = ({ reportData }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {reportData.metrics.map((metric, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {metric.value}
          </div>
          <div className="text-sm text-gray-600">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryView
