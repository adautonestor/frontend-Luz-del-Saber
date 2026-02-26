import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, Users, Clock, Calendar, 
  TrendingUp, FileText, Edit, Eye,
  ChevronRight, Star, BookMarked
} from 'lucide-react'

const TeacherCourses = () => {
  // TODO: Fetch courses from store/API
  const courses = []
  const upcomingClasses = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus cursos asignados y planifica tus clases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
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
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.reduce((sum, course) => sum + course.students, 0)}
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
            <div className="bg-yellow-500 rounded-lg p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Semanales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {courses.reduce((sum, course) => sum + course.weeklyHours, 0)}
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
            <div className="bg-purple-500 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Cursos Asignados</h2>
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className={`${course.color} w-4 h-4 rounded-full mr-3`} />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.name} - {course.grade} {course.section}
                    </h3>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      {course.students} estudiantes
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {course.weeklyHours} hrs/semana
                    </div>
                    <div className="flex items-center">
                      <BookMarked size={16} className="mr-1" />
                      {course.room}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      {course.progress}% completado
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso del curso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${course.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Horarios:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.schedule.map((time, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Today's Classes */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Clases de Hoy
            </h3>
            <div className="space-y-4">
              {upcomingClasses.map((class_item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{class_item.course}</p>
                      <p className="text-sm text-gray-600">{class_item.topic}</p>
                      <p className="text-xs text-gray-500">{class_item.room}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {class_item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="mr-2" size={20} />
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <FileText className="mr-3" size={18} />
                  <span className="text-sm font-medium">Crear nueva evaluación</span>
                </div>
                <ChevronRight size={16} />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <Users className="mr-3" size={18} />
                  <span className="text-sm font-medium">Tomar asistencia</span>
                </div>
                <ChevronRight size={16} />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="flex items-center">
                  <BookOpen className="mr-3" size={18} />
                  <span className="text-sm font-medium">Planificar clase</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherCourses