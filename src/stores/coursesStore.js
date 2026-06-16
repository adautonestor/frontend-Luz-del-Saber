import { create } from 'zustand'
import { courseService } from '../services/academic/courseService'
import { matriculationService } from '../services/matriculationService'
import studentsService from '../services/studentsService'
import { gradesService } from '../services/gradesService'
import { getGradingScalesStore } from './gradingScalesStore'

/**
 * Helper para asignar colores según el área del curso
 */
const getColorForArea = (area) => {
  const areaColors = {
    'comunicación': 'bg-blue-500',
    'comunicacion': 'bg-blue-500',
    'matemática': 'bg-green-500',
    'matematica': 'bg-green-500',
    'matemáticas': 'bg-green-500',
    'ciencias': 'bg-purple-500',
    'ciencia y tecnología': 'bg-purple-500',
    'ciencia y ambiente': 'bg-purple-500',
    'personal social': 'bg-orange-500',
    'ciencias sociales': 'bg-orange-500',
    'educación física': 'bg-red-500',
    'psicomotricidad': 'bg-red-500',
    'arte': 'bg-pink-500',
    'arte y cultura': 'bg-pink-500',
    'arte y creatividad': 'bg-pink-500',
    'inglés': 'bg-indigo-500',
    'ingles': 'bg-indigo-500',
    'religión': 'bg-yellow-500',
    'educación religiosa': 'bg-yellow-500'
  }
  return areaColors[(area || '').toLowerCase()] || 'bg-gray-500'
}

/**
 * Courses Store - Gestión de Cursos y Asignaciones
 * Integrado con APIs reales del backend
 */
export const useCoursesStore = create((set, get) => ({
  // State
  courses: [],
  teacherAssignments: [],
  courseCompetencies: [],
  competencies: [],
  capacities: [],
  studentsByCourse: {},
  selectedCourse: null,
  isLoading: false,
  error: null,

  // ==================== INITIALIZE ====================
  initialize: async (teacherId = null) => {
    set({ isLoading: true, error: null })

    try {
      // Cargar cursos, asignaciones y course_competencies desde APIs reales
      const [allCourses, allAssignments, allCourseCompetencies] = await Promise.all([
        courseService.getAllCourses(),
        courseService.getAllAssignments(),
        courseService.getAllCourseCompetencies()
      ])

      // Filtrar cursos del profesor si se especifica
      let teacherCourses = allCourses || []
      if (teacherId) {
        const teacherAssignmentIds = (allAssignments || [])
          .filter(a => a.teacher_id === teacherId || a.teacher_id === teacherId)
          .map(a => a.course_id || a.course_id)

        teacherCourses = teacherCourses.filter(c =>
          teacherAssignmentIds.includes(c.id)
        )
      }

      // Enriquecer cursos con la propiedad 'nivel' para compatibilidad con MyCoursesPage
      teacherCourses = teacherCourses.map(course => {
        // Determinar nivel basado en level_name o level_id
        let nivel = 'primaria' // default
        const levelName = (course.level_name || '').toLowerCase()

        if (levelName.includes('inicial')) {
          nivel = 'inicial'
        } else if (levelName.includes('primaria')) {
          nivel = 'primaria'
        } else if (levelName.includes('secundaria')) {
          nivel = 'secundaria'
        } else if (course.level_id) {
          // Mapear por level_id si no hay level_name
          // 1 = Inicial, 2 = Primaria, 3 = Secundaria (típicamente)
          const levelIdMap = { 1: 'inicial', 2: 'primaria', 3: 'secundaria' }
          nivel = levelIdMap[course.level_id] || 'primaria'
        }

        // Extraer datos del primer assignment si existe
        const firstAssignment = Array.isArray(course.assignments) && course.assignments.length > 0
          ? course.assignments[0]
          : null

        // Obtener grado y sección del assignment o del curso
        const gradeName = course.grade_name || firstAssignment?.grade_name || course.grado || ''
        const sectionName = course.section_name || firstAssignment?.section_name || course.seccion || ''
        const weeklyHours = course.weekly_hours || firstAssignment?.weekly_hours || null

        // Formatear horario con las horas semanales
        const horario = weeklyHours ? `${weeklyHours} hrs/sem` : null

        return {
          ...course,
          nivel,
          // También mapear otros campos que espera MyCoursesPage
          grado: gradeName,
          seccion: sectionName,
          horario: horario,
          cantidadEstudiantes: course.student_count || 0,
          state: course.status || 'activo',
          color: course.color || getColorForArea(course.area)
        }
      })

      // Organizar estudiantes por curso y calcular promedios
      // NOTA: Los estudiantes se matriculan en grado/sección, no en cursos específicos
      // Por lo tanto, obtenemos estudiantes por el grado asignado al profesor
      const studentsByCourse = {}
      const courseAverages = {} // Almacenar promedios por curso

      // Cargar todos los estudiantes una sola vez
      let allStudents = []
      try {
        allStudents = await studentsService.getAll() || []
      } catch (error) {
        console.warn('Could not load students:', error)
      }

      for (const course of teacherCourses) {
        // Obtener TODAS las asignaciones del curso (puede tener múltiples grados)
        const courseAssignments = (allAssignments || []).filter(a => a.course_id === course.id)

        if (courseAssignments.length === 0) {
          studentsByCourse[course.id] = []
          courseAverages[course.id] = null
          continue
        }

        // Recopilar todos los grade_ids asignados al curso
        const assignedGradeIds = new Set(courseAssignments.map(a => a.grade_id))

        // Filtrar estudiantes de TODOS los grados asignados
        const courseStudents = allStudents
          .filter(student => {
            const studentGradeId = student.grade_id
            const studentStatus = student.status
            // Filtrar por cualquier grado del curso y estudiantes matriculados
            return assignedGradeIds.has(studentGradeId) && studentStatus === 'enrolled'
          })
          .map(student => ({
            ...student,
            enrollmentId: null,
            fechaInscripcion: student.enrollment_date || null,
            notaPromedio: 0
          }))

        studentsByCourse[course.id] = courseStudents

        // Calcular promedio del curso cargando promedios de competencias en paralelo
        let gradingSystem = 'literal' // Por defecto literal
        try {
          // Cargar promedios de todos los estudiantes en paralelo
          const studentPromises = courseStudents.map(async (student) => {
            try {
              // Cargar los 4 bimestres en paralelo
              const quarterPromises = [1, 2, 3, 4].map(quarter =>
                gradesService.getCompetencyAverages({
                  student_id: student.id,
                  course_id: course.id,
                  quarter: quarter
                }).catch(() => [])
              )

              const quarterResults = await Promise.all(quarterPromises)
              const studentAverages = []

              quarterResults.forEach(averages => {
                if (averages && Array.isArray(averages) && averages.length > 0) {
                  // Detectar sistema de calificación del primer promedio encontrado
                  if (averages[0]?.grading_system) {
                    gradingSystem = averages[0].grading_system
                  }

                  const quarterAvg = averages.reduce((sum, avg) => {
                    const value = parseFloat(avg.average_value)
                    return sum + (isNaN(value) ? 0 : value)
                  }, 0) / averages.length

                  if (!isNaN(quarterAvg) && quarterAvg > 0) {
                    studentAverages.push(quarterAvg)
                  }
                }
              })

              if (studentAverages.length > 0) {
                const studentAvg = studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length
                student.notaPromedio = studentAvg
                return studentAvg
              }
              return null
            } catch (err) {
              return null
            }
          })

          const studentResults = await Promise.all(studentPromises)
          const validAverages = studentResults.filter(avg => avg !== null && avg > 0)

          // Calcular promedio del curso
          if (validAverages.length > 0) {
            const avgValue = validAverages.reduce((a, b) => a + b, 0) / validAverages.length
            courseAverages[course.id] = {
              value: avgValue,
              gradingSystem: gradingSystem
            }
          } else {
            courseAverages[course.id] = null
          }
        } catch (error) {
          console.warn(`Could not calculate average for course ${course.id}:`, error)
          courseAverages[course.id] = null
        }
      }

      // Función helper para convertir valor numérico a letra usando store SSOT
      const valueToLetter = (value, levelId = null) => {
        return getGradingScalesStore().convertNumericToLetter(value, levelId)
      }

      // Agregar promedios a los cursos
      teacherCourses = teacherCourses.map(course => {
        const avgData = courseAverages[course.id]
        let promedioGeneral = null
        let sistemaCalificacion = 'literal'
        // Obtener levelId del curso para configuración dinámica
        const levelId = course.level_id || null

        if (avgData) {
          sistemaCalificacion = avgData.gradingSystem || 'literal'
          if (sistemaCalificacion === 'literal') {
            // Mostrar letra usando configuración dinámica del nivel
            promedioGeneral = valueToLetter(avgData.value, levelId)
          } else {
            // Mostrar número (escala 0-20)
            promedioGeneral = avgData.value
          }
        }

        return {
          ...course,
          promedioGeneral,
          promedioNumerico: avgData?.value || null,
          sistemaCalificacion,
          cantidadEstudiantes: studentsByCourse[course.id]?.length || 0
        }
      })

      set({
        courses: teacherCourses,
        teacherAssignments: allAssignments || [],
        courseCompetencies: allCourseCompetencies || [],
        studentsByCourse,
        isLoading: false
      })

      return teacherCourses
    } catch (error) {
      console.error('Error loading courses:', error)
      set({
        error: error.message || 'Error al cargar cursos',
        isLoading: false
      })
      throw error
    }
  },

  // ==================== COURSES ====================
  createCourse: async (courseData) => {
    set({ isLoading: true, error: null })

    try {
      const newCourse = await courseService.saveCourse(courseData)

      set(state => ({
        courses: [...state.courses, newCourse],
        isLoading: false
      }))

      console.log('✅ Course created:', newCourse.name || newCourse.name)
      return newCourse
    } catch (error) {
      console.error('❌ Error creating course:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateCourse: async (courseId, updates) => {
    set({ isLoading: true, error: null })

    try {
      // saveCourse espera: (courseData, levels, editingItemId, selectedAcademicYear)
      // levels no es necesario para la actualización (se usa internamente para validaciones)
      const updatedCourse = await courseService.saveCourse(updates, null, courseId, null)

      set(state => ({
        courses: state.courses.map(c => c.id === courseId ? updatedCourse : c),
        selectedCourse: state.selectedCourse?.id === courseId ? updatedCourse : state.selectedCourse,
        isLoading: false
      }))

      return updatedCourse
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteCourse: async (courseId) => {
    set({ isLoading: true, error: null })

    try {
      await courseService.deleteCourse(courseId)

      set(state => ({
        courses: state.courses.filter(c => c.id !== courseId),
        selectedCourse: state.selectedCourse?.id === courseId ? null : state.selectedCourse,
        isLoading: false
      }))

      console.log('✅ Course deleted:', courseId)
    } catch (error) {
      console.error('❌ Error deleting course:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== TEACHER ASSIGNMENTS ====================
  assignTeacher: async (assignmentData) => {
    set({ isLoading: true, error: null })

    try {
      const newAssignment = await courseService.saveAssignments(assignmentData)

      set(state => ({
        teacherAssignments: [...state.teacherAssignments, newAssignment],
        isLoading: false
      }))

      return newAssignment
    } catch (error) {
      console.error('Error assigning teacher:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  removeTeacherAssignment: async (assignmentId) => {
    set({ isLoading: true, error: null })

    try {
      await courseService.deleteAssignment(assignmentId)

      set(state => ({
        teacherAssignments: state.teacherAssignments.filter(a => a.id !== assignmentId),
        isLoading: false
      }))

      console.log('✅ Teacher assignment removed')
    } catch (error) {
      console.error('❌ Error removing assignment:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== STUDENT ENROLLMENTS ====================
  enrollStudent: async (courseId, studentId) => {
    set({ isLoading: true, error: null })

    try {
      // Crear matrícula para el estudiante en el curso
      const enrollmentData = {
        student_id: studentId,
        course_id: courseId,
        fecha_inscripcion: new Date().toISOString(),
        state: 'activo',
        nota_promedio: 0,
        asistencia_promedio: 100
      }

      const newEnrollment = await matriculationService.create(enrollmentData)

      // Obtener datos del estudiante
      const student = await studentsService.getById(studentId)

      if (student) {
        const enrolledStudent = {
          ...student,
          enrollmentId: newEnrollment.id,
          fechaInscripcion: newEnrollment.fecha_inscripcion || newEnrollment.fechaInscripcion,
          notaPromedio: 0
        }

        set(state => ({
          studentsByCourse: {
            ...state.studentsByCourse,
            [courseId]: [...(state.studentsByCourse[courseId] || []), enrolledStudent]
          },
          isLoading: false
        }))

        console.log('✅ Student enrolled in course')
        return newEnrollment
      }

      set({ isLoading: false })
      return newEnrollment
    } catch (error) {
      console.error('❌ Error enrolling student:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  removeStudent: async (courseId, enrollmentId) => {
    set({ isLoading: true, error: null })

    try {
      // Actualizar estado de matrícula a inactivo
      await matriculationService.update(enrollmentId, {
        state: 'inactivo',
        fecha_baja: new Date().toISOString()
      })

      // Actualizar lista local
      set(state => ({
        studentsByCourse: {
          ...state.studentsByCourse,
          [courseId]: (state.studentsByCourse[courseId] || []).filter(
            s => s.enrollmentId !== enrollmentId
          )
        },
        isLoading: false
      }))

      console.log('✅ Student removed from course')
      return true
    } catch (error) {
      console.error('❌ Error removing student:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== COMPETENCIES & CAPACITIES ====================
  loadCompetencies: async () => {
    set({ isLoading: true, error: null })

    try {
      const competencies = await courseService.getAllCompetencies()

      set({
        competencies: competencies || [],
        isLoading: false
      })

      return competencies
    } catch (error) {
      console.error('Error loading competencies:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  loadCapacities: async (competencyId) => {
    set({ isLoading: true, error: null })

    try {
      const capacities = await courseService.getCapacitiesByCompetency(competencyId)

      set({
        capacities: capacities || [],
        isLoading: false
      })

      return capacities
    } catch (error) {
      console.error('Error loading capacities:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  selectCourse: (courseId) => {
    const course = get().courses.find(c => c.id === courseId)
    set({ selectedCourse: course })
    return course
  },

  getCourseStudents: (courseId) => {
    return get().studentsByCourse[courseId] || []
  },

  getCourseById: (courseId) => {
    const { courses } = get()
    return courses.find(c => c.id === courseId)
  },

  getTeacherCourses: (teacherId) => {
    const { courses, teacherAssignments } = get()
    const teacherCourseIds = teacherAssignments
      .filter(a => a.teacher_id === teacherId || a.teacher_id === teacherId)
      .map(a => a.course_id || a.course_id)

    return courses.filter(c => teacherCourseIds.includes(c.id))
  },

  clearError: () => {
    set({ error: null })
  }
}))
