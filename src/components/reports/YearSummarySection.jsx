import React from 'react'

/**
 * Sección de resumen del año escolar
 */
const YearSummarySection = ({ yearSummary }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Año Escolar</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{yearSummary.totalDays}</div>
          <div className="text-sm text-gray-600">Días Totales</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{yearSummary.presentDays}</div>
          <div className="text-sm text-gray-600">Presentes</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{yearSummary.absentDays}</div>
          <div className="text-sm text-gray-600">Ausentes</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{yearSummary.percentage}%</div>
          <div className="text-sm text-gray-600">Asistencia</div>
        </div>
      </div>
    </div>
  )
}

export default YearSummarySection
