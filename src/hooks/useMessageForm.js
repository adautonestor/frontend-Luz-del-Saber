import { useState } from 'react'
import { getInitialMessageForm } from '@/constants/teacherCommunications'
import { getDefaultExpirationDate } from '@/utils/teacherCommunications'

/**
 * Hook para manejar el estado del formulario de mensajes
 */
export const useMessageForm = () => {
  const [messageForm, setMessageForm] = useState(getInitialMessageForm(getDefaultExpirationDate))

  const resetForm = () => {
    setMessageForm(getInitialMessageForm(getDefaultExpirationDate))
  }

  const updateForm = (field, value) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateMultipleFields = (fields) => {
    setMessageForm(prev => ({
      ...prev,
      ...fields
    }))
  }

  return {
    messageForm,
    setMessageForm,
    resetForm,
    updateForm,
    updateMultipleFields
  }
}
