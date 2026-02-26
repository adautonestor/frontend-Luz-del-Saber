import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import CommunicationItem from './CommunicationItem'

/**
 * Lista de comunicaciones con animaciones
 * @param {Array} communications - Lista de comunicados
 * @param {Function} onViewMessage - Callback al ver un mensaje
 * @param {Function} isOwnCommunication - Función para verificar si un comunicado es propio
 */
const CommunicationsList = ({ communications, onViewMessage, isOwnCommunication }) => {
  if (communications.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay comunicaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva comunicación
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {communications.map((comm, index) => (
        <CommunicationItem
          key={comm.id}
          communication={comm}
          index={index}
          onClick={() => onViewMessage(comm)}
          isOwn={isOwnCommunication ? isOwnCommunication(comm) : false}
        />
      ))}
    </div>
  )
}

export default CommunicationsList
