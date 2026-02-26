import React from 'react'
import { X, Users, BarChart3, GraduationCap } from 'lucide-react'

const CourseDetailHeader = ({ course, studentCount, avgGrade, onClose }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">
          {course.name}
        </h2>
        <p className="text-blue-100 text-lg mb-4">
          {course.nivel} - {course.grado} - Sección {course.seccion}
        </p>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
            <Users className="w-5 h-5 mr-2" />
            <div>
              <p className="text-xs text-blue-200">Estudiantes</p>
              <p className="text-lg font-bold">{studentCount}</p>
            </div>
          </div>

          <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
            <BarChart3 className="w-5 h-5 mr-2" />
            <div>
              <p className="text-xs text-blue-200">Promedio del curso</p>
              <p className="text-lg font-bold">{avgGrade}</p>
            </div>
          </div>

          <div className="flex items-center bg-white/10 rounded-lg px-4 py-2">
            <GraduationCap className="w-5 h-5 mr-2" />
            <div>
              <p className="text-xs text-blue-200">Área</p>
              <p className="text-lg font-bold">{course.area || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
      >
        <X size={28} />
      </button>
    </div>
  )
}

export default CourseDetailHeader
