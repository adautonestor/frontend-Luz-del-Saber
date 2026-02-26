import React from 'react'
import { Plus } from 'lucide-react'

/**
 * Header de la página de comunicaciones
 */
const CommunicationsHeader = ({ onNewCommunication }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comunicaciones</h1>
        <p className="mt-2 text-gray-600">Gestiona las comunicaciones con padres y estudiantes</p>
      </div>
      <button
        onClick={onNewCommunication}
        className="btn btn-primary flex items-center gap-2"
      >
        <Plus size={20} />
        Nueva Comunicación
      </button>
    </div>
  )
}

export default CommunicationsHeader
