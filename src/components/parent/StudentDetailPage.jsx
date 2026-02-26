import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, User, Calendar, GraduationCap, MapPin,
  Clock, CreditCard, Star, CheckCircle, AlertTriangle,
  Heart, Users
} from 'lucide-react'
import { convertAverageValueToLetter } from '../../utils/gradeConversion.jsx'

const StudentDetailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { child, academicYear } = location.state || {}

  const [activeTab, setActiveTab] = useState('academic')

  // Redirigir si no hay datos del estudiante
  if (!child) {
    navigate('/padre/hijos')
    return null
  }

  // Pestañas disponibles (solo las que tienen datos reales)
  const tabs = [
    { id: 'academic', name: 'Rendimiento Académico', icon: GraduationCap },
    { id: 'attendance', name: 'Asistencia', icon: Clock },
    { id: 'behavior', name: 'Comportamiento', icon: Heart },
    { id: 'schedule', name: 'Horario', icon: Calendar },
    { id: 'payments', name: 'Pagos', icon: CreditCard }
  ]

  // Diccionario para traducir días del horario
  const dayTranslations = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo',
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'miércoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'sábado': 'Sábado',
    'domingo': 'Domingo'
  }

  // Función para traducir día
  const translateDay = (day) => {
    if (!day) return 'Sin día'
    const lowerDay = day.toLowerCase()
    return dayTranslations[lowerDay] || day
  }

  const getGradeColor = (grade) => {
    if (grade >= 17) return 'text-green-600'
    if (grade >= 14) return 'text-blue-600'
    if (grade >= 11) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'attention': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <Star className="w-4 h-4" />
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'attention': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen Académico</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Promedio General</span>
                    <span className={`font-bold text-2xl ${getGradeColor(child.currentGrade)}`}>
                      {child.currentGrade}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Asistencia</span>
                    <span className="font-semibold text-blue-600">{child.attendance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado</span>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(child.status)}`}>
                      {getStatusIcon(child.status)}
                      <span className="ml-1 capitalize">
                        {child.status === 'excellent' ? 'Excelente' : child.status === 'good' ? 'Bueno' : 'Atención'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Información General</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Código:</span>
                    <span className="ml-2 font-medium">{child.code}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Edad:</span>
                    <span className="ml-2 font-medium">{calculateAge(child.birthDate)} años</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Grado:</span>
                    <span className="ml-2 font-medium">{child.grade} {child.section}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Profesor:</span>
                    <span className="ml-2 font-medium">{child.teacher}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Aula:</span>
                    <span className="ml-2 font-medium">{child.room}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Notas por Materia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {child.subjects && Object.keys(child.subjects).length > 0 ? (
                  Object.entries(child.subjects).map(([subject, data]) => (
                    <div key={subject} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium capitalize">
                          {subject.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <p className="text-sm text-gray-500">{data.teacher}</p>
                      </div>
                      <span className={`font-bold text-xl ${getGradeColor(data.grade)}`}>
                        {data.grade}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No hay notas registradas aún.</p>
                )}
              </div>
            </div>
          </div>
        )

      case 'attendance':
        // Usar datos reales del backend si están disponibles
        const totalDias = child.total_dias || child.totalDias || 0
        const diasPresente = child.dias_presente || child.diasPresente || 0
        const diasAusente = totalDias - diasPresente
        const porcentajeAsistencia = child.attendance || 0

        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen de Asistencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{porcentajeAsistencia}%</div>
                  <div className="text-sm text-gray-600">Asistencia General</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{diasPresente}</div>
                  <div className="text-sm text-gray-600">Días Asistidos</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{diasAusente}</div>
                  <div className="text-sm text-gray-600">Días Ausentes</div>
                </div>
              </div>
              {totalDias > 0 && (
                <div className="mt-2 text-center text-sm text-gray-500">
                  Total de días registrados: {totalDias}
                </div>
              )}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${porcentajeAsistencia}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'behavior':
        // Validar que behavior tenga datos reales (no null/undefined)
        const behaviorData = child.behavior || {}
        const hasBehaviorData = behaviorData.discipline || behaviorData.parentRating || behaviorData.comments

        // Mapeo de nombres de campos a español
        const behaviorLabels = {
          'discipline': 'Disciplina',
          'parentRating': 'Evaluación del Tutor',
          'comments': 'Comentarios',
          'quarter': 'Bimestre'
        }

        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Evaluación de Comportamiento</h3>
              {hasBehaviorData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(behaviorData).map(([aspect, value]) => {
                    // Solo mostrar si el valor existe y no es null
                    if (value === null || value === undefined || value === '') return null

                    return (
                      <div key={aspect} className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-600 mb-1">
                          {behaviorLabels[aspect] || aspect}:
                        </div>
                        <div className="text-blue-600 font-semibold">{value}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay información de comportamiento registrada para este período.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'schedule':
        // Procesar horario - puede venir como array de objetos o como objeto agrupado por día
        const scheduleData = child.schedule || child.horario || []
        let groupedSchedule = {}

        // Si es un array, agrupar por día
        if (Array.isArray(scheduleData) && scheduleData.length > 0) {
          scheduleData.forEach(item => {
            const day = item.dia || item.day || 'sin_dia'
            if (!groupedSchedule[day]) {
              groupedSchedule[day] = []
            }
            groupedSchedule[day].push({
              subject: item.curso || item.subject || 'Sin curso',
              time: item.hora_inicio && item.hora_fin
                ? `${item.hora_inicio} - ${item.hora_fin}`
                : item.time || '',
              classroom: item.aula || item.classroom || ''
            })
          })
        } else if (typeof scheduleData === 'object' && !Array.isArray(scheduleData)) {
          // Ya viene agrupado por día
          groupedSchedule = scheduleData
        }

        const hasSchedule = Object.keys(groupedSchedule).length > 0

        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Horario Semanal</h3>
              <div className="space-y-4">
                {hasSchedule ? (
                  Object.entries(groupedSchedule).map(([day, classes]) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 text-blue-600">
                        {translateDay(day)}
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(classes) && classes.map((classInfo, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{classInfo.subject}</span>
                              {classInfo.classroom && (
                                <span className="text-sm text-gray-500 ml-2">- Aula: {classInfo.classroom}</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-blue-600">{classInfo.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No hay horario disponible para este período.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Estado de Pagos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                    <div>
                      <div className="font-semibold text-blue-900">Pagos Pendientes</div>
                      <div className="text-2xl font-bold text-blue-600">{child.pendingPayments || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <div>
                      <div className="font-semibold text-green-900">Pagos al Día</div>
                      <div className="text-2xl font-bold text-green-600">{12 - (child.pendingPayments || 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
              {child.pendingPayments > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      Tiene {child.pendingPayments} pago(s) pendiente(s)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return <div>Contenido no disponible</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/padre/hijos')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
                <p className="text-gray-600">
                  {child.code} • {child.grade} {child.section} • Año Lectivo {academicYear}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(child.status)}`}>
                {getStatusIcon(child.status)}
                <span className="ml-1 capitalize">
                  {child.status === 'excellent' ? 'Excelente' : child.status === 'good' ? 'Bueno' : 'Atención'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDetailPage