import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useCoursesStore } from '../stores/coursesStore'
import { useAcademicStore } from '../stores/academicStore'
import studentsService from '../services/studentsService'
import { courseService } from '../services/courseService'

export const useCoursesPageState = () => {
  const { user } = useAuthStore()
  const coursesStore = useCoursesStore()
  const academicStore = useAcademicStore()

  const [courses, setCourses] = useState([])
  const [competencies, setCompetencies] = useState([])
  const [capacities, setCapacities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCompetencyModal, setShowCompetencyModal] = useState(false)
  const [selectedCourseArea, setSelectedCourseArea] = useState('')
  const [courseStudents, setCourseStudents] = useState([])
  const [courseActivities, setCourseActivities] = useState([])
  const [courseGrades, setCourseGrades] = useState([])

  useEffect(() => {
    console.log('useEffect - Cargando cursos iniciales')
    loadCourses()
  }, [])

  useEffect(() => {
    console.log('selectedCourse cambió a:', selectedCourse)
    if (selectedCourse) {
      console.log('Modal debería estar visible')
    } else {
      console.log('Modal debería estar oculto')
    }
  }, [selectedCourse])

  const generateSchedule = (horasSemanales) => {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie']
    const times = ['8:00-9:30 AM', '9:30-11:00 AM', '11:00 AM-12:30 PM', '2:00-3:30 PM']

    const numDays = Math.min(horasSemanales / 2, 3)
    const selectedDays = days.slice(0, numDays)
    const time = times[Math.floor(Math.random() * times.length)]

    return `${selectedDays.join(', ')} - ${time}`
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      // Initialize stores
      await Promise.all([
        coursesStore.courses.length === 0 ? coursesStore.initialize() : Promise.resolve(),
        academicStore.levels.length === 0 ? academicStore.initialize() : Promise.resolve()
      ])

      // Load competencies and capacities
      const [competenciesData, capacitiesData] = await Promise.all([
        courseService.getAllCompetencies(),
        courseService.getAllCapacities()
      ])

      // Get all students
      const students = await studentsService.getAll()

      // Filter courses for current teacher
      const teacherCourses = coursesStore.courses.filter(course => {
        const teacher_id = course.teacher_id || course.teacher_id
        const profesores = course.profesores || []
        return profesorId === user?.id || profesores.includes(user?.id)
      }).slice(0, 6)

      // Enhance courses with additional data
      const enhancedCourses = teacherCourses.map((course, index) => {
        const level_id = course.level_id || course.level_id
        const level = academicStore.levels.find(l => l.id === nivelId)

        const levelGrades = academicStore.grades.filter(g => {
          const gradeNivelId = g.level_id || g.level_id
          return gradeNivelId === nivelId
        })

        const allSections = levelGrades.flatMap(grade =>
          academicStore.sections.filter(s => {
            const sectionGradoId = s.grade_id || s.grade_id
            return sectionGradoId === grade.id
          })
        )

        const section = allSections[index % allSections.length]
        const sectionGradoId = section?.grade_id || section?.grade_id
        const grade = academicStore.grades.find(g => g.id === sectionGradoId)

        const sectionStudents = students.filter(s => {
          const studentSeccionId = s.section_id || s.section_id
          return studentSeccionId === section?.id
        })

        const colors = ['blue', 'green', 'purple', 'yellow', 'red', 'indigo']
        const progreso = 60 + Math.floor(Math.random() * 30)
        const unidadesTotal = 8
        const unidadesCompletas = Math.floor((progreso / 100) * unidadesTotal)

        const horasSemanales = course.horas_semanales || course.horasSemanales || 4

        return {
          ...course,
          nivel: level?.name || level?.name || 'N/A',
          grado: grade?.name || grade?.name || 'N/A',
          seccion: section?.name || section?.name || 'A',
          estudiantes: sectionStudents.length || 25 + Math.floor(Math.random() * 10),
          horario: generateSchedule(horasSemanales),
          aula: `Aula ${100 + Math.floor(Math.random() * 200)}`,
          progreso,
          unidadesTotal,
          unidadesCompletas,
          evaluacionesPendientes: Math.floor(Math.random() * 6),
          promedioGeneral: 14 + Math.random() * 4,
          color: colors[index % colors.length]
        }
      })

      setCourses(enhancedCourses)
      setCompetencies(competenciesData || [])
      setCapacities(capacitiesData || [])
    } catch (error) {
      console.error('Error loading courses:', error)
      setCourses([])
      setCompetencies([])
      setCapacities([])
    } finally {
      setLoading(false)
    }
  }

  const loadCourseDetails = (course) => {
    console.log('=== loadCourseDetails INICIADO ===')
    console.log('Curso recibido:', course)

    try {
      // TODO: Fetch real data from API/store
      setCourseStudents([])
      setCourseActivities([])
      setCourseGrades([])
      setSelectedCourse(course)
      setActiveTab('overview')

      console.log('=== loadCourseDetails COMPLETADO ===')
    } catch (error) {
      console.error('ERROR en loadCourseDetails:', error)
    }
  }

  const handleViewCompetencies = (course) => {
    setSelectedCourseArea(course.area)
    setShowCompetencyModal(true)
  }

  const getCapacitiesByCompetency = (competencyId) => {
    return capacities.filter(cap => cap.competenciaId === competencyId)
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600 bg-green-100'
    if (progress >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getGradeColor = (average) => {
    if (average >= 17) return 'text-green-600'
    if (average >= 14) return 'text-yellow-600'
    if (average >= 11) return 'text-orange-600'
    return 'text-red-600'
  }

  return {
    // State
    courses,
    competencies,
    capacities,
    loading,
    selectedCourse,
    activeTab,
    showCompetencyModal,
    selectedCourseArea,
    courseStudents,
    courseActivities,
    courseGrades,

    // Setters
    setSelectedCourse,
    setActiveTab,
    setShowCompetencyModal,

    // Functions
    loadCourseDetails,
    handleViewCompetencies,
    getCapacitiesByCompetency,
    getProgressColor,
    getGradeColor
  }
}
