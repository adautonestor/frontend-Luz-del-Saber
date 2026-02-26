import { useState, useEffect, useCallback } from 'react'
import { useGradesStore } from '../stores/gradesStore.jsx'
import { useEnrollmentStore } from '../stores/enrollmentStore'
import { useAcademicStore } from '../stores/academicStore'

/**
 * Hook personalizado para gestionar el estado completo de TeacherGrades
 * Maneja todos los estados locales, modales y handlers de eventos
 */
export const useTeacherGradesState = () => {
  // ==================== STORES ====================
  const {
    grades,
    categories,
    subcategories,
    evaluationStructures,
    initialize: initializeGrades,
    getGradesByStudentAndCourse,
    getGradingSystemForCourse,
    isLoading: gradesLoading
  } = useGradesStore()

  const { students, initialize: initializeEnrollment } = useEnrollmentStore()
  const { courses, grades: academicGrades, sections, initialize: initializeAcademic } = useAcademicStore()

  // ==================== ESTADOS DE SELECCIÓN ====================
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('1')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'cards'

  // ==================== ESTADOS DE MODALES ====================
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedGradeData, setSelectedGradeData] = useState(null)
  const [showWeeklyExamModal, setShowWeeklyExamModal] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [showCompetenceModal, setShowCompetenceModal] = useState(false)
  const [selectedCompetenceData, setSelectedCompetenceData] = useState(null)
  const [showWeightDistributionModal, setShowWeightDistributionModal] = useState(false)
  const [selectedWeightDistributionData, setSelectedWeightDistributionData] = useState(null)

  // ==================== INICIALIZACIÓN ====================
  useEffect(() => {
    console.log('📚 TeacherGrades - Initializing stores...')
    initializeGrades()
    initializeEnrollment()
    initializeAcademic()
  }, [])

  // Auto-seleccionar primer curso cuando se cargan
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      console.log('📚 TeacherGrades - Auto-selecting first course:', courses[0])
      setSelectedCourse(courses[0].id)
    }
  }, [courses, selectedCourse])

  // ==================== HANDLERS DE GRADE MODAL ====================
  const handleAddGrade = useCallback((student, course, category, subcategory) => {
    console.log('📚 TeacherGrades - Opening grade modal for:', {
      student: student.first_names + ' ' + student.last_names,
      course: course.name,
      category: category.name,
      subcategory: subcategory.name,
      quarter: selectedQuarter
    })

    // Check if there's an existing grade
    const studentGrades = getGradesByStudentAndCourse(student.id, course.id)
    const existingGrade = studentGrades.find(g =>
      g.categoriaId === category.id &&
      g.subcategoriaId === subcategory.id &&
      g.quarter === parseInt(selectedQuarter)
    )

    console.log('📚 TeacherGrades - Existing grade found:', existingGrade || 'None')

    setSelectedGradeData({
      student,
      course,
      category,
      subcategory,
      quarter: parseInt(selectedQuarter),
      existingGrade
    })
    setShowGradeModal(true)
  }, [selectedQuarter, getGradesByStudentAndCourse])

  const handleGradeSuccess = useCallback(() => {
    console.log('📚 TeacherGrades - Grade saved successfully, refreshing data...')
    setShowGradeModal(false)
    setSelectedGradeData(null)
    initializeGrades() // Refresh data
  }, [initializeGrades])

  // ==================== HANDLERS DE COMPETENCE MODAL ====================
  const handleOpenCompetenceModal = useCallback((student, course, category) => {
    console.log('📚 TeacherGrades - Opening competence grades modal for:', {
      student: student.first_names + ' ' + student.last_names,
      course: course.name,
      category: category.name,
      quarter: selectedQuarter
    })

    // Get existing grades for this competence
    const { getCompetenceGrades } = useGradesStore.getState()
    const existingGrades = getCompetenceGrades(
      student.id,
      course.id,
      category.id,
      parseInt(selectedQuarter)
    )

    console.log('📚 TeacherGrades - Existing competence grades:', existingGrades)

    setSelectedCompetenceData({
      student,
      course,
      category,
      quarter: parseInt(selectedQuarter),
      existingGrades
    })
    setShowCompetenceModal(true)
  }, [selectedQuarter])

  const handleCompetenceGradesSave = useCallback(async (gradeData, gradingSystem) => {
    console.log('📚 TeacherGrades - Saving competence grades:', gradeData)

    const { recordGrade } = useGradesStore.getState()

    try {
      await recordGrade({
        student_id: selectedCompetenceData.student.id,
        course_id: selectedCompetenceData.course.id,
        categoriaId: gradeData.categoriaId,
        quarter: gradeData.quarter,
        notas: gradeData.notas,
        promedio: gradeData.promedio,
        gradingSystem: gradingSystem
      })

      console.log('📚 TeacherGrades - Competence grades saved successfully')
      setShowCompetenceModal(false)
      setSelectedCompetenceData(null)
      initializeGrades() // Refresh data
    } catch (error) {
      console.error('📚 TeacherGrades - Error saving competence grades:', error)
    }
  }, [selectedCompetenceData, initializeGrades])

  // ==================== HANDLERS DE WEEKLY EXAM MODAL ====================
  const handleWeeklyExamUpload = useCallback((weekNumber) => {
    console.log('📚 TeacherGrades - Opening weekly exam upload for week:', weekNumber)
    setSelectedWeek(weekNumber)
    setShowWeeklyExamModal(true)
  }, [])

  const handleWeeklyExamSuccess = useCallback(() => {
    console.log('📚 TeacherGrades - Weekly exam uploaded successfully')
    setShowWeeklyExamModal(false)
    initializeGrades() // Refresh data
  }, [initializeGrades])

  // ==================== HANDLERS DE WEIGHT DISTRIBUTION MODAL ====================
  const handleOpenWeightDistribution = useCallback((category, selectedCourseData) => {
    console.log('📚 TeacherGrades - Opening weight distribution modal for:', {
      course: selectedCourseData?.name,
      category: category.name,
      quarter: selectedQuarter
    })

    setSelectedWeightDistributionData({
      course: selectedCourseData,
      category: category,
      quarter: parseInt(selectedQuarter),
      initialDistribution: null // TODO: Load from store if exists
    })
    setShowWeightDistributionModal(true)
  }, [selectedQuarter])

  const handleWeightDistributionSave = useCallback((distributionData) => {
    console.log('📚 TeacherGrades - Saving weight distribution:', distributionData)
    // TODO: Save to store
    // For now, just close the modal
    setShowWeightDistributionModal(false)
    setSelectedWeightDistributionData(null)
  }, [])

  // ==================== RETURN ====================
  return {
    // Store data
    grades,
    categories,
    subcategories,
    evaluationStructures,
    students,
    courses,
    academicGrades,
    sections,
    gradesLoading,

    // Store functions
    getGradesByStudentAndCourse,
    getGradingSystemForCourse,
    initializeGrades,

    // Selection states
    selectedCourse,
    setSelectedCourse,
    selectedQuarter,
    setSelectedQuarter,
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,

    // Modal states
    showGradeModal,
    setShowGradeModal,
    selectedGradeData,
    showWeeklyExamModal,
    setShowWeeklyExamModal,
    selectedWeek,
    showCompetenceModal,
    setShowCompetenceModal,
    selectedCompetenceData,
    showWeightDistributionModal,
    setShowWeightDistributionModal,
    selectedWeightDistributionData,

    // Handlers
    handleAddGrade,
    handleGradeSuccess,
    handleOpenCompetenceModal,
    handleCompetenceGradesSave,
    handleWeeklyExamUpload,
    handleWeeklyExamSuccess,
    handleOpenWeightDistribution,
    handleWeightDistributionSave
  }
}
