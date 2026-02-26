import React from 'react'
import { motion } from 'framer-motion'
import { Award, GraduationCap, TrendingUp, Eye, Download, Share2, CheckCircle, X } from 'lucide-react'
import { getGradeColor, getPassFailColor } from '@/utils/reports'
import { formatDate } from '@/utils/reports'

/**
 * Tarjeta individual de reporte en la lista
 */
const ReportCard = ({ report, index, onOpen }) => {
  return (
    <motion.div
      key={`${report.periodId}-${report.reportType}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card p-6 hover:shadow-lg transition-shadow cursor-pointer ${
        report.type === 'final' ?
          (report.passed ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500') :
          'border-l-4 border-blue-500'
      }`}
      onClick={() => onOpen(report)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`rounded-lg p-3 ${
            report.type === 'final' ?
              (report.passed ? 'bg-green-100' : 'bg-red-100') :
              report.reportType === 'progress' ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            {report.type === 'final' ? (
              <Award className={`w-8 h-8 ${
                report.passed ? 'text-green-600' : 'text-red-600'
              }`} />
            ) : report.reportType === 'progress' ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <GraduationCap className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {report.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{report.periodName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Generado el {formatDate(report.generatedDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {report.type === 'final' && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getPassFailColor(report.passed)}`}>
              {report.passed ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              {report.finalStatus}
            </div>
          )}

          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getGradeColor(report.overallGrade)}`}>
            Promedio: {report.overallGrade}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-gray-900">Materias</div>
          <div className="text-gray-600">{report.subjects?.length || 0}</div>
        </div>

        {report.attendance && (
          <div className="text-center">
            <div className="font-medium text-gray-900">Asistencia</div>
            <div className="text-gray-600">{report.attendance.percentage}%</div>
          </div>
        )}

        {report.achievements && (
          <div className="text-center">
            <div className="font-medium text-gray-900">Logros</div>
            <div className="text-gray-600">{report.achievements.length}</div>
          </div>
        )}

        {report.type === 'final' && (
          <div className="text-center">
            <div className="font-medium text-gray-900">Próximo Grado</div>
            <div className="text-gray-600">{report.nextGrade}</div>
          </div>
        )}

        {report.reportType === 'progress' && (
          <div className="text-center">
            <div className="font-medium text-gray-900">Progreso</div>
            <div className="text-green-600 font-medium">{report.comparison?.improvement}</div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {report.type === 'final' ? 'Ver boleta final' :
               report.reportType === 'progress' ? 'Ver progreso' : 'Ver detalles'}
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Download size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReportCard
