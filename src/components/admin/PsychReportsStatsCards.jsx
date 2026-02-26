/**
 * Tarjetas de estadísticas de informes psicológicos
 */

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const PsychReportsStatsCards = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {Object.entries(stats).map(([level, data]) => (
        <motion.div
          key={level}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {level}
            </h3>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total estudiantes:</span>
              <span className="font-semibold">{data.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Con informe:</span>
              <span className="font-semibold text-green-600">{data.withReport}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Progreso</span>
                <span className="text-xs font-semibold text-purple-600">{data.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default PsychReportsStatsCards
