/**
 * Helpers para tipos de mensajes y colores
 */

import { MESSAGE_TYPES } from '@/constants/teacherCommunications'

export const getTypeConfig = (tipo) => {
  return MESSAGE_TYPES.find(t => t.id === tipo) || MESSAGE_TYPES[0]
}

export const getTypeIcon = (tipo) => {
  const typeConfig = getTypeConfig(tipo)
  return typeConfig.icon
}

export const getTypeColor = (tipo) => {
  const typeConfig = getTypeConfig(tipo)
  return typeConfig.color
}

export const getTypeName = (tipo) => {
  const typeConfig = getTypeConfig(tipo)
  return typeConfig.name
}
