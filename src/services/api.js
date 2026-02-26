/**
 * Servicio base para llamadas HTTP a la API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL

/**
 * Obtener la URL base del backend (sin /api)
 * Detecta automáticamente según el entorno
 */
export const getBackendUrl = () => {
  // Si hay variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    // Quitar el /api del final si existe
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  }

  // Fallback: detectar según el hostname actual
  const { protocol, hostname } = window.location

  // En desarrollo local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4010'
  }

  // En producción, asumir que el backend está en el mismo dominio o usar variable de entorno
  // Esto funciona si frontend y backend comparten dominio o están configurados con CORS
  return `${protocol}//${hostname.replace('frontend', 'backend')}`
}

/**
 * Construir URL para acceder a archivos del backend
 * @param {string} filePath - Path del archivo (ej: "payment-vouchers/voucher_123.pdf")
 * @param {string} route - Ruta del API (default: "/api/files")
 */
export const getFileUrl = (filePath, route = '/api/files') => {
  if (!filePath) return null
  const backendUrl = getBackendUrl()
  return `${backendUrl}${route}/${encodeURIComponent(filePath)}`
}

/**
 * Función auxiliar para manejar respuestas HTTP
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type')
  const isJson = contentType && contentType.includes('application/json')

  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error = (data && data.error) || data.mensaje || response.statusText
    throw new Error(error)
  }

  return data
}

/**
 * Realizar petición GET
 */
export const get = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken')

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

/**
 * Realizar petición POST
 */
export const post = async (endpoint, body = {}, options = {}) => {
  const token = localStorage.getItem('authToken')

  // Detectar si body es FormData
  const isFormData = body instanceof FormData

  const config = {
    method: 'POST',
    headers: {
      // No incluir Content-Type si es FormData (el navegador lo establece automáticamente con boundary)
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    // Si es FormData, enviar directamente; si no, convertir a JSON
    body: isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

/**
 * Realizar petición PUT
 */
export const put = async (endpoint, body = {}, options = {}) => {
  const token = localStorage.getItem('authToken')

  // Detectar si body es FormData
  const isFormData = body instanceof FormData

  const config = {
    method: 'PUT',
    headers: {
      // No incluir Content-Type si es FormData (el navegador lo establece automáticamente con boundary)
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    // Si es FormData, enviar directamente; si no, convertir a JSON
    body: isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

/**
 * Realizar petición PATCH
 */
export const patch = async (endpoint, body = {}, options = {}) => {
  const token = localStorage.getItem('authToken')

  const config = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    body: JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

/**
 * Realizar petición DELETE
 */
export const del = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken')

  const config = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

export default {
  get,
  post,
  put,
  patch,
  del,
  getBackendUrl,
  getFileUrl
}
