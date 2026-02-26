import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Search, Filter, Download, Eye, Edit,
  Phone, Mail, MapPin, Calendar, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle, X,
  User, GraduationCap, Star, Clock
} from 'lucide-react'

const TeacherStudents = () => {
  const [selectedCourse, setSelectedCourse] = useState('math-5a')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Mock data
  const courses = [
    { id: 'math-5a', name: 'Matemática 5°A', students: 28 },
    { id: 'math-5b', name: 'Matemática 5°B', students: 25 },
    { id: 'math-4a', name: 'Matemática 4°A', students: 30 }
  ]

  const students = [
    {
      id: 1,
      code: 'EST001',
      name: 'Ana García López',
      avatar: null,
      grade: '5° Grado',
      section: 'A',
      age: 10,
      birthDate: '2014-03-15',
      address: 'Jr. Real 123, Huancayo',
      phone: '987654321',
      email: 'ana.garcia@email.com',
      parentName: 'Carlos García',
      parentPhone: '987654321',
      parentEmail: 'carlos.garcia@email.com',
      currentGrade: 17.8,
      attendance: 95,
      status: 'excellent',
      lastActivity: '2024-01-15',
      subjects: {
        mathematics: 18,
        language: 17,
        science: 19,
        socialStudies: 16
      },
      notes: 'Estudiante destacada con excelente participación en clase.'
    },
    {
      id: 2,
      code: 'EST002',
      name: 'Carlos Mendoza Torres',
      avatar: null,
      grade: '5° Grado',
      section: 'A',
      age: 11,
      birthDate: '2013-08-22',
      address: 'Av. Ferrocarril 456, El Tambo',
      phone: '987654322',
      email: 'carlos.mendoza@email.com',
      parentName: 'María Torres',
      parentPhone: '987654322',
      parentEmail: 'maria.torres@email.com',
      currentGrade: 15.2,
      attendance: 88,
      status: 'good',
      lastActivity: '2024-01-14',
      subjects: {
        mathematics: 15,
        language: 16,
        science: 14,
        socialStudies: 15
      },
      notes: 'Buen estudiante, necesita refuerzo en matemáticas.'
    },
    {
      id: 3,
      code: 'EST003',
      name: 'María Flores Ramírez',
      avatar: null,
      grade: '5° Grado',
      section: 'A',
      age: 10,
      birthDate: '2014-01-10',
      address: 'Calle Amazonas 789, Chilca',
      phone: '987654323',
      email: 'maria.flores@email.com',
      parentName: 'Luis Flores',
      parentPhone: '987654323',
      parentEmail: 'luis.flores@email.com',
      currentGrade: 19.1,
      attendance: 98,
      status: 'excellent',
      lastActivity: '2024-01-15',
      subjects: {
        mathematics: 19,
        language: 20,
        science: 19,
        socialStudies: 18
      },
      notes: 'Estudiante excepcional con gran potencial académico.'
    },
    {
      id: 4,
      code: 'EST004',
      name: 'Luis Vásquez Castro',
      avatar: null,
      grade: '5° Grado',
      section: 'A',
      age: 11,
      birthDate: '2013-11-05',
      address: 'Jr. Ancash 321, Huancayo Centro',
      phone: '987654324',
      email: 'luis.vasquez@email.com',
      parentName: 'Rosa Castro',
      parentPhone: '987654324',
      parentEmail: 'rosa.castro@email.com',
      currentGrade: 12.8,
      attendance: 82,
      status: 'attention',
      lastActivity: '2024-01-12',
      subjects: {
        mathematics: 12,
        language: 13,
        science: 13,
        socialStudies: 13
      },
      notes: 'Requiere atención especial y apoyo académico adicional.'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'attention': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <Star className="w-4 h-4" />
      case 'good': return <CheckCircle className="w-4 h-4" />
      case 'attention': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getGradeColor = (grade) => {
    if (grade >= 18) return 'text-green-600'
    if (grade >= 14) return 'text-blue-600'
    if (grade >= 11) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const openStudentModal = (student) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const closeStudentModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Estudiantes</h1>
        <p className="mt-2 text-gray-600">
          Gestiona la información y seguimiento de tus estudiantes
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="attention">Requiere Atención</option>
                <option value="critical">Crítico</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Download className="mr-2" size={16} />
              Exportar
            </button>
          </div>
        </div>
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
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {selectedCourseData?.students || 0}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900">16.2</p>
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
            <div className="bg-purple-500 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asistencia Prom.</p>
              <p className="text-2xl font-semibold text-gray-900">91%</p>
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
            <div className="bg-yellow-500 rounded-lg p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Req. Atención</p>
              <p className="text-2xl font-semibold text-gray-900">
                {students.filter(s => s.status === 'attention' || s.status === 'critical').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openStudentModal(student)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{student.name}</h3>
                  <p className="text-xs text-gray-500">{student.code}</p>
                </div>
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                {getStatusIcon(student.status)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Promedio:</span>
                <span className={`font-semibold ${getGradeColor(student.currentGrade)}`}>
                  {student.currentGrade}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Asistencia:</span>
                <span className="font-semibold text-gray-900">{student.attendance}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${student.attendance}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {student.lastActivity}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    openStudentModal(student)
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                    <p className="text-gray-600">{selectedStudent.code} - {selectedStudent.grade} {selectedStudent.section}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(selectedStudent.status)}`}>
                      {getStatusIcon(selectedStudent.status)}
                      <span className="ml-1 capitalize">{selectedStudent.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeStudentModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Fecha de nacimiento:</span>
                        <span className="ml-2 text-sm font-medium">{selectedStudent.birthDate} ({selectedStudent.age} años)</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Dirección:</span>
                        <span className="ml-2 text-sm">{selectedStudent.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <span className="ml-2 text-sm">{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm">{selectedStudent.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Apoderado</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Nombre:</span>
                        <span className="ml-2 text-sm font-medium">{selectedStudent.parentName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <span className="ml-2 text-sm">{selectedStudent.parentPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm">{selectedStudent.parentEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Académico</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Promedio General:</span>
                        <span className={`text-lg font-bold ${getGradeColor(selectedStudent.currentGrade)}`}>
                          {selectedStudent.currentGrade}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Asistencia:</span>
                        <span className="text-lg font-bold text-blue-600">{selectedStudent.attendance}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas por Materia</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedStudent.subjects).map(([subject, grade]) => (
                        <div key={subject} className="flex justify-between items-center p-2 border-b">
                          <span className="text-sm capitalize">{subject.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className={`font-semibold ${getGradeColor(grade)}`}>{grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedStudent.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedStudent.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeStudentModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cerrar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Editar Información
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TeacherStudents