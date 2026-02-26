import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Eye, MessageSquare } from 'lucide-react'
import { formatDate } from '../../utils/communicationsHelpers'

/**
 * Lista de comunicados agrupados por mes
 */
const CommunicationsList = ({ groupedCommunications, onOpenCommunication }) => {
  if (groupedCommunications.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay comunicados</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron comunicados que coincidan con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupedCommunications.map((monthGroup, monthIndex) => (
        <motion.div
          key={monthGroup.monthKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: monthIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Month Header */}
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              <Calendar className="w-5 h-5 inline mr-2" />
              <span className="font-semibold">{monthGroup.monthName}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500">
              {monthGroup.communications.length} comunicado{monthGroup.communications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Communications for this month */}
          <div className="bg-white rounded-lg border border-gray-200 ml-4">
            {monthGroup.communications.map((communication, index) => (
              <motion.div
                key={communication.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (monthIndex * 0.1) + (index * 0.05) }}
                className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-all cursor-pointer ${
                  index !== monthGroup.communications.length - 1 ? 'border-b border-gray-100' : ''
                } ${
                  communication.status === 'unread' ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => onOpenCommunication(communication)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {communication.status === 'unread' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}

                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {communication.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {formatDate(communication.sentDate)}
                  </span>

                  {communication.status === 'read' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default CommunicationsList
