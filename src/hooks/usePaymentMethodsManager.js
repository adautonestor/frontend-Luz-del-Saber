import { useState, useEffect } from 'react'
import { usePaymentsStore } from '../stores/paymentsStore'
import * as settingsService from '../services/settingsService'

/**
 * Hook para gestionar métodos de pago
 * Maneja CRUD completo de métodos de pago
 * Integrado con APIs reales del backend
 */
export const usePaymentMethodsManager = () => {
  const [showAddMethodModal, setShowAddMethodModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [methodForm, setMethodForm] = useState({
    type: 'digital',
    name: '',
    instructions: '',
    phone_number: '',
    bank: '',
    account_number: '',
    cci: '',
    holder: '',
    qr_code: '',
    status: 'active'
  })
  const [showAlert, setShowAlert] = useState(false)

  const paymentsStore = usePaymentsStore()

  // Cargar métodos de pago al montar
  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      // Solo cargar si no hay métodos ya cargados
      if (paymentsStore.methods.length === 0) {
        await paymentsStore.initialize()
      }
      // Ya no creamos defaults automáticamente - se gestionan manualmente desde el UI
    } catch (error) {
      console.error('Error loading payment methods:', error)
    }
  }

  // Subir imagen a Wasabi
  const uploadImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'payment-methods')

      const response = await settingsService.uploadFile(formData)

      // El backend retorna {success, data: {path, url}}
      if (response.success && response.data) {
        return response.data.path || response.data.url
      } else if (response.path || response.url) {
        return response.path || response.url
      }
      return null
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      return null
    }
  }

  // Agregar nuevo método
  const handleAddMethod = async () => {
    try {
      let qrCodeUrl = null

      // Si hay archivo de imagen, subirlo primero
      if (methodForm.qr_file) {
        qrCodeUrl = await uploadImage(methodForm.qr_file)
      } else if (methodForm.qr_code && !methodForm.qr_code.startsWith('blob:')) {
        qrCodeUrl = methodForm.qr_code
      }

      const methodData = {
        type: methodForm.type,
        name: methodForm.name,
        instructions: methodForm.instructions,
        phone_number: methodForm.phone_number || null,
        bank: methodForm.bank || null,
        account_number: methodForm.account_number || null,
        cci: methodForm.cci || null,
        holder: methodForm.holder || null,
        qr_code: qrCodeUrl,
        status: 'active'
      }

      await paymentsStore.createPaymentMethod(methodData)

      setShowAddMethodModal(false)
      setMethodForm({
        type: 'digital',
        name: '',
        instructions: '',
        phone_number: '',
        bank: '',
        account_number: '',
        cci: '',
        holder: '',
        qr_code: '',
        status: 'active'
      })
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Error adding method:', error)
      alert('Error al agregar el método: ' + error.message)
    }
  }

  // Editar método existente
  const handleEditMethod = (method) => {
    setEditingMethod(method)
    setMethodForm({
      type: method.type || 'digital',
      name: method.name || '',
      instructions: method.instructions || '',
      phone_number: method.phone_number || '',
      bank: method.bank || '',
      account_number: method.account_number || '',
      cci: method.cci || '',
      holder: method.holder || '',
      qr_code: method.qr_code || '',
      status: method.status || 'active'
    })
    setShowAddMethodModal(true)
  }

  // Actualizar método
  const handleUpdateMethod = async () => {
    if (!editingMethod) return

    try {
      let qrCodeUrl = null

      // Si hay archivo de imagen nuevo, subirlo primero
      if (methodForm.qr_file) {
        qrCodeUrl = await uploadImage(methodForm.qr_file)
      } else if (methodForm.qr_code && !methodForm.qr_code.startsWith('blob:')) {
        qrCodeUrl = methodForm.qr_code
      }

      const methodData = {
        type: methodForm.type,
        name: methodForm.name,
        instructions: methodForm.instructions,
        phone_number: methodForm.phone_number || null,
        bank: methodForm.bank || null,
        account_number: methodForm.account_number || null,
        cci: methodForm.cci || null,
        holder: methodForm.holder || null,
        qr_code: qrCodeUrl,
        status: 'active'
      }

      await paymentsStore.updatePaymentMethod(editingMethod.id, methodData)

      setShowAddMethodModal(false)
      setEditingMethod(null)
      setMethodForm({
        type: 'digital',
        name: '',
        instructions: '',
        phone_number: '',
        bank: '',
        account_number: '',
        cci: '',
        holder: '',
        qr_code: '',
        status: 'active'
      })
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Error updating method:', error)
      alert('Error al actualizar el método: ' + error.message)
    }
  }

  // Eliminar método
  const handleDeleteMethod = async (id) => {
    if (!confirm('¿Está seguro de eliminar este método de pago?')) return

    try {
      await paymentsStore.deletePaymentMethod(id)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    } catch (error) {
      console.error('Error deleting method:', error)
      alert('Error al eliminar el método: ' + error.message)
    }
  }

  // Activar/desactivar método
  const handleToggleMethod = async (id) => {
    try {
      const method = paymentsStore.methods.find(m => m.id === id)
      if (!method) return

      const currentStatus = method.status || 'active'
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

      await paymentsStore.updatePaymentMethod(id, { status: newStatus })
    } catch (error) {
      console.error('Error toggling method:', error)
      alert('Error al cambiar el estado: ' + error.message)
    }
  }

  return {
    paymentMethods: paymentsStore.methods,
    showAddMethodModal,
    setShowAddMethodModal,
    editingMethod,
    setEditingMethod,
    methodForm,
    setMethodForm,
    showAlert,
    setShowAlert,
    handleAddMethod,
    handleEditMethod,
    handleUpdateMethod,
    handleDeleteMethod,
    handleToggleMethod
  }
}
