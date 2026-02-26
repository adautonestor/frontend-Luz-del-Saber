import { create } from 'zustand'
import { studentsService } from '../services/studentsService'
import { academicYearService } from '../services/academic/academicYearService'
import { paymentsService } from '../services/paymentsService'

/**
 * Store centralizado para datos del padre de familia
 * Permite compartir datos entre todas las pantallas del módulo padre
 * Implementa caché temporal para evitar recargas innecesarias
 */

// Tiempo de caché en milisegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000

export const useParentDataStore = create((set, get) => ({
  // Estado de datos
  children: [],
  activeYear: null,
  availableYears: [],
  paymentsByChild: {},
  stats: {
    hijosMatriculados: 0,
    promedioGeneral: 0,
    pagosPendientes: 0,
    asistenciaPromedio: 0
  },

  // Estado de carga y errores
  loading: false,
  error: null,
  lastFetch: null, // Timestamp de última carga

  // Verificar si el caché es válido
  isCacheValid: () => {
    const { lastFetch } = get()
    if (!lastFetch) return false
    return Date.now() - lastFetch < CACHE_DURATION
  },

  // Forzar recarga ignorando caché
  forceRefresh: async (userId) => {
    set({ lastFetch: null })
    return get().loadParentData(userId)
  },

  // Cargar datos del padre (con caché)
  loadParentData: async (userId, forceReload = false) => {
    const state = get()

    // Si el caché es válido y no se fuerza recarga, no hacer nada
    if (!forceReload && state.isCacheValid() && state.children.length > 0) {
      console.log('[ParentDataStore] Usando datos en caché')
      return { success: true, fromCache: true }
    }

    if (!userId) {
      set({ error: 'ID de usuario no proporcionado', loading: false })
      return { success: false, error: 'ID de usuario no proporcionado' }
    }

    set({ loading: true, error: null })

    try {
      // 1. Cargar años académicos
      let activeYear = null
      let availableYears = []
      try {
        const [active, all] = await Promise.all([
          academicYearService.getActive().catch(() => null),
          academicYearService.getAll().catch(() => [])
        ])
        activeYear = active
        availableYears = all || []
      } catch (e) {
        console.warn('[ParentDataStore] Error cargando años académicos:', e)
      }

      // 2. Cargar hijos con datos enriquecidos
      let childrenData = []
      try {
        // IMPORTANTE: El backend espera el año numérico (2025, 2026), NO el ID del registro
        const yearNumber = activeYear?.year || activeYear?.año || activeYear?.academic_year || new Date().getFullYear()
        childrenData = await studentsService.getByParent(userId, {
          academicYear: yearNumber,
          enriched: true
        }) || []
      } catch (e) {
        console.error('[ParentDataStore] Error cargando hijos:', e)
        set({ error: 'No se pudieron cargar los datos de los hijos', loading: false })
        return { success: false, error: e.message }
      }

      // 3. Cargar pagos para cada hijo (en paralelo)
      const paymentsMap = {}
      await Promise.all(childrenData.map(async (child) => {
        try {
          const obligations = await paymentsService.getObligationsByStudent(child.id) || []
          paymentsMap[child.id] = obligations
        } catch (e) {
          console.warn(`[ParentDataStore] Error cargando pagos del estudiante ${child.id}:`, e)
          paymentsMap[child.id] = []
        }
      }))

      // 4. Calcular estadísticas
      const stats = calculateStats(childrenData, paymentsMap)

      // Actualizar estado
      set({
        children: childrenData,
        activeYear,
        availableYears,
        paymentsByChild: paymentsMap,
        stats,
        loading: false,
        error: null,
        lastFetch: Date.now()
      })

      console.log(`[ParentDataStore] Datos cargados: ${childrenData.length} hijos`)
      return { success: true, fromCache: false }

    } catch (error) {
      console.error('[ParentDataStore] Error general:', error)
      set({
        error: 'Error al cargar los datos. Por favor, intente nuevamente.',
        loading: false
      })
      return { success: false, error: error.message }
    }
  },

  // Obtener hijo por ID
  getChildById: (childId) => {
    const { children } = get()
    return children.find(c => c.id === childId || c.id === parseInt(childId))
  },

  // Obtener pagos de un hijo
  getChildPayments: (childId) => {
    const { paymentsByChild } = get()
    return paymentsByChild[childId] || []
  },

  // Actualizar un hijo específico (después de editar)
  updateChild: (childId, updatedData) => {
    set(state => ({
      children: state.children.map(child =>
        child.id === childId ? { ...child, ...updatedData } : child
      )
    }))
  },

  // Limpiar datos (al cerrar sesión)
  clearData: () => {
    set({
      children: [],
      activeYear: null,
      availableYears: [],
      paymentsByChild: {},
      stats: {
        hijosMatriculados: 0,
        promedioGeneral: 0,
        pagosPendientes: 0,
        asistenciaPromedio: 0
      },
      loading: false,
      error: null,
      lastFetch: null
    })
  },

  // Invalidar caché (forzar recarga en próxima visita)
  invalidateCache: () => {
    set({ lastFetch: null })
  }
}))

/**
 * Calcular estadísticas de los hijos
 */
function calculateStats(children, paymentsByChild) {
  if (!children || children.length === 0) {
    return {
      hijosMatriculados: 0,
      promedioGeneral: 0,
      pagosPendientes: 0,
      asistenciaPromedio: 0
    }
  }

  const hijosMatriculados = children.length

  // Promedio general
  const promedios = children
    .map(child => parseFloat(child.promedio_general || child.currentGrade || 0))
    .filter(p => p > 0)
  const promedioGeneral = promedios.length > 0
    ? promedios.reduce((a, b) => a + b, 0) / promedios.length
    : 0

  // Pagos pendientes
  let pagosPendientes = 0
  Object.values(paymentsByChild).forEach(payments => {
    pagosPendientes += payments.filter(p =>
      p.status === 'pending' || p.status === 'pendiente' ||
      p.estado === 'pending' || p.estado === 'pendiente'
    ).length
  })

  // También sumar desde los datos de los hijos si están disponibles
  children.forEach(child => {
    if (child.cantidad_pagos_pendientes) {
      // Solo si no contamos de paymentsByChild
      if (!paymentsByChild[child.id] || paymentsByChild[child.id].length === 0) {
        pagosPendientes += parseInt(child.cantidad_pagos_pendientes)
      }
    }
  })

  // Asistencia promedio
  const asistencias = children
    .map(child => parseFloat(child.porcentaje_asistencia || child.attendance || 0))
    .filter(a => a > 0)
  const asistenciaPromedio = asistencias.length > 0
    ? asistencias.reduce((a, b) => a + b, 0) / asistencias.length
    : 0

  return {
    hijosMatriculados,
    promedioGeneral,
    pagosPendientes,
    asistenciaPromedio
  }
}

export default useParentDataStore
