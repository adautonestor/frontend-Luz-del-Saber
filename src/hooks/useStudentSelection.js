import { useState, useEffect, useMemo } from 'react'
import { filterEstudiantes } from '@/utils/teacherCommunications'
import { structureService } from '@/services/academic/structureService'
import studentsService from '@/services/studentsService'
import { GRADOS, SECCIONES } from '@/constants/teacherCommunications'

/**
 * Hook para manejar la selección de estudiantes
 * Carga grados, secciones y estudiantes desde el backend
 */
export const useStudentSelection = (messageForm, setMessageForm) => {
  const [filtroGrado, setFiltroGrado] = useState('todos')
  const [filtroSeccion, setFiltroSeccion] = useState('todos')
  const [estudiantes, setEstudiantes] = useState([])
  const [grados, setGrados] = useState(GRADOS)
  const [secciones, setSecciones] = useState(SECCIONES)
  const [loading, setLoading] = useState(true)

  // Cargar grados, secciones y estudiantes desde el backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Cargar grados y secciones en paralelo
        const [gradesData, sectionsData, studentsData] = await Promise.all([
          structureService.getAllGrades().catch(() => []),
          structureService.getAllSections().catch(() => []),
          studentsService.getAll().catch(() => [])
        ])

        // Procesar grados - extraer nombres únicos
        if (gradesData && gradesData.length > 0) {
          const gradeNames = [...new Set(gradesData.map(g => g.name).filter(Boolean))]
          if (gradeNames.length > 0) {
            setGrados(gradeNames)
          }
        }

        // Procesar secciones - extraer nombres únicos
        if (sectionsData && sectionsData.length > 0) {
          const sectionNames = [...new Set(sectionsData.map(s => s.name).filter(Boolean))]
          if (sectionNames.length > 0) {
            setSecciones(sectionNames)
          }
        }

        // Procesar estudiantes
        if (studentsData && studentsData.length > 0) {
          const formattedStudents = studentsData.map(s => ({
            id: s.id,
            name: `${s.first_names || ''} ${s.last_names || ''}`.trim(),
            grado: s.gradeName || s.grade?.name || '',
            seccion: s.sectionName || s.section?.name || ''
          }))
          setEstudiantes(formattedStudents)
        }
      } catch (error) {
        console.error('Error loading student selection data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar estudiantes según grado y sección seleccionados
  const estudiantesFiltrados = useMemo(() => {
    return filterEstudiantes(estudiantes, filtroGrado, filtroSeccion)
  }, [estudiantes, filtroGrado, filtroSeccion])

  const toggleEstudiante = (estudianteId) => {
    const seleccionados = messageForm.estudiantesSeleccionados || []
    if (seleccionados.includes(estudianteId)) {
      setMessageForm(prev => ({
        ...prev,
        estudiantesSeleccionados: seleccionados.filter(id => id !== estudianteId)
      }))
    } else {
      setMessageForm(prev => ({
        ...prev,
        estudiantesSeleccionados: [...seleccionados, estudianteId]
      }))
    }
  }

  const seleccionarTodos = () => {
    setMessageForm(prev => ({
      ...prev,
      estudiantesSeleccionados: estudiantesFiltrados.map(e => e.id)
    }))
  }

  const deseleccionarTodos = () => {
    setMessageForm(prev => ({
      ...prev,
      estudiantesSeleccionados: []
    }))
  }

  return {
    filtroGrado,
    setFiltroGrado,
    filtroSeccion,
    setFiltroSeccion,
    grados,
    secciones,
    estudiantesFiltrados,
    toggleEstudiante,
    seleccionarTodos,
    deseleccionarTodos,
    loading
  }
}
