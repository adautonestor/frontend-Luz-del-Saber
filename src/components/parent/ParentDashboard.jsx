import React from 'react'
import { useAuthStore } from '../../stores/authStore'
import padreSvg from '../../config/padre.svg'
import { useScheduleStore } from '../../stores/scheduleStore.jsx'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useCoursesStore } from '../../stores/coursesStore'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { useParentDataStore } from '../../stores/parentDataStore'
import {
  getMyChildren,
  getActiveAvisos,
  getChildSchedule,
  getWeeklySchedule,
  getChildInfo
} from '../../utils/parentDashboardHelpers'
import { MAX_AVISOS_DASHBOARD, MAX_DAYS_SCHEDULE_PREVIEW } from '../../config/parentLayoutConstants'
import DashboardChildCard from './DashboardChildCard'
import DashboardStatsCards from './DashboardStatsCards'
import DashboardAvisos from './DashboardAvisos'
import DashboardSchedule from './DashboardSchedule'
import DashboardActivity from './DashboardActivity'
import { avisosService } from '../../services/avisosService'

/**
 * Dashboard principal para padres de familia
 * Usa store centralizado para compartir datos entre pantallas
 */
const ParentDashboard = () => {
  const { user } = useAuthStore()
  const { getGradeSchedules, initialize: initializeSchedules } = useScheduleStore()
  const { students, initialize: initializeEnrollment } = useEnrollmentStore()
  const { courses: allCourses, initialize: initializeCourses } = useCoursesStore()
  const { grades, sections, initialize: initializeAcademic } = useAcademicStore()
  const { initialize: initializeCommunications, getUserCommunications } = useCommunicationsStore()

  // Store centralizado para datos del padre
  const {
    children: storeChildren,
    stats: storeStats,
    loading: storeLoading,
    error: storeError,
    loadParentData,
    isCacheValid
  } = useParentDataStore()

  const [avisos, setAvisos] = React.useState([])
  const [selectedChild, setSelectedChild] = React.useState(null)
  const [expandedDay, setExpandedDay] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [comunicadosNoLeidos, setComunicadosNoLeidos] = React.useState(0)

  // Usar SOLO hijos del store centralizado (tiene datos enriquecidos con promedios)
  // El fallback de enrollmentStore no tiene promedio_general, así que no lo usamos
  const myChildren = storeChildren

  // Estadísticas combinadas (del store + comunicados)
  const stats = React.useMemo(() => ({
    hijosMatriculados: storeStats.hijosMatriculados,
    promedioGeneral: storeStats.promedioGeneral,
    pagosPendientes: storeStats.pagosPendientes,
    comunicadosNoLeidos: comunicadosNoLeidos
  }), [storeStats, comunicadosNoLeidos])

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Cargar datos del padre usando store centralizado (con caché)
        if (user?.id) {
          await loadParentData(user.id)
        }

        // Cargar comunicados del padre
        try {
          await initializeCommunications()
          const comunicadosData = getUserCommunications(user?.id, 'Padre') || []
          const noLeidos = comunicadosData.filter(c => !c.leido && !c.read).length
          setComunicadosNoLeidos(noLeidos)
        } catch (e) {
          console.warn('Error cargando comunicados:', e)
        }

        // Cargar avisos activos
        const avisosData = await avisosService.getAll() || []
        const avisosActivos = getActiveAvisos(avisosData, MAX_AVISOS_DASHBOARD)
        setAvisos(avisosActivos)

        // Cargar datos de horarios
        await Promise.all([
          initializeSchedules(),
          initializeEnrollment(),
          initializeCourses(),
          initializeAcademic()
        ])

      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setError('Hubo un problema al cargar los datos. Por favor, intente nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id, loadParentData, initializeSchedules, initializeEnrollment, initializeCourses, initializeAcademic, initializeCommunications, getUserCommunications])

  // Auto-seleccionar primer hijo cuando cambia la lista
  React.useEffect(() => {
    if (myChildren.length > 0 && !selectedChild) {
      setSelectedChild(myChildren[0])
    }
  }, [myChildren.length, selectedChild])

  // Combinar errores del store y locales
  const displayError = error || storeError

  // Get schedule for selected child
  const childSchedules = getChildSchedule(selectedChild, getGradeSchedules, allCourses)
  const weeklySchedule = getWeeklySchedule(childSchedules)
  const childInfo = getChildInfo(selectedChild, grades, sections)

  // Obtener primer nombre y primer apellido del usuario
  const getDisplayName = () => {
    if (!user) return ''

    const firstName = user.first_name?.split(' ')[0] || ''
    const firstLastName = user.last_names?.split(' ')[0] || ''

    return `${firstName} ${firstLastName}`.trim()
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {getDisplayName() || 'Padre de Familia'}
        </h1>
        <p className="mt-2 text-gray-600">
          Seguimiento académico y administrativo de tus hijos
        </p>
      </div>

      {/* Diagrama de flujo visual */}
      <div className="card p-4 bg-gray-50">
        <img
          src={padreSvg}
          alt="Guía para padres"
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Children Cards */}
      {storeLoading ? (
        <div className="card p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando información de tus hijos...</p>
        </div>
      ) : myChildren.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No se encontraron hijos matriculados en el sistema.</p>
          <p className="text-sm text-gray-400 mt-2">Si crees que esto es un error, contacta con la administración.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myChildren.map((child, index) => (
            <DashboardChildCard key={child.id} child={child} index={index} />
          ))}
        </div>
      )}

      {/* Mensaje de error si existe */}
      {displayError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{displayError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Recargar página
          </button>
        </div>
      )}

      {/* Summary Stats - Ahora con datos reales */}
      <DashboardStatsCards
        hijosMatriculados={stats.hijosMatriculados}
        promedioGeneral={stats.promedioGeneral}
        pagosPendientes={stats.pagosPendientes}
        comunicadosNoLeidos={stats.comunicadosNoLeidos}
      />

      {/* Avisos Section */}
      <DashboardAvisos avisos={avisos} />

      {/* Schedules Section */}
      <DashboardSchedule
        myChildren={myChildren}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        childInfo={childInfo}
        weeklySchedule={weeklySchedule}
        loading={loading}
        expandedDay={expandedDay}
        setExpandedDay={setExpandedDay}
        maxDays={MAX_DAYS_SCHEDULE_PREVIEW}
      />

      {/* Recent Activity and Alerts */}
      <DashboardActivity />
    </div>
  )
}

export default ParentDashboard
