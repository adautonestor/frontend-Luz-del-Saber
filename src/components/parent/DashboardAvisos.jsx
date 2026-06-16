import React from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Bell, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDateSafe } from '../../utils/dateUtils'

/**
 * Sección de avisos importantes del dashboard
 */
const DashboardAvisos = ({ avisos }) => {
  const navigate = useNavigate()
  if (avisos.length === 0) return null

  return (
    <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Avisos Importantes</h3>
      </div>
      <div className="space-y-4">
        {avisos.map((aviso, index) => (
          <motion.div
            key={aviso.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h4 className="font-semibold text-gray-900 mb-2">{aviso.titulo}</h4>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{aviso.contenido}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Bell size={12} />
                {formatDateSafe(aviso.fechaCreacion)}
              </span>
              <button
                onClick={() => navigate(`/padre/avisos?aviso=${aviso.id}`)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Eye size={14} />
                Ver más
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default DashboardAvisos
