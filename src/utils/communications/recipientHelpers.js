/**
 * Utilidades para cálculo de destinatarios de comunicaciones
 * Helpers puros - los datos deben ser provistos por el llamador desde servicios/stores
 */

/**
 * Obtiene el conteo/descripción de destinatarios de una comunicación
 * @param {Object} comm - Comunicación
 * @param {Array} levels - Niveles disponibles
 * @param {Array} grades - Grados disponibles
 * @param {Array} sections - Secciones disponibles
 * @param {Array} availableUsers - Usuarios disponibles
 * @returns {string} Descripción de destinatarios
 */
export const getRecipientCount = (comm, levels = [], grades = [], sections = [], availableUsers = []) => {
  // Manejar nuevo formato de destinatarios { type, valores }
  const destinatarios = comm.destinatarios || {}

  // Si es el formato antiguo (array), mantener compatibilidad
  if (Array.isArray(destinatarios)) {
    const recipients = destinatarios
    if (recipients.includes('todos')) return 'Todos'
    if (recipients.includes('profesores') && recipients.includes('padres')) return 'Profesores y Padres'
    if (recipients.includes('profesores')) return 'Profesores'
    if (recipients.includes('padres')) return 'Padres'
    return `${recipients.length} destinatarios`
  }

  // Nuevo formato { type, valores }
  if (!destinatarios.type) {
    return '0 destinatarios'
  }

  switch (destinatarios.type) {
    case 'todos':
      return 'Todos'
    case 'profesores':
      return 'Profesores'
    case 'padres':
      return 'Padres'
    case 'profesores_y_padres':
      return 'Profesores y Padres'
    case 'nivel':
      if (destinatarios.valores && destinatarios.valores.length > 0) {
        const level = levels.find(l => l.id === destinatarios.valores[0])
        return level ? `Nivel ${level.name}` : 'Por nivel'
      }
      return 'Por nivel'
    case 'grado':
      if (destinatarios.valores && destinatarios.valores.length > 0) {
        const grade = grades.find(g => g.id === destinatarios.valores[0])
        return grade ? `Grado ${grade.name}` : 'Por grado'
      }
      return 'Por grado'
    case 'seccion':
      if (destinatarios.valores && destinatarios.valores.length > 0) {
        const section = sections.find(s => s.id === destinatarios.valores[0])
        return section ? `Sección ${section.name}` : 'Por sección'
      }
      return 'Por sección'
    case 'especifico':
      if (destinatarios.valores && destinatarios.valores.length > 0) {
        const userId = destinatarios.valores[0]
        const user = availableUsers.find(u => u.id === userId || u.id === Number(userId))
        if (user) {
          const displayName = user.name || `${user.first_name || ''} ${user.last_names || ''}`.trim()
          return displayName || '1 usuario específico'
        }
      }
      return '1 usuario específico'
    case 'estudiantes':
      if (destinatarios.valores && destinatarios.valores.length > 0) {
        const n = destinatarios.valores.length
        return n === 1 ? 'Padres de 1 estudiante' : `Padres de ${n} estudiantes`
      }
      return 'Padres de estudiantes seleccionados'
    default:
      return 'Destinatarios'
  }
}

/**
 * Estima la cantidad de destinatarios basada en filtros del formulario
 * Versión simplificada que funciona con los datos disponibles en el frontend
 * @param {Object} formData - Datos del formulario
 * @param {Array} levels - Niveles disponibles
 * @param {Array} grades - Grados disponibles
 * @returns {number|string} Cantidad estimada o descripción de destinatarios
 */
export const getEstimatedRecipientCount = (formData, levels = [], grades = []) => {
  // Usuario específico
  if (formData.usuarioEspecifico) {
    return 1
  }

  // Sin destinatarios seleccionados
  if (!formData.destinatarios || formData.destinatarios.length === 0) {
    return 0
  }

  // Todos seleccionado
  if (formData.destinatarios.includes('todos')) {
    return 'Todos los usuarios'
  }

  // Calcular descripción basada en selección
  const destDescriptions = []

  if (formData.destinatarios.includes('profesores')) {
    destDescriptions.push('Profesores')
  }

  if (formData.destinatarios.includes('padres')) {
    destDescriptions.push('Padres')
  }

  if (destDescriptions.length > 0) {
    return destDescriptions.join(' y ')
  }

  return `${formData.destinatarios.length} grupo(s)`
}

/**
 * Genera descripción de filtros aplicados
 * @param {Object} formData - Datos del formulario
 * @param {Array} levels - Niveles disponibles
 * @param {Array} grades - Grados disponibles
 * @param {Array} sections - Secciones disponibles
 * @returns {string} Descripción de filtros
 */
export const getFilterDescription = (formData, levels = [], grades = [], sections = []) => {
  const descriptions = []

  if (formData.filtros.padresMorosos) descriptions.push('padres morosos')
  if (formData.filtros.matriculaActiva) descriptions.push('matrícula activa')
  if (formData.filtros.bajoRendimiento) descriptions.push('bajo rendimiento académico')

  if (formData.filtros.nivel) {
    const level = levels.find(l => l.id === formData.filtros.nivel)
    const targetRole = formData.destinatarios.includes('profesores') ? 'docentes de' : ''
    descriptions.push(`${targetRole} nivel ${level?.name}`)
  }

  if (formData.filtros.grado) {
    const grade = grades.find(g => g.id === formData.filtros.grado)
    descriptions.push(`grado ${grade?.name}`)
  }

  if (formData.filtros.seccion) {
    const section = sections.find(s => s.id === formData.filtros.seccion)
    descriptions.push(`sección ${section?.name}`)
  }

  if (formData.filtros.area) {
    descriptions.push(`área ${formData.filtros.area}`)
  }

  return descriptions.length > 0 ? `Filtros: ${descriptions.join(', ')}` : ''
}
