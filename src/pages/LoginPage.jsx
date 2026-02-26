import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useSchoolLogo } from '../hooks/useSchoolLogo'

const LoginPage = () => {
  const { logoUrl, schoolName, address } = useSchoolLogo()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const { login, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!formData.email || !formData.password) {
      return
    }

    try {
      await login(formData)
    } catch (error) {
      // Error is handled in the store
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20">
                <img src={logoUrl} alt={schoolName} className="w-32 h-32 object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {schoolName}
            </h1>
            {address && (
              <p className="text-xl text-white/90 mb-6">
                {address}
              </p>
            )}
            <p className="text-lg text-white/80 max-w-md">
              Sistema integral de gestión escolar para la excelencia educativa
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <img src={logoUrl} alt={schoolName} className="w-24 h-24 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {schoolName}
              </h1>
              <p className="text-gray-600">Sistema de Gestion Escolar</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-gray-600 mb-8">
                Accede a tu cuenta del sistema educativo
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
              >
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="label text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="usuario@luzdelsaber.edu.pe"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label text-gray-700">
                  Contraseña
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Iniciando sesión...
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </motion.button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                © 2024 {schoolName}. Todos los derechos reservados.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage