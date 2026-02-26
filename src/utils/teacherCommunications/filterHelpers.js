/**
 * Helpers para filtrado de comunicaciones y estudiantes
 */

export const filterEstudiantes = (estudiantes, filtroGrado, filtroSeccion) => {
  return estudiantes.filter(est => {
    const matchGrado = filtroGrado === 'todos' || est.grado === filtroGrado
    const matchSeccion = filtroSeccion === 'todos' || est.seccion === filtroSeccion
    return matchGrado && matchSeccion
  })
}

export const filterCommunications = (communications, searchTerm, filterType, activeTab) => {
  let filtered = communications

  // Filtrar por tab
  if (activeTab === 'sent') {
    filtered = filtered.filter(c => c.state === 'enviado')
  } else if (activeTab === 'scheduled') {
    filtered = filtered.filter(c => c.state === 'programado')
  }

  // Filtrar por tipo
  if (filterType !== 'all') {
    filtered = filtered.filter(c => c.type === filterType)
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter(c =>
      c.asunto?.toLowerCase().includes(term) ||
      c.contenido?.toLowerCase().includes(term)
    )
  }

  return filtered
}
