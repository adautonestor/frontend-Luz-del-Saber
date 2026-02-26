import React from 'react'
import { motion } from 'framer-motion'
import { Users, GraduationCap, DollarSign, MessageSquare } from 'lucide-react'

/**
 * Tarjetas de estadísticas del dashboard
 * Recibe datos dinámicos calculados desde los hijos del padre
 * @param {Object} props
 * @param {number} props.hijosMatriculados - Cantidad de hijos matriculados
 * @param {number|string} props.promedioGeneral - Promedio general de todos los hijos
 * @param {number} props.pagosPendientes - Total de pagos pendientes
 * @param {number} props.comunicadosNoLeidos - Comunicados sin leer
 */
const DashboardStatsCards = ({
  hijosMatriculados = 0,
  promedioGeneral = 0,
  pagosPendientes = 0,
  comunicadosNoLeidos = 0
}) => {
  // Formatear promedio para mostrar
  const formatPromedio = (promedio) => {
    if (promedio === 0 || promedio === '0' || !promedio) return '-'
    const num = parseFloat(promedio)
    return isNaN(num) ? '-' : num.toFixed(1)
  }

  const stats = [
    {
      name: 'Hijos Matriculados',
      value: hijosMatriculados.toString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      name: 'Promedio General',
      value: formatPromedio(promedioGeneral),
      icon: GraduationCap,
      color: 'bg-blue-500'
    },
    {
      name: 'Pagos Pendientes',
      value: pagosPendientes.toString(),
      icon: DollarSign,
      color: pagosPendientes > 0 ? 'bg-red-500' : 'bg-green-500'
    },
    {
      name: 'Comunicados No Leídos',
      value: comunicadosNoLeidos.toString(),
      icon: MessageSquare,
      color: comunicadosNoLeidos > 0 ? 'bg-purple-500' : 'bg-gray-400'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((item, index) => {
        const Icon = item.icon
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
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
  )
}

export default DashboardStatsCards
