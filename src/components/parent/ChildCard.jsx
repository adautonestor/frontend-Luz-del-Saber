import React from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, AlertTriangle, Eye } from 'lucide-react'
import { getStatusColor, getStatusIcon, getGradeColor, calculateAge, getStatusText } from '../../utils/childrenUtils.jsx'
import { convertAverageValueToLetter } from '../../utils/gradeConversion.jsx'

/**
 * Componente que muestra la tarjeta individual de un hijo
 * @param {Object} child - Datos del hijo
 * @param {number} index - Índice para la animación
 * @param {Function} onOpenModal - Callback para abrir el modal de detalles
 */
const ChildCard = ({ child, index, onOpenModal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onOpenModal(child)}
    >
      {/* Header con info básica y estado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
            <p className="text-gray-600">{child.code} • {calculateAge(child.birthDate)} años</p>
            <p className="text-sm text-gray-500">{child.grade} {child.section} - {child.level}</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(child.status)}`}>
          {getStatusIcon(child.status)}
          <span className="ml-1 capitalize">{getStatusText(child.status)}</span>
        </div>
      </div>

      {/* Grid de promedio y asistencia */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Promedio</p>
          <p className={`text-2xl font-bold ${child.currentGrade > 0 ? getGradeColor(child.currentGrade) : 'text-gray-400'}`}>
            {child.currentGrade > 0 ? convertAverageValueToLetter(child.currentGrade) : '--'}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Asistencia</p>
          <p className={`text-2xl font-bold ${child.attendance > 0 || child.totalAttendanceDays > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
            {child.attendance > 0 || child.totalAttendanceDays > 0 ? `${child.attendance || 0}%` : '--'}
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            Tutor: {child.teacher || 'Sin asignar'}
          </div>
          {/* Solo mostrar aula si existe */}
          {child.room && child.room !== 'Sin asignar' && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {child.room}
            </div>
          )}
        </div>

        {/* Alerta de pagos pendientes */}
        {child.pendingPayments > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
            <div className="flex items-center text-sm text-yellow-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {child.pendingPayments} pago(s) pendiente(s)
            </div>
            {child.pendingAmount > 0 && (
              <span className="text-yellow-700 text-xs font-medium">
                S/ {child.pendingAmount.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer con última actividad */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Última actividad: {new Date(child.lastActivity).toLocaleDateString('es-PE')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenModal(child)
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ChildCard
