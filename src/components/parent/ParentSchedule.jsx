import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, BookOpen, User, MapPin, AlertCircle,
  Download, Printer, ChevronDown, ChevronUp, Info
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useScheduleStore } from '../../stores/scheduleStore.jsx'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useCoursesStore } from '../../stores/coursesStore'

const ParentSchedule = () => {
  const { user } = useAuthStore()
  const { schedules, initialize: initializeSchedules, getGradeSchedules, loading: schedulesLoading } = useScheduleStore()
  const { students, initialize: initializeEnrollment } = useEnrollmentStore()
  const { courses: allCourses, initialize: initializeCourses } = useCoursesStore()
  const { grades, sections, initialize: initializeAcademic } = useAcademicStore()

  const [selectedChild, setSelectedChild] = useState(null)
  const [expandedDay, setExpandedDay] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get children of current parent
  const myChildren = students.filter(student =>
    student.parentIds && student.parentIds.includes(user?.parentId)
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          initializeSchedules(),
          initializeEnrollment(),
          initializeCourses(),
          initializeAcademic()
        ])

        // Auto-select first child
        if (myChildren.length > 0 && !selectedChild) {
          setSelectedChild(myChildren[0])
        }
      } catch (error) {
        console.error('Error loading schedule data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Update selected child when children list changes
  useEffect(() => {
    if (myChildren.length > 0 && !selectedChild) {
      setSelectedChild(myChildren[0])
    }
  }, [myChildren.length])

  // Get schedule for selected child
  const getChildSchedule = () => {
    if (!selectedChild) return []

    const childSchedules = getGradeSchedules(selectedChild.grade_id, selectedChild.section_id)

    // Enrich with course and teacher data
    return childSchedules.map(schedule => {
      const course = allCourses.find(c => c.id === schedule.course_id)
      const teacher = course?.profesorNombre || 'Sin asignar'

      return {
        ...schedule,
        cursoNombre: course?.name || 'Curso no encontrado',
        profesorNombre: teacher
      }
    })
  }

  // Organize schedule by days
  const getWeeklySchedule = () => {
    const childSchedules = getChildSchedule()
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

    return weekDays.map((day, dayIndex) => {
      const daySchedules = childSchedules
        .filter(schedule => schedule.dia === dayIndex)
        .sort((a, b) => {
          const timeA = a.horaInicio.split(':').map(Number)
          const timeB = b.horaInicio.split(':').map(Number)
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
        })

      return {
        day,
        dayIndex,
        schedules: daySchedules
      }
    })
  }

  const weeklySchedule = getWeeklySchedule()

  // Get child's grade and section info
  const getChildInfo = () => {
    if (!selectedChild) return null

    const grade = grades.find(g => g.id === selectedChild.grade_id)
    const section = sections.find(s => s.id === selectedChild.section_id)

    return {
      gradoNombre: grade?.name || 'N/A',
      seccionNombre: section?.name || 'N/A',
      nivel: grade?.nivel || 'N/A'
    }
  }

  const childInfo = getChildInfo()

  // Print schedule
  const handlePrint = () => {
    window.print()
  }

  // Download as PDF (simplified - just triggers print)
  const handleDownload = () => {
    window.print()
  }

  if (loading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    )
  }

  if (myChildren.length === 0) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay estudiantes registrados</h3>
          <p className="text-gray-600">No se encontraron estudiantes asociados a su cuenta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
        <p className="mt-2 text-gray-600">Consulta los horarios de clases de tus hijos</p>
      </div>

      {/* Child Selector */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Estudiante
            </label>
            <select
              value={selectedChild?.id || ''}
              onChange={(e) => {
                const child = myChildren.find(c => c.id === e.target.value)
                setSelectedChild(child)
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {myChildren.map(child => (
                <option key={child.id} value={child.id}>
                  {child.first_names} {child.last_names}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          </div>
        </div>

        {/* Student Info */}
        {selectedChild && childInfo && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">Estudiante</p>
              <p className="font-semibold text-gray-900">
                {selectedChild.first_names} {selectedChild.last_names}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Grado y Sección</p>
              <p className="font-semibold text-gray-900">
                {childInfo.gradoNombre} - {childInfo.seccionNombre}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Nivel</p>
              <p className="font-semibold text-gray-900 capitalize">
                {childInfo.nivel}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 gap-4">
        {weeklySchedule.map((daySchedule) => (
          <motion.div
            key={daySchedule.dayIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: daySchedule.dayIndex * 0.1 }}
            className="card"
          >
            {/* Day Header */}
            <button
              onClick={() => setExpandedDay(expandedDay === daySchedule.dayIndex ? null : daySchedule.dayIndex)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{daySchedule.day}</h3>
                  <p className="text-sm text-gray-600">
                    {daySchedule.schedules.length} {daySchedule.schedules.length === 1 ? 'clase' : 'clases'}
                  </p>
                </div>
              </div>
              {expandedDay === daySchedule.dayIndex ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Day Schedule Details */}
            {expandedDay === daySchedule.dayIndex && (
              <div className="border-t border-gray-200">
                {daySchedule.schedules.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay clases programadas para este día</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-3">
                    {daySchedule.schedules.map((schedule, index) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Time */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Horario</p>
                              <p className="font-bold text-gray-900">
                                {schedule.horaInicio} - {schedule.horaFin}
                              </p>
                            </div>
                          </div>

                          {/* Course */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Curso</p>
                              <p className="font-semibold text-gray-900">{schedule.cursoNombre}</p>
                            </div>
                          </div>

                          {/* Teacher */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Profesor(a)</p>
                              <p className="font-medium text-gray-900">{schedule.profesorNombre}</p>
                            </div>
                          </div>

                          {/* Classroom */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Aula</p>
                              <p className="font-medium text-gray-900">{schedule.aula || 'No asignada'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Observations */}
                        {schedule.observations && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Observaciones:</p>
                            <p className="text-sm text-gray-700">{schedule.observations}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="card p-6 bg-gray-50 print:hidden">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Información</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• El horario se actualiza automáticamente según las programaciones del colegio</p>
          <p>• Puede descargar o imprimir el horario para tenerlo siempre a mano</p>
          <p>• Los cambios en el horario serán notificados oportunamente</p>
          <p>• Para consultas sobre cambios de horario, contacte con la secretaría del colegio</p>
        </div>
      </div>
    </div>
  )
}

export default ParentSchedule
