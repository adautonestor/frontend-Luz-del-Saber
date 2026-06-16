import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Users, MapPin, Clock, CheckCircle, XCircle, Info,
  AlertCircle, FileText
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { getMeetingsForParent, getAttendanceSummaryForParent } from '../../services/mock/schemas/parentMeetings'
import parentMeetingsService from '../../services/parentMeetingsService'
import meetingAttendancesService from '../../services/meetingAttendancesService'
import structureService from '../../services/academic/structureService'
import { parseDateOnly } from '../../utils/dateUtils'

const ParentMeetings = () => {
  const { user } = useAuthStore()
  const [meetings, setMeetings] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMeetings()
  }, [user, selectedYear])

  const loadMeetings = async () => {
    if (!user?.parentId) return

    setLoading(true)
    try {
      const allMeetings = await parentMeetingsService.getAll() || []
      const allAttendances = await meetingAttendancesService.getAll() || []

      // Get meetings for this parent
      const parentMeetings = getMeetingsForParent(
        allMeetings,
        allAttendances,
        user.parentId,
        selectedYear
      )

      // Sort by date (most recent first)
      const sortedMeetings = parentMeetings.sort((a, b) => {
        return (parseDateOnly(b.fecha)?.getTime() || 0) - (parseDateOnly(a.fecha)?.getTime() || 0)
      })

      setMeetings(sortedMeetings)

      // Get attendance summary
      const summary = getAttendanceSummaryForParent(
        allMeetings,
        allAttendances,
        user.parentId,
        selectedYear
      )
      setAttendanceSummary(summary)
    } catch (error) {
      console.error('Error loading meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMeetingStatus = (meeting) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const meetingDate = parseDateOnly(meeting.fecha)

    if (meeting.state === 'cancelada') {
      return {
        label: 'Cancelada',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      }
    }

    if (meeting.state === 'realizada') {
      return {
        label: meeting.asistio ? 'Asistió' : 'No Asistió',
        color: meeting.asistio ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
        icon: meeting.asistio ? CheckCircle : XCircle
      }
    }

    if (meetingDate && meetingDate.getTime() < today.getTime()) {
      return {
        label: 'Pendiente de registro',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle
      }
    }

    return {
      label: 'Próxima',
      color: 'bg-blue-100 text-blue-800',
      icon: Calendar
    }
  }

  const formatDate = async (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAlcanceText = async (meeting) => {
    if (meeting.alcance === 'todos') {
      return 'Todos los padres de familia'
    } else if (meeting.alcance === 'nivel') {
      return `Nivel: ${meeting.level_id}`
    } else if (meeting.alcance === 'grado') {
      const grades = await structureService.getAllGrades() || []
      const grade = grades.find(g => g.id === meeting.grade_id)
      const sections = await structureService.getAllSections() || []
      const section = meeting.section_id ? sections.find(s => s.id === meeting.section_id) : null
      return `${grade?.name || 'N/A'}${section ? ` - Sección ${section.name}` : ''}`
    }
    return 'No especificado'
  }

  // Separate meetings into upcoming and past
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingMeetings = meetings.filter(m => {
    const meetingDate = parseDateOnly(m.fecha)
    return meetingDate && meetingDate.getTime() >= today.getTime() && m.state !== 'cancelada' && m.state !== 'realizada'
  })

  const pastMeetings = meetings.filter(m => {
    const meetingDate = parseDateOnly(m.fecha)
    return (meetingDate && meetingDate.getTime() < today.getTime()) || m.state === 'realizada' || m.state === 'cancelada'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reuniones de Padres</h1>
        <p className="mt-2 text-gray-600">
          Consulta las reuniones convocadas y tu historial de asistencia
        </p>
      </div>

      {/* Year Selector & Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año Escolar
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input max-w-xs"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        {attendanceSummary && (
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Asistencia del Año</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attendanceSummary.formato}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {attendanceSummary.asistidas} de {attendanceSummary.totalConvocadas} reuniones
                </p>
              </div>
              <div className="relative">
                <Users className="h-12 w-12 text-gray-300" />
                {attendanceSummary.totalConvocadas > 0 && (
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    (attendanceSummary.asistidas / attendanceSummary.totalConvocadas) >= 0.8
                      ? 'bg-green-500 text-white'
                      : (attendanceSummary.asistidas / attendanceSummary.totalConvocadas) >= 0.5
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {Math.round((attendanceSummary.asistidas / attendanceSummary.totalConvocadas) * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reuniones...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Próximas Reuniones
              </h2>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting, index) => {
                  const status = getMeetingStatus(meeting)
                  const StatusIcon = status.icon

                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card overflow-hidden border-l-4 border-blue-500"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {meeting.titulo}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1`}>
                                <StatusIcon size={14} />
                                {status.label}
                              </span>
                            </div>

                            {meeting.description && (
                              <p className="text-sm text-gray-600 mb-4">
                                {meeting.description}
                              </p>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{formatDate(meeting.fecha)}</span>
                              </div>

                              {meeting.hora && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{meeting.hora}</span>
                                </div>
                              )}

                              {meeting.lugar && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{meeting.lugar}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{getAlcanceText(meeting)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              Por favor, confirme su asistencia a esta reunión. Su participación es importante para el seguimiento académico de su(s) hijo(s).
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Meetings */}
          {pastMeetings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gray-600" />
                Historial de Reuniones
              </h2>
              <div className="space-y-4">
                {pastMeetings.map((meeting, index) => {
                  const status = getMeetingStatus(meeting)
                  const StatusIcon = status.icon

                  return (
                    <motion.div
                      key={meeting.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`card overflow-hidden border-l-4 ${
                        meeting.asistio ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {meeting.titulo}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} flex items-center gap-1`}>
                                <StatusIcon size={14} />
                                {status.label}
                              </span>
                            </div>

                            {meeting.description && (
                              <p className="text-sm text-gray-600 mb-4">
                                {meeting.description}
                              </p>
                            )}

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{formatDate(meeting.fecha)}</span>
                              </div>

                              {meeting.hora && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{meeting.hora}</span>
                                </div>
                              )}

                              {meeting.lugar && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{meeting.lugar}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{getAlcanceText(meeting)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* No meetings found */}
          {!loading && meetings.length === 0 && (
            <div className="card p-12 text-center">
              <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reuniones convocadas
              </h3>
              <p className="text-gray-600">
                No se encontraron reuniones para el año escolar {selectedYear}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ParentMeetings
