import React from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

const StudentsStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow-sm border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Estudiantes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <Users className="text-primary-600" size={32} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 rounded-lg shadow-sm border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Inicial</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inicial}</p>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">I</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg shadow-sm border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Primaria</p>
            <p className="text-2xl font-bold text-green-600">{stats.primaria}</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold text-sm">P</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-lg shadow-sm border"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Secundaria</p>
            <p className="text-2xl font-bold text-purple-600">{stats.secundaria}</p>
          </div>
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm">S</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StudentsStatsCards
