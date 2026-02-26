import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, FileText, Calendar, Users, Lock, Unlock,
  CheckCircle, AlertCircle, Clock, Info, Save, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { isReportCardVisible } from '../../services/mock/schemas/reportCardVisibility'
import academicYearService from '../../services/academic/academicYearService'
import structureService from '../../services/academic/structureService'
import reportCardVisibilityService from '../../services/reportCardVisibilityService'

const ReportCardVisibilityPage = () => {
  const { user } = useAuthStore()
  const [academicYears, setAcademicYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [visibilityConfigs, setVisibilityConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedYear) {
      loadVisibilityConfigs()
    }
  }, [selectedYear])

  const loadData = async () => {
    try {
      const years = await academicYearService.getAll() || []
      setAcademicYears(years)

      // Select active year by default
      const activeYear = years.find(y => y.state === 'activo')
      if (activeYear) {
        setSelectedYear(Number(activeYear.id))
      } else if (years.length > 0) {
        setSelectedYear(Number(years[0].id))
      }

      const levelsData = await structureService.getAllLevels() || []
      setLevels(levelsData)

      const gradesData = await structureService.getAllGrades() || []
      setGrades(gradesData)

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const loadVisibilityConfigs = async () => {
    try {
      const configs = await reportCardVisibilityService.getAll() || []
      // Filtrar configs del año seleccionado usando Number() para evitar type mismatch string/number
      const numSelectedYear = Number(selectedYear)
      const yearConfigs = configs.filter(c =>
        Number(c.academic_year_id) === numSelectedYear ||
        Number(c.añoLectivoId) === numSelectedYear ||
        !c.academic_year_id // Incluir configs legacy sin año asignado
      )
      setVisibilityConfigs(yearConfigs)
    } catch (error) {
      console.error('Error loading visibility configs:', error)
    }
  }

  const toggleBimesterVisibility = async (bimestre) => {
    // Cargar TODAS las configs del servidor para actualizar también las legacy
    const allConfigs = await reportCardVisibilityService.getAll() || []
    const numSelectedYear = Number(selectedYear)

    // Find global config for this bimester (comparación numérica segura)
    const globalConfig = visibilityConfigs.find(
      c => Number(c.quarter) === bimestre && !c.level_id && !c.grade_id
    )

    // Find all level-specific configs for this bimester
    const levelConfigs = visibilityConfigs.filter(
      c => Number(c.quarter) === bimestre && c.level_id && !c.grade_id
    )

    // Buscar configs por grado del año seleccionado
    const gradeConfigs = allConfigs.filter(
      c => Number(c.quarter) === bimestre && c.grade_id && Number(c.academic_year_id) === numSelectedYear
    )

    console.log('📝 [toggleBimesterVisibility] Bimestre:', bimestre)
    console.log('📝 [toggleBimesterVisibility] Total configs:', allConfigs.length)
    console.log('📝 [toggleBimesterVisibility] Grade configs encontradas:', gradeConfigs.length, gradeConfigs.map(c => ({ id: c.id, grade_id: c.grade_id, visible: c.visible })))

    try {
      const newVisible = globalConfig ? !globalConfig.visible : true
      const updatedData = {
        visible: newVisible,
        authorization_date: newVisible ? new Date().toISOString() : null,
        authorized_by: newVisible ? user.id : null
      }

      // Update or create global config
      if (globalConfig) {
        await reportCardVisibilityService.update(globalConfig.id, updatedData)
      } else {
        const newConfig = {
          academic_year_id: selectedYear,
          quarter: bimestre,
          level_id: null,
          grade_id: null,
          visible: newVisible,
          authorization_date: newVisible ? new Date().toISOString() : null,
          authorized_by: newVisible ? user.id : null,
          observations: 'Autorizado globalmente para todos los niveles',
          status: 'active'
        }
        await reportCardVisibilityService.create(newConfig)
      }

      // Also update ALL level-specific configs to match
      for (const levelConfig of levelConfigs) {
        await reportCardVisibilityService.update(levelConfig.id, updatedData)
      }

      // IMPORTANTE: También actualizar todas las configs específicas por GRADO
      // Estas tienen la prioridad más alta en el sistema de visibilidad
      for (const gradeConfig of gradeConfigs) {
        await reportCardVisibilityService.update(gradeConfig.id, updatedData)
      }

      // Reload configs from server to get fresh data
      await loadVisibilityConfigs()

      showSuccessMessage(
        `Boletas del Bimestre ${bimestre} ${newVisible ? 'autorizadas' : 'restringidas'} para todos los niveles y grados`
      )
    } catch (error) {
      console.error('Error toggling visibility:', error)
      showSuccessMessage('Error al cambiar visibilidad')
    }
  }

  const toggleLevelVisibility = async (bimestre, nivelId) => {
    // Mapear nombre de nivel a ID
    const nivelIdMap = { 'inicial': 1, 'primaria': 2, 'secundaria': 3 }
    const nivelIdNum = nivelIdMap[nivelId] || 1
    const nivelName = nivelId.charAt(0).toUpperCase() + nivelId.slice(1)

    // Buscar config existente para este nivel (comparación numérica segura)
    const levelConfig = visibilityConfigs.find(
      c => Number(c.quarter) === bimestre && Number(c.level_id) === nivelIdNum && !c.grade_id
    )

    try {
      if (levelConfig) {
        const newVisible = !levelConfig.visible
        const updatedData = {
          visible: newVisible,
          authorization_date: newVisible ? new Date().toISOString() : null,
          authorized_by: newVisible ? user.id : null
        }

        await reportCardVisibilityService.update(levelConfig.id, updatedData)

        // Actualizar el estado local
        setVisibilityConfigs(prev =>
          prev.map(c => c.id === levelConfig.id ? { ...c, visible: newVisible } : c)
        )

        showSuccessMessage(
          `Boletas de ${nivelName} - Bimestre ${bimestre} ${newVisible ? 'autorizadas' : 'restringidas'}`
        )
      } else {
        // Crear config para nivel especifico
        const newConfig = {
          academic_year_id: selectedYear,
          quarter: bimestre,
          level_id: nivelIdNum,
          grade_id: null,
          visible: true,
          authorization_date: new Date().toISOString(),
          authorized_by: user.id,
          observations: `Autorizado para ${nivelName}`,
          status: 'active'
        }

        const created = await reportCardVisibilityService.create(newConfig)
        setVisibilityConfigs(prev => [...prev, created])

        showSuccessMessage(`Boletas de ${nivelName} - Bimestre ${bimestre} autorizadas`)
      }
    } catch (error) {
      console.error('Error toggling level visibility:', error)
      showSuccessMessage('Error al cambiar visibilidad del nivel')
    }
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getBimesterStatus = (bimestre) => {
    const globalConfig = visibilityConfigs.find(
      c => Number(c.quarter) === bimestre && !c.level_id && !c.grade_id
    )

    if (globalConfig) {
      return globalConfig.visible
    }

    // Check if any level-specific config exists and all are visible
    const levelConfigs = visibilityConfigs.filter(
      c => Number(c.quarter) === bimestre && c.level_id && !c.grade_id
    )

    if (levelConfigs.length > 0) {
      return levelConfigs.every(c => c.visible)
    }

    return false // Default hidden
  }

  const getLevelStatus = (bimestre, nivelId) => {
    // Mapear nombre de nivel a ID numerico
    const nivelIdMap = { 'inicial': 1, 'primaria': 2, 'secundaria': 3 }
    const nivelIdNum = nivelIdMap[nivelId] || nivelId

    // Check specific level config (comparación numérica segura)
    const levelConfig = visibilityConfigs.find(
      c => Number(c.quarter) === bimestre && (Number(c.level_id) === nivelIdNum) && !c.grade_id
    )

    if (levelConfig) {
      return levelConfig.visible
    }

    // Check global config
    const globalConfig = visibilityConfigs.find(
      c => Number(c.quarter) === bimestre && !c.level_id && !c.grade_id
    )

    if (globalConfig) {
      return globalConfig.visible
    }

    return false // Default hidden
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const selectedYearData = academicYears.find(y => y.id === selectedYear)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Visibilidad de Boletas
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Controla cuándo los padres pueden visualizar las boletas de notas
              </p>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Año Lectivo:</label>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.año})
                {year.state === 'activo' ? ' - Activo' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 border-2 border-green-300 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">
              Información importante
            </h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Por defecto, todas las boletas están <strong>OCULTAS</strong> para los padres</li>
              <li>Debes <strong>AUTORIZAR</strong> cada bimestre cuando estés listo para publicar las notas</li>
              <li>Puedes autorizar por bimestre completo o por nivel educativo específico</li>
              <li>Los padres solo verán las boletas que hayas autorizado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bimesters Control */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(bimestre => {
          const isVisible = getBimesterStatus(bimestre)

          return (
            <motion.div
              key={bimestre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bimestre * 0.1 }}
              className={`bg-white rounded-lg shadow-md border-2 transition-all ${
                isVisible
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="p-6">
                {/* Bimester Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      isVisible ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {isVisible ? (
                        <Unlock className="h-6 w-6 text-green-600" />
                      ) : (
                        <Lock className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Bimestre {bimestre}
                      </h3>
                      <p className={`text-sm font-medium ${
                        isVisible ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {isVisible ? '✓ Visible para padres' : '✕ Restringido'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Global Toggle */}
                <button
                  onClick={() => toggleBimesterVisibility(bimestre)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isVisible
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isVisible ? (
                    <>
                      <EyeOff className="h-5 w-5" />
                      Restringir visibilidad
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5" />
                      Autorizar visibilidad
                    </>
                  )}
                </button>

                {/* Level-specific controls */}
                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Control por nivel:
                    </p>
                    <div className="space-y-2">
                      {['inicial', 'primaria', 'secundaria'].map(nivelId => {
                        const levelVisible = getLevelStatus(bimestre, nivelId)
                        const nivelName = nivelId.charAt(0).toUpperCase() + nivelId.slice(1)

                        return (
                          <button
                            key={nivelId}
                            onClick={() => toggleLevelVisibility(bimestre, nivelId)}
                            className={`w-full py-2 px-3 rounded text-sm font-medium transition-all flex items-center justify-between ${
                              levelVisible
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            <span>{nivelName}</span>
                            {levelVisible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Advanced Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? '▼' : '▶'} Modo avanzado (control por nivel educativo)
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Usa el modo avanzado para autorizar boletas solo para niveles específicos (Inicial, Primaria, Secundaria)
        </p>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de visibilidad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(bimestre => {
            const isVisible = getBimesterStatus(bimestre)
            return (
              <div
                key={bimestre}
                className={`p-4 rounded-lg border-2 ${
                  isVisible
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm text-gray-600">Bimestre {bimestre}</p>
                <p className={`text-lg font-bold ${
                  isVisible ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {isVisible ? 'Visible' : 'Oculto'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReportCardVisibilityPage
