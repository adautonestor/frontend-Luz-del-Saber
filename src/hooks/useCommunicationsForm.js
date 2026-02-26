import { useState } from 'react'
import { getInitialFormData } from '@/constants/communications'

/**
 * Hook personalizado para manejar el estado del formulario de comunicaciones
 * @returns {Object} Estado y funciones del formulario
 */
export const useCommunicationsForm = () => {
  const [formData, setFormData] = useState(getInitialFormData())
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)

  const resetForm = () => {
    setFormData(getInitialFormData())
    setUserSearchTerm('')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMessage(null)
    resetForm()
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  return {
    formData,
    setFormData,
    userSearchTerm,
    setUserSearchTerm,
    isModalOpen,
    setIsModalOpen,
    selectedMessage,
    setSelectedMessage,
    resetForm,
    handleCloseModal,
    handleOpenModal
  }
}
