import React, { useState, useEffect } from 'react'

// Sub-componentes
import GradingSystemCard from './academic/GradingSystemCard'
import SaveButtonSection from './academic/SaveButtonSection'

// Servicio para verificar estado de bloqueo
import * as gradingScalesService from '../../../services/gradingScalesService'

/**
 * Tab de configuración académica
 * Gestiona: Sistemas de calificación por nivel (dinámico desde BD)
 */
const AcademicSettingsTab = ({ settings, setSettings, handleSave, isSaving, levels = [] }) => {
  // Estado para niveles bloqueados
  const [lockedLevels, setLockedLevels] = useState({})
  const [isCheckingLocks, setIsCheckingLocks] = useState(true)

  // Ordenar niveles por ID para mantener orden consistente
  const sortedLevels = [...levels].sort((a, b) => a.id - b.id)

  // Crear una clave estable basada en los IDs de los niveles
  const levelIdsKey = sortedLevels.map(l => l.id).join(',')

  // Verificar estado de bloqueo de cada nivel cuando cambian los niveles
  useEffect(() => {
    const checkLockedLevels = async () => {
      if (sortedLevels.length === 0) {
        setIsCheckingLocks(false)
        return
      }

      setIsCheckingLocks(true)
      const locks = {}

      for (const level of sortedLevels) {
        try {
          const isLocked = await gradingScalesService.isLevelLocked('active', level.id)
          locks[level.id] = isLocked
        } catch (error) {
          console.error(`[AcademicSettingsTab] Error verificando bloqueo para nivel ${level.id}:`, error)
          locks[level.id] = false
        }
      }

      setLockedLevels(locks)
      setIsCheckingLocks(false)
    }

    checkLockedLevels()
  }, [levelIdsKey]) // Dependencia basada en IDs reales, no solo longitud

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-6">Configuración Académica</h3>

      {/* Sección: Sistemas de calificación por nivel */}
      <div>
        <label className="label">Sistema de Calificación por Nivel</label>

        {sortedLevels.length === 0 ? (
          <div className="text-gray-500 text-sm mt-4 p-4 bg-gray-50 rounded-lg">
            No hay niveles educativos configurados.
            Crea niveles en la sección de Estructura Académica para configurar sus sistemas de calificación.
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {sortedLevels.map((level) => (
              <GradingSystemCard
                key={level.id}
                levelId={level.id}
                levelCode={level.code}
                title={level.name}
                settings={settings}
                setSettings={setSettings}
                isLocked={lockedLevels[level.id] || false}
                isCheckingLock={isCheckingLocks}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botón guardar */}
      <SaveButtonSection handleSave={handleSave} isSaving={isSaving} section="academic" />
    </div>
  )
}

export default AcademicSettingsTab
