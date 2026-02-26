import React from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

/**
 * Navegación de semanas con botón de agregar evento
 */
const WeekNavigation = ({ weekDates, onNavigateWeek }) => {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            Semana del {weekDates[0].toLocaleDateString('es-PE')} al {weekDates[6].toLocaleDateString('es-PE')}
          </h2>

          <button
            onClick={() => onNavigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={16} />
          Agregar Evento
        </button>
      </div>
    </div>
  )
}

export default WeekNavigation
