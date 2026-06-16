import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Plus, Edit, Trash2, Users,
  Calendar, Clock, ChevronRight, School,
  Layers, Grid, Award, Target, ChevronDown,
  Building, BookMarked, GraduationCap, User,
  Brain, CheckCircle, Eye, Archive, Settings,
  Lock, AlertCircle, PlayCircle, X, Check, Search,
  ChevronLeft, XCircle
} from 'lucide-react'
import { fixAcademicData } from '../../utils/fixAcademicData'
import { useCoursesStore } from '../../stores/coursesStore'
import { useAuthStore } from '../../stores/authStore'
import { academicYearService } from '../../services/academic/academicYearService'
import { structureService } from '../../services/academic/structureService'
import { courseService } from '../../services/academic/courseService'
import { generateCourseCode, updateExistingCourseCodes } from '../../utils/academic/codeGenerators'
import { useAcademicData } from '../../hooks/useAcademicData'
import CloseYearModal from '../../components/academic-structure/modals/CloseYearModal'
import UniversalModal from '../../components/academic-structure/modals/UniversalModal'
import CourseFormModal from '../../components/courses/modals/CourseFormModal'
import TreeNode from '../../components/academic-structure/TreeNode'
import AcademicYearsTab from '../../components/academic-structure/tabs/AcademicYearsTab'
import StructureTab from '../../components/academic-structure/tabs/StructureTab'
import CoursesTab from '../../components/academic-structure/tabs/CoursesTab'
import PageHeader from '../../components/academic-structure/PageHeader'
import StatsCards from '../../components/academic-structure/StatsCards'
import TabsNavigation from '../../components/academic-structure/TabsNavigation'
import studentsService from '../../services/studentsService'

