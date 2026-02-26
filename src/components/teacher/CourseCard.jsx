import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Clock, AlertCircle, Brain } from 'lucide-react'

const CourseCard = ({
  course,
  index,
  onViewDetails,
  onViewCompetencies,
  getProgressColor,
  getGradeColor
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-6 hover:shadow-lg transition-shadow"
    >
      <div
        className="flex items-start justify-between mb-4 cursor-pointer"
        onClick={() => {
          console.log('=== CLICK EN CARD DE CURSO ===')
          console.log('Curso seleccionado:', course)
          onViewDetails(course)
        }}
      >
        <div className="flex items-center">
          <div className={`bg-${course.color}-500 rounded-lg p-3`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {course.name}
            </h3>
            <p className="text-sm text-gray-600">
              {course.grado} - Sección {course.seccion}
            </p>
          </div>
        </div>
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            console.log('=== CLICK EN ICONO CHEVRON ===')
            console.log('Curso seleccionado:', course)
            onViewDetails(course)
          }}
        >
          <ChevronRight className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Estudiantes</p>
          <p className="text-lg font-semibold text-gray-900">{course.estudiantes}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Aula</p>
          <p className="text-lg font-semibold text-gray-900">{course.aula}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del Curso</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(course.progreso)}`}>
            {course.progreso}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-${course.color}-500 h-2 rounded-full`}
            style={{ width: `${course.progreso}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {course.unidadesCompletas}/{course.unidadesTotal} unidades
        </span>
        {course.promedioGeneral > 0 && (
          <span className={`font-semibold ${getGradeColor(course.promedioGeneral)}`}>
            Promedio: {course.promedioGeneral.toFixed(1)}
          </span>
        )}
      </div>

      {course.evaluacionesPendientes > 0 && (
        <div className="mt-3 flex items-center text-yellow-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="text-sm">{course.evaluacionesPendientes} evaluaciones pendientes</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {course.horario}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewCompetencies(course)
            }}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50"
          >
            <Brain size={14} />
            Competencias
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default CourseCard
