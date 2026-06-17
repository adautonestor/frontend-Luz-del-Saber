import React, { useState, useEffect, useMemo } from 'react'
import { useCommunicationsStore } from '../../stores/communicationsStore'
import { useAuthStore } from '../../stores/authStore'
import {
  transformCommunications,
  filterCommunications,
  groupCommunicationsByMonth,
  calculateCommunicationStats
} from '../../utils/communicationsHelpers'
import CommunicationsFilters from './CommunicationsFilters'
import CommunicationsSummaryCards from './CommunicationsSummaryCards'
import CommunicationsList from './CommunicationsList'
import CommunicationDetailModal from './CommunicationDetailModal'
import Pagination from '../common/Pagination'
import { usePagination } from '../../hooks/usePagination'

/**
 * Componente principal de comunicaciones para padres
 */
const ParentCommunications = () => {
  const { user } = useAuthStore()
  const { getUserCommunications, markAsRead, initialize } = useCommunicationsStore()

  // Estados de filtros
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Estados de modal
  const [selectedCommunication, setSelectedCommunication] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Inicializar store de comunicaciones
  useEffect(() => {
    initialize()
  }, [initialize])

  // Obtener comunicaciones del usuario (filtradas por rol)
  const userRole = user?.rol || user?.role || 'Padre'
  const userCommunications = user ? getUserCommunications(user.id, userRole) : []

  // Transformar comunicaciones
  const communications = useMemo(() => {
    return transformCommunications(userCommunications)
  }, [userCommunications, transformCommunications])

  // Filtrar comunicaciones usando useMemo
  const filteredCommunications = useMemo(() => {
    return filterCommunications(communications, {
      searchTerm,
      filterType,
      filterStatus
    })
  }, [communications, filterCommunications, searchTerm, filterType, filterStatus])

  // Calcular estadísticas
  const stats = useMemo(() => {
    return calculateCommunicationStats(communications)
  }, [communications, calculateCommunicationStats])

  // Paginación de la lista de comunicados (sobre el arreglo filtrado y plano)
  const pg = usePagination(filteredCommunications, 10, JSON.stringify({ searchTerm, filterType, filterStatus }))

  // Agrupar por mes solo los comunicados de la página actual
  const groupedCommunications = useMemo(() => {
    return groupCommunicationsByMonth(pg.pageItems)
  }, [pg.pageItems, groupCommunicationsByMonth])

  // Handlers
  const handleOpenCommunication = async (communication) => {
    setSelectedCommunication(communication)
    setShowModal(true)

    // Marcar como leído automáticamente al abrir
    if (user && communication.id) {
      try {
        await markAsRead(communication.id, user.id, {
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent
        })
      } catch (error) {
        console.error('Error al marcar como leído:', error)
      }
    }
  }

  const handleCloseCommunication = () => {
    setShowModal(false)
    setSelectedCommunication(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comunicados</h1>
        <p className="mt-2 text-gray-600">
          Mantente informado sobre las actividades y comunicaciones del colegio
        </p>
      </div>

      {/* Filtros */}
      <CommunicationsFilters
        filterType={filterType}
        filterStatus={filterStatus}
        searchTerm={searchTerm}
        onTypeChange={setFilterType}
        onStatusChange={setFilterStatus}
        onSearchChange={setSearchTerm}
      />

      {/* Tarjetas de Resumen */}
      <CommunicationsSummaryCards stats={stats} />

      {/* Lista de Comunicados */}
      <CommunicationsList
        groupedCommunications={groupedCommunications}
        onOpenCommunication={handleOpenCommunication}
      />

      <Pagination
        page={pg.page}
        totalPages={pg.totalPages}
        total={pg.total}
        from={pg.from}
        to={pg.to}
        pageSize={pg.pageSize}
        onPageChange={pg.setPage}
        onPrev={pg.prev}
        onNext={pg.next}
        onPageSizeChange={pg.setPageSize}
      />

      {/* Modal de Detalle */}
      <CommunicationDetailModal
        isOpen={showModal}
        communication={selectedCommunication}
        onClose={handleCloseCommunication}
      />
    </div>
  )
}

export default ParentCommunications
