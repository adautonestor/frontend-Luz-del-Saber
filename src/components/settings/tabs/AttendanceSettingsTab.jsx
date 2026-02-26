import React, { useState, useEffect } from 'react'
import { Clock, Save, RefreshCw, AlertCircle, Plus, Sun, Moon } from 'lucide-react'
import attendanceSchedulesService from '../../../services/attendanceSchedulesService'

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lun', fullName: 'Lunes' },
  { id: 2, name: 'Mar', fullName: 'Martes' },
  { id: 3, name: 'Mie', fullName: 'Miércoles' },
  { id: 4, name: 'Jue', fullName: 'Jueves' },
  { id: 5, name: 'Vie', fullName: 'Viernes' },
  { id: 6, name: 'Sab', fullName: 'Sábado' },
  { id: 7, name: 'Dom', fullName: 'Domingo' }
]

/**
 * Tab de configuración de horarios de asistencia
 * Usa la tabla attendance_schedules con level_id
 */
const AttendanceSettingsTab = ({ levels }) => {
  const [schedules, setSchedules] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('success')

  // Colores para cada nivel
  const colors = [
    { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600', textDark: 'text-purple-900' },
    { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-600', textDark: 'text-blue-900' },
    { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-600', textDark: 'text-green-900' },
    { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', textDark: 'text-orange-900' }
  ]

  // Cargar horarios al montar
  useEffect(() => {
    if (levels && levels.length > 0) {
      loadSchedules()
    } else {
      setIsLoading(false)
    }
  }, [levels])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const data = await attendanceSchedulesService.getAll()

      // Convertir array a objeto indexado por level_id Y por level_code (cross-year)
      const schedulesMap = {}
      const schedulesByCode = {}
      data.forEach(schedule => {
        const scheduleData = {
          id: schedule.id,
          level_id: schedule.level_id,
          level_name: schedule.level_name,
          level_code: schedule.level_code,
          entry1_start_time: formatTimeForInput(schedule.entry1_start_time),
          entry1_limit_time: formatTimeForInput(schedule.entry1_limit_time),
          exit1_expected_time: formatTimeForInput(schedule.exit1_expected_time),
          entry2_start_time: formatTimeForInput(schedule.entry2_start_time),
          entry2_limit_time: formatTimeForInput(schedule.entry2_limit_time),
          exit2_expected_time: formatTimeForInput(schedule.exit2_expected_time),
          tolerance_minutes: schedule.tolerance_minutes || 15,
          applicable_days: schedule.applicable_days || [1, 2, 3, 4, 5],
          hasSecondShift: !!schedule.entry2_start_time
        }
        schedulesMap[schedule.level_id] = scheduleData
        // Indexar por código para fallback cross-year
        if (schedule.level_code) {
          schedulesByCode[schedule.level_code] = scheduleData
        }
      })

      // Inicializar niveles del año actual
      // Si no hay horario exacto por level_id, buscar por código de nivel (cross-year)
      levels.forEach(level => {
        if (!schedulesMap[level.id]) {
          const crossYearSchedule = level.code && schedulesByCode[level.code]
          if (crossYearSchedule) {
            // Heredar config de año anterior con el level_id del año actual
            schedulesMap[level.id] = {
              ...crossYearSchedule,
              id: undefined,
              level_id: level.id
            }
          } else {
            schedulesMap[level.id] = getDefaultSchedule(level.id)
          }
        }
      })

      setSchedules(schedulesMap)
    } catch (error) {
      console.error('Error cargando horarios:', error)
      showAlertMessage('Error al cargar horarios', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeForInput = (time) => {
    if (!time) return ''
    // Si viene como "HH:MM:SS", tomar solo "HH:MM"
    return time.substring(0, 5)
  }

  const getDefaultSchedule = (levelId) => ({
    level_id: levelId,
    entry1_start_time: '08:00',
    entry1_limit_time: '08:15',
    exit1_expected_time: '13:00',
    entry2_start_time: '',
    entry2_limit_time: '',
    exit2_expected_time: '',
    tolerance_minutes: 15,
    applicable_days: [1, 2, 3, 4, 5],
    hasSecondShift: false
  })

  const updateSchedule = (levelId, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [levelId]: {
        ...prev[levelId],
        [field]: value
      }
    }))
  }

  const toggleDay = (levelId, dayId) => {
    setSchedules(prev => {
      const currentDays = prev[levelId]?.applicable_days || []
      const newDays = currentDays.includes(dayId)
        ? currentDays.filter(d => d !== dayId)
        : [...currentDays, dayId].sort((a, b) => a - b)

      return {
        ...prev,
        [levelId]: {
          ...prev[levelId],
          applicable_days: newDays
        }
      }
    })
  }

  const toggleSecondShift = (levelId) => {
    setSchedules(prev => {
      const hasSecondShift = !prev[levelId]?.hasSecondShift
      return {
        ...prev,
        [levelId]: {
          ...prev[levelId],
          hasSecondShift,
          // Limpiar campos del segundo turno si se desactiva
          entry2_start_time: hasSecondShift ? prev[levelId]?.entry2_start_time || '' : '',
          entry2_limit_time: hasSecondShift ? prev[levelId]?.entry2_limit_time || '' : '',
          exit2_expected_time: hasSecondShift ? prev[levelId]?.exit2_expected_time || '' : ''
        }
      }
    })
  }

  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Preparar datos para guardar
      const schedulesToSave = Object.values(schedules)
        .filter(s => s.entry1_start_time && s.entry1_limit_time && s.exit1_expected_time)
        .map(s => ({
          level_id: s.level_id,
          entry1_start_time: s.entry1_start_time,
          entry1_limit_time: s.entry1_limit_time,
          exit1_expected_time: s.exit1_expected_time,
          entry2_start_time: s.hasSecondShift ? s.entry2_start_time : null,
          entry2_limit_time: s.hasSecondShift ? s.entry2_limit_time : null,
          exit2_expected_time: s.hasSecondShift ? s.exit2_expected_time : null,
          tolerance_minutes: s.tolerance_minutes || 15,
          applicable_days: s.applicable_days || [1, 2, 3, 4, 5]
        }))

      await attendanceSchedulesService.saveAll(schedulesToSave)
      showAlertMessage('Horarios guardados exitosamente')

      // Recargar para obtener IDs actualizados
      await loadSchedules()
    } catch (error) {
      console.error('Error guardando horarios:', error)
      showAlertMessage('Error al guardar horarios', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <RefreshCw className="animate-spin mr-2" size={20} />
        <span>Cargando horarios...</span>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-2">Configuración de Horarios de Asistencia</h3>
      <p className="text-sm text-gray-600 mb-6">
        Configura los horarios de entrada, salida y tolerancia para cada nivel educativo
      </p>

      {/* Alert */}
      {showAlert && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center ${
          alertType === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <AlertCircle className="mr-2" size={20} />
          {alertMessage}
        </div>
      )}

      <div className="space-y-6">
        {levels.map((level, index) => {
          const color = colors[index % colors.length]
          const schedule = schedules[level.id] || getDefaultSchedule(level.id)

          return (
            <div key={level.id} className={`border-2 ${color.border} rounded-lg p-4 ${color.bg}`}>
              {/* Header del nivel */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className={color.text} size={20} />
                  <h4 className={`font-semibold ${color.textDark}`}>Nivel {level.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSecondShift(level.id)}
                  className={`text-sm px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
                    schedule.hasSecondShift
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {schedule.hasSecondShift ? (
                    <>
                      <Moon size={14} />
                      Turno tarde activo
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Agregar turno tarde
                    </>
                  )}
                </button>
              </div>

              {/* Turno Mañana */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={16} className={color.text} />
                  <span className="text-sm font-medium text-gray-700">Turno Mañana</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label text-sm font-semibold">Hora Inicio Entrada</label>
                    <input
                      type="time"
                      className="input"
                      value={schedule.entry1_start_time || ''}
                      onChange={(e) => updateSchedule(level.id, 'entry1_start_time', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Desde esta hora pueden entrar</p>
                  </div>
                  <div>
                    <label className="label text-sm font-semibold">Hora Límite Entrada</label>
                    <input
                      type="time"
                      className="input"
                      value={schedule.entry1_limit_time || ''}
                      onChange={(e) => updateSchedule(level.id, 'entry1_limit_time', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Después de esta hora = tardanza</p>
                  </div>
                  <div>
                    <label className="label text-sm font-semibold">Hora Salida</label>
                    <input
                      type="time"
                      className="input"
                      value={schedule.exit1_expected_time || ''}
                      onChange={(e) => updateSchedule(level.id, 'exit1_expected_time', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Hora de fin de clases</p>
                  </div>
                </div>
              </div>

              {/* Turno Tarde (opcional) */}
              {schedule.hasSecondShift && (
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon size={16} className={color.text} />
                    <span className="text-sm font-medium text-gray-700">Turno Tarde</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label text-sm font-semibold">Hora Inicio Entrada</label>
                      <input
                        type="time"
                        className="input"
                        value={schedule.entry2_start_time || ''}
                        onChange={(e) => updateSchedule(level.id, 'entry2_start_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-sm font-semibold">Hora Límite Entrada</label>
                      <input
                        type="time"
                        className="input"
                        value={schedule.entry2_limit_time || ''}
                        onChange={(e) => updateSchedule(level.id, 'entry2_limit_time', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label text-sm font-semibold">Hora Salida</label>
                      <input
                        type="time"
                        className="input"
                        value={schedule.exit2_expected_time || ''}
                        onChange={(e) => updateSchedule(level.id, 'exit2_expected_time', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tolerancia y Días */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="label text-sm font-semibold">Tolerancia (minutos)</label>
                  <input
                    type="number"
                    className="input w-32"
                    min="0"
                    max="60"
                    value={schedule.tolerance_minutes || 15}
                    onChange={(e) => updateSchedule(level.id, 'tolerance_minutes', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minutos de gracia adicionales</p>
                </div>
                <div>
                  <label className="label text-sm font-semibold mb-2">Días Aplicables</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(level.id, day.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          (schedule.applicable_days || []).includes(day.id)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={day.fullName}
                      >
                        {day.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Información */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">¿Cómo funciona?</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Hora Inicio Entrada:</strong> Desde esta hora el estudiante puede registrar su entrada</li>
              <li>• <strong>Hora Límite Entrada:</strong> Después de esta hora se marca como <strong>tardanza</strong></li>
              <li>• <strong>Tolerancia:</strong> Minutos adicionales de gracia sobre la hora límite</li>
              <li>• Puedes configurar un segundo turno (tarde) si el nivel lo requiere</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary px-6 py-2 flex items-center gap-2"
        >
          {isSaving ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  )
}

export default AttendanceSettingsTab
