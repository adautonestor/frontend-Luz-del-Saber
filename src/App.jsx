import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoginPage from './pages/LoginPage'
import AdminLayout from './components/layout/AdminLayout'
import TeacherLayout from './components/layout/TeacherLayout'
import ParentLayout from './components/layout/ParentLayout'
import { useAuthStore } from './stores/authStore'
import useGradingScalesStore from './stores/gradingScalesStore'

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const { loadConfig, isLoaded } = useGradingScalesStore()

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Inicializar store de escalas de calificación cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoaded) {
      loadConfig('active')
    }
  }, [isAuthenticated, isLoaded, loadConfig])

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route 
              path="/login" 
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <LoginPage />
                </motion.div>
              } 
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    )
  }

  const getRoleRoute = () => {
    switch (user?.rol) {
      case 'Director': return '/admin'
      case 'administrador': return '/admin'
      case 'Secretaria': return '/admin'
      case 'Profesor': return '/profesor'
      case 'Padre': return '/padre'
      default: return '/admin'
    }
  }

  return (
    <Router>
      <Routes>
        {/* Redirect login to dashboard if authenticated */}
        <Route 
          path="/login" 
          element={<Navigate to={getRoleRoute()} replace />}
        />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* Teacher Routes */}
        <Route path="/profesor/*" element={<TeacherLayout />} />
        
        {/* Parent Routes */}
        <Route path="/padre/*" element={<ParentLayout />} />

        {/* Root and catch all redirect */}
        <Route path="/" element={<Navigate to={getRoleRoute()} replace />} />
        <Route path="*" element={<Navigate to={getRoleRoute()} replace />} />
      </Routes>
    </Router>
  )
}

export default App