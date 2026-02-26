import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { useAuthStore } from '../../stores/authStore'
import { useParentDataStore } from '../../stores/parentDataStore'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'
import ChildrenStatsCards from './ChildrenStatsCards'
import ChildCard from './ChildCard'
import ChildDetailModal from './ChildDetailModal'
import { usersService } from '../../services/usersService'
import { studentsService } from '../../services/studentsService'
import academicYearService from '../../services/academic/academicYearService'

/**
 * Componente principal que muestra la información de los hijos del padre
 * Incluye selector de año lectivo, estadísticas, tarjetas de hijos y modal de detalles
 * Usa store centralizado para compartir datos con otras pantallas
 */
const ParentChildren = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    initialize: initializePayments,
    isLoading: paymentsLoading
  } = usePaymentsStore()

  // Store centralizado
  const {
    children: storeChildren,
    activeYear: storeActiveYear,
    availableYears: storeYears,
    loadParentData,
    forceRefresh
  } = useParentDataStore()

  // Estados locales
  const [selectedChild, setSelectedChild] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [children, setChildren] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [parentData, setParentData] = useState(null)
  const [error, setError] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [user])

  // Cargar hijos cuando cambia el año lectivo
  useEffect(() => {
    if (user?.id && selectedAcademicYear) {
      loadChildren()
    }
  }, [selectedAcademicYear, user])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Inicializar pagos
      initializePayments()

      // Cargar datos del padre desde store centralizado (usa caché)
      if (user?.id) {
        await loadParentData(user.id)
      }

      // Cargar años lectivos disponibles
      let yearsData = storeYears
      if (!yearsData || yearsData.length === 0) {
        try {
          yearsData = await academicYearService.getAll() || []
        } catch (e) {
          console.warn('Error cargando años lectivos:', e)
          yearsData = []
        }
      }
      setAcademicYears(yearsData)

      // Establecer año actual como predeterminado con fallbacks robustos
      let selectedYear = null

      // Primero intentar con el año activo del store
      if (storeActiveYear) {
        selectedYear = storeActiveYear.año || storeActiveYear.year || storeActiveYear.academic_year
      }

      // Si no hay año en store, intentar obtener del servicio
      if (!selectedYear) {
        try {
          const currentYear = await academicYearService.getActive()
          if (currentYear) {
            selectedYear = currentYear.año || currentYear.year || currentYear.academic_year
          }
        } catch (e) {
          console.warn('No se pudo obtener año activo:', e)
        }
      }

      // Si aún no hay año, usar el primer año disponible
      if (!selectedYear && yearsData.length > 0) {
        const firstYear = yearsData[0]
        selectedYear = firstYear.año || firstYear.year || firstYear.academic_year
      }

      // Si todavía no hay año, usar el año actual del sistema
      if (!selectedYear) {
        selectedYear = new Date().getFullYear()
        console.warn(`Usando año actual del sistema: ${selectedYear}`)
      }

      setSelectedAcademicYear(selectedYear)

      // Obtener datos del padre actual
      if (user?.id) {
        try {
          const parent = await usersService.getById(user.id)
          setParentData(parent?.data || parent)
        } catch (e) {
          console.warn('Error cargando datos del padre:', e)
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Hubo un problema al cargar los datos. Por favor, intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChildren = async () => {
    try {
      if (!user?.id) return
      setError(null)

      // Primero intentar usar datos del store centralizado si están disponibles
      // y corresponden al año seleccionado
      let childrenArray = []

      if (storeChildren.length > 0) {
        // ========================================================================
        // NOTA IMPORTANTE: FILTRADO POR AÑO ACADÉMICO
        // ========================================================================
        // Los hijos mostrados en esta vista se FILTRAN por el año académico
        // seleccionado en el selector superior. Esto puede resultar en una
        // cantidad diferente a la mostrada en el Dashboard, ya que el Dashboard
        // muestra TODOS los hijos sin filtrar por año.
        //
        // Ejemplo: Si el padre tiene 6 hijos pero solo 5 están matriculados en
        // el año 2025, esta vista mostrará 5 cuando se seleccione 2025.
        // ========================================================================
        childrenArray = storeChildren.filter(child => {
          if (!selectedAcademicYear) return true
          const childYear = child.academic_year || child.año_lectivo || child.academicYear
          return childYear == selectedAcademicYear || String(childYear) === String(selectedAcademicYear)
        })
      }

      // Si no hay datos en store o están vacíos, cargar del backend
      if (childrenArray.length === 0) {
        try {
          const response = await studentsService.getByParent(user.id, {
            academicYear: selectedAcademicYear ? parseInt(selectedAcademicYear, 10) : null,
            enriched: true
          })
          const childrenData = response?.data || response || []
          childrenArray = Array.isArray(childrenData) ? childrenData : []
        } catch (e) {
          console.error('Error cargando hijos del backend:', e)
          setError('No se pudieron cargar los datos de sus hijos. Intente nuevamente.')
          setChildren([])
          return
        }
      }

      // Mapear los datos a la estructura esperada por los componentes
      // Ahora usamos los datos enriquecidos del backend
      const store = getGradingScalesStore()

      const mappedChildren = childrenArray.map(child => {
        // Calcular estado basado en promedio usando configuración dinámica del nivel
        const promedio = parseFloat(child.promedio_general) || 0
        const levelId = child.level_id || null
        let calculatedStatus = 'active'

        if (promedio > 0) {
          // Usar store SSOT para obtener el color/estado basado en la configuración del nivel
          const hexColor = store.getGradeColor(promedio, levelId)

          // Mapear color a estado
          const statusMap = {
            '#22c55e': 'excellent',  // Verde - Excelente
            '#3b82f6': 'good',       // Azul - Bueno
            '#eab308': 'attention',  // Amarillo - Atención
            '#ef4444': 'critical'    // Rojo - Crítico
          }
          calculatedStatus = statusMap[hexColor] || 'active'
        }

        // Convertir materias del backend al formato esperado por el frontend
        const materias = child.materias || []
        const subjectsObject = {}
        if (Array.isArray(materias)) {
          materias.forEach(mat => {
            if (mat.curso_nombre) {
              subjectsObject[mat.curso_nombre] = {
                grade: parseFloat(mat.promedio) || 0,
                quarter: mat.bimestre,
                teacher: '' // El backend no trae el profesor por materia
              }
            }
          })
        }

        return {
          ...child,
          // Mapear campos básicos
          name: `${child.first_names || ''} ${child.last_names || ''}`.trim(),
          birthDate: child.birth_date,
          code: child.code,
          level: child.level_name || child.nivelNombre || child.nivel || '',
          grade: child.grade_name || child.gradoNombre || child.grado || '',
          section: child.section_name || child.seccionNombre || child.seccion || '',
          academicYear: child.academic_year,

          // Datos enriquecidos del backend (YA NO SON HARDCODED)
          currentGrade: parseFloat(child.promedio_general) || 0,
          attendance: parseFloat(child.porcentaje_asistencia) || 0,
          totalAttendanceDays: parseInt(child.total_dias) || 0,
          daysPresent: parseInt(child.dias_presente) || 0,
          status: calculatedStatus,
          teacher: child.tutor_nombre || 'Sin asignar',
          room: child.aula || 'Sin asignar',
          pendingPayments: parseInt(child.cantidad_pagos_pendientes) || 0,
          pendingAmount: parseFloat(child.monto_pendiente) || 0,
          lastActivity: child.ultima_asistencia || new Date().toISOString(),
          subjects: subjectsObject,
          behavior: {
            discipline: child.comportamiento_disciplina || null,
            parentRating: child.comportamiento_evaluacion || null,
            comments: child.comportamiento_comentarios || null,
            quarter: child.comportamiento_bimestre || null
          },
          schedule: child.horario || [],

          // Campos sin tabla en BD (mantener vacíos)
          nextExams: [],
          achievements: []
        }
      })

      setChildren(mappedChildren)
    } catch (error) {
      console.error('Error loading children:', error)
      setChildren([])
    }
  }

  // Handlers
  const handlePaymentRedirect = () => {
    navigate('/parent/payments')
  }

  const openChildModal = (child) => {
    setSelectedChild(child)
    setShowModal(true)
  }

  const closeChildModal = () => {
    setShowModal(false)
    setSelectedChild(null)
  }

  const handleViewMoreDetails = (child) => {
    navigate(`/padre/hijos/${child.code}`, {
      state: {
        child: child,
        academicYear: selectedAcademicYear
      }
    })
  }

  // Handler para recargar datos
  const handleRefresh = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true)
      try {
        await forceRefresh(user.id)
        await loadChildren()
      } finally {
        setIsLoading(false)
      }
    }
  }, [user?.id, forceRefresh])

  // Estados condicionales
  if (isLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando información de sus hijos...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Hijos</h1>
          <p className="mt-2 text-gray-600">Información académica y seguimiento</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  // Obtener primer nombre y primer apellido del usuario
  const getDisplayName = () => {
    if (!user) return ''

    const firstName = user.first_name?.split(' ')[0] || ''
    const firstLastName = user.last_names?.split(' ')[0] || ''

    return `${firstName} ${firstLastName}`.trim()
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de año lectivo */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {getDisplayName() || 'Padre de Familia'}
          </h1>
          <p className="mt-2 text-gray-600">
            Información académica y seguimiento de tus hijos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="input"
              disabled={academicYears.length === 0}
            >
              {academicYears.length === 0 ? (
                <option value="">Sin años disponibles</option>
              ) : (
                academicYears.map(year => (
                  <option key={year.id} value={year.academic_year || year.año}>
                    Año Lectivo {year.academic_year || year.año}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <ChildrenStatsCards children={children} />

      {/* Children Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child, index) => (
          <ChildCard
            key={child.id}
            child={child}
            index={index}
            onOpenModal={openChildModal}
          />
        ))}
      </div>

      {/* Child Detail Modal */}
      <ChildDetailModal
        isOpen={showModal}
        child={selectedChild}
        onClose={closeChildModal}
        onViewMoreDetails={handleViewMoreDetails}
      />
    </div>
  )
}

export default ParentChildren
