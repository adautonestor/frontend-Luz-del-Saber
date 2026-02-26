import { useState } from 'react'

/**
 * Hook para gestionar modales (Alert y Confirm)
 * Reemplazo completo para window.alert() y window.confirm()
 *
 * @returns {Object} Funciones y estado para gestionar modales
 */
export const useModal = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger'
  })

  /**
   * Muestra un modal de alerta (reemplazo de alert())
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
   * @param {string} title - Título opcional
   */
  const showAlert = (message, type = 'info', title = null) => {
    const defaultTitles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    }

    setAlertModal({
      isOpen: true,
      title: title || defaultTitles[type] || 'Notificación',
      message,
      type
    })
  }

  /**
   * Cierra el modal de alerta
   */
  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  /**
   * Muestra un modal de confirmación (reemplazo de confirm())
   * @param {string} message - Mensaje de confirmación
   * @param {function} onConfirm - Callback a ejecutar si confirma
   * @param {Object} options - Opciones adicionales
   */
  const showConfirm = (message, onConfirm, options = {}) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || 'Confirmar Acción',
      message,
      onConfirm,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      variant: options.variant || 'danger'
    })
  }

  /**
   * Cierra el modal de confirmación
   */
  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }

  /**
   * Ejecuta la confirmación
   */
  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm()
    }
    closeConfirm()
  }

  return {
    // Alert modal
    alertModal,
    showAlert,
    closeAlert,

    // Confirm modal
    confirmModal,
    showConfirm,
    closeConfirm,
    handleConfirm
  }
}
