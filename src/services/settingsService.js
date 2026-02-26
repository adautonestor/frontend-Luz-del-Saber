import api from './api'

/**
 * Servicio para gestionar configuraciones del sistema
 * Conecta con /api/system-settings
 */

/**
 * Obtener todas las configuraciones
 */
export const getAllSettings = async () => {
  try {
    const response = await api.get('/system-settings')
    return response.data
  } catch (error) {
    console.error('Error getting all settings:', error)
    throw error
  }
}

/**
 * Obtener configuracion por key
 * @param {string} key - Clave de la configuracion
 */
export const getSettingByKey = async (key) => {
  try {
    const response = await api.get(`/system-settings/key/${key}`)
    return response.data
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    throw error
  }
}

/**
 * Crear nueva configuracion
 * @param {Object} data - { key, value }
 */
export const createSetting = async (data) => {
  try {
    const response = await api.post('/system-settings', data)
    return response.data
  } catch (error) {
    console.error('Error creating setting:', error)
    throw error
  }
}

/**
 * Actualizar configuracion por key
 * @param {string} key - Clave de la configuracion
 * @param {Object} value - Nuevo valor (objeto JSON)
 */
export const updateSettingByKey = async (key, value) => {
  try {
    const response = await api.put(`/system-settings/key/${key}/value`, { valor: value })
    return response.data
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error)
    throw error
  }
}

/**
 * Crear o actualizar configuracion (upsert)
 * @param {string} key - Clave de la configuracion
 * @param {Object} value - Valor (objeto JSON)
 */
export const upsertSetting = async (key, value) => {
  try {
    // Intentar actualizar primero
    const response = await updateSettingByKey(key, value)
    return response
  } catch (error) {
    // Si no existe, crear
    if (error.response?.status === 404) {
      return await createSetting({ key, value })
    }
    throw error
  }
}

/**
 * Subir logo del colegio
 * @param {File} file - Archivo de imagen
 */
export const uploadLogo = async (file) => {
  try {
    const formData = new FormData()
    formData.append('logo', file)

    const response = await api.post('/system-settings/upload-logo', formData)
    return response
  } catch (error) {
    console.error('Error uploading logo:', error)
    throw error
  }
}

/**
 * Eliminar configuracion
 * @param {number} id - ID de la configuracion
 */
export const deleteSetting = async (id) => {
  try {
    const response = await api.delete(`/system-settings/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting setting:', error)
    throw error
  }
}

/**
 * Subir archivo generico (imagenes, etc)
 * @param {FormData} formData - FormData con el archivo
 */
export const uploadFile = async (formData) => {
  try {
    const response = await api.post('/system-settings/upload-file', formData)
    return response.data
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export default {
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSettingByKey,
  upsertSetting,
  uploadLogo,
  uploadFile,
  deleteSetting
}
