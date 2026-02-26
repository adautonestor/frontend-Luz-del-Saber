import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, UserCheck } from 'lucide-react'
import { getMeetingScopeText, getAttendanceCount } from '../../utils/parentMeetingsHelpers'
import { MEETING_STATUS_LABELS, MEETING_STATUS_COLORS } from '../../config/parentMeetingsConstants'

/**
 * Tabla de reuniones convocadas
 */
const MeetingsTable = ({ meetings, parents, grades, sections, onOpenAttendance, onCreateFirst }) => {
  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Reuniones Convocadas</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reunión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alcance
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asistencia
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetings.map((meeting) => (
              <motion.tr
                key={meeting.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{meeting.titulo}</div>
                    {meeting.description && (
                      <div className="text-sm text-gray-500">{meeting.description}</div>
                    )}
                    {meeting.lugar && (
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {meeting.lugar}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{meeting.fecha}</div>
                  {meeting.hora && (
                    <div className="text-sm text-gray-500">{meeting.hora}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {getMeetingScopeText(meeting, grades, sections)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${MEETING_STATUS_COLORS[meeting.state]}`}>
                    {MEETING_STATUS_LABELS[meeting.state]}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-gray-900">
                    {getAttendanceCount(meeting.id)} / {parents.length}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenAttendance(meeting)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserCheck size={16} />
                    Registrar Asistencia
                  </button>
                </td>
              </motion.tr>
            ))}

            {meetings.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No hay reuniones convocadas para este año</p>
                  <button
                    onClick={onCreateFirst}
                    className="mt-4 btn btn-primary"
                  >
                    Convocar Primera Reunión
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MeetingsTable
