import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Search, Filter, Eye, Edit, Phone, Mail,
  MapPin, Calendar, BookOpen, TrendingUp, AlertCircle,
  CheckCircle, UserCheck, UserX, BarChart3, FileText,
  Download, MessageSquare, Star, Clock
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const StudentsPage = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  const [courses] = useState([
    { id: 'all', name: 'Todos los cursos' },
    { id: 'math-5a', name: 'Matemática 5°A' },
    { id: 'math-5b', name: 'Matemática 5°B' },
    { id: 'math-4a', name: 'Matemática 4°A' },
    { id: 'tutoria-5a', name: 'Tutoría 5°A' }
  ])

  const [students, setStudents] = useState([
    {
      id: 'st1',
      first_names: 'Ana Lucía',
      last_names: 'García Mendoza',
      code: '2024-5A-01',
      dni: '12345678',
      fechaNacimiento: '2014-05-15',
      edad: 10,
      sexo: 'F',
      grado: '5° Primaria',
      seccion: 'A',
      cursos: ['math-5a', 'tutoria-5a'],
      state: 'activo',
      promedioGeneral: 17.2,
      asistencia: 95,
      conducta: 'A',
      padre: {
        name: 'Juan Carlos García',
        telefono: '+51987654321',
        email: 'jcarlos.garcia@email.com'
      },
      madre: {
        name: 'María Mendoza Ruiz',
        telefono: '+51987654322',
        email: 'maria.mendoza@email.com'
      },
      direccion: 'Av. Real 123, San Carlos, Huancayo',
      observations: 'Estudiante destacada en matemáticas. Participa activamente en clase.',
      ultimaActividad: '2024-09-08T10:30:00',
      materias: {
        matematicas: { promedio: 18.5, participacion: 'Excelente', tareas: '100%' },
        comunicacion: { promedio: 16.8, participacion: 'Buena', tareas: '95%' },
        ciencias: { promedio: 17.2, participacion: 'Muy Buena', tareas: '100%' }
      }
    },
    {
      id: 'st2',
      first_names: 'Carlos Eduardo',
      last_names: 'Martínez López',
      code: '2024-5A-02',
      dni: '23456789',
      fechaNacimiento: '2014-03-22',
      edad: 10,
      sexo: 'M',
      grado: '5° Primaria',
      seccion: 'A',
      cursos: ['math-5a', 'tutoria-5a'],
      state: 'activo',
      promedioGeneral: 14.8,
      asistencia: 88,
      conducta: 'B',
      padre: {
        name: 'Eduardo Martínez Silva',
        telefono: '+51987654323',
        email: 'eduardo.martinez@email.com'
      },
      madre: {
        name: 'Rosa López Vega',
        telefono: '+51987654324',
        email: 'rosa.lopez@email.com'
      },
      direccion: 'Jr. Amazonas 456, El Tambo, Huancayo',
      observations: 'Necesita refuerzo en operaciones con fracciones. Buen comportamiento.',
      ultimaActividad: '2024-09-08T11:15:00',
      materias: {
        matematicas: { promedio: 14.2, participacion: 'Regular', tareas: '85%' },
        comunicacion: { promedio: 15.8, participacion: 'Buena', tareas: '90%' },
        ciencias: { promedio: 14.5, participacion: 'Regular', tareas: '88%' }
      }
    },
    {
      id: 'st3',
      first_names: 'María José',
      last_names: 'Rojas Vargas',
      code: '2024-5A-03',
      dni: '34567890',
      fechaNacimiento: '2014-07-10',
      edad: 10,
      sexo: 'F',
      grado: '5° Primaria',
      seccion: 'A',
      cursos: ['math-5a', 'tutoria-5a'],
      state: 'activo',
      promedioGeneral: 18.6,
      asistencia: 98,
      conducta: 'A',
      padre: {
        name: 'Roberto Rojas Díaz',
        telefono: '+51987654325',
        email: 'roberto.rojas@email.com'
      },
      madre: {
        name: 'Carmen Vargas Torres',
        telefono: '+51987654326',
        email: 'carmen.vargas@email.com'
      },
      direccion: 'Av. Giráldez 789, Huancayo',
      observations: 'Excelente estudiante. Líder natural, ayuda a sus compañeros.',
      ultimaActividad: '2024-09-08T09:45:00',
      materias: {
        matematicas: { promedio: 19.2, participacion: 'Excelente', tareas: '100%' },
        comunicacion: { promedio: 18.5, participacion: 'Excelente', tareas: '100%' },
        ciencias: { promedio: 18.1, participacion: 'Excelente', tareas: '100%' }
      }
    }
  ])

  useEffect(() => {
    setTimeout(() => setLoading(false), 800)
  }, [])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_names.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.last_names.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = selectedCourse === 'all' || student.cursos.includes(selectedCourse)
    
    return matchesSearch && matchesCourse
  })

  const getGradeColor = (grade) => {
    if (grade >= 17) return 'text-green-600 bg-green-100'
    if (grade >= 14) return 'text-blue-600 bg-blue-100'
    if (grade >= 11) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAttendanceColor = (percentage) => {
    if (percentage >= 95) return 'text-green-600'
    if (percentage >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConductColor = (conduct) => {
    switch(conduct) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando estudiantes...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información de tus estudiantes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="btn btn-outline flex items-center gap-2">
            <Download size={20} />
            Exportar Lista
          </button>
          <button className="btn btn-outline flex items-center gap-2">
            <BarChart3 size={20} />
            Reporte
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}</p>
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
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio General</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(students.reduce((sum, s) => sum + s.promedioGeneral, 0) / students.length).toFixed(1)}
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
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asistencia Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(students.reduce((sum, s) => sum + s.asistencia, 0) / students.length)}%
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
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Excelente Conducta</p>
              <p className="text-2xl font-semibold text-gray-900">
                {students.filter(s => s.conducta === 'A').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCourse('all')
            }}
            className="btn btn-outline flex items-center gap-2"
          >
            <Filter size={18} />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedStudent(student)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {student.first_names.charAt(0)}{student.last_names.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.first_names} {student.last_names}
                  </h3>
                  <p className="text-sm text-gray-600">{student.code}</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Grado</p>
                <p className="font-medium text-gray-900">{student.grado} {student.seccion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Edad</p>
                <p className="font-medium text-gray-900">{student.edad} años</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promedio</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(student.promedioGeneral)}`}>
                  {student.promedioGeneral}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Asistencia</span>
                <span className={`text-sm font-medium ${getAttendanceColor(student.asistencia)}`}>
                  {student.asistencia}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conducta</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConductColor(student.conducta)}`}>
                  {student.conducta}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Última actividad: {new Date(student.ultimaActividad).toLocaleDateString('es-PE')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estudiantes</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {selectedStudent.first_names.charAt(0)}{selectedStudent.last_names.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedStudent.first_names} {selectedStudent.last_names}
                  </h3>
                  <p className="text-gray-600">{selectedStudent.code} - {selectedStudent.grado} {selectedStudent.seccion}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye size={24} className="transform rotate-180" />
              </button>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'info', name: 'Información Personal', icon: Users },
                  { id: 'academic', name: 'Rendimiento Académico', icon: BookOpen },
                  { id: 'contact', name: 'Contacto', icon: Phone },
                  { id: 'notes', name: 'Observaciones', icon: FileText }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.name}
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Datos Personales</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">DNI</label>
                        <p className="text-gray-900">{selectedStudent.dni}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                        <p className="text-gray-900">
                          {new Date(selectedStudent.fechaNacimiento).toLocaleDateString('es-PE')} ({selectedStudent.edad} años)
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sexo</label>
                        <p className="text-gray-900">{selectedStudent.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado</label>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          selectedStudent.state === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedStudent.state.charAt(0).toUpperCase() + selectedStudent.state.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información Académica</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Grado y Sección</label>
                        <p className="text-gray-900">{selectedStudent.grado} - Sección {selectedStudent.seccion}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Promedio General</label>
                        <p className={`font-semibold ${selectedStudent.promedioGeneral >= 17 ? 'text-green-600' : 
                          selectedStudent.promedioGeneral >= 14 ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {selectedStudent.promedioGeneral}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Asistencia</label>
                        <p className={`font-semibold ${getAttendanceColor(selectedStudent.asistencia)}`}>
                          {selectedStudent.asistencia}%
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Conducta</label>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getConductColor(selectedStudent.conducta)}`}>
                          {selectedStudent.conducta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900">Rendimiento por Materia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(selectedStudent.materias).map(([materia, datos]) => (
                      <div key={materia} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3 capitalize">{materia}</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Promedio:</span>
                            <span className={`font-semibold ${getGradeColor(datos.promedio).split(' ')[0]}`}>
                              {datos.promedio}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Participación:</span>
                            <span className="text-sm text-gray-900">{datos.participacion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Tareas:</span>
                            <span className="text-sm text-gray-900">{datos.tareas}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información del Padre</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nombre</label>
                        <p className="text-gray-900">{selectedStudent.padre.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{selectedStudent.padre.telefono}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{selectedStudent.padre.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Información de la Madre</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nombre</label>
                        <p className="text-gray-900">{selectedStudent.madre.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{selectedStudent.madre.telefono}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900">{selectedStudent.madre.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-semibold text-gray-900">Dirección</h4>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <p className="text-gray-900">{selectedStudent.direccion}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Observaciones del Docente</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedStudent.observations}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="btn btn-outline">
                      <Edit size={16} className="mr-2" />
                      Editar Observaciones
                    </button>
                    <button className="btn btn-primary">
                      <MessageSquare size={16} className="mr-2" />
                      Enviar Mensaje a Padres
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn btn-outline"
              >
                Cerrar
              </button>
              <button className="btn btn-primary">
                Ver Perfil Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentsPage