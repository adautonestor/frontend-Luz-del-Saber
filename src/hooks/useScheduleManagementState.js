import { useState, useEffect } from 'react'
import { useAcademicStore } from '../stores/academicStore'
import { usersService } from '../services/usersService'
import { schedulesService } from '../services/schedulesService'
import { structureService } from '../services/academic/structureService'
import { academicYearService } from '../services/academic/academicYearService'

export const useScheduleManagementState = () => {
  const academicStore = useAcademicStore()

  // Estados para gestión de imágenes de horarios
  const [scheduleImages, setScheduleImages] = useState([])
  const [activeTab, setActiveTab] = useState('alumnos')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Datos (ahora vienen del store)
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [sections, setSections] = useState([])
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar datos directamente desde las APIs (no depender del store)
      let activeYear = null
      try {
        activeYear = await academicYearService.getActive()
      } catch (error) {
        console.log('No hay año activo, buscando años disponibles...')
        const years = await academicYearService.getAll()
        if (years && years.length > 0) {
          activeYear = years.find(y => y.status === 'active') || years[0]
        }
      }

      // Cargar estructura académica directamente
      let loadedLevels = []
      let loadedGrades = []
      let loadedSections = []

      if (activeYear) {
        const structure = await structureService.loadAcademicStructure(activeYear)
        loadedLevels = structure.levels || []
        loadedGrades = structure.grades || []
        loadedSections = structure.sections || []
      }

      // Si no hay datos del año, cargar todos sin filtro
      if (loadedLevels.length === 0) {
        loadedLevels = await structureService.getAllLevels()
        loadedGrades = await structureService.getAllGrades()
        loadedSections = await structureService.getAllSections()
      }

      // Load teachers and schedule images
      const [allTeachers, existingImages] = await Promise.all([
        usersService.getByRole('profesor'),
        schedulesService.getAllImages()
      ])

      console.log('📊 [ScheduleManagement] Imágenes cargadas:', JSON.stringify(existingImages, null, 2))
      console.log('📊 [ScheduleManagement] Datos cargados:')
      console.log('  - Niveles:', loadedLevels.length)
      console.log('  - Grados:', loadedGrades.length)
      console.log('  - Secciones:', loadedSections.length)

      setLevels(loadedLevels)
      setGrades(loadedGrades)
      setSections(loadedSections)
      setTeachers(allTeachers || [])
      setScheduleImages(existingImages || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setLevels([])
      setGrades([])
      setSections([])
      setTeachers([])
      setScheduleImages([])
    } finally {
      setLoading(false)
    }
  }

  const getGradesByLevel = (levelId) => {
    if (!levelId) return []
    const levelIdNum = parseInt(levelId, 10)
    return grades.filter(grade => grade.level_id === levelIdNum)
  }

  const getSectionsByGrade = (gradeId) => {
    if (!gradeId) return []
    const gradeIdNum = parseInt(gradeId, 10)
    return sections.filter(section => section.grade_id === gradeIdNum)
  }

  const getFilteredImages = () => {
    let filtered = scheduleImages.filter(img => img.type === activeTab)

    if (activeTab === 'alumnos') {
      if (selectedLevel) {
        const levelIdNum = parseInt(selectedLevel, 10)
        filtered = filtered.filter(img => img.level_id === levelIdNum)
      }
      if (selectedGrade) {
        const gradeIdNum = parseInt(selectedGrade, 10)
        filtered = filtered.filter(img => img.grade_id === gradeIdNum)
      }
      if (selectedSection) {
        const sectionIdNum = parseInt(selectedSection, 10)
        filtered = filtered.filter(img => img.section_id === sectionIdNum)
      }
    } else if (activeTab === 'docentes') {
      if (selectedLevel) {
        const levelIdNum = parseInt(selectedLevel, 10)
        filtered = filtered.filter(img => img.level_id === levelIdNum)
      }
    }

    return filtered
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedLevel('')
    setSelectedGrade('')
    setSelectedSection('')
    setSelectedTeacher('')
  }

  const openViewModal = (image) => {
    setSelectedImage(image)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedImage(null)
    setZoomLevel(1)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleZoomReset = () => {
    setZoomLevel(1)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const handleDelete = async (imageId) => {
    if (confirm('¿Está seguro de eliminar esta imagen de horario?')) {
      try {
        await schedulesService.removeImage(imageId)
        setScheduleImages(currentImages => currentImages.filter(img => img.id !== imageId))
        console.log('✅ Imagen eliminada exitosamente')
      } catch (error) {
        console.error('Error deleting image:', error)
        alert('Error al eliminar la imagen')
      }
    }
  }

  const getItemName = (id, items, field = 'name') => {
    const item = items.find(item => item.id === id)
    return item ? item[field] : 'Sin especificar'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    // State
    scheduleImages,
    setScheduleImages,
    activeTab,
    selectedLevel,
    setSelectedLevel,
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    selectedTeacher,
    setSelectedTeacher,
    loading,
    selectedImage,
    showViewModal,
    zoomLevel,
    levels,
    grades,
    sections,
    teachers,

    // Functions
    loadData,
    getGradesByLevel,
    getSectionsByGrade,
    getFilteredImages,
    handleTabChange,
    openViewModal,
    closeViewModal,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleWheel,
    handleDelete,
    getItemName,
    formatFileSize
  }
}