const AcademicStructurePage = () => {
  // Auth store for permissions
  const { hasPermission, isSecretary } = useAuthStore()

  // Custom hook for academic data management
  const {
    academicYears,
    setAcademicYears,
    currentAcademicYear,
    setCurrentAcademicYear,
    selectedAcademicYear,
    setSelectedAcademicYear,
    levels,
    setLevels,
    grades,
    setGrades,
    sections,
    setSections,
    courses,
    setCourses,
    competencies,
    setCompetencies,
    capacities,
    setCapacities,
    availableCourses,
    setAvailableCourses,
    teachers,
    setTeachers,
    loading,
    expandedItems,
    setExpandedItems,
    loadAcademicData,
    loadAcademicStructure,
    handleAcademicYearChange
  } = useAcademicData()

  // UI state management
  const [showNewCourseInput, setShowNewCourseInput] = useState(false)
  const [activeTab, setActiveTab] = useState('anos-lectivos')
  const [selectedItem, setSelectedItem] = useState(null)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'level', 'grade', 'section', 'course', 'academic-year'
  const [editingItem, setEditingItem] = useState(null)
  const [showCloseYearModal, setShowCloseYearModal] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error', message: '' }
  const [confirmDialog, setConfirmDialog] = useState(null) // { item, type, onConfirm }

  // Ref para rastrear el item editado y actualizar selectedItem después de recargar datos
  const pendingUpdate = useRef(null)

  // Forms
  const [academicYearForm, setAcademicYearForm] = useState({
    name: '',
    año: new Date().getFullYear(),
    type: 'regular',
    fechaInicio: '',
    fechaFin: '',
    description: '',
    state: 'planificado'
  })
  const [levelForm, setLevelForm] = useState({ name: '', description: '', code: '', order: 1 })
  const [gradeForm, setGradeForm] = useState({ name: '', description: '', code: '', level_id: '', orden: 1 })
  const [sectionForm, setSectionForm] = useState({ name: '', code: '', grade_id: '', capacidadMaxima: 30, turno: 'mañana', tutorId: '' })
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    nivel: '', // Cambiado de level_id a nivel para compatibilidad con CourseFormModal
    area: '',
    horasSemanales: 4,
    description: '',
    objectives: '',
    methodology: '',
    resources: '',
    evaluation: '',
    profesoresPorGrado: {} // Cambiado de teacher_id a profesoresPorGrado
  })
  const [competencyForm, setCompetencyForm] = useState({
    code: '',
    name: '',
    description: '',
    area: '',
    level_id: '',
    order: 1
  })

  // Función para generar código de competencia automáticamente
  const generateCompetencyCode = (area, levelId) => {
    if (!area || !levelId) return ''

    const areaPrefixes = {
      'comunicación': 'COM',
      'matemáticas': 'MAT',
      'ciencias': 'CYT',
      'sociales': 'SOC',
      'arte': 'ART',
      'educación física': 'EFI',
      'inglés': 'ING',
      'religión': 'REL'
    }

    const levelSuffixes = {
      1: 'INI',
      2: 'PRI',
      3: 'SEC'
    }

    const prefix = areaPrefixes[area] || 'GEN'
    const suffix = levelSuffixes[levelId] || 'GEN'

    const existingCodes = competencies
      .filter(c => c.code?.startsWith(`${prefix}-${suffix}-`))
      .map(c => {
        const match = c.code.match(/-(\d+)$/)
        return match ? parseInt(match[1]) : 0
      })

    const nextNumber = existingCodes.length > 0
      ? Math.max(...existingCodes) + 1
      : 1

    return `${prefix}-${suffix}-${String(nextNumber).padStart(2, '0')}`
  }

  // Tree management functions
  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleSelectItem = (item, type) => {
    setSelectedItem({ ...item, type })
  }

  // Modal management
  const openCreateModal = (type, parentId = null, area = null, levelId = null) => {
    setEditingItem(null)
    setModalType(type)
    setShowNewCourseInput(false)

    if (type === 'grade' && parentId) {
      setGradeForm(prev => ({ ...prev, level_id: parseInt(parentId) }))
    }
    if (type === 'section' && parentId) {
      setSectionForm(prev => ({ ...prev, grade_id: parseInt(parentId) }))
    }
    if (type === 'course' && parentId) {
      setCourseForm(prev => ({ ...prev, nivel: parseInt(parentId) }))
    }
    if (type === 'competency') {
      // Generar código automáticamente si tenemos área y nivel
      const generatedCode = generateCompetencyCode(area, levelId)
      setCompetencyForm({
        code: generatedCode,
        name: '',
        description: '',
        area: area || '',
        level_id: levelId || '',
        order: 1
      })
    }

    setShowModal(true)
  }

  const openEditModal = (item, type) => {
    setEditingItem(item)
    setModalType(type)
    
    switch (type) {
      case 'level':
        setLevelForm({ name: item.name, description: item.description || '', code: item.code || '', order: item.order || 1 })
        break
      case 'grade':
        setGradeForm({ 
          name: item.name, 
          description: item.description || '', 
          code: item.code || '', 
          level_id: item.level_id,
          orden: item.orden || 1
        })
        break
      case 'section':
        setSectionForm({
          name: item.name,
          code: item.code || '',
          grade_id: item.grade_id,
          capacidadMaxima: item.capacity || item.capacidadMaxima || 30,
          turno: item.shift || item.turno || 'mañana',
          tutorId: item.tutor_id || item.tutorId || ''
        })
        break
      case 'course':
        // Cargar asignaciones desde courseService
        const loadAssignments = async () => {
          try {
            const assignmentsForCourse = await courseService.getAssignmentsByCourse(item.id, selectedAcademicYear)

            // Construir objeto profesoresPorGrado desde course_assignments
            const profesoresPorGrado = {}
            assignmentsForCourse.forEach(assignment => {
              if (assignment.grade_id && assignment.teacher_id) {
                profesoresPorGrado[assignment.grade_id] = assignment.teacher_id
              }
            })

            setCourseForm({
              name: item.name,
              code: item.code || '',
              description: item.description || '',
              nivel: item.level_id || '',
              area: item.academic_area_id || item.area || '',
              horasSemanales: item.weekly_hours || item.horasSemanales || 4,
              objectives: item.objectives || '',
              methodology: item.methodology || '',
              resources: item.resources || '',
              evaluation: item.evaluation || '',
              profesoresPorGrado: profesoresPorGrado
            })
          } catch (error) {
            console.error('Error cargando asignaciones:', error)
            // Continuar sin asignaciones si hay error
            setCourseForm({
              name: item.name,
              code: item.code || '',
              description: item.description || '',
              nivel: item.level_id || '',
              area: item.academic_area_id || item.area || '',
              horasSemanales: item.weekly_hours || item.horasSemanales || 4,
              objectives: item.objectives || '',
              methodology: item.methodology || '',
              resources: item.resources || '',
              evaluation: item.evaluation || '',
              profesoresPorGrado: {}
            })
          }
        }
        loadAssignments()
        break
      case 'academic-year':
        setAcademicYearForm({
          name: item.name,
          año: item.year || item.año,
          type: item.type || 'regular',
          // Transform backend field names (start_date, end_date) to form field names (fechaInicio, fechaFin)
          fechaInicio: item.start_date || item.fecha_inicio || item.fechaInicio || '',
          fechaFin: item.end_date || item.fecha_fin || item.fechaFin || '',
          description: item.description || '',
          state: item.state
        })
        break
      case 'competency':
        setCompetencyForm({
          code: item.code || '',
          name: item.name || '',
          description: item.description || '',
          area: item.area || '',
          level_id: item.level_id || '',
          order: item.order || 1
        })
        break
    }

    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setEditingItem(null)
    setShowNewCourseInput(false)
    setAcademicYearForm({
      name: '',
      año: new Date().getFullYear(),
      type: 'regular',
      fechaInicio: '',
      fechaFin: '',
      description: '',
      state: 'planificado'
    })
    setLevelForm({ name: '', description: '', code: '', order: 1 })
    setGradeForm({ name: '', description: '', code: '', level_id: '', orden: 1 })
    setSectionForm({ name: '', code: '', grade_id: '', capacidadMaxima: 30, turno: 'mañana', tutorId: '' })
    setCourseForm({ name: '', code: '', nivel: '', area: '', horasSemanales: 4, description: '', objectives: '', methodology: '', resources: '', evaluation: '', profesoresPorGrado: {} })
    setCompetencyForm({ code: '', name: '', description: '', area: '', level_id: '', order: 1 })
  }

  const getGradesByLevel = (levelId) => {
    return grades.filter(grade => grade.level_id === levelId)
  }

  const getSectionsByGrade = (gradeId) => {
    return sections.filter(section => section.grade_id === gradeId)
  }

  const getCoursesByLevel = (levelId) => {
    return courses
      .filter(course => course.level_id === levelId)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
  }

  // NOTA: Función comentada porque no se puede usar directamente en JSX (devuelve Promise)
  // Si se necesita mostrar el conteo de estudiantes, usar un estado y useEffect
  // const getStudentCount = async (sectionId) => {
  //   const students = await studentsService.getAll() || []
  //   return students.filter(s => s.section_id === sectionId).length
  // }

  // useEffect para actualizar selectedItem después de recargar datos
  useEffect(() => {
    if (pendingUpdate.current) {
      const { id, type } = pendingUpdate.current
      let updatedItem = null

      switch (type) {
        case 'level':
          updatedItem = levels.find(l => l.id === id)
          break
        case 'grade':
          updatedItem = grades.find(g => g.id === id)
          break
        case 'section':
          updatedItem = sections.find(s => s.id === id)
          break
        case 'course':
          updatedItem = courses.find(c => c.id === id)
          break
      }

      if (updatedItem) {
        setSelectedItem({ ...updatedItem, type })
        pendingUpdate.current = null // Limpiar la referencia
      }
    }
  }, [levels, grades, sections, courses])

  // CRUD Functions
  const handleSave = async () => {
    try {
      // Guardar el id del item que se está editando para actualizar selectedItem después
      const editedItemId = editingItem?.id
      const itemType = modalType

      switch (modalType) {
        case 'academic-year':
          await saveAcademicYear()
          break
        case 'level':
          await saveLevel()
          break
        case 'grade':
          await saveGrade()
          break
        case 'section':
          await saveSection()
          break
        case 'course':
          await saveCourse()
          break
        case 'competency':
          await saveCompetency()
          break
      }

      // Marcar que hay una actualización pendiente si se está editando y está seleccionado
      if (editedItemId && selectedItem?.id === editedItemId) {
        pendingUpdate.current = { id: editedItemId, type: itemType }
      }

      await loadAcademicData()
      closeModal()

      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: `${modalType === 'academic-year' ? 'Año académico' : modalType} guardado exitosamente`
      })
      setTimeout(() => setNotification(null), 4000)
    } catch (error) {
      console.error(`Error saving ${modalType}:`, error)
      // Mostrar notificación de error
      setNotification({
        type: 'error',
        message: error.message || `Error al guardar ${modalType}`
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const saveAcademicYear = async () => {
    // Transform camelCase form fields to snake_case for API
    const dataToSave = {
      ...academicYearForm,
      nombre: academicYearForm.name,
      fecha_inicio: academicYearForm.fechaInicio,
      fecha_fin: academicYearForm.fechaFin,
      status: academicYearForm.state // El backend espera 'status', no 'state'
    }
    // Remove camelCase versions
    delete dataToSave.name
    delete dataToSave.fechaInicio
    delete dataToSave.fechaFin
    delete dataToSave.state

    await academicYearService.save(dataToSave, editingItem?.id)
  }

  const saveLevel = async () => {
    await structureService.saveLevel(levelForm, selectedAcademicYear, editingItem?.id)
  }

  const saveGrade = async () => {
    await structureService.saveGrade(gradeForm, levels, selectedAcademicYear, editingItem?.id)
  }

  const saveSection = async () => {
    await structureService.saveSection(sectionForm, grades, selectedAcademicYear, editingItem?.id)
  }

  const saveCourse = async () => {
    const { id: userId } = useAuthStore.getState().user || {}

    // Obtener el level_id correcto (puede venir como nivel o level_id)
    const levelId = courseForm.nivel || courseForm.level_id

    // Obtener academic_year_id
    const academicYearId = selectedAcademicYear?.id || selectedAcademicYear

    // Preparar datos del curso para el backend
    const courseData = {
      name: courseForm.name,
      code: courseForm.code,
      description: courseForm.description,
      area: courseForm.area,
      level_id: levelId,
      horasSemanales: courseForm.horasSemanales,
      weekly_hours: courseForm.horasSemanales,
      objectives: courseForm.objectives || null,
      methodology: courseForm.methodology || null,
      resources: courseForm.resources || null,
      evaluation: courseForm.evaluation || null,
      academic_year_id: academicYearId
    }

    // Guardar el curso usando el courseService directamente
    // Esto asegura que el academic_year_id se envíe correctamente
    const savedCourse = await courseService.saveCourse(
      courseData,
      levels,
      editingItem?.id,
      selectedAcademicYear // Enviar solo el ID (número)
    )

    const courseId = savedCourse?.id || editingItem?.id

    // Guardar asignaciones de profesores por grado en course_assignments
    if (courseForm.profesoresPorGrado && Object.keys(courseForm.profesoresPorGrado).length > 0 && courseId) {
      // Usar courseService.saveAssignments
      await courseService.saveAssignments(
        courseId,
        courseForm.profesoresPorGrado,
        selectedAcademicYear,
        courseForm.horasSemanales || 4,
        userId
      )
    }
  }

  const saveCompetency = async () => {
    // Mapear el nombre del área al ID del área académica
    const areaMapping = {
      'comunicación': 1,
      'matemáticas': 2,
      'ciencias': 3,
      'sociales': 4,
      'educación física': 5,
      'arte': 6,
      'inglés': 7,
      'religión': 8
    }

    const dataToSave = {
      codigo: competencyForm.code,
      nombre: competencyForm.name,
      descripcion: competencyForm.description || null,
      area_id: areaMapping[competencyForm.area] || null,
      nivel_id: competencyForm.level_id,
      orden: competencyForm.order || 1
    }

    if (editingItem?.id) {
      await structureService.updateCompetency(editingItem.id, dataToSave)
    } else {
      await structureService.createCompetency(dataToSave)
    }
  }

  const handleDelete = (item, type) => {
    // Mostrar modal de confirmación
    setConfirmDialog({
      item,
      type,
      onConfirm: async () => {
        try {
          // Eliminar usando los servicios apropiados
          switch (type) {
            case 'level':
              await structureService.deleteLevel(item.id)
              break
            case 'grade':
              await structureService.deleteGrade(item.id)
              break
            case 'section':
              await structureService.deleteSection(item.id)
              break
            case 'course':
              await courseService.deleteCourse(item.id)
              break
            default:
              throw new Error(`Tipo desconocido: ${type}`)
          }

          // Si el item eliminado es el que está seleccionado, limpiar selectedItem
          if (selectedItem?.id === item.id) {
            setSelectedItem(null)
          }

          await loadAcademicData()

          // Cerrar modal de confirmación
          setConfirmDialog(null)

          // Mostrar notificación de éxito
          setNotification({
            type: 'success',
            message: `${type} eliminado exitosamente`
          })
          setTimeout(() => setNotification(null), 4000)
        } catch (error) {
          console.error(`Error deleting ${type}:`, error)
          // Cerrar modal de confirmación
          setConfirmDialog(null)
          // Mostrar notificación de error
          setNotification({
            type: 'error',
            message: error.message || `Error al eliminar ${type}`
          })
          setTimeout(() => setNotification(null), 5000)
        }
      }
    })
  }

  // Academic Year Closure Functions
  const handleCloseAcademicYear = async (closeData) => {
    try {
      // Transformar datos del frontend al formato del backend
      const dataToSend = {
        motivo: closeData.motivo,
        observaciones: closeData.observations, // Convertir 'observations' a 'observaciones'
        crearSiguienteAño: closeData.crearSiguienteAño
      }

      const response = await academicYearService.close(currentAcademicYear.id, dataToSend)
      await loadAcademicData()
      setShowCloseYearModal(false)

      // Mensaje personalizado según si se creó el siguiente año
      let successMessage = '¡Año lectivo cerrado exitosamente!'

      if (response.data?.newYear) {
        successMessage = `¡Año lectivo ${response.data.closedYear?.año || currentAcademicYear.año} cerrado exitosamente!

Se ha creado automáticamente el año ${response.data.newYear.año} con toda la estructura académica copiada (niveles, grados, secciones y cursos).`
      } else {
        successMessage = '¡Año lectivo cerrado exitosamente! Se ha creado un archivo histórico completo con todos los datos del año académico.'
      }

      setNotification({
        type: 'success',
        message: successMessage
      })
      setTimeout(() => setNotification(null), 6000)
    } catch (error) {
      console.error('Error closing academic year:', error)
      setNotification({
        type: 'error',
        message: error.message || 'Error al cerrar el año lectivo. Por favor, intente nuevamente.'
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  // TreeNode Component - MOVED TO components/academic-structure/TreeNode.jsx

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - MOVED TO components/academic-structure/PageHeader.jsx */}
      <PageHeader
        isSecretary={isSecretary}
        hasPermission={hasPermission}
        openCreateModal={openCreateModal}
      />

      {/* Stats - MOVED TO components/academic-structure/StatsCards.jsx */}
      <StatsCards
        levels={levels}
        grades={grades}
        sections={sections}
        courses={courses}
      />

      {/* Tabs - MOVED TO components/academic-structure/TabsNavigation.jsx */}
      <TabsNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'anos-lectivos' && (
        <AcademicYearsTab
          academicYears={academicYears}
          currentAcademicYear={currentAcademicYear}
          setShowModal={setShowModal}
          setModalType={setModalType}
          setShowCloseYearModal={setShowCloseYearModal}
          loadAcademicData={loadAcademicData}
          setEditingItem={setEditingItem}
          setAcademicYearForm={setAcademicYearForm}
        />
      )}

      {activeTab === 'estructura' && (
        <StructureTab
          levels={levels}
          grades={grades}
          sections={sections}
          courses={courses}
          expandedItems={expandedItems}
          selectedItem={selectedItem}
          toggleExpanded={toggleExpanded}
          handleSelectItem={handleSelectItem}
          getGradesByLevel={getGradesByLevel}
          getSectionsByGrade={getSectionsByGrade}
          getCoursesByLevel={getCoursesByLevel}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
          TreeNode={TreeNode}
          academicYears={academicYears}
          selectedAcademicYear={selectedAcademicYear}
          handleAcademicYearChange={handleAcademicYearChange}
          hasPermission={hasPermission}
        />
      )}
      
      {activeTab === 'cursos' && (
        <CoursesTab
          courses={courses}
          competencies={competencies}
          capacities={capacities}
          grades={grades}
          levels={levels}
          teachers={teachers}
          loadAcademicData={loadAcademicData}
          hasPermission={hasPermission}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          academicYears={academicYears}
          selectedAcademicYear={selectedAcademicYear}
          handleAcademicYearChange={handleAcademicYearChange}
          getGradesByLevel={getGradesByLevel}
        />
      )}


      {/* Universal Modal - Para Años Lectivos, Niveles, Grados y Secciones */}
      {modalType !== 'course' && (
        <UniversalModal
          showModal={showModal}
          modalType={modalType}
          editingItem={editingItem}
          closeModal={closeModal}
          handleSave={handleSave}
          academicYearForm={academicYearForm}
          setAcademicYearForm={setAcademicYearForm}
          levelForm={levelForm}
          setLevelForm={setLevelForm}
          gradeForm={gradeForm}
          setGradeForm={setGradeForm}
          sectionForm={sectionForm}
          setSectionForm={setSectionForm}
          courseForm={courseForm}
          setCourseForm={setCourseForm}
          competencyForm={competencyForm}
          setCompetencyForm={setCompetencyForm}
          levels={levels}
          grades={grades}
          courses={courses}
          competencies={competencies}
          academicYears={academicYears}
          showNewCourseInput={showNewCourseInput}
          setShowNewCourseInput={setShowNewCourseInput}
        />
      )}

      {/* Course Form Modal - Modal especializado para Cursos */}
      {modalType === 'course' && (
        <CourseFormModal
          show={showModal}
          selectedCourse={editingItem}
          courseForm={courseForm}
          setCourseForm={setCourseForm}
          isSaving={false}
          levels={levels}
          courses={courses}
          teachers={teachers}
          getGradesByLevel={getGradesByLevel}
          onClose={closeModal}
          onSave={handleSave}
          academicYears={academicYears}
          selectedAcademicYear={selectedAcademicYear}
        />
      )}

      {/* Close Year Modal */}
      {showCloseYearModal && createPortal(
        <>
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 z-[60]"
            onClick={() => setShowCloseYearModal(false)}
          ></div>

          <div className="fixed inset-0 z-[70] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <CloseYearModal
                  currentYear={currentAcademicYear}
                  onClose={() => setShowCloseYearModal(false)}
                  onConfirm={handleCloseAcademicYear}
                />
              </motion.div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Notification Modal */}
      {notification && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotification(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <button
              onClick={() => setNotification(null)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              } rounded-full p-3`}>
                {notification.type === 'success' ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>

              <div className="flex-1 pt-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  notification.type === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {notification.type === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setNotification(null)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  notification.type === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-orange-100 text-orange-600 rounded-full p-3">
                <AlertCircle size={24} />
              </div>

              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  Confirmar eliminación
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  ¿Está seguro que desea eliminar este <strong>{confirmDialog.type}</strong>?
                  {confirmDialog.item?.name && (
                    <span className="block mt-2 text-gray-700 font-medium">
                      "{confirmDialog.item.name}"
                    </span>
                  )}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// StructureTab Component - MOVED TO components/academic-structure/tabs/StructureTab.jsx

// CoursesTab Component - MOVED TO components/academic-structure/tabs/CoursesTab.jsx

// AcademicYearsTab Component - MOVED TO components/academic-structure/tabs/AcademicYearsTab.jsx

// CloseYearModal Component - MOVED TO components/academic-structure/modals/CloseYearModal.jsx

// Debug function to force data reload
if (typeof window !== 'undefined') {
  window.forceReloadAcademicData = async () => {
    await window.forceResetData()
  }
}

export default AcademicStructurePage