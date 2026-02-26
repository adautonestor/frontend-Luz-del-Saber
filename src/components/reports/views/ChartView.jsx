import React from 'react'

/**
 * Vista de gráfico de barras para reportes
 * Muestra datos en formato de tarjetas con barras de progreso
 */
const ChartView = ({ reportData }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportData.data.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">{item.month}</div>
            <div className="text-2xl font-semibold text-gray-900">
              S/. {item.amount.toLocaleString('es-PE')}
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${(item.amount / Math.max(...reportData.data.map(d => d.amount))) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartView
