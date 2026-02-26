import React from 'react'
import { motion } from 'framer-motion'
import { FileText, GraduationCap, Activity, Award } from 'lucide-react'

/**
 * Tarjetas de resumen de estadísticas de reportes
 */
const ReportsSummaryCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-blue-500 rounded-lg p-3">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Reportes Disponibles</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalReports}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-green-500 rounded-lg p-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Promedio General</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.averageGrade}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-purple-500 rounded-lg p-3">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Períodos</p>
            <p className="text-2xl font-semibold text-purple-600">
              {stats.totalPeriods}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center">
          <div className="bg-yellow-500 rounded-lg p-3">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Estado Final</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {stats.finalStatus}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ReportsSummaryCards
