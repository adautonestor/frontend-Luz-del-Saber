import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Clock, Save, Edit, Check, X, AlertCircle, RefreshCw
} from 'lucide-react'
import { useAttendanceStore } from '../../stores/attendanceStore'
import { useLocation } from 'react-router'
import structureService from '../../services/academic/structureService'

const AttendanceSettings = () => {
  console.log('🚀 AttendanceSettings component mounted')

  const location = useLocation()
  const {
    schedules,
    saveSchedule,
    getScheduleByLevel,
    isLoading
  } = useAttendanceStore()

  const [editingLevel, setEditingLevel] = useState(null)
  const [levels, setLevels] = useState([])
  const [formData, setFormData] = useState({
    nivel: '',
    // Primera entrada (mañana)
    horaEntrada1Inicio: '',
    horaEntrada1Limite: '',
    // Primera salida (medio día)
    horaSalida1Esperada: '',
    // Segunda entrada (tarde - para estudiantes con doble jornada)
    horaEntrada2Inicio: '',
    horaEntrada2Limite: '',
    // Segunda salida (tarde final)
    horaSalida2Esperada: '',
    toleranciaMinutos: 15,
    diasAplicables: [1, 2, 3, 4, 5],
    activo: true
  })

  console.log('📊 Current levels state:', levels)

  // Cargar niveles desde la estructura académica
  const loadLevels = async () => {
    const academicLevels = await structureService.getAllLevels() || []
    console.log('📚 Niveles cargados desde mockDb:', academicLevels)
    const formattedLevels = academicLevels.map(level => ({
      id: level.id,
      name: level.name
    }))
    console.log('✅ Niveles formateados:', formattedLevels)
    setLevels(formattedLevels)
  }

  // Cargar niveles al montar y cuando se navega a esta página
  useEffect(() => {
    loadLevels()
  }, [location.pathname])

  const weekDays = [
    { id: 0, name: 'Dom' },
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' }
  ]

  // Función para obtener colores dinámicos según el índice
  const getLevelColors = (index) => {
    const colors = [
      { bg: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'bg-blue-100', text: 'text-blue-600' },
      { bg: 'bg-green-100', text: 'text-green-600' },
      { bg: 'bg-orange-100', text: 'text-orange-600' },
      { bg: 'bg-pink-100', text: 'text-pink-600' },
      { bg: 'bg-indigo-100', text: 'text-indigo-600' }
    ]
    return colors[index % colors.length]
  }

  const handleEdit = (level) => {
    // Buscar configuración existente para este nivel (ahora sin turno)
    const schedule = schedules.find(s => s.nivel === level.id && s.activo)

    setEditingLevel(level.id)
    setFormData({
      nivel: level.id,
      // Primera entrada
      horaEntrada1Inicio: schedule?.horaEntrada1Inicio || '',
      horaEntrada1Limite: schedule?.horaEntrada1Limite || '',
      // Primera salida
      horaSalida1Esperada: schedule?.horaSalida1Esperada || '',
      // Segunda entrada
      horaEntrada2Inicio: schedule?.horaEntrada2Inicio || '',
      horaEntrada2Limite: schedule?.horaEntrada2Limite || '',
      // Segunda salida
      horaSalida2Esperada: schedule?.horaSalida2Esperada || '',
      toleranciaMinutos: schedule?.toleranciaMinutos || 15,
      diasAplicables: schedule?.diasAplicables || [1, 2, 3, 4, 5],
      activo: true
    })
  }

  const handleCancel = async () => {
    setEditingLevel(null)
    setFormData({
      nivel: '',
      horaEntrada1Inicio: '',
      horaEntrada1Limite: '',
      horaSalida1Esperada: '',
      horaEntrada2Inicio: '',
      horaEntrada2Limite: '',
      horaSalida2Esperada: '',
      toleranciaMinutos: 15,
      diasAplicables: [1, 2, 3, 4, 5],
      activo: true
    })
  }

  const handleSave = async () => {
    try {
      // Buscar configuración existente
      const scheduleExisting = schedules.find(s => s.nivel === formData.nivel)

      // Guardar un solo registro con todos los horarios
      await saveSchedule({
        id: scheduleExisting?.id,
        nivel: formData.nivel,
        horaEntrada1Inicio: formData.horaEntrada1Inicio,
        horaEntrada1Limite: formData.horaEntrada1Limite,
        horaSalida1Esperada: formData.horaSalida1Esperada,
        horaEntrada2Inicio: formData.horaEntrada2Inicio || null,
        horaEntrada2Limite: formData.horaEntrada2Limite || null,
        horaSalida2Esperada: formData.horaSalida2Esperada || null,
        toleranciaMinutos: formData.toleranciaMinutos,
        diasAplicables: formData.diasAplicables,
        activo: true
      })

      handleCancel()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert(error.message || 'Error al guardar configuración')
    }
  }

  const toggleDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      diasAplicables: prev.diasAplicables.includes(dayId)
        ? prev.diasAplicables.filter(d => d !== dayId)
        : [...prev.diasAplicables, dayId].sort()
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Horarios</h1>
          <p className="mt-2 text-gray-600">
            Configura los horarios de entrada y salida por nivel educativo
          </p>
        </div>
        <button
          onClick={loadLevels}
          className="btn btn-outline flex items-center gap-2"
          title="Recargar niveles desde estructura académica"
        >
          <RefreshCw size={18} />
          Actualizar Niveles
        </button>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level, index) => {
          const colors = getLevelColors(index)
          const schedule = schedules.find(s => s.nivel === level.id && s.activo)
          const isEditing = editingLevel === level.id

          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className={`p-4 border-b ${
                isEditing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Clock className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {level.name}
                      </h3>
                    </div>
                  </div>
                  {!isEditing && schedule && (
                    <button
                      onClick={() => handleEdit(level)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                {isEditing ? (
                  <>
                    {/* Editing Form */}
                    <div className="space-y-4">
                      {/* Primera Entrada (Mañana) */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">1ª Entrada (Mañana)</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Hora inicio
                            </label>
                            <input
                              type="time"
                              value={formData.horaEntrada1Inicio}
                              onChange={(e) => setFormData({ ...formData, horaEntrada1Inicio: e.target.value })}
                              className="input w-full text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Límite (tardanza)
                            </label>
                            <input
                              type="time"
                              value={formData.horaEntrada1Limite}
                              onChange={(e) => setFormData({ ...formData, horaEntrada1Limite: e.target.value })}
                              className="input w-full text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Primera Salida (Medio día) */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">1ª Salida (Medio día)</h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Hora esperada
                          </label>
                          <input
                            type="time"
                            value={formData.horaSalida1Esperada}
                            onChange={(e) => setFormData({ ...formData, horaSalida1Esperada: e.target.value })}
                            className="input w-full text-sm"
                          />
                        </div>
                      </div>

                      {/* Segunda Entrada y Salida - Solo para primaria y secundaria */}
                      {level.id !== 'inicial' && (
                        <>
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">2ª Entrada (Tarde - doble jornada)</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Hora inicio
                                </label>
                                <input
                                  type="time"
                                  value={formData.horaEntrada2Inicio}
                                  onChange={(e) => setFormData({ ...formData, horaEntrada2Inicio: e.target.value })}
                                  className="input w-full text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Límite (tardanza)
                                </label>
                                <input
                                  type="time"
                                  value={formData.horaEntrada2Limite}
                                  onChange={(e) => setFormData({ ...formData, horaEntrada2Limite: e.target.value })}
                                  className="input w-full text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">2ª Salida (Tarde final)</h4>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Hora esperada
                              </label>
                              <input
                                type="time"
                                value={formData.horaSalida2Esperada}
                                onChange={(e) => setFormData({ ...formData, horaSalida2Esperada: e.target.value })}
                                className="input w-full text-sm"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Tolerancia */}
                      <div className="border-t border-gray-200 pt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tolerancia (minutos)
                        </label>
                        <input
                          type="number"
                          value={formData.toleranciaMinutos}
                          onChange={(e) => setFormData({ ...formData, toleranciaMinutos: Number(e.target.value) })}
                          min="0"
                          max="60"
                          className="input w-full"
                        />
                      </div>

                      {/* Días aplicables */}
                      <div className="border-t border-gray-200 pt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días aplicables
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {weekDays.map(day => (
                            <button
                              key={day.id}
                              onClick={() => toggleDay(day.id)}
                              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                formData.diasAplicables.includes(day.id)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {day.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleCancel}
                        className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                      >
                        <Save size={18} />
                        {isLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </>
                ) : schedule ? (
                  <>
                    {/* Display Mode */}
                    <div className="space-y-3">
                      {/* Primera Entrada y Salida */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">1ª Entrada</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {schedule.horaEntrada1Inicio} - {schedule.horaEntrada1Limite}
                          </p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600 mb-1">1ª Salida</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {schedule.horaSalida1Esperada}
                          </p>
                        </div>
                      </div>

                      {/* Segunda Entrada y Salida - Solo si existe */}
                      {schedule.horaEntrada2Inicio && (
                        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
                          <div className="bg-orange-50 p-2 rounded">
                            <p className="text-xs text-gray-600 mb-1">2ª Entrada</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {schedule.horaEntrada2Inicio} - {schedule.horaEntrada2Limite}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <p className="text-xs text-gray-600 mb-1">2ª Salida</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {schedule.horaSalida2Esperada}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tolerancia */}
                      <div className="border-t border-gray-200 pt-2">
                        <p className="text-xs text-gray-500">Tolerancia</p>
                        <p className="text-sm text-gray-900">
                          {schedule.toleranciaMinutos} minutos
                        </p>
                      </div>

                      {/* Días aplicables */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Días aplicables</p>
                        <div className="flex gap-1 flex-wrap">
                          {schedule.diasAplicables?.map(dayId => (
                            <span
                              key={dayId}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {weekDays.find(d => d.id === dayId)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      No hay configuración de horarios
                    </p>
                    <button
                      onClick={() => {
                        const defaults = level.id === 'inicial'
                          ? { entrada1Inicio: '08:00', entrada1Limite: '08:30', salida1: '12:00',
                              entrada2Inicio: '', entrada2Limite: '', salida2: '' }
                          : level.id === 'primaria'
                            ? { entrada1Inicio: '07:45', entrada1Limite: '08:00', salida1: '13:00',
                                entrada2Inicio: '13:30', entrada2Limite: '14:00', salida2: '17:00' }
                            : { entrada1Inicio: '07:30', entrada1Limite: '07:45', salida1: '13:00',
                                entrada2Inicio: '13:30', entrada2Limite: '14:00', salida2: '17:00' }

                        setEditingLevel(level.id)
                        setFormData({
                          nivel: level.id,
                          horaEntrada1Inicio: defaults.entrada1Inicio,
                          horaEntrada1Limite: defaults.entrada1Limite,
                          horaSalida1Esperada: defaults.salida1,
                          horaEntrada2Inicio: defaults.entrada2Inicio,
                          horaEntrada2Limite: defaults.entrada2Limite,
                          horaSalida2Esperada: defaults.salida2,
                          toleranciaMinutos: 15,
                          diasAplicables: [1, 2, 3, 4, 5],
                          activo: true
                        })
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Configurar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Information */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Sistema de doble jornada - 4 registros diarios:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>1ª Entrada (mañana):</strong> Todos los estudiantes registran llegada por la mañana</li>
              <li>• <strong>1ª Salida (medio día):</strong> Todos los estudiantes salen a casa para almorzar</li>
              <li>• <strong>2ª Entrada (tarde):</strong> Solo estudiantes con doble jornada regresan por la tarde</li>
              <li>• <strong>2ª Salida (tarde):</strong> Salida final de estudiantes con doble jornada</li>
              <li>• Los estudiantes con doble jornada deben estar marcados en su perfil de estudiante</li>
              <li>• La configuración es por nivel educativo (Inicial, Primaria, Secundaria)</li>
              <li>• Usa el botón "Actualizar Niveles" si no ves un nivel recién creado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceSettings
