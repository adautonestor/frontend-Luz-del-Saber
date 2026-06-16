import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, BookOpen, Users, MessageSquare, Calendar,
  LogOut, Menu, X, Bell, GraduationCap,
  Edit2, Plus, Trash2, Check, FolderOpen, Barcode, Megaphone
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { useTasksStore } from '../../stores/tasksStore'
import { avisosService } from '../../services/avisosService'
import { dashboardService } from '../../services/dashboardService'
import { useSchoolLogo } from '../../hooks/useSchoolLogo'
import teacherWorkflowSvg from '../../config/profe.svg'
import MyCoursesPage from '../../pages/teacher/MyCoursesPage'
import TeacherGradesPage from '../../pages/teacher/TeacherGradesPage'
import TeacherCommunications from '../teacher/TeacherCommunications'
import TeacherAvisos from '../teacher/TeacherAvisos'
import TeacherSchedule from '../teacher/TeacherSchedule'
import TeacherDocuments from '../teacher/TeacherDocuments'
import AttendanceScannerPage from '../../pages/admin/AttendanceScannerPage'
import HighPriorityMessagePopup from '../common/HighPriorityMessagePopup'
import NotificationsDropdown from '../common/NotificationsDropdown'
import { formatDateSafe } from '../../utils/dateUtils'

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [showHighPriorityPopup, setShowHighPriorityPopup] = React.useState(false)
  const { user, logout } = useAuthStore()
  const { initialize, getUserCommunications, markAsRead } = useCommunicationsStore()
  const location = useLocation()
  const { logoUrl, schoolName } = useSchoolLogo()

  // Initialize communications store on mount
  React.useEffect(() => {
    initialize()
  }, [initialize])

  // Check for high priority unread messages on mount
  React.useEffect(() => {
    if (user?.id) {
      const userCommunications = getUserCommunications(user.id)
      const highPriorityUnread = userCommunications.filter(comm =>
        comm.prioridad === 'alta' && !comm.isRead
      )

      if (highPriorityUnread.length > 0) {
        setShowHighPriorityPopup(true)
      }
    }
  }, [user?.id, getUserCommunications])

  const handleClosePopup = () => {
    setShowHighPriorityPopup(false)
  }

  const handleMarkAsRead = async (communicationId, userId) => {
    await markAsRead(communicationId, userId)
  }

  const navigation = [
    { name: 'Dashboard', href: '/profesor', icon: Home, exact: true },
    { name: 'Mis Cursos', href: '/profesor/cursos', icon: BookOpen },
    { name: 'Notas', href: '/profesor/notas', icon: GraduationCap },
    { name: 'Asistencia', href: '/profesor/asistencia', icon: Barcode },
    { name: 'Comunicados', href: '/profesor/comunicados', icon: MessageSquare },
    { name: 'Avisos', href: '/profesor/avisos', icon: Megaphone },
    { name: 'Documentos', href: '/profesor/documentos', icon: FolderOpen },
    { name: 'Horarios', href: '/profesor/horarios', icon: Calendar },
  ]

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-20 p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 shadow-md">
            <img
              src={logoUrl}
              alt={schoolName}
              className="h-12 w-auto object-contain"
            />
          </div>
          <button
            className="lg:hidden absolute right-4 text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive(item.href, item.exact)
                        ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActive(item.href, item.exact) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="w-full p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="/img_user_default.png"
                alt="Usuario"
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications */}
                <NotificationsDropdown
                  linkTo="/profesor/comunicados"
                  themeColor="blue"
                />

                {/* User avatar */}
                <img
                  src="/img_user_default.png"
                  alt="Usuario"
                  className="w-8 h-8 rounded-full object-cover"
                />

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
              <Routes>
                <Route index element={<TeacherDashboard />} />
                <Route path="cursos/*" element={<MyCoursesPage />} />
                <Route path="notas/*" element={<TeacherGradesPage />} />
                <Route path="asistencia/*" element={<AttendanceScannerPage />} />
                <Route path="comunicados/*" element={<TeacherCommunications />} />
                <Route path="avisos/*" element={<TeacherAvisos />} />
                <Route path="documentos/*" element={<TeacherDocuments />} />
                <Route path="horarios/*" element={<TeacherSchedule />} />
              </Routes>
            </motion.div>
          </div>
        </main>
      </div>

      {/* High Priority Message Popup */}
      {showHighPriorityPopup && user?.id && (
        <HighPriorityMessagePopup
          communications={getUserCommunications(user.id)}
          onMarkAsRead={handleMarkAsRead}
          onClose={handleClosePopup}
          userId={user.id}
        />
      )}
    </div>
  )
}

