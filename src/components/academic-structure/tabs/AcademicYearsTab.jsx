import React, { useState, useEffect } from 'react'
import {
  Calendar,
  PlayCircle,
  Clock,
  Lock,
  Archive,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Tag,
  Trash2,
  Palette,
  Save,
  RefreshCw
} from 'lucide-react'
import { academicYearService } from '../../../services/academic/academicYearService'
import { academicYearTypesService } from '../../../services/academic/academicYearTypesService'

/**
 * Tab de gestión de años lectivos
 * Maneja creación, edición, activación y cierre de años académicos
 */
const AcademicYearsTab = ({
  academicYears,
  currentAcademicYear,
  setShowModal,
  setModalType,
  setShowCloseYearModal,
  loadAcademicData,
  setEditingItem,
  setAcademicYearForm
}) => {
  const [notification, setNotification] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null) // { title, message, onConfirm, confirmText, type }

  // Estados para gestión de tipos de año (conectado a API)
  const [showYearTypesSection, setShowYearTypesSection] = useState(false)
  const [yearTypes, setYearTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [savingType, setSavingType] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6',
    order: 0
  })

  // Cargar tipos de año cuando se abre la sección
  useEffect(() => {
    if (showYearTypesSection && yearTypes.length === 0) {
      loadYearTypes()
    }
  }, [showYearTypesSection])

  const loadYearTypes = async () => {
    setLoadingTypes(true)
    try {
      const types = await academicYearTypesService.getAll()
      setYearTypes(types || [])
    } catch (error) {
      console.error('Error cargando tipos:', error)
      setNotification({
        type: 'error',
        message: 'Error al cargar tipos de año'
      })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setLoadingTypes(false)
    }
  }

  const getYearStatusColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'planificado':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cerrado':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getYearStatusIcon = (estado) => {
    switch (estado) {
      case 'activo':
        return <PlayCircle className="w-5 h-5 text-green-600" />
      case 'planificado':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'cerrado':
        return <Lock className="w-5 h-5 text-gray-600" />
      default:
        return null
    }
  }

  const handleCreateAcademicYear = () => {
    setEditingItem(null)
    setAcademicYearForm({
      name: '',
      año: new Date().getFullYear(),
      type: 'regular',
      fechaInicio: '',
      fechaFin: '',
      description: '',
      state: 'planificado'
    })
    setModalType('academic-year')
    setShowModal(true)
  }

  const handleEditAcademicYear = (year) => {
    console.log('📝 Editando año:', year) // Debug
    setEditingItem(year)

    // Priorizar campos transformados del servicio
    const fechaInicio = year.fechaInicio || year.start_date || ''
    const fechaFin = year.fechaFin || year.end_date || ''

    setAcademicYearForm({
      name: year.name || '',
      año: year.año || year.year || new Date().getFullYear(),
      type: year.type || 'regular',
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      description: year.description || '',
      state: year.state || 'planificado'
    })

    console.log('📝 Form cargado con fechas:', { fechaInicio, fechaFin }) // Debug
    setModalType('academic-year')
    setShowModal(true)
  }

  const handleActivateYear = (yearId, yearName) => {
    setConfirmDialog({
      title: '¿Activar año lectivo?',
      message: `¿Está seguro de activar "${yearName}"? Esto desactivará el año lectivo actual.`,
      confirmText: 'Sí, Activar',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          // Activate selected year using real API service
          await academicYearService.activate(yearId)

          // Reload academic data to reflect changes
          await loadAcademicData()

          setNotification({
            type: 'success',
            message: 'Año lectivo activado correctamente'
          })
          setTimeout(() => setNotification(null), 4000)
        } catch (error) {
          console.error('Error activating year:', error)
          setNotification({
            type: 'error',
            message: 'Error al activar el año lectivo: ' + (error.message || 'Error desconocido')
          })
          setTimeout(() => setNotification(null), 5000)
        }
      }
    })
  }

  const handleDeleteYear = (year) => {
    setConfirmDialog({
      title: '¿Eliminar año lectivo?',
      message: `¿Está seguro de eliminar "${year.name}"? Esta acción no se puede deshacer. Solo se permite eliminar años sin estudiantes matriculados vigentes.`,
      confirmText: 'Sí, Eliminar',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null)
        try {
          await academicYearService.delete(year.id)
          await loadAcademicData()
          setNotification({
            type: 'success',
            message: 'Año lectivo eliminado correctamente'
          })
          setTimeout(() => setNotification(null), 4000)
        } catch (error) {
          console.error('Error al eliminar año:', error)
          setNotification({
            type: 'error',
            message: error.message || 'Error al eliminar el año lectivo'
          })
          setTimeout(() => setNotification(null), 5000)
        }
      }
    })
  }

  // === Funciones para Tipos de Año (conectado a API) ===
  const handleOpenTypeModal = (type = null) => {
    if (type) {
      setEditingType(type)
      setTypeForm({
        name: type.name,
        code: type.code,
        description: type.description || '',
        color: type.color || '#3B82F6',
        order: type.order || 0
      })
    } else {
      // Calcular siguiente orden automáticamente
      const maxOrder = yearTypes.length > 0
        ? Math.max(...yearTypes.map(t => t.order || 0))
        : 0
      setEditingType(null)
      setTypeForm({
        name: '',
        code: '',
        description: '',
        color: '#3B82F6',
        order: maxOrder + 1
      })
    }
    setShowTypeModal(true)
  }

  const handleSaveType = async () => {
    if (!typeForm.name || !typeForm.code) {
      setNotification({
        type: 'error',
        message: 'Nombre y codigo son requeridos'
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setSavingType(true)
    try {
      if (editingType) {
        // Actualizar tipo existente
        await academicYearTypesService.update(editingType.id, typeForm)
        setNotification({
          type: 'success',
          message: 'Tipo de año actualizado correctamente'
        })
      } else {
        // Crear nuevo tipo
        await academicYearTypesService.create(typeForm)
        setNotification({
          type: 'success',
          message: 'Tipo de año creado correctamente'
        })
      }

      // Recargar lista
      await loadYearTypes()
      setShowTypeModal(false)
      setEditingType(null)
    } catch (error) {
      console.error('Error guardando tipo:', error)
      setNotification({
        type: 'error',
        message: error.message || 'Error al guardar tipo de año'
      })
    } finally {
      setSavingType(false)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleDeleteType = (typeId) => {
    setConfirmDialog({
      title: '¿Eliminar tipo de año?',
      message: '¿Esta seguro de eliminar este tipo de año? Esta accion no se puede deshacer.',
      confirmText: 'Si, Eliminar',
      type: 'warning',
      onConfirm: async () => {
        try {
          await academicYearTypesService.delete(typeId)
          await loadYearTypes()
          setConfirmDialog(null)
          setNotification({
            type: 'success',
            message: 'Tipo de año eliminado correctamente'
          })
        } catch (error) {
          console.error('Error eliminando tipo:', error)
          setNotification({
            type: 'error',
            message: error.message || 'Error al eliminar tipo de año'
          })
        }
        setTimeout(() => setNotification(null), 3000)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Años Lectivos</h2>
          <p className="text-gray-600">Administra el ciclo de vida de los años académicos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowYearTypesSection(!showYearTypesSection)}
            className={`btn px-4 py-2 flex items-center gap-2 ${
              showYearTypesSection
                ? 'btn-secondary'
                : 'btn-outline'
            }`}
          >
            <Tag size={20} />
            Tipos de Año
          </button>
          <button
            onClick={handleCreateAcademicYear}
            className="btn btn-primary px-4 py-2 flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Año Lectivo
          </button>
        </div>
      </div>

      {/* Year Types Section */}
      {showYearTypesSection && (
        <div className="card p-6 border-2 border-indigo-200 bg-indigo-50/50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tipos de Año Lectivo</h3>
              {loadingTypes && (
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              )}
            </div>
            <button
              onClick={() => handleOpenTypeModal()}
              className="btn btn-primary btn-sm px-3 py-1 flex items-center gap-1"
            >
              <Plus size={16} />
              Nuevo Tipo
            </button>
          </div>

          {loadingTypes ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
              <span className="text-gray-500">Cargando tipos...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearTypes.sort((a, b) => (a.order || 0) - (b.order || 0)).map((type) => (
                  <div
                    key={type.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: type.color }}
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{type.name}</h4>
                          <span className="text-xs text-gray-500 font-mono">{type.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenTypeModal(type)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-600 mt-2">{type.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      <span>Orden: {type.order}</span>
                    </div>
                  </div>
                ))}
              </div>

              {yearTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay tipos de año configurados</p>
                  <button
                    onClick={() => handleOpenTypeModal()}
                    className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Crear el primero
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Alerta de fecha de fin vencida */}
      {currentAcademicYear && (currentAcademicYear.state === 'activo' || currentAcademicYear.status === 'active') && (() => {
        const endDate = new Date(currentAcademicYear.end_date || currentAcademicYear.fechaFin)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)
        const isExpired = endDate <= today

        if (!isExpired) return null

        return (
          <div className="card p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ¡El año lectivo activo ha llegado a su fecha de fin!
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  El año lectivo <strong>"{currentAcademicYear.name}"</strong> tenía como fecha de fin el{' '}
                  <strong>{new Date(currentAcademicYear.end_date || currentAcademicYear.fechaFin).toLocaleDateString('es-PE')}</strong>.
                  Es necesario cerrar este año lectivo para mantener la integridad de los datos académicos.
                </p>
                <button
                  onClick={() => setShowCloseYearModal(true)}
                  className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 flex items-center gap-2 font-semibold"
                >
                  <Archive size={16} />
                  Cerrar Año Lectivo Ahora
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Current Year Status */}
      {currentAcademicYear ? (
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentAcademicYear.name}
                </h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getYearStatusColor(currentAcademicYear.state || 'planificado')}`}>
                  {(currentAcademicYear.state || 'planificado').toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Inicio:</span> {new Date(currentAcademicYear.start_date).toLocaleDateString('es-PE')}
                </div>
                <div>
                  <span className="font-medium">Fin:</span> {new Date(currentAcademicYear.end_date).toLocaleDateString('es-PE')}
                </div>
              </div>
            </div>
            {(currentAcademicYear.state || 'planificado') === 'activo' && (
              <button
                onClick={() => setShowCloseYearModal(true)}
                className="btn btn-outline text-orange-600 border-orange-200 hover:bg-orange-50 px-4 py-2 flex items-center gap-2"
              >
                <Archive size={16} />
                Cerrar Año
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                No hay año lectivo activo
              </h3>
              <p className="text-sm text-yellow-700">
                No hay ningún año académico activo en este momento. Puede activar uno desde la lista de años lectivos a continuación.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Academic Years List */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Todos los Años Lectivos</h3>

          <div className="space-y-4">
            {academicYears.map((year) => (
              <div
                key={year.id}
                className={`p-4 border rounded-lg transition-colors ${
                  (year.state || 'planificado') === 'activo' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getYearStatusIcon(year.state || 'planificado')}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {year.añoCodigo || year.año} - {year.name}
                        {year.type && year.type !== 'regular' && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {year.type === 'recuperacion' ? 'Recuperación' : 'Vacacional'}
                          </span>
                        )}
                      </h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          {new Date(year.start_date).toLocaleDateString('es-PE')} - {new Date(year.end_date).toLocaleDateString('es-PE')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getYearStatusColor(year.state || 'planificado')}`}>
                          {year.state || 'planificado'}
                        </span>
                      </div>
                      {year.description && (
                        <p className="text-sm text-gray-500 mt-1">{year.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(year.state || 'planificado') !== 'activo' && (year.state || 'planificado') !== 'cerrado' && (
                      <button
                        onClick={() => handleActivateYear(year.id, year.name)}
                        className="btn btn-sm btn-outline text-green-600 border-green-200 hover:bg-green-50 px-3 py-1"
                      >
                        Activar
                      </button>
                    )}

                    <button
                      onClick={() => handleEditAcademicYear(year)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Editar año lectivo"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Botón eliminar - solo para años no activos */}
                    {(year.state || 'planificado') !== 'activo' && (
                      <button
                        onClick={() => handleDeleteYear(year)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar año lectivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotification(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <button
              onClick={() => setNotification(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              } rounded-full p-3`}>
                {notification.type === 'success' ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>

              <div className="flex-1 pt-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  notification.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {notification.type === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setNotification(null)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  notification.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <button
              onClick={() => setConfirmDialog(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${
                confirmDialog.type === 'danger'
                  ? 'bg-red-100 text-red-600'
                  : confirmDialog.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-blue-100 text-blue-600'
              } rounded-full p-3`}>
                {confirmDialog.type === 'danger' ? <Trash2 size={24} /> : <AlertCircle size={24} />}
              </div>

              <div className="flex-1 pt-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  confirmDialog.type === 'danger'
                    ? 'text-red-900'
                    : confirmDialog.type === 'warning'
                      ? 'text-yellow-900'
                      : 'text-blue-900'
                }`}>
                  {confirmDialog.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  confirmDialog.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : confirmDialog.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear/Editar Tipo de Año (Cosmético) */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTypeModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 transform transition-all animate-scale-in">
            <button
              onClick={() => setShowTypeModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">
                <Tag size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {editingType ? 'Editar Tipo de Año' : 'Nuevo Tipo de Año'}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: Regular"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={typeForm.code}
                    onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="input w-full font-mono"
                    placeholder="Ej: regular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="input w-full"
                  rows={2}
                  placeholder="Descripción del tipo de año..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-2">
                    <Palette size={14} />
                    Color
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={typeForm.color}
                    onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={typeForm.color}
                    onChange={(e) => setTypeForm({ ...typeForm, color: e.target.value })}
                    className="input flex-1 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 mb-2 block">Vista previa:</span>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: typeForm.color }}
                  />
                  <span className="font-semibold">{typeForm.name || 'Nombre'}</span>
                  <span className="text-xs text-gray-500 font-mono">({typeForm.code || 'codigo'})</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowTypeModal(false)}
                disabled={savingType}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveType}
                disabled={savingType}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 disabled:opacity-50"
              >
                {savingType ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {savingType ? 'Guardando...' : (editingType ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AcademicYearsTab
