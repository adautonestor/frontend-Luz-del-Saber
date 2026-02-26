import React from 'react'
import { Calculator, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Tarjetas de estadísticas del curso
 * Muestra promedio, aprobados, desaprobados, mejor y peor nota
 */
const GradesStatsCards = ({ stats, getGradeColor }) => {
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Promedio General</p>
            <p className={`text-2xl font-semibold ${getGradeColor(stats.promedio)}`}>
              {stats.promedio}
            </p>
          </div>
          <Calculator className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Aprobados</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.aprobados}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Desaprobados</p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.desaprobados}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-red-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Mejor Nota</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.mejorNota}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Nota Más Baja</p>
            <p className="text-2xl font-semibold text-orange-600">
              {stats.peorNota}
            </p>
          </div>
          <AlertCircle className="h-8 w-8 text-orange-400" />
        </div>
      </div>
    </div>
  )
}

export default GradesStatsCards
