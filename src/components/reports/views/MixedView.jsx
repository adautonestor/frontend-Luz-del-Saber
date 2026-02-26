import React from 'react'

/**
 * Vista mixta para reportes de matrícula
 * Muestra estadísticas de matriculados vs capacidad por nivel
 */
const MixedView = ({ reportData }) => {
  return (
    <div className="space-y-4">
      {reportData.data.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-900">{item.level}</h4>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              parseFloat(item.percentage) >= 80 ? 'bg-red-100 text-red-800' :
              parseFloat(item.percentage) >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {item.percentage}% ocupado
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Matriculados:</span>
              <span className="ml-2 font-semibold">{item.enrolled}</span>
            </div>
            <div>
              <span className="text-gray-500">Capacidad:</span>
              <span className="ml-2 font-semibold">{item.capacity}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  parseFloat(item.percentage) >= 80 ? 'bg-red-500' :
                  parseFloat(item.percentage) >= 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MixedView
