import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react'

const CoursesStats = ({ courses }) => {
  const totalCourses = courses.length
  const totalStudents = courses.reduce((sum, course) => sum + course.estudiantes, 0)
  const totalPendingEvaluations = courses.reduce((sum, course) => sum + course.evaluacionesPendientes, 0)
  const averageGrade = courses.filter(c => c.promedioGeneral > 0).length > 0
    ? (courses.reduce((sum, course) => sum + (course.promedioGeneral || 0), 0) / courses.filter(c => c.promedioGeneral > 0).length).toFixed(1)
    : '0.0'

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Cursos',
      value: totalCourses,
      bgColor: 'bg-blue-500',
      delay: 0
    },
    {
      icon: Users,
      label: 'Total Estudiantes',
      value: totalStudents,
      bgColor: 'bg-green-500',
      delay: 0.1
    },
    {
      icon: FileText,
      label: 'Evaluaciones Pendientes',
      value: totalPendingEvaluations,
      bgColor: 'bg-yellow-500',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      label: 'Promedio General',
      value: averageGrade,
      bgColor: 'bg-purple-500',
      delay: 0.3
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.bgColor} rounded-lg p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default CoursesStats
