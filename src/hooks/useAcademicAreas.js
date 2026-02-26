import { useState, useEffect } from 'react'

/**
 * Hook para gestionar áreas académicas
 *
 * TODO: Implementar con backend real
 * - Crear endpoint /api/academic-areas para CRUD de áreas
 * - Por ahora usa localStorage como almacenamiento temporal
 */
export const useAcademicAreas = () => {
  const [academicAreas, setAcademicAreas] = useState([])
  const [editingArea, setEditingArea] = useState(null)
  const [areaForm, setAreaForm] = useState({
    name: '',
    description: ''
  })

  // Cargar áreas al montar
  useEffect(() => {
    loadAcademicAreas()
  }, [])

  const loadAcademicAreas = () => {
    try {
      // TODO: Replace with API call
      // const areas = await academicAreasService.getAll({ state: 'activo' })

      const storedAreas = localStorage.getItem('academicAreas')
      const areas = storedAreas ? JSON.parse(storedAreas) : []
      setAcademicAreas(areas.filter(area => area.state === 'activo'))
    } catch (error) {
      console.error('Error loading academic areas:', error)
      setAcademicAreas([])
    }
  }

  const handleCreateArea = () => {
    setEditingArea(null)
    setAreaForm({
      name: '',
      description: ''
    })
  }

  const handleEditArea = (area) => {
    setEditingArea(area)
    setAreaForm({
      name: area.name,
      description: area.description || ''
    })
  }

  const handleSaveArea = async () => {
    if (!areaForm.name.trim()) {
      alert('El nombre del área es requerido')
      return
    }

    try {
      // TODO: Replace with API call
      // if (editingArea) {
      //   await academicAreasService.update(editingArea.id, areaForm)
      // } else {
      //   await academicAreasService.create(areaForm)
      // }

      const areaData = {
        ...areaForm,
        id: editingArea?.id || `area-${Date.now()}`,
        state: 'activo',
        orden: editingArea?.orden || (academicAreas.length + 1),
        createdAt: editingArea?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const storedAreas = localStorage.getItem('academicAreas')
      const allAreas = storedAreas ? JSON.parse(storedAreas) : []

      if (editingArea) {
        const index = allAreas.findIndex(a => a.id === editingArea.id)
        if (index >= 0) {
          allAreas[index] = areaData
        }
      } else {
        allAreas.push(areaData)
      }

      localStorage.setItem('academicAreas', JSON.stringify(allAreas))

      loadAcademicAreas()
      setEditingArea(null)
      setAreaForm({ name: '', description: '' })
    } catch (error) {
      console.error('Error saving area:', error)
      alert('Error al guardar el área')
    }
  }

  const handleDeleteArea = async (area) => {
    if (confirm(`¿Estás seguro de eliminar el área "${area.name}"?`)) {
      try {
        // TODO: Replace with API call
        // await academicAreasService.remove(area.id)

        const storedAreas = localStorage.getItem('academicAreas')
        const allAreas = storedAreas ? JSON.parse(storedAreas) : []
        const index = allAreas.findIndex(a => a.id === area.id)

        if (index >= 0) {
          allAreas[index] = { ...allAreas[index], state: 'inactivo' }
          localStorage.setItem('academicAreas', JSON.stringify(allAreas))
        }

        loadAcademicAreas()
      } catch (error) {
        console.error('Error deleting area:', error)
        alert('Error al eliminar el área')
      }
    }
  }

  return {
    academicAreas,
    editingArea,
    areaForm,
    setAreaForm,
    handleCreateArea,
    handleEditArea,
    handleSaveArea,
    handleDeleteArea,
    loadAcademicAreas
  }
}
