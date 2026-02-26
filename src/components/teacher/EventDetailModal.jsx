import React from 'react'
import { Plus } from 'lucide-react'
import { EVENT_TYPE_NAMES } from '../../config/scheduleConstants'

/**
 * Modal de detalle de evento
 */
const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {event.subject}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Plus size={24} className="transform rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Horario</label>
              <p className="text-gray-900">{event.startTime} - {event.endTime}</p>
            </div>
            {event.room && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Aula</label>
                <p className="text-gray-900">{event.room}</p>
              </div>
            )}
          </div>

          {event.students && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Estudiantes</label>
              <p className="text-gray-900">{event.students} estudiantes</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600">Tipo de Actividad</label>
            <p className="text-gray-900">{EVENT_TYPE_NAMES[event.type] || 'Actividad'}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cerrar
          </button>
          <button className="btn btn-primary">
            Editar Evento
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventDetailModal
