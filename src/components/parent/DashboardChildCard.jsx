import React from 'react'
import { motion } from 'framer-motion'
import { getAverageColor } from '../../utils/parentDashboardHelpers'
import { convertAverageValueToLetter } from '../../utils/gradeConversion.jsx'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'

/**
 * Tarjeta de información de un hijo en el dashboard
 */
const DashboardChildCard = ({ child, index }) => {
  // Obtener el promedio del hijo (mapear diferentes campos posibles)
  const getChildAverage = () => {
    const promedio = parseFloat(child.promedio_general || child.currentGrade || child.average || 0)
    return promedio
  }

  // Obtener el nombre del hijo (mapear diferentes campos posibles)
  const getChildName = () => {
    if (child.name) return child.name
    const firstName = child.first_names || ''
    const lastName = child.last_names || ''
    return `${firstName} ${lastName}`.trim() || 'Sin nombre'
  }

  // Obtener el grado del hijo
  const getChildGrade = () => {
    return child.grade_name || child.gradoNombre || child.grade || child.grado || 'Sin grado'
  }

  // Obtener los pagos pendientes
  const getPendingPayments = () => {
    const pending = parseInt(child.cantidad_pagos_pendientes || child.pendingPayments || 0)
    return isNaN(pending) ? 0 : pending
  }

  // Obtener estado académico basado en promedio usando configuración dinámica del nivel
  const getAcademicStatus = () => {
    const promedio = getChildAverage()
    if (promedio <= 0) return 'regular'

    // Usar store SSOT para obtener color/estado basado en la configuración del nivel
    const store = getGradingScalesStore()
    const levelId = child.level_id || null
    const hexColor = store.getGradeColor(promedio, levelId)

    // Mapear color a estado académico
    const statusMap = {
      '#22c55e': 'excellent',  // Verde - Excelente
      '#3b82f6': 'good',       // Azul - Bueno
      '#eab308': 'regular',    // Amarillo - Regular
      '#ef4444': 'regular'     // Rojo - Regular (requiere atención)
    }

    return statusMap[hexColor] || 'regular'
  }

  // Obtener inicial del nombre para avatar
  const getInitials = () => {
    const name = getChildName()
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const promedio = getChildAverage()
  const pendingPayments = getPendingPayments()
  const status = child.status || getAcademicStatus()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-6"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
          {getInitials()}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{getChildName()}</h3>
          <p className="text-sm text-gray-600">{getChildGrade()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Promedio:</span>
          <span className={`text-sm font-semibold ${getAverageColor(promedio, child.level_id)}`}>
            {promedio > 0 ? convertAverageValueToLetter(promedio, child.level_id) : 'Sin notas'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado Académico:</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            status === 'excellent' ? 'bg-green-100 text-green-800' :
            status === 'good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'excellent' ? 'Excelente' :
             status === 'good' ? 'Bueno' : 'Regular'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Pagos Pendientes:</span>
          <span className={`text-sm font-semibold ${
            pendingPayments === 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {pendingPayments === 0 ? 'Al día' : `${pendingPayments} pendiente${pendingPayments > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default DashboardChildCard
