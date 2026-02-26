import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Users, Clock, Calendar, ChevronRight,
  GraduationCap, Award, TrendingUp, AlertCircle,
  Search, Filter, Grid, List, Plus, Eye
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCoursesStore } from '../../stores/coursesStore'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'
import CourseDetailModal from '../../components/teacher/CourseDetailModal'

const MyCoursesPage = () => {
  const { user } = useAuthStore()
  const { courses, initialize, isLoading, getCourseStudents } = useCoursesStore()

  const [viewMode, setViewMode] = useState('grid') // grid o list
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseDetail, setShowCourseDetail] = useState(false)

  useEffect(() => {
    // Inicializar con los cursos del profesor actual
    if (user?.id) {
      initialize(user.id)
    }
  }, [user])

  // Usar solo cursos reales del store (sin datos mock)
  const displayCourses = courses

  // Filtrar cursos
  const filteredCourses = displayCourses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.area?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = !filterLevel || course.nivel === filterLevel
    return matchesSearch && matchesLevel
  })

  // Estadísticas
  // Calcular promedio general usando promedioNumerico (valor numérico) en lugar de promedioGeneral (puede ser letra)
  const validAverages = filteredCourses.filter(c => c.promedioNumerico !== null && c.promedioNumerico !== undefined)
  const avgSum = validAverages.reduce((sum, course) => sum + course.promedioNumerico, 0)
  const avgGrade = validAverages.length > 0 ? avgSum / validAverages.length : null

  // Detectar si el sistema es literal (todos los cursos con sistema literal)
  const isLiteralSystem = filteredCourses.some(c => c.sistemaCalificacion === 'literal')
  // Obtener levelId del primer curso para configuración dinámica
  const primaryLevelId = filteredCourses[0]?.level_id || null

  const stats = {
    totalCourses: filteredCourses.length,
    totalStudents: filteredCourses.reduce((sum, course) =>
      sum + (course.cantidadEstudiantes || getCourseStudents(course.id).length), 0
    ),
    averageGrade: avgGrade,
    averageGradeFormatted: avgGrade !== null
      ? (isLiteralSystem
          // Usar store SSOT para conversión dinámica
          ? getGradingScalesStore().convertNumericToLetter(avgGrade, primaryLevelId)
          : avgGrade.toFixed(1))
      : 'N/A',
    activeClasses: filteredCourses.filter(c => c.state === 'activo').length
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    setShowCourseDetail(true)
  }

  const getGradeColor = (grade, levelId = null) => {
    // Usar store SSOT para obtener color dinámicamente
    if (grade === null || grade === undefined) return 'text-gray-400'

    const store = getGradingScalesStore()
    const hexColor = store.getGradeColor(grade, levelId)

    // Mapear color hex a clase Tailwind
    const colorMap = {
      '#22c55e': 'text-green-600',
      '#3b82f6': 'text-blue-600',
      '#eab308': 'text-yellow-600',
      '#ef4444': 'text-red-600',
      '#9ca3af': 'text-gray-400'
    }

    return colorMap[hexColor] || 'text-gray-600'
  }

  // Formatear promedio según tipo
  const formatPromedio = (promedio) => {
    if (promedio === null || promedio === undefined) return 'N/A'
    if (typeof promedio === 'string') return promedio // Letras como 'A', 'B', 'C', 'D'
    if (typeof promedio === 'number') return promedio.toFixed(1)
    return 'N/A'
  }

  const getNivelBadge = (nivel) => {
    const badges = {
      inicial: {
        text: 'Inicial',
        bg: 'bg-pink-100',
        color: 'text-pink-800',
        border: 'border-pink-200'
      },
      primaria: {
        text: 'Primaria',
        bg: 'bg-blue-100',
        color: 'text-blue-800',
        border: 'border-blue-200'
      },
      secundaria: {
        text: 'Secundaria',
        bg: 'bg-purple-100',
        color: 'text-purple-800',
        border: 'border-purple-200'
      }
    }
    return badges[nivel?.toLowerCase()] || badges.primaria
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus cursos y visualiza el progreso de tus estudiantes
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cursos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalCourses}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Promedio General</p>
              <p className={`text-2xl font-semibold ${getGradeColor(stats.averageGradeFormatted)}`}>
                {stats.averageGradeFormatted}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clases Activas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.activeClasses}
              </p>
            </div>
            <GraduationCap className="h-8 w-8 text-indigo-400" />
          </div>
        </motion.div>
      </div>

      {/* Controles */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar curso..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="input w-full md:w-48"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            <option value="inicial">Inicial</option>
            <option value="primaria">Primaria</option>
            <option value="secundaria">Secundaria</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Estado vacío - sin cursos asignados */}
      {displayCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-100 rounded-full p-6 mb-6">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes cursos asignados
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Aún no se te han asignado cursos. Cuando el administrador te asigne cursos,
              aparecerán aquí para que puedas gestionarlos.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertCircle size={16} />
              <span>Contacta al administrador si crees que esto es un error</span>
            </div>
          </div>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* Cursos - Vista Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCourseClick(course)}
              className="card hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className={`h-2 ${course.color || 'bg-blue-500'} rounded-t-lg`} />

              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h3>
                      <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors ml-2" size={20} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                        getNivelBadge(course.nivel).bg
                      } ${
                        getNivelBadge(course.nivel).color
                      } ${
                        getNivelBadge(course.nivel).border
                      }`}>
                        {getNivelBadge(course.nivel).text}
                      </span>
                      <span className="text-sm text-gray-500">{course.area}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>{course.cantidadEstudiantes || getCourseStudents(course.id).length} estudiantes</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>{course.horario || 'Sin horario'}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Award size={16} className="mr-2 text-gray-400" />
                    <span className={getGradeColor(course.promedioGeneral)}>
                      Promedio: {formatPromedio(course.promedioGeneral)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {course.grado} - Sección {course.seccion}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.state === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.state || 'activo'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Vista Lista */
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado/Sección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map(course => {
                const nivelBadge = getNivelBadge(course.nivel)
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.area}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        nivelBadge.bg
                      } ${
                        nivelBadge.color
                      } ${
                        nivelBadge.border
                      }`}>
                        {nivelBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.grado} - {course.seccion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.horario || 'Sin horario'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {course.cantidadEstudiantes || getCourseStudents(course.id).length}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-medium ${getGradeColor(course.promedioGeneral)}`}>
                        {formatPromedio(course.promedioGeneral)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.state === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.state || 'activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleCourseClick(course)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">No se encontraron cursos</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalle del curso */}
      {showCourseDetail && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => {
            setShowCourseDetail(false)
            setSelectedCourse(null)
          }}
        />
      )}
    </div>
  )
}

export default MyCoursesPage