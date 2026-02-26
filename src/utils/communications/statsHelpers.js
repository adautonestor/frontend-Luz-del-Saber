/**
 * Calcula las estadísticas de comunicaciones
 * @param {Array} communications - Lista de comunicaciones
 * @returns {Object} Estadísticas calculadas
 */
export const calculateCommunicationsStats = (communications) => {
  const now = new Date()

  return {
    // Estados del backend: 'sent', 'draft', 'scheduled', 'deleted'
    totalSent: communications.filter(c => c.state === 'sent' || c.status === 'sent').length,
    drafts: communications.filter(c => c.state === 'draft' || c.status === 'draft').length,
    scheduled: communications.filter(c => c.state === 'scheduled' || c.status === 'scheduled').length,
    thisMonth: communications.filter(c => {
      const date = new Date(c.fechaEnvio || c.send_date)
      return date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear() &&
             (c.state === 'sent' || c.status === 'sent')
    }).length
  }
}
