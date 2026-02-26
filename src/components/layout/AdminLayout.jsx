import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Users, GraduationCap, CreditCard, MessageSquare,
  Settings, LogOut, Menu, X,
  UserPlus, BookOpen, DollarSign, BarChart3, FileText, Clock, CheckSquare, Upload, Barcode, Megaphone, Calendar, Brain, Eye, Edit2
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { dashboardService } from '../../services/dashboardService'
import { useSchoolLogo } from '../../hooks/useSchoolLogo'
import NotificationsDropdown from '../common/NotificationsDropdown'
import adminWorkflowSvg from '../../config/admin.svg'
import secretariaWorkflowSvg from '../../config/secretaria.svg'
import EnrollmentPage from '../../pages/admin/EnrollmentPage'
import UsersPage from '../../pages/admin/UsersPage'
import AcademicStructurePage from '../../pages/admin/AcademicStructurePage'
import EvaluationRubricsPage from '../../pages/admin/EvaluationRubricsPage'
import ScheduleManagementPage from '../../pages/admin/ScheduleManagementPage'
import PaymentsPage from '../../pages/admin/PaymentsPage'
import PaymentManagementPage from '../../pages/admin/PaymentManagementPage'
import CommunicationsPage from '../../pages/admin/CommunicationsPage'
import AvisosPage from '../../pages/admin/AvisosPage'
import ReportsPage from '../../pages/admin/ReportsPage'
import ReportCardVisibilityPage from '../../pages/admin/ReportCardVisibilityPage'
import GradesManagementPage from '../../pages/admin/GradesManagementPage'
import SettingsPage from '../../pages/admin/SettingsPage'
import StudentsManagementPage from '../../pages/admin/StudentsManagementPage'
import DocumentsPage from '../../pages/admin/DocumentsPage'
import AttendanceScannerPage from '../../pages/admin/AttendanceScannerPage'
import StudentCardsGenerator from '../../pages/admin/StudentCardsGenerator'
import PsychologicalReportsPage from '../../pages/admin/PsychologicalReportsPage'
import FinalReportCardsPage from '../../pages/admin/FinalReportCardsPage'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { user, logout } = useAuthStore()
  const { initialize } = useCommunicationsStore()
  const location = useLocation()
  const { logoUrl, schoolName } = useSchoolLogo()

  // Inicializar communications store
  React.useEffect(() => {
    initialize()
  }, [initialize])

  const isSecretary = user?.rol === 'Secretaria'

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, exact: true },
    { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
    ...((user?.rol === 'Director' || user?.rol === 'Secretaria') ? [{ name: 'Estudiantes', href: '/admin/estudiantes', icon: GraduationCap }] : []),
    { name: 'Matrícula', href: '/admin/matricula', icon: UserPlus },
    { name: 'Estructura Académica', href: '/admin/estructura', icon: BookOpen },
    { name: 'Rubricas de Evaluación', href: '/admin/rubricas', icon: CheckSquare },
    { name: 'Gestión de Horarios', href: '/admin/horarios', icon: Clock },
    { name: 'Visibilidad de Boletas', href: '/admin/visibilidad-boletas', icon: Eye },
    { name: 'Boletas Finales', href: '/admin/boletas-finales', icon: FileText },
    { name: 'Informes Psicológicos', href: '/admin/informes-psicologicos', icon: Brain },
    { name: 'Asistencia', href: '/admin/asistencia', icon: Barcode },
    { name: 'Pagos', href: '/admin/pagos', icon: CreditCard },
    { name: 'Comunicados', href: '/admin/comunicados', icon: MessageSquare },
    { name: 'Avisos', href: '/admin/avisos', icon: Megaphone },
    { name: 'Documentos', href: '/admin/documentos', icon: Upload },
    ...(user?.rol !== 'Secretaria' ? [{ name: 'Reportes', href: '/admin/reportes', icon: BarChart3 }] : []),
    ...(user?.rol !== 'Secretaria' ? [{ name: 'Configuración', href: '/admin/configuracion', icon: Settings }] : []),
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
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-2 shadow-md">
            <img
              src={logoUrl}
              alt={schoolName}
              className="h-12 w-auto object-contain"
            />
          </div>
          {isSecretary && <span className="ml-2 text-sm text-gray-600">(Secretaria)</span>}
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
                        ? 'bg-primary-100 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActive(item.href, item.exact) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
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
                  linkTo="/admin/comunicados"
                  themeColor="primary"
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
                <Route index element={<AdminDashboard />} />
                <Route path="usuarios/*" element={<UsersPage />} />
                <Route path="estudiantes/*" element={<StudentsManagementPage />} />
                <Route path="matricula/*" element={<EnrollmentPage />} />
                <Route path="estructura/*" element={<AcademicStructurePage />} />
                <Route path="rubricas/*" element={<EvaluationRubricsPage />} />
                <Route path="horarios/*" element={<ScheduleManagementPage />} />
                <Route path="notas/*" element={<GradesManagementPage />} />
                <Route path="visibilidad-boletas/*" element={<ReportCardVisibilityPage />} />
                <Route path="boletas-finales/*" element={<FinalReportCardsPage />} />
                <Route path="informes-psicologicos/*" element={<PsychologicalReportsPage />} />
                <Route path="asistencia" element={<AttendanceScannerPage />} />
                <Route path="asistencia/carnets" element={<StudentCardsGenerator />} />
                <Route path="pagos/*" element={<PaymentsPage />} />
                <Route path="comunicados/*" element={<CommunicationsPage />} />
                <Route path="avisos/*" element={<AvisosPage />} />
                <Route path="documentos/*" element={<DocumentsPage />} />
                <Route path="reportes/*" element={<ReportsPage />} />
                <Route path="configuracion/*" element={<SettingsPage />} />
              </Routes>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Dynamic Dashboard Component with Real Metrics
const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadDashboardData = React.useCallback(async () => {
      try {
        // Get dashboard stats from API
        const stats = await dashboardService.getStats()

        setDashboardData({
          activeStudents: stats.activeStudents,
          activeTeachers: stats.activeTeachers,
          monthlyIncome: stats.monthlyIncome,
          monthlyComms: stats.monthlyComms,
          overduePayments: stats.overduePayments?.count || 0,
          recentActivity: stats.recentActivity || [],
          upcomingMeetings: stats.upcomingMeetings || [],
          pendingPayments: stats.pendingPayments || 0,
          completedPayments: stats.completedPayments || 0
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isSecretary = user?.rol === 'Secretaria'

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
          Bienvenido, {getDisplayName() || (isSecretary ? 'Secretaria' : 'Director')}
        </h1>
        <p className="mt-2 text-gray-600">
          Sistema de gestión escolar - Colegio Luz del Saber
        </p>
      </div>

      {/* Diagrama de flujo visual */}
      <div className="card p-4 bg-gray-50">
        <img
          src={isSecretary ? secretariaWorkflowSvg : adminWorkflowSvg}
          alt={isSecretary ? "Flujo de trabajo de secretaría" : "Flujo de trabajo administrativo"}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            name: 'Estudiantes Activos', 
            value: dashboardData?.activeStudents?.toString() || '0', 
            icon: GraduationCap, 
            color: 'bg-blue-500' 
          },
          { 
            name: 'Docentes Activos', 
            value: dashboardData?.activeTeachers?.toString() || '0', 
            icon: Users, 
            color: 'bg-green-500' 
          },
          { 
            name: 'Ingresos del Mes', 
            value: `S/ ${dashboardData?.monthlyIncome?.toLocaleString() || '0'}`, 
            icon: DollarSign, 
            color: 'bg-yellow-500' 
          },
          { 
            name: 'Comunicados Enviados', 
            value: dashboardData?.monthlyComms?.toString() || '0', 
            icon: MessageSquare, 
            color: 'bg-purple-500' 
          },
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => {
                const getActivityColor = (tipo) => {
                  switch (tipo) {
                    case 'matricula': return 'bg-blue-500'
                    case 'pago': return 'bg-green-500'
                    case 'comunicado': return 'bg-purple-500'
                    case 'aviso': return 'bg-yellow-500'
                    default: return 'bg-gray-500'
                  }
                }
                const getActivityLabel = (tipo) => {
                  switch (tipo) {
                    case 'matricula': return 'Matrícula:'
                    case 'pago': return 'Pago recibido:'
                    case 'comunicado': return 'Comunicado:'
                    case 'aviso': return 'Aviso:'
                    default: return ''
                  }
                }
                return (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className={`w-2 h-2 ${getActivityColor(activity.tipo)} rounded-full mr-3`} />
                    <span className="font-medium mr-1">{getActivityLabel(activity.tipo)}</span>
                    {activity.descripcion}
                  </div>
                )
              })
            ) : (
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-3" />
                No hay actividad reciente
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>
          <div className="space-y-3">
            {dashboardData?.overduePayments > 0 && (
              <div className="text-sm text-red-600 flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-3" />
                {dashboardData.overduePayments} pagos vencidos requieren seguimiento
              </div>
            )}
            {dashboardData?.pendingPayments > 0 && (
              <div className="text-sm text-yellow-600 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                {dashboardData.pendingPayments} pagos pendientes por vencer
              </div>
            )}
            {dashboardData?.completedPayments > 0 && (
              <div className="text-sm text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                {dashboardData.completedPayments} pagos completados
              </div>
            )}
            <div className="text-sm text-blue-600 flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
              {dashboardData?.activeStudents || 0} estudiantes activos en el sistema
            </div>
            <div className="text-sm text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
              {dashboardData?.activeTeachers || 0} docentes activos
            </div>
            <div className="text-sm text-purple-600 flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
              {dashboardData?.monthlyComms || 0} comunicados enviados este año
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout