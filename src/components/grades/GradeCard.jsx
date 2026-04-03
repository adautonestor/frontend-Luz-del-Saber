import React from 'react'
import { MessageCircle, FileText, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const GradeCard = ({ grade, student, course, category, subcategory }) => {
  const getGradeColor = (value, gradingSystem) => {
    if (gradingSystem === 'secundaria') {
      const numValue = parseFloat(value)
      if (numValue >= 18) return 'text-green-700 bg-green-100'
      if (numValue >= 14) return 'text-blue-700 bg-blue-100'
      if (numValue >= 11) return 'text-yellow-700 bg-yellow-100'
      return 'text-red-700 bg-red-100'
    } else {
      // Letter grades
      if (value === 'AD' || value === 'A') return 'text-green-700 bg-green-100'
      if (value === 'B') return 'text-blue-700 bg-blue-100'
      return 'text-red-700 bg-red-100'
    }
  }

  const getGradeDescription = (value, gradingSystem) => {
    if (gradingSystem === 'secundaria') {
      const numValue = parseFloat(value)
      if (numValue >= 18) return 'Logro destacado'
      if (numValue >= 14) return 'Logro esperado'
      if (numValue >= 11) return 'En proceso'
      return 'En inicio'
    } else {
      const config = {
        inicial: { 'A': 'Logro destacado', 'B': 'Logro esperado', 'C': 'En inicio' },
        primaria: { 'AD': 'Logro destacado', 'A': 'Logro esperado', 'B': 'En proceso', 'C': 'En inicio' }
      }
      return config[gradingSystem]?.[value] || ''
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
    } catch {
      return dateString
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
          <p className="text-sm text-gray-600">{category.name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.valor, grade.gradingSystem)}`}>
          {grade.valor}
        </div>
      </div>

      {/* Course and Student Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={14} />
          <span>{course.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={14} />
          <span>{student.paternal_last_name || ''} {student.maternal_last_name || ''}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{formatDate(grade.registration_date)}</span>
        </div>
      </div>

      {/* Grade Description */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">
          {getGradeDescription(grade.valor, grade.gradingSystem)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Bimestre {grade.quarter}° - Peso: {subcategory.peso}%
        </p>
      </div>

      {/* Observation/Comment */}
      {grade.observacion && (
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={14} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Observación</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">{grade.observacion}</p>
          </div>
        </div>
      )}

      {/* No observation placeholder */}
      {!grade.observacion && (
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 text-gray-400">
            <MessageCircle size={14} />
            <span className="text-sm">Sin observaciones</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GradeCard