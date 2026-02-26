import React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import { convertAverageValueToLetter } from '../../utils/gradeConversion.jsx'

/**
 * Componente que muestra las tarjetas de estadísticas de los hijos
 * @param {Array} children - Array de hijos
 */
const ChildrenStatsCards = ({ children }) => {
  // Calcular promedio general numérico
  const averageGradeNum = children.length > 0
    ? children.reduce((sum, child) => sum + (parseFloat(child.currentGrade) || 0), 0) / children.length
    : 0
  // Convertir a letra
  const averageGrade = convertAverageValueToLetter(averageGradeNum)

  // Calcular asistencia promedio
  const averageAttendance = children.length > 0
    ? Math.round(children.reduce((sum, child) => sum + (parseFloat(child.attendance) || 0), 0) / children.length)
    : 0

  // Calcular total de pagos pendientes
  const totalPendingPayments = children.reduce((sum, child) => sum + (parseInt(child.pendingPayments) || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Hijos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-lg p-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Hijos</p>
            <p className="text-2xl font-semibold text-gray-900">{children.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Promedio General */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-green-500 rounded-lg p-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Promedio General</p>
            <p className="text-2xl font-semibold text-gray-900">{averageGrade}</p>
          </div>
        </div>
      </motion.div>

      {/* Asistencia Promedio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-purple-500 rounded-lg p-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Asistencia Prom.</p>
            <p className="text-2xl font-semibold text-gray-900">{averageAttendance}%</p>
          </div>
        </div>
      </motion.div>

      {/* Pagos Pendientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-yellow-500 rounded-lg p-3">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
            <p className="text-2xl font-semibold text-gray-900">{totalPendingPayments}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChildrenStatsCards
