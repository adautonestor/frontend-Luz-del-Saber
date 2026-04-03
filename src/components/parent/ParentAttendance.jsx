import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Barcode as BarcodeIcon, Users, Calendar, Clock, CheckCircle,
  XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import Barcode from 'react-barcode'
import { useAuthStore } from '../../stores/authStore'
import { studentsService } from '../../services/studentsService'
import { attendanceService } from '../../services/attendanceService'

const ParentAttendance = () => {
  const { user } = useAuthStore()

  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      loadAttendanceRecords()
    }
  }, [selectedChild, selectedMonth, selectedYear])

  const loadChildren = async () => {
    if (!user?.id) return

    try {
      const childrenResponse = await studentsService.getByParent(user.id)
      const childrenData = childrenResponse?.data || childrenResponse || []
      const childrenArray = Array.isArray(childrenData) ? childrenData : []

      setChildren(childrenArray)

      if (childrenArray.length > 0 && !selectedChild) {
        setSelectedChild(childrenArray[0].id)
      }
    } catch (error) {
      console.error('Error loading children:', error)
      setChildren([])
    }
  }

  const loadAttendanceRecords = async () => {
    if (!selectedChild) return

    setIsLoading(true)
    try {
      const records = await attendanceService.getAllRecords({ student_id: selectedChild })
      setAttendanceRecords(Array.isArray(records) ? records : [])
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendanceRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'a_tiempo':
      case 'asistio':
      case 'presente':
        return 'text-green-600 bg-green-100'
      case 'tardanza':
        return 'text-yellow-600 bg-yellow-100'
      case 'falta':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'a_tiempo':
      case 'asistio':
      case 'presente':
        return <CheckCircle className="w-4 h-4" />
      case 'tardanza':
        return <AlertCircle className="w-4 h-4" />
      case 'falta':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'a_tiempo':
        return 'A tiempo'
      case 'asistio':
      case 'presente':
        return 'Asistió'
      case 'tardanza':
        return 'Tardanza'
      case 'falta':
        return 'Falta'
      default:
        return 'Sin registro'
    }
  }

  const selectedChildData = children.find(c => c.id === selectedChild)

  // Calcular estadísticas del mes
  const getMonthlyStats = () => {
    const monthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() + 1 === selectedMonth &&
             recordDate.getFullYear() === selectedYear
    })

    const total = monthRecords.length
    const asistio = monthRecords.filter(r => r.entry_status1 === 'a_tiempo' || r.entry_status1 === 'presente').length
    const tardanzas = monthRecords.filter(r => r.entry_status1 === 'tardanza').length
    const faltas = monthRecords.filter(r => r.entry_status1 === 'falta').length

    return {
      total,
      asistio,
      tardanzas,
      faltas,
      porcentajeAsistencia: total > 0 ? Math.round((asistio / total) * 100) : 0,
      porcentajeTardanzas: total > 0 ? Math.round((tardanzas / total) * 100) : 0,
      porcentajeFaltas: total > 0 ? Math.round((faltas / total) * 100) : 0
    }
  }

  const monthlyStats = getMonthlyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
        <p className="mt-2 text-gray-600">
          Consulta el historial de asistencia de tus hijos
        </p>
      </div>

      {/* Children Tabs */}
      {children.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedChild === child.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{child.paternal_last_name || ''} {child.maternal_last_name || ''}, {child.first_names}{child.last_names ? ` ${child.last_names}` : ''}</div>
                <div className="text-xs opacity-80">{child.gradeName}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedChildData && (
        <>
          {/* Barcode Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Barcode Card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <BarcodeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Código de Barras del Carnet
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedChildData.paternal_last_name || ''} {selectedChildData.maternal_last_name || ''}, {selectedChildData.first_names}{selectedChildData.last_names ? ` ${selectedChildData.last_names}` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedChildData.dni ? (
                  <>
                    <div className="p-6 bg-white border-2 border-gray-300 rounded-lg text-center">
                      <div className="flex justify-center mb-3">
                        <Barcode
                          value={selectedChildData.dni}
                          width={1.5}
                          height={60}
                          fontSize={14}
                          margin={10}
                          displayValue={true}
                        />
                      </div>
                      <p className="text-lg font-medium text-gray-700 mt-2">
                        DNI: {selectedChildData.dni}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Código de barras para asistencia</p>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          Código registrado en el sistema
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        No hay DNI registrado
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Contacta con la administración del colegio
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Instrucciones:
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• El código de barras está impreso en el carnet del estudiante</li>
                    <li>• Al llegar al colegio, el estudiante debe mostrar su carnet</li>
                    <li>• El personal escaneará el código de barras</li>
                    <li>• Se registrará automáticamente la hora de entrada/salida</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Monthly Statistics */}
            {monthlyStats && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Estadísticas del Mes
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="text-sm px-2 py-1 border border-gray-300 rounded"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2024, i).toLocaleDateString('es-PE', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="text-sm px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <CheckCircle size={20} />
                      <span className="text-2xl font-bold">{monthlyStats.asistio || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Asistió</p>
                    <p className="text-xs text-gray-500">{monthlyStats.porcentajeAsistencia || 0}%</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-600 mb-1">
                      <AlertCircle size={20} />
                      <span className="text-2xl font-bold">{monthlyStats.tardanzas || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Tardanzas</p>
                    <p className="text-xs text-gray-500">{monthlyStats.porcentajeTardanzas || 0}%</p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                      <XCircle size={20} />
                      <span className="text-2xl font-bold">{monthlyStats.faltas || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Faltas</p>
                    <p className="text-xs text-gray-500">{monthlyStats.porcentajeFaltas || 0}%</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar size={20} />
                      <span className="text-2xl font-bold">{monthlyStats.total || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Total días</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de Asistencia
              </h3>
              <button
                onClick={() => loadAttendanceRecords()}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <RefreshCw className="mx-auto h-8 w-8 text-gray-400 mb-2 animate-spin" />
                        <p>Cargando registros...</p>
                      </td>
                    </tr>
                  ) : attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p>No hay registros de asistencia aún</p>
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString('es-PE', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {record.entry_time1 ? (
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {new Date(record.entry_time1).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {record.exit_time1 ? (
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-900">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {new Date(record.exit_time1).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(record.entry_status1)
                          }`}>
                            {getStatusIcon(record.entry_status1)}
                            {getStatusText(record.entry_status1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {children.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay estudiantes registrados
          </h3>
          <p className="text-gray-600">
            No se encontraron estudiantes asociados a tu cuenta
          </p>
        </div>
      )}
    </div>
  )
}

export default ParentAttendance
