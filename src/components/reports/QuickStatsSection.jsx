import React, { useState, useEffect } from 'react'
import { reportsService } from '../../services/reportsService'

/**
 * Sección de estadísticas rápidas de reportes
 * Muestra estadísticas generales del sistema educativo
 */
const QuickStatsSection = ({ academicYear }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const response = await reportsService.getGeneralStats(academicYear)
        setStats(response.data || response)
        setError(null)
      } catch (err) {
        console.error('Error loading general stats:', err)
        setError('Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [academicYear])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Estadísticas de Estudiantes */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          Estudiantes
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Activos</span>
            <span className="text-sm font-semibold text-gray-900">{stats?.students?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Matriculados</span>
            <span className="text-sm font-semibold text-green-600">{stats?.students?.enrolled || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasa de Matrícula</span>
            <span className="text-sm font-semibold text-blue-600">{stats?.students?.enrollmentRate || '0%'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Secciones</span>
            <span className="text-sm font-semibold text-gray-900">{stats?.students?.sections || 0}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Académicas */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          Académico
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Docentes</span>
            <span className="text-sm font-semibold text-gray-900">{stats?.academic?.teachers || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cursos Activos</span>
            <span className="text-sm font-semibold text-gray-900">{stats?.academic?.courses || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Notas Registradas</span>
            <span className="text-sm font-semibold text-purple-600">{stats?.academic?.gradesRegistered || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Promedio General</span>
            <span className="text-sm font-semibold text-blue-600">{stats?.academic?.averageGrade || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Financieras */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Finanzas
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total por Cobrar</span>
            <span className="text-sm font-semibold text-gray-900">S/ {stats?.financial?.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cobrado</span>
            <span className="text-sm font-semibold text-green-600">S/ {stats?.financial?.totalPaid?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pendiente</span>
            <span className="text-sm font-semibold text-orange-600">S/ {stats?.financial?.totalPending?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tasa de Cobranza</span>
            <span className="text-sm font-semibold text-blue-600">{stats?.financial?.collectionRate || '0%'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickStatsSection
