import { useState } from 'react'
import { generateCourseCode } from '../utils/academic/codeGenerators'
import { useCoursesStore } from '../stores/coursesStore'
import { courseService } from '../services/academic/courseService'

/**
 * Hook para gestionar creación y edición de cursos
 */
export const useCourseManagement = (selectedAcademicYear, userId, loadAcademicData, levels = []) => {
  const coursesStore = useCoursesStore()

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    area: '',
    nivel: '',
    horasSemanales: 4,
    objectives: '',
    methodology: '',
    resources: '',
    evaluation: '',
    profesoresPorGrado: {}
  })

  const handleCloseCourseModal = () => {
    setShowCourseModal(false)
    setIsSaving(false)
  }

  const handleCreateCourse = () => {
    console.log('🚀 handleCreateCourse called')
    try {
      setSelectedCourse(null)
      setIsSaving(false)

      // Pre-seleccionar el primer nivel disponible para generar código automáticamente
      const firstLevel = levels && levels.length > 0 ? levels[0].id : ''

      const initialForm = {
        name: '',
        code: '',
        nivel: firstLevel, // Pre-seleccionar primer nivel
        area: '',
        horasSemanales: 4,
        description: '',
        objectives: '',
        methodology: '',
        resources: '',
        evaluation: '',
        profesoresPorGrado: {}
      }

      console.log('🆕 Setting initial form with pre-selected level:', initialForm)
      setCourseForm(initialForm)
      setShowCourseModal(true)
    } catch (error) {
      console.error('Error opening course modal:', error)
    }
  }

  const handleEditCourse = async (course) => {
    setSelectedCourse(course)
    setIsSaving(false)

    try {
      // Extraer el ID del año académico
      const academicYearId = typeof selectedAcademicYear === 'object'
        ? selectedAcademicYear.id
        : selectedAcademicYear

      // Cargar asignaciones desde coursesStore (usar teacherAssignments)
      const assignmentsForCourse = coursesStore.teacherAssignments.filter(a => {
        const course_id = a.course_id || a.course_id
        const anoLectivoId = a.academic_year_id || a.año_lectivo_id || a.añoLectivoId
        return course_id === course.id && anoLectivoId === academicYearId
      })

      // Construir objeto profesoresPorGrado desde courseAssignments
      const profesoresPorGrado = {}
      assignmentsForCourse.forEach(assignment => {
        const grade_id = assignment.grade_id || assignment.grade_id
        const teacher_id = assignment.teacher_id || assignment.teacher_id
        if (grade_id && teacher_id) {
          profesoresPorGrado[grade_id] = teacher_id
        }
      })

      const level_id = course.level_id || course.level_id
      const horasSemanales = course.weekly_hours || course.horas_semanales || course.horasSemanales

      setCourseForm({
        name: course.name || '',
        code: course.code || '',
        nivel: level_id || '',
        area: course.academic_area_id || course.area || '',
        horasSemanales: horasSemanales || 4,
        description: course.description || '',
        objectives: course.objectives || '',
        methodology: course.methodology || '',
        resources: course.resources || '',
        evaluation: course.evaluation || '',
        profesoresPorGrado: profesoresPorGrado
      })
      setShowCourseModal(true)
    } catch (error) {
      console.error('Error loading course assignments:', error)
      // Continuar sin asignaciones si hay error
      setCourseForm({
        name: course.name || '',
        code: course.code || '',
        nivel: course.level_id || '',
        area: course.academic_area_id || course.area || '',
        horasSemanales: course.weekly_hours || course.horas_semanales || course.horasSemanales || 4,
        description: course.description || '',
        objectives: course.objectives || '',
        methodology: course.methodology || '',
        resources: course.resources || '',
        evaluation: course.evaluation || '',
        profesoresPorGrado: {}
      })
      setShowCourseModal(true)
    }
  }

  const handleSaveCourse = async () => {
    if (isSaving) return

    try {
      setIsSaving(true)

      if (!selectedAcademicYear) {
        alert('Debe seleccionar un año lectivo para crear el curso')
        setIsSaving(false)
        return
      }

      // Extraer el ID del año académico (puede ser un objeto o un ID directamente)
      const academicYearId = typeof selectedAcademicYear === 'object'
        ? selectedAcademicYear.id
        : selectedAcademicYear

      const courseData = {
        name: courseForm.name,
        code: courseForm.code,
        description: courseForm.description,
        area: courseForm.area,
        level_id: courseForm.nivel,
        grade_id: null,
        año_lectivo_id: academicYearId,
        academic_year_id: academicYearId,
        horas_semanales: courseForm.horasSemanales,
        weekly_hours: courseForm.horasSemanales,
        objectives: courseForm.objectives,
        methodology: courseForm.methodology,
        resources: courseForm.resources,
        evaluation: courseForm.evaluation
      }

      let savedCourse
      if (selectedCourse) {
        savedCourse = await coursesStore.updateCourse(selectedCourse.id, courseData)
      } else {
        savedCourse = await coursesStore.createCourse(courseData)
      }

      const courseId = savedCourse?.id || selectedCourse?.id

      // Guardar asignaciones de profesores por grado
      if (courseForm.profesoresPorGrado && Object.keys(courseForm.profesoresPorGrado).length > 0 && courseId) {
        // Eliminar asignaciones anteriores para este curso y año lectivo
        const currentAssignments = coursesStore.teacherAssignments.filter(a => {
          const course_id = a.course_id || a.course_id
          const anoLectivoId = a.academic_year_id || a.año_lectivo_id || a.añoLectivoId
          return course_id === courseId && anoLectivoId === academicYearId
        })

        for (const assignment of currentAssignments) {
          await coursesStore.removeTeacherAssignment(assignment.id)
        }

        // Usar el servicio de course para crear asignaciones con lógica upsert
        await courseService.saveAssignments(
          courseId,
          courseForm.profesoresPorGrado,
          academicYearId,
          courseData.weekly_hours || courseData.horas_semanales || 4,
          userId || 'admin'
        )

        console.log(`✅ Guardadas ${Object.keys(courseForm.profesoresPorGrado).length} asignaciones de profesores`)
      }

      await loadAcademicData()
      setShowCourseModal(false)
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Error al guardar el curso: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    selectedCourse,
    showCourseModal,
    isSaving,
    courseForm,
    setCourseForm,
    handleCloseCourseModal,
    handleCreateCourse,
    handleEditCourse,
    handleSaveCourse
  }
}
