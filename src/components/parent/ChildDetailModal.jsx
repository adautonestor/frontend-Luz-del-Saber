import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X, User, Calendar, GraduationCap, Activity,
  Eye, CreditCard, AlertTriangle, MapPin, RefreshCw, Loader2
} from 'lucide-react'
import { getStatusColor, getStatusIcon, getGradeColor, calculateAge, getStatusText } from '../../utils/childrenUtils.jsx'
import { convertAverageValueToLetter } from '../../utils/gradeConversion.jsx'
import { studentsService } from '../../services/studentsService'

/**
 * Modal con información detallada de un hijo
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {Object} child - Datos del hijo seleccionado
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Function} onViewMoreDetails - Callback para navegar a más detalles
 * @param {Function} onChildUpdated - Callback cuando los datos del hijo se actualizan
 */
const ChildDetailModal = ({ isOpen, child, onClose, onViewMoreDetails, onChildUpdated }) => {
  const [localChild, setLocalChild] = useState(child)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  // Actualizar datos locales cuando cambia el child prop
  useEffect(() => {
    if (child) {
      setLocalChild(child)
    }
  }, [child])

  // Función para recargar datos frescos del hijo
  const handleRefresh = useCallback(async () => {
    if (!child?.id) return

    setIsRefreshing(true)
    try {
      // Obtener datos actualizados del estudiante
      const freshData = await studentsService.getById(child.id)
      if (freshData) {
        // Mapear datos al formato esperado
        const updatedChild = {
          ...localChild,
          ...freshData,
          currentGrade: parseFloat(freshData.promedio_general || freshData.currentGrade) || localChild.currentGrade,
          attendance: parseFloat(freshData.porcentaje_asistencia || freshData.attendance) || localChild.attendance,
          pendingPayments: parseInt(freshData.cantidad_pagos_pendientes || freshData.pendingPayments) || 0,
          pendingAmount: parseFloat(freshData.monto_pendiente || freshData.pendingAmount) || 0,
          teacher: freshData.tutor_nombre || freshData.teacher || localChild.teacher,
          room: freshData.aula || freshData.room || localChild.room
        }
        setLocalChild(updatedChild)
        setLastRefresh(new Date())

        // Notificar al componente padre si hay callback
        if (onChildUpdated) {
          onChildUpdated(updatedChild)
        }
      }
    } catch (error) {
      console.error('Error actualizando datos del hijo:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [child?.id, localChild, onChildUpdated])

  if (!isOpen || !child) return null

  // Usar datos locales actualizados
  const displayChild = localChild || child

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayChild.name}</h2>
                <p className="text-gray-600">
                  {displayChild.code} • {calculateAge(displayChild.birthDate)} años
                </p>
                <p className="text-gray-500">
                  {displayChild.grade} {displayChild.section} - {displayChild.level}
                </p>
                <p className="text-blue-600 font-medium flex items-center mt-1">
                  <Calendar className="mr-1" size={16} />
                  Año Lectivo {displayChild.academicYear}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(displayChild.status)}`}>
                  {getStatusIcon(displayChild.status)}
                  <span className="ml-1 capitalize">{getStatusText(displayChild.status)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Actualizar datos"
              >
                {isRefreshing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <RefreshCw size={20} />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-2">
              Actualizado: {lastRefresh.toLocaleTimeString('es-PE')}
            </p>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna Izquierda - Rendimiento Académico */}
            <div className="space-y-6">
              {/* Rendimiento Académico */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="mr-2" size={20} />
                  Rendimiento Académico
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Promedio General</p>
                    <p className={`text-3xl font-bold ${displayChild.currentGrade > 0 ? getGradeColor(displayChild.currentGrade) : 'text-gray-400'}`}>
                      {displayChild.currentGrade > 0 ? convertAverageValueToLetter(displayChild.currentGrade) : '--'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Asistencia</p>
                    <p className={`text-3xl font-bold ${displayChild.attendance > 0 || displayChild.totalAttendanceDays > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {displayChild.attendance > 0 || displayChild.totalAttendanceDays > 0 ? `${displayChild.attendance || 0}%` : '--'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Notas por Materia</h4>
                  {displayChild.subjects && Object.keys(displayChild.subjects).length > 0 ? (
                    Object.entries(displayChild.subjects).map(([subject, data]) => (
                      <div key={subject} className="flex justify-between items-center p-2 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium">
                            {subject}
                          </span>
                          {data.quarter && (
                            <p className="text-xs text-gray-500">Bimestre {data.quarter}</p>
                          )}
                        </div>
                        <span className={`font-semibold ${data.grade > 0 ? getGradeColor(data.grade) : 'text-gray-400'}`}>
                          {data.grade > 0 ? convertAverageValueToLetter(data.grade) : '--'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No hay notas registradas aún.</p>
                  )}
                </div>
              </div>

              {/* Comportamiento */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Activity className="mr-2" size={16} />
                  Comportamiento
                </h4>
                <div className="space-y-2">
                  {displayChild.behavior && (displayChild.behavior.discipline || displayChild.behavior.parentRating || displayChild.behavior.comments) ? (
                    <>
                      {displayChild.behavior.discipline && (
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Disciplina:</span>
                          <span className="text-sm font-medium">{displayChild.behavior.discipline}</span>
                        </div>
                      )}
                      {displayChild.behavior.parentRating && (
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Evaluación del padre:</span>
                          <span className="text-sm font-medium">{displayChild.behavior.parentRating}</span>
                        </div>
                      )}
                      {displayChild.behavior.comments && (
                        <div className="p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Comentarios:</span>
                          <p className="text-sm mt-1">{displayChild.behavior.comments}</p>
                        </div>
                      )}
                      {displayChild.behavior.quarter && (
                        <div className="text-xs text-gray-400 mt-2">
                          Bimestre: {displayChild.behavior.quarter}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay información de comportamiento registrada.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Información Adicional */}
            <div className="space-y-6">
              {/* Información del Tutor y Aula */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Información del Tutor
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium text-gray-900">{displayChild.teacher || 'Sin asignar'}</p>
                  {/* Solo mostrar aula si existe y no es "Sin asignar" */}
                  {displayChild.room && displayChild.room !== 'Sin asignar' && displayChild.room !== 'Aula no asignada' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {displayChild.room}
                    </div>
                  )}
                  <p className="text-sm text-gray-600">Tutor de {displayChild.grade} {displayChild.section}</p>
                </div>
              </div>

              {/* Estado de Pagos */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CreditCard className="mr-2" size={16} />
                  Estado de Pagos
                </h4>
                <div className="space-y-2">
                  {displayChild.pendingPayments > 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                        <div>
                          <p className="font-medium text-yellow-800">
                            {displayChild.pendingPayments} pago(s) pendiente(s)
                          </p>
                          {displayChild.pendingAmount > 0 && (
                            <p className="text-sm text-yellow-700">
                              Monto: S/ {displayChild.pendingAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-medium">✓ Pagos al día</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Última Actividad */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Última Actividad
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Última asistencia registrada:
                  </p>
                  <p className="font-medium text-gray-900">
                    {displayChild.lastActivity
                      ? new Date(displayChild.lastActivity).toLocaleDateString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Sin registro'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onViewMoreDetails(displayChild)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Eye className="mr-2" size={16} />
              Ver Más Detalles
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChildDetailModal
