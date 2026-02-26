import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { hasHighPriorityUnread } from '../../utils/parentDashboardHelpers'
import { PARENT_NAVIGATION } from '../../config/parentLayoutConstants'
import { useSchoolLogo } from '../../hooks/useSchoolLogo'
import ParentDashboard from '../parent/ParentDashboard'
import ParentChildren from '../parent/ParentChildren'
import StudentDetailPage from '../parent/StudentDetailPage'
import ParentGrades from '../parent/ParentGrades'
import FamilyPaymentSchedule from '../parent/FamilyPaymentSchedule'
import ParentCommunications from '../parent/ParentCommunications'
import ParentAvisos from '../parent/ParentAvisos'
import ParentProfile from '../parent/ParentProfile'
import ParentDocuments from '../parent/ParentDocuments'
import ParentAttendance from '../parent/ParentAttendance'
import BoletaNotas from '../parent/BoletaNotas'
import ParentPsychologicalReports from '../parent/ParentPsychologicalReports'
import ParentHorarios from '../parent/ParentHorarios'
import HighPriorityMessagePopup from '../common/HighPriorityMessagePopup'
import UrgentCommunicationModal from '../common/UrgentCommunicationModal'
import NotificationsDropdown from '../common/NotificationsDropdown'

/**
 * Layout principal para el portal de padres
 */
const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [showHighPriorityPopup, setShowHighPriorityPopup] = React.useState(false)
  const { user, logout } = useAuthStore()
  const { initialize, getUserCommunications, markAsRead } = useCommunicationsStore()
  const location = useLocation()
  const { logoUrl, schoolName } = useSchoolLogo()

  // Obtener primer nombre y primer apellido del usuario
  const getDisplayName = () => {
    if (!user) return ''

    const firstName = user.first_name?.split(' ')[0] || ''
    const firstLastName = user.last_names?.split(' ')[0] || ''

    return `${firstName} ${firstLastName}`.trim()
  }

  // Initialize communications store on mount
  React.useEffect(() => {
    initialize()
  }, [initialize])

  // Check for high priority unread messages on mount
  React.useEffect(() => {
    if (user?.id) {
      const userCommunications = getUserCommunications(user.id)
      if (hasHighPriorityUnread(userCommunications)) {
        setShowHighPriorityPopup(true)
      }
    }
  }, [user?.id, getUserCommunications])

  const isActive = (href, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleClosePopup = () => {
    setShowHighPriorityPopup(false)
  }

  const handleMarkAsRead = async (communicationId, userId) => {
    await markAsRead(communicationId, userId)
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
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2 shadow-md">
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
            {PARENT_NAVIGATION.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive(item.href, item.exact)
                        ? 'bg-green-100 text-green-600 border-r-2 border-green-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActive(item.href, item.exact) ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'
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
              <p className="text-xs text-gray-500 capitalize">
                Padre de Familia
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
                  linkTo="/padre/comunicados"
                  themeColor="green"
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
                <Route index element={<ParentDashboard />} />
                <Route path="hijos" element={<ParentChildren />} />
                <Route path="hijos/:studentCode" element={<StudentDetailPage />} />
                <Route path="notas/*" element={<ParentGrades />} />
                <Route path="asistencia/*" element={<ParentAttendance />} />
                <Route path="informes-psicologicos/*" element={<ParentPsychologicalReports />} />
                <Route path="pagos/*" element={<FamilyPaymentSchedule />} />
                <Route path="comunicados/*" element={<ParentCommunications />} />
                <Route path="avisos/*" element={<ParentAvisos />} />
                <Route path="horarios/*" element={<ParentHorarios />} />
                <Route path="documentos/*" element={<ParentDocuments />} />
                <Route path="boletas/*" element={<BoletaNotas />} />
                <Route path="perfil/*" element={<ParentProfile />} />
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

      {/* Urgent Communication Modal */}
      <UrgentCommunicationModal />
    </div>
  )
}

export default ParentLayout
