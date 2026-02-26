import { useState, useEffect, useCallback } from 'react'
import { useAcademicStore } from '../stores/academicStore'
import { usePaymentsStore } from '../stores/paymentsStore'
import * as settingsService from '../services/settingsService'
import { getFileUrl, getBackendUrl } from '../services/api'

/**
 * Hook para gestionar todos los settings del sistema
 * Conecta con la API /api/system-settings para persistir en BD
 */
export const useSettingsData = () => {
  const academicStore = useAcademicStore()
  const paymentsStore = usePaymentsStore()

  // Estado inicial con valores por defecto
  const [settings, setSettings] = useState({
    general: {
      schoolName: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logoPath: null,
      logoUrl: null,
      ruc: '',
      ugel: ''
    },
    attendance: {
      inicial: {
        entryTime: '',
        exitTime: '',
        toleranceMinutes: 0
      },
      primaria: {
        entryTime: '',
        exitTime: '',
        toleranceMinutes: 0
      },
      secundaria: {
        entryTime: '',
        exitTime: '',
        toleranceMinutes: 0
      }
    },
    academic: {
      // @deprecated Los gradingSystems aquí son valores por defecto de fallback.
      // La configuración principal de escalas de calificación se gestiona ahora desde:
      // - API: /api/system-settings/grading-scales
      // - Hook: useGradingScales()
      // - Servicio: services/gradingScalesService.js
      // Estos valores se mantienen solo por retrocompatibilidad.
      gradingSystems: {
        inicial: {
          type: 'letters',
          scale: ['A', 'B', 'C', 'D'],
          descriptions: {
            'A': 'Logro destacado',
            'B': 'Logro esperado',
            'C': 'En proceso',
            'D': 'En inicio'
          },
          passingGrade: 'B',
          // Valores numéricos consistentes: A=4, B=3, C=2, D=1
          numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
        },
        primaria: {
          type: 'letters',
          scale: ['A', 'B', 'C', 'D'],
          descriptions: {
            'A': 'Logro destacado',
            'B': 'Logro esperado',
            'C': 'En proceso',
            'D': 'En inicio'
          },
          passingGrade: 'B',
          // Valores numéricos consistentes: A=4, B=3, C=2, D=1
          numericValues: { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
        },
        secundaria: {
          type: 'numeric',
          scale: { min: 0, max: 20 },
          passingGrade: 11,
          descriptions: {
            '18-20': 'Logro destacado',
            '14-17': 'Logro esperado',
            '11-13': 'En proceso',
            '0-10': 'En inicio'
          }
        }
      }
    },
    payment: {
      currency: 'PEN',
      monthlyDueDate: 5,
      lateFeePercentage: 5,
      minPartialPayment: 50,
      paymentReminders: true,
      reminderDays: [5, 3, 1],
      moraEnabled: true,
      moraDiaria: 0.80,
      moraMaxima: 24.00,
      diasMaximosMora: 30
    },
    notifications: {
      smsEnabled: true,
      pushEnabled: true,
      notifyGrades: true,
      notifyPayments: true,
      notifyAttendance: true,
      notifyAnnouncements: true,
      smsProvider: 'twilio',
      smsApiKey: '',
      smsPhoneNumber: '',
      pushProvider: 'firebase',
      pushApiKey: '',
      pushSenderId: ''
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      maxLoginAttempts: 3,
      twoFactorAuth: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      backupRetention: 30,
      lastBackup: null
    }
  })

  const [levels, setLevels] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('success')

  // Mapeo de secciones a keys de BD
  const sectionToKey = {
    general: 'school_info',
    attendance: 'attendance_config',
    academic: 'academic_config',
    payment: 'payment_config',
    notifications: 'communication_config',
    security: 'security_config',
    backup: 'backup_config'
  }

  // Cargar configuraciones desde la BD
  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await settingsService.getAllSettings()

      // La API puede retornar { success, data } o directamente el array
      const settingsData = response.success ? response.data : (Array.isArray(response) ? response : null)

      if (settingsData && settingsData.length > 0) {
        const dbSettings = {}

        // Reordenar para que school_info, school_logo y academic_config se procesen primero
        // school_logo va después de school_info para sobrescribir el logo si existe
        const sortedSettings = [...settingsData].sort((a, b) => {
          const priority = ['school_info', 'school_logo', 'academic_config']
          const aIndex = priority.indexOf(a.key)
          const bIndex = priority.indexOf(b.key)
          if (aIndex !== -1 && bIndex === -1) return -1
          if (aIndex === -1 && bIndex !== -1) return 1
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          return 0
        })

        // Procesar cada setting de la BD
        sortedSettings.forEach(setting => {
          const value = typeof setting.value === 'string'
            ? JSON.parse(setting.value)
            : setting.value

          // Mapear key de BD a seccion del estado
          switch (setting.key) {
            case 'school_info':
              // Construir logoUrl desde logoPath usando función centralizada
              let logoUrl = value.logoUrl || null
              if (value.logoPath) {
                // Siempre reconstruir usando getFileUrl para evitar problemas de localhost
                logoUrl = getFileUrl(value.logoPath, '/api/files')
              }

              dbSettings.general = {
                schoolName: value.name || value.schoolName || '',
                address: value.address || '',
                phone: value.phone || '',
                email: value.email || '',
                website: value.website || '',
                logoPath: value.logoPath || null,
                logoUrl: logoUrl,
                ruc: value.ruc || '',
                ugel: value.ugel || ''
              }
              break
            case 'school_logo':
              // Logo del colegio (fila separada)
              if (value && value.filePath) {
                // Usar función centralizada para construir URL
                const logoUrl = `${getBackendUrl()}/${value.filePath}`
                // Asegurar que general existe
                if (!dbSettings.general) {
                  dbSettings.general = { ...settings.general }
                }
                dbSettings.general.logoPath = value.filePath
                dbSettings.general.logoUrl = logoUrl
              }
              break
            case 'school_name':
              // Compatibilidad con formato antiguo - SOLO aplicar si school_info no existe
              // school_info tiene prioridad sobre school_name
              if (!dbSettings.general) {
                dbSettings.general = { ...settings.general }
                dbSettings.general.schoolName = value.name || ''
              }
              // Si ya existe dbSettings.general (de school_info), ignorar school_name
              break
            case 'attendance_config':
              // Cargar horarios por nivel desde la BD - dinámico por ID
              dbSettings.attendance = {}
              Object.keys(value).forEach(key => {
                const levelData = value[key]
                if (levelData && typeof levelData === 'object') {
                  dbSettings.attendance[key] = {
                    entryTime: levelData.entryTime || '',
                    exitTime: levelData.exitTime || '',
                    toleranceMinutes: levelData.toleranceMinutes || 0
                  }
                }
              })
              break
            case 'academic_config':
              dbSettings.academic = { ...settings.academic, ...value }
              break
            case 'grading_system':
              // REGISTRO LEGACY - Solo aplicar si academic_config NO tiene gradingSystems
              // academic_config tiene prioridad sobre grading_system
              if (dbSettings.academic?.gradingSystems) {
                // Ya tenemos gradingSystems de academic_config, ignorar este registro legacy
                break
              }

              // Mapear valores de BD a formato del frontend (solo si no existe academic_config)
              const mapGradingType = (dbValue) => {
                if (dbValue === 'literal') return 'letters'
                if (dbValue === 'vigesimal') return 'numeric'
                return dbValue || 'letters'
              }

              // Escala literal siempre es A, B, C, D
              const literalScale = ['A', 'B', 'C', 'D']
              const literalDescriptions = {
                'A': 'Logro destacado',
                'B': 'Logro esperado',
                'C': 'En proceso',
                'D': 'En inicio'
              }
              // Valores numéricos estándar para cálculo de promedios: A=4, B=3, C=2, D=1
              const literalNumericValues = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
              const numericDescriptions = {
                '18-20': 'Logro destacado',
                '14-17': 'Logro esperado',
                '11-13': 'En proceso',
                '0-10': 'En inicio'
              }

              if (!dbSettings.academic) dbSettings.academic = {}
              dbSettings.academic.gradingSystems = {
                inicial: {
                  type: mapGradingType(value.inicial),
                  scale: value.inicial === 'literal' ? literalScale : { min: 0, max: 20 },
                  descriptions: value.inicial === 'literal' ? literalDescriptions : numericDescriptions,
                  passingGrade: value.inicial === 'literal' ? 'B' : 11,
                  numericValues: value.inicial === 'literal' ? literalNumericValues : undefined
                },
                primaria: {
                  type: mapGradingType(value.primaria),
                  scale: value.primaria === 'literal' ? literalScale : { min: 0, max: 20 },
                  descriptions: value.primaria === 'literal' ? literalDescriptions : numericDescriptions,
                  passingGrade: value.primaria === 'literal' ? 'B' : 11,
                  numericValues: value.primaria === 'literal' ? literalNumericValues : undefined
                },
                secundaria: {
                  type: mapGradingType(value.secundaria),
                  scale: value.secundaria === 'vigesimal' ? { min: 0, max: 20 } : literalScale,
                  descriptions: value.secundaria === 'vigesimal' ? numericDescriptions : literalDescriptions,
                  passingGrade: value.secundaria === 'vigesimal' ? 11 : 'B',
                  numericValues: value.secundaria !== 'vigesimal' ? literalNumericValues : undefined
                }
              }
              break
            case 'payment_config':
              // Mapear formato de BD a formato de frontend
              dbSettings.payment = {
                ...settings.payment,
                currency: value.currency || settings.payment.currency,
                monthlyDueDate: value.monthlyDueDate ?? value.grace_period_days ?? settings.payment.monthlyDueDate,
                lateFeePercentage: value.lateFeePercentage ?? value.mora_percentage ?? settings.payment.lateFeePercentage,
                minPartialPayment: value.minPartialPayment ?? settings.payment.minPartialPayment,
                paymentReminders: value.paymentReminders ?? settings.payment.paymentReminders,
                reminderDays: value.reminderDays || settings.payment.reminderDays,
                moraEnabled: value.moraEnabled ?? value.enable_online_payments ?? settings.payment.moraEnabled,
                moraDiaria: value.moraDiaria ?? settings.payment.moraDiaria,
                moraMaxima: value.moraMaxima ?? settings.payment.moraMaxima,
                diasMaximosMora: value.diasMaximosMora ?? settings.payment.diasMaximosMora
              }
              break
            case 'communication_config':
              // Mapear formato de BD a formato de frontend
              dbSettings.notifications = {
                ...settings.notifications,
                smsEnabled: value.smsEnabled ?? value.enable_sms ?? settings.notifications.smsEnabled,
                pushEnabled: value.pushEnabled ?? value.enable_push ?? settings.notifications.pushEnabled,
                notifyGrades: value.notifyGrades ?? settings.notifications.notifyGrades,
                notifyPayments: value.notifyPayments ?? value.enable_email ?? settings.notifications.notifyPayments,
                notifyAttendance: value.notifyAttendance ?? settings.notifications.notifyAttendance,
                notifyAnnouncements: value.notifyAnnouncements ?? settings.notifications.notifyAnnouncements,
                smsProvider: value.smsProvider || settings.notifications.smsProvider,
                smsApiKey: value.smsApiKey || settings.notifications.smsApiKey,
                smsPhoneNumber: value.smsPhoneNumber || settings.notifications.smsPhoneNumber,
                pushProvider: value.pushProvider || settings.notifications.pushProvider,
                pushApiKey: value.pushApiKey || settings.notifications.pushApiKey,
                pushSenderId: value.pushSenderId || settings.notifications.pushSenderId
              }
              break
            case 'security_config':
              dbSettings.security = { ...settings.security, ...value }
              break
            case 'backup_config':
              dbSettings.backup = { ...settings.backup, ...value }
              break
          }
        })

        // Actualizar estado con datos de BD (manteniendo defaults para lo que no existe)
        setSettings(prev => ({
          ...prev,
          ...dbSettings,
          general: { ...prev.general, ...dbSettings.general },
          attendance: { ...prev.attendance, ...dbSettings.attendance },
          academic: { ...prev.academic, ...dbSettings.academic },
          payment: { ...prev.payment, ...dbSettings.payment },
          notifications: { ...prev.notifications, ...dbSettings.notifications },
          security: { ...prev.security, ...dbSettings.security },
          backup: { ...prev.backup, ...dbSettings.backup }
        }))

        // SYNC: Sincronizar configuración de mora al paymentsStore
        // para que moraCalculator use los valores de la BD en vez de los hardcoded
        if (dbSettings.payment) {
          const moraConfig = {
            enabled: dbSettings.payment.moraEnabled ?? true,
            dailyRate: parseFloat(dbSettings.payment.moraDiaria) || 0.80,
            maxAmount: parseFloat(dbSettings.payment.moraMaxima) || 24.00,
            maxDays: parseInt(dbSettings.payment.diasMaximosMora) || 30
          }
          // Usar el método del paymentsStore directamente
          usePaymentsStore.getState().updateMoraConfig(moraConfig)
        }
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
      // Mantener valores por defecto si hay error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar niveles dinamicamente desde la estructura academica
  useEffect(() => {
    const initializeData = async () => {
      // 1. Primero cargar los settings desde la BD
      await loadSettings()

      // 2. Luego cargar niveles para attendance
      await academicStore.initialize()

      // Esperar a que el store se actualice y obtener los niveles
      const academicLevels = useAcademicStore.getState().levels || []
      setLevels(academicLevels)

      // 3. Inicializar attendance solo para niveles que no existen en settings
      setSettings(prev => {
        const newAttendance = { ...prev.attendance }
        let attendanceChanged = false

        academicLevels.forEach(level => {
          const levelKey = level.id
          if (!newAttendance[levelKey]) {
            newAttendance[levelKey] = {
              entryTime: '',
              exitTime: '',
              toleranceMinutes: 0
            }
            attendanceChanged = true
          }
        })

        // Solo actualizar si realmente hay cambios en attendance
        if (!attendanceChanged) {
          return prev
        }

        return {
          ...prev,
          attendance: newAttendance
        }
      })
    }

    initializeData()
  }, [])

  // Mostrar alerta
  const showAlertMessage = (message, type = 'success') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  // Guardar settings en BD
  const handleSave = async (section) => {
    setIsSaving(true)
    try {
      const key = sectionToKey[section]
      if (!key) {
        throw new Error(`Seccion desconocida: ${section}`)
      }

      let valueToSave = settings[section]

      // Para general, formatear como school_info (sin logo - el logo se guarda en 'school_logo')
      if (section === 'general') {
        valueToSave = {
          name: settings.general.schoolName,
          schoolName: settings.general.schoolName,
          address: settings.general.address,
          phone: settings.general.phone,
          email: settings.general.email,
          website: settings.general.website,
          ruc: settings.general.ruc,
          ugel: settings.general.ugel
          // logoPath y logoUrl se manejan en fila separada 'school_logo'
        }
      }

      // Para attendance, guardar dinámicamente todos los niveles configurados
      if (section === 'attendance') {
        valueToSave = {}
        // Iterar sobre todos los niveles en settings.attendance
        Object.keys(settings.attendance).forEach(levelId => {
          const data = settings.attendance[levelId]
          if (data && typeof data === 'object') {
            valueToSave[String(levelId)] = {
              entryTime: data.entryTime || '',
              exitTime: data.exitTime || '',
              toleranceMinutes: data.toleranceMinutes || 0
            }
          }
        })
      }

      // Para notifications, formatear como communication_config
      if (section === 'notifications') {
        valueToSave = {
          enable_sms: settings.notifications.smsEnabled,
          enable_push: settings.notifications.pushEnabled,
          enable_email: settings.notifications.notifyPayments,
          ...settings.notifications
        }
      }

      await settingsService.updateSettingByKey(key, valueToSave)

      // SYNC CRÍTICO: Si guardamos academic, también sincronizar con grading_scales_config
      // Esto asegura que los cambios del admin lleguen al profesor
      if (section === 'academic' && settings.academic?.gradingSystems) {
        try {
          await syncGradingScalesToBackend(settings.academic.gradingSystems, levels)
        } catch (syncError) {
          console.error('Error sincronizando grading scales:', syncError)
          // No mostrar error al usuario, el guardado principal fue exitoso
        }
      }

      showAlertMessage('Configuracion guardada exitosamente')

    } catch (error) {
      console.error('Error guardando configuracion:', error)
      showAlertMessage('Error al guardar configuracion', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Sincroniza la configuración de gradingSystems con el endpoint grading-scales
   * Esto asegura que los cambios del admin en Configuración Académica
   * se reflejen cuando el profesor registra notas
   *
   * IMPORTANTE: Los niveles bloqueados (con notas registradas) se preservan
   * exactamente como están en el backend para evitar errores de validación.
   */
  const syncGradingScalesToBackend = async (gradingSystems, levelsList) => {
    try {
      // Importar dinámicamente el servicio de grading scales
      const gradingScalesServiceModule = await import('../services/gradingScalesService')
      const gradingScalesService = gradingScalesServiceModule.default || gradingScalesServiceModule

      // Obtener config actual de grading_scales_config
      let currentConfig
      try {
        currentConfig = await gradingScalesService.getGradingScalesConfig('active')
      } catch (e) {
        // Si no existe, crear estructura base
        currentConfig = { levels: {}, locked_levels: [] }
      }

      // Obtener lista de niveles bloqueados
      const lockedLevelIds = (currentConfig.locked_levels || []).map(id => Number(id))

      const updatedLevels = { ...currentConfig.levels }

      // Crear mapeo de nombres/códigos legacy a IDs de niveles
      const legacyToLevelId = {}
      for (const level of levelsList) {
        const nameLower = level.name.toLowerCase()
        const codeLower = level.code.toLowerCase()

        // Mapear nombres legacy
        if (nameLower.includes('inicial') || codeLower === 'ini') {
          legacyToLevelId['inicial'] = level.id
        }
        if (nameLower.includes('primaria') || codeLower === 'pri') {
          legacyToLevelId['primaria'] = level.id
        }
        if (nameLower.includes('secundaria') || codeLower === 'sec') {
          legacyToLevelId['secundaria'] = level.id
        }
        // También mapear por ID directo
        legacyToLevelId[level.id] = level.id
        legacyToLevelId[String(level.id)] = level.id
      }

      // Procesar cada gradingSystem configurado
      for (const [levelKey, config] of Object.entries(gradingSystems)) {
        // Encontrar el level_id correspondiente
        const levelId = legacyToLevelId[levelKey] || legacyToLevelId[levelKey.toLowerCase()]
        if (!levelId) {
          console.warn(`No se encontró nivel para key: ${levelKey}`)
          continue
        }

        // IMPORTANTE: Si el nivel está bloqueado, preservar la configuración original
        // y NO sobrescribir con los datos del frontend
        if (lockedLevelIds.includes(Number(levelId))) {
          // Mantener la configuración existente del backend
          continue
        }

        // Encontrar info del nivel
        const levelInfo = levelsList.find(l => l.id === levelId) || { name: levelKey, code: levelKey }

        // Convertir al formato de grading_scales_config
        if (config.type === 'letters' || config.type === 'literal') {
          const scaleArray = Array.isArray(config.scale) ? config.scale : ['A', 'B', 'C', 'D']
          updatedLevels[levelId] = {
            level_id: levelId,
            level_name: levelInfo.name,
            level_code: levelInfo.code,
            type: 'letters',
            scale: scaleArray.map((letter, index) => ({
              value: letter,
              label: config.descriptions?.[letter] || letter,
              numericValue: config.numericValues?.[letter] ?? (4 - index),
              color: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'][index] || '#9ca3af',
              order: index + 1
            })),
            passingGrade: config.passingGrade || 'B',
            passingNumericValue: config.numericValues?.[config.passingGrade] ?? 3
          }
        } else {
          // Tipo numérico
          updatedLevels[levelId] = {
            level_id: levelId,
            level_name: levelInfo.name,
            level_code: levelInfo.code,
            type: 'numeric',
            minValue: config.scale?.min ?? 0,
            maxValue: config.scale?.max ?? 20,
            passingGrade: config.passingGrade ?? 11,
            ranges: [
              { min: 18, max: 20, label: 'Logro destacado', color: '#22c55e', order: 1 },
              { min: 14, max: 17, label: 'Logro esperado', color: '#3b82f6', order: 2 },
              { min: 11, max: 13, label: 'En proceso', color: '#eab308', order: 3 },
              { min: 0, max: 10, label: 'En inicio', color: '#ef4444', order: 4 }
            ]
          }
        }
      }

      // Guardar la configuración actualizada
      await gradingScalesService.updateGradingScalesConfig('active', {
        ...currentConfig,
        levels: updatedLevels
      })
    } catch (error) {
      console.error('[syncGradingScales] Error:', error)
      throw error
    }
  }

  // Subir logo
  const handleUploadLogo = async (file) => {
    try {
      setIsSaving(true)
      const response = await settingsService.uploadLogo(file)

      if (response.success) {
        setSettings(prev => ({
          ...prev,
          general: {
            ...prev.general,
            logoPath: response.data.logoPath,
            logoUrl: response.data.logoUrl
          }
        }))
        showAlertMessage('Logo subido exitosamente')

        // Disparar evento para que useSchoolLogo actualice el logo en toda la app
        window.dispatchEvent(new CustomEvent('school-logo-updated'))
      }

      return response
    } catch (error) {
      console.error('Error subiendo logo:', error)
      showAlertMessage('Error al subir logo', 'error')
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Helper functions for grading systems
  const addGradeToScale = (level, newGrade = '') => {
    const currentSystem = settings.academic.gradingSystems[level]
    const newScale = [...currentSystem.scale, newGrade || `Nuevo${currentSystem.scale.length + 1}`]
    const newDescriptions = { ...currentSystem.descriptions }
    if (newGrade) {
      newDescriptions[newGrade] = ''
    }

    setSettings({
      ...settings,
      academic: {
        ...settings.academic,
        gradingSystems: {
          ...settings.academic.gradingSystems,
          [level]: {
            ...currentSystem,
            scale: newScale,
            descriptions: newDescriptions
          }
        }
      }
    })
  }

  const removeGradeFromScale = (level, gradeIndex) => {
    const currentSystem = settings.academic.gradingSystems[level]
    const gradeToRemove = currentSystem.scale[gradeIndex]
    const newScale = currentSystem.scale.filter((_, index) => index !== gradeIndex)
    const newDescriptions = { ...currentSystem.descriptions }
    delete newDescriptions[gradeToRemove]

    setSettings({
      ...settings,
      academic: {
        ...settings.academic,
        gradingSystems: {
          ...settings.academic.gradingSystems,
          [level]: {
            ...currentSystem,
            scale: newScale,
            descriptions: newDescriptions,
            passingGrade: currentSystem.passingGrade === gradeToRemove
              ? (newScale[0] || currentSystem.passingGrade)
              : currentSystem.passingGrade
          }
        }
      }
    })
  }

  return {
    settings,
    setSettings,
    levels,
    isSaving,
    isLoading,
    showAlert,
    alertMessage,
    alertType,
    setShowAlert,
    handleSave,
    handleUploadLogo,
    addGradeToScale,
    removeGradeFromScale,
    loadSettings
  }
}