// Placeholder Dashboard Component
const TeacherDashboard = () => {
  const { user } = useAuthStore()
  const { teacherTasks, loadTasks, addTeacherTask, updateTeacherTask, deleteTeacherTask, toggleTaskCompleted, isLoading: loadingTasks } = useTasksStore()
  const [editingTask, setEditingTask] = React.useState(null)
  const [newTaskText, setNewTaskText] = React.useState('')
  const [editText, setEditText] = React.useState('')
  const [isAddingTask, setIsAddingTask] = React.useState(false)
  const [savingTask, setSavingTask] = React.useState(false)
  const [avisos, setAvisos] = React.useState([])
  const [stats, setStats] = React.useState({
    coursesCount: 0,
    studentsCount: 0,
    communicationsCount: 0,
    pendingGradesCount: 0
  })
  const [loadingStats, setLoadingStats] = React.useState(true)

  // Cargar tareas desde el servidor al montar el componente
  React.useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Cargar avisos activos
  React.useEffect(() => {
    const loadAvisos = async () => {
      try {
        const avisosData = await avisosService.getAll({ state: 'active' })
        const avisosActivos = avisosData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3) // Solo mostrar los 3 más recientes
        setAvisos(avisosActivos)
      } catch (error) {
        console.error('Error loading avisos:', error)
        setAvisos([])
      }
    }
    loadAvisos()
  }, [])

  // Cargar estadisticas del profesor
  React.useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return
      try {
        setLoadingStats(true)
        const teacherStats = await dashboardService.getTeacherStats(user.id)
        setStats(teacherStats)
      } catch (error) {
        console.error('Error loading teacher stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }
    loadStats()
  }, [user?.id])

  const handleAddTask = async () => {
    if (newTaskText.trim() && !savingTask) {
      setSavingTask(true)
      try {
        await addTeacherTask(newTaskText.trim())
        setNewTaskText('')
        setIsAddingTask(false)
      } catch (error) {
        console.error('Error al agregar tarea:', error)
      } finally {
        setSavingTask(false)
      }
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task.id)
    setEditText(task.description)
  }

  const handleSaveEdit = async () => {
    if (editText.trim() && !savingTask) {
      setSavingTask(true)
      try {
        await updateTeacherTask(editingTask, { description: editText.trim() })
        setEditingTask(null)
        setEditText('')
      } catch (error) {
        console.error('Error al actualizar tarea:', error)
      } finally {
        setSavingTask(false)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setEditText('')
  }

  const handleDeleteTask = async (taskId) => {
    if (!savingTask) {
      setSavingTask(true)
      try {
        await deleteTeacherTask(taskId)
      } catch (error) {
        console.error('Error al eliminar tarea:', error)
      } finally {
        setSavingTask(false)
      }
    }
  }

  const handleToggleCompleted = async (taskId) => {
    if (!savingTask) {
      try {
        await toggleTaskCompleted(taskId)
      } catch (error) {
        console.error('Error al marcar tarea:', error)
      }
    }
  }

  // Get only pending tasks for display
  const pendingTasks = teacherTasks.filter(task => !task.completed)

  // Obtener primer nombre y primer apellido del usuario
  const getDisplayName = () => {
    if (!user) return ''

    const firstName = user.first_name?.split(' ')[0] || ''
    const firstLastName = user.last_names?.split(' ')[0] || ''

    return `${firstName} ${firstLastName}`.trim()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {getDisplayName() || 'Profesor'}
        </h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus clases, estudiantes y evaluaciones
        </p>
      </div>

      {/* Diagrama de flujo visual */}
      <div className="card p-4 bg-gray-50">
        <img
          src={teacherWorkflowSvg}
          alt="Flujo de trabajo docente"
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Mis Cursos', value: loadingStats ? '...' : stats.coursesCount.toString(), icon: BookOpen, color: 'bg-blue-500' },
          { name: 'Estudiantes', value: loadingStats ? '...' : stats.studentsCount.toString(), icon: Users, color: 'bg-green-500' },
          { name: 'Notas Pendientes', value: loadingStats ? '...' : stats.pendingGradesCount.toString(), icon: GraduationCap, color: 'bg-yellow-500' },
          { name: 'Comunicados', value: loadingStats ? '...' : stats.communicationsCount.toString(), icon: MessageSquare, color: 'bg-purple-500' },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center">
                <div className={`${item.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{item.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tasks and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Pendientes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tareas Pendientes
            </h3>
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="mr-1" />
              Agregar
            </button>
          </div>

          <div className="space-y-3">
            {/* Add new task form */}
            {isAddingTask && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Nueva tarea..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                  disabled={savingTask}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  disabled={savingTask}
                  className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                >
                  {savingTask ? (
                    <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsAddingTask(false)
                    setNewTaskText('')
                  }}
                  disabled={savingTask}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Task list */}
            {pendingTasks.map((task) => (
              <div key={task.id} className="group flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => handleToggleCompleted(task.id)}
                    className="w-4 h-4 mr-3 border-2 border-blue-500 rounded hover:bg-blue-50 flex items-center justify-center"
                  >
                    {task.completed && <Check size={12} className="text-blue-600" />}
                  </button>

                  {editingTask === task.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      onBlur={handleSaveEdit}
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.description}
                    </span>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2 transition-opacity">
                  {editingTask === task.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {loadingTasks && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm text-gray-500">Cargando tareas...</span>
              </div>
            )}

            {!loadingTasks && pendingTasks.length === 0 && !isAddingTask && (
              <p className="text-sm text-gray-400 text-center py-4">
                No hay tareas pendientes
              </p>
            )}
          </div>
        </div>

        {/* Avisos Importantes */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Avisos Importantes</h3>
          </div>
          {avisos.length > 0 ? (
            <div className="space-y-4">
              {avisos.map((aviso, index) => (
                <motion.div
                  key={aviso.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{aviso.titulo}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{aviso.contenido}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Bell size={12} />
                      {formatDateSafe(aviso.fechaCreacion)}
                    </span>
                    {aviso.enlace && (
                      <a
                        href={aviso.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver más →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Megaphone className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No hay avisos importantes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherLayout