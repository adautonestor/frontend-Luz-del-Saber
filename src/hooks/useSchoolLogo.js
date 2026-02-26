import { useState, useEffect, useCallback } from 'react'
import { getFileUrl } from '../services/api'

// Logo por defecto (fallback)
const DEFAULT_LOGO = '/logoColegio.png'

// Obtener URL base de API
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:4010/api'
}

/**
 * Hook para obtener el logo del colegio desde la configuracion del sistema
 * Usa ruta PUBLICA que no requiere autenticacion
 * Retorna la URL del logo o el logo por defecto si no existe
 */
export const useSchoolLogo = () => {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO)
  const [schoolName, setSchoolName] = useState('Luz del Saber')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchSchoolInfo = useCallback(async () => {
    try {
      const apiBase = getApiBaseUrl()
      // Usar ruta publica (no requiere token) con cache-bust
      const response = await fetch(`${apiBase}/system-settings/public/school-info?t=${Date.now()}`)
      const data = await response.json()

      if (data.success && data.data) {
        // Nombre del colegio
        if (data.data.schoolName) {
          setSchoolName(data.data.schoolName)
        }

        // Direccion del colegio
        if (data.data.address) {
          setAddress(data.data.address)
        }

        // Construir URL del logo con cache-bust usando función centralizada
        if (data.data.logoPath) {
          const constructedUrl = `${getFileUrl(data.data.logoPath, '/api/files')}?t=${Date.now()}`
          setLogoUrl(constructedUrl)
        } else {
          setLogoUrl(DEFAULT_LOGO)
        }
      }
    } catch (error) {
      // Si hay error, usar valores por defecto
      console.warn('No se pudo cargar la info del colegio, usando valores por defecto')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchoolInfo()

    // Escuchar evento de actualizacion de logo
    const handleLogoUpdate = () => {
      fetchSchoolInfo()
    }

    window.addEventListener('school-logo-updated', handleLogoUpdate)

    return () => {
      window.removeEventListener('school-logo-updated', handleLogoUpdate)
    }
  }, [fetchSchoolInfo])

  return { logoUrl, schoolName, address, isLoading, DEFAULT_LOGO, refetch: fetchSchoolInfo }
}

export default useSchoolLogo
