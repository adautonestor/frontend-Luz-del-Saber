/**
 * Hook para manejar competencias dentro de una estructura
 *
 * IMPORTANTE: Cada competencia es INDEPENDIENTE
 * - No se mezclan notas entre competencias
 * - Cada competencia tiene su propia calificación (0-20 o AD/A/B/C)
 * - El "peso" no aplica a nivel de competencia, solo a subcategorías dentro de cada competencia
 */
export const useCompetencias = (structureData, setStructureData) => {
  const addCompetencia = () => {
    setStructureData(prev => {
      const nuevoNumero = prev.competencias.length + 1

      return {
        ...prev,
        competencias: [
          ...prev.competencias,
          {
            numero: nuevoNumero,
            nombreCompetencia: '',
            description: '',
            // No se asigna peso a la competencia, cada una es independiente
            subcategorias: [] // Cada competencia tiene sus propias subcategorías
          }
        ]
      }
    })
  }

  const updateCompetencia = (index, field, value) => {
    setStructureData(prev => ({
      ...prev,
      competencias: prev.competencias.map((comp, i) =>
        i === index ? { ...comp, [field]: value } : comp
      )
    }))
  }

  const removeCompetencia = (index) => {
    setStructureData(prev => {
      const nuevasCompetencias = prev.competencias.filter((_, i) => i !== index)
      const competenciasRenumeradas = nuevasCompetencias.map((comp, i) => ({
        ...comp,
        numero: i + 1
      }))
      return {
        ...prev,
        competencias: competenciasRenumeradas
      }
    })
  }

  const applyTemplate = (template) => {
    if (template) {
      setStructureData({
        name: template.name,
        description: template.description,
        competencias: JSON.parse(JSON.stringify(template.competencias))
      })
    }
  }

  return {
    addCompetencia,
    updateCompetencia,
    removeCompetencia,
    applyTemplate
  }
}
