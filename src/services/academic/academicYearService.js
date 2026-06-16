import { get, post, put, del } from '../api'
import { parseDateOnly } from '../../utils/dateUtils'

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD para inputs HTML
 * @param {string} isoDate - Fecha en formato ISO (2025-03-01T05:00:00.000Z)
 * @returns {string} Fecha en formato YYYY-MM-DD (2025-03-01)
 */
const formatDateForInput = (isoDate) => {
  if (!isoDate) return ''
  // Si ya está en formato correcto (YYYY-MM-DD), devolverlo
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  // Si es un string ISO, extraer solo la fecha
  return isoDate.split('T')[0]
}

/**
 * Transforma los datos del año lectivo del backend (inglés) al frontend (español)
 */
const transformYearData = (year) => {
  if (!year) return null

  // El backend ahora devuelve los estados ya en español
  // pero mantenemos el mapeo por compatibilidad
  const stateMap = {
    'planned': 'planificado',
    'active': 'activo',
    'closed': 'cerrado',
    'inactive': 'inactivo'
  }

  // El backend devuelve 'status', no 'state'
  const status = year.status || year.state || 'planificado'

  return {
    ...year,
    año: year.year,
    añoCodigo: year.year_code,
    fechaInicio: formatDateForInput(year.start_date),
    fechaFin: formatDateForInput(year.end_date),
    state: stateMap[status] || status, // Mapear si está en inglés, o usar directo si ya está en español
    fechaCierre: year.close_date ? formatDateForInput(year.close_date) : null,
    motivoCierre: year.close_reason,
    observacionesCierre: year.close_observations,
    archivo: year.file
  }
}

/**
 * Servicio para gestión de años lectivos
 * Conecta con las APIs reales del backend
 */
export const academicYearService = {
  /**
   * Obtener todos los años lectivos
   * @returns {Promise<Array>} Lista de años lectivos
   */
  async getAll() {
    try {
      const response = await get('/academic-years')
      const years = response.años || response.data || response
      return Array.isArray(years) ? years.map(transformYearData) : []
    } catch (error) {
      console.error('Error al obtener años lectivos:', error)
      throw error
    }
  },

  /**
   * Obtener año lectivo activo actual
   * @returns {Promise<Object>} Año lectivo activo
   */
  async getActive() {
    try {
      const response = await get('/academic-years/current')
      const year = response.data
      // Si no hay año activo, devolver null sin error
      if (!year) {
        return null
      }
      return transformYearData(year)
    } catch (error) {
      console.error('Error al obtener año activo:', error)
      throw error
    }
  },

  /**
   * Obtener año lectivo por ID
   * @param {number} id - ID del año lectivo
   * @returns {Promise<Object>} Año lectivo
   */
  async getById(id) {
    try {
      const response = await get(`/academic-years/${id}`)
      const year = response.año || response.data || response
      return transformYearData(year)
    } catch (error) {
      console.error(`Error al obtener año lectivo ${id}:`, error)
      throw error
    }
  },

  /**
   * Crear o actualizar año lectivo
   * @param {Object} yearData - Datos del año lectivo
   * @param {number|null} editingItemId - ID si es edición
   * @returns {Promise<Object>} Año lectivo creado/actualizado
   */
  async save(yearData, editingItemId = null) {
    try {
      // Validaciones
      if (!yearData.nombre || !yearData.año || !yearData.fecha_inicio || !yearData.fecha_fin) {
        throw new Error('Todos los campos marcados con * son requeridos')
      }

      // Validar fechas
      const startDate = parseDateOnly(yearData.fecha_inicio)
      const endDate = parseDateOnly(yearData.fecha_fin)
      if (!startDate || !endDate || startDate.getTime() >= endDate.getTime()) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
      }

      let response
      if (editingItemId) {
        // Actualizar
        response = await put(`/academic-years/${editingItemId}`, yearData)
      } else {
        // Crear
        response = await post('/academic-years', yearData)
      }

      const year = response.año || response.data || response
      return transformYearData(year)
    } catch (error) {
      console.error('Error al guardar año lectivo:', error)
      throw error
    }
  },

  /**
   * Activar un año lectivo
   * @param {number} yearId - ID del año a activar
   * @returns {Promise<Object>} Año activado
   */
  async activate(yearId) {
    try {
      // El backend espera 'status' en español
      const response = await put(`/academic-years/${yearId}`, { status: 'activo' })
      const year = response.año || response.data || response
      return transformYearData(year)
    } catch (error) {
      console.error('Error al activar año lectivo:', error)
      throw error
    }
  },

  /**
   * Cerrar año lectivo
   * @param {number} yearId - ID del año a cerrar
   * @param {Object} closeData - Datos de cierre
   * @returns {Promise<Object>} Año cerrado y opcionalmente nuevo año creado
   */
  async close(yearId, closeData) {
    try {
      const response = await put(`/academic-years/${yearId}/close`, closeData)

      // El backend devuelve { data: { closedYear, newYear } }
      if (response.data) {
        return {
          ...response,
          data: {
            closedYear: transformYearData(response.data.closedYear),
            newYear: response.data.newYear ? transformYearData(response.data.newYear) : null
          }
        }
      }

      // Fallback para compatibilidad
      const year = response.año || response.data || response
      return { data: { closedYear: transformYearData(year), newYear: null } }
    } catch (error) {
      console.error('Error al cerrar año lectivo:', error)
      throw error
    }
  },

  /**
   * Eliminar año lectivo (soft delete)
   * @param {number} yearId - ID del año a eliminar
   * @returns {Promise<Object>} Confirmación
   */
  async remove(yearId) {
    try {
      const response = await del(`/academic-years/${yearId}`)
      return response
    } catch (error) {
      console.error('Error al eliminar año lectivo:', error)
      throw error
    }
  },

  /**
   * Alias para eliminar año lectivo
   * @param {number} yearId - ID del año a eliminar
   * @returns {Promise<Object>} Confirmación
   */
  async delete(yearId) {
    return this.remove(yearId)
  }
}

export default academicYearService
