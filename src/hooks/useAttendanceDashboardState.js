import { useState, useEffect } from 'react'
import { useAttendanceStore } from '../stores/attendanceStore'
import { useCoursesStore } from '../stores/coursesStore'
import { useAcademicStore } from '../stores/academicStore'
import studentsService from '../services/studentsService'
import { attendanceService } from '../services/attendanceService'
import * as XLSX from 'xlsx'
import { getTodayLima } from '../utils/dateUtils'

/**
 * Hook para gestión del dashboard de asistencia
 * Integrado con APIs reales del backend
 */
export const useAttendanceDashboardState = (user) => {
  const {
    getClassAttendance,
    getMonthlyStats,
    registerManualAttendance,
    justifyLateArrival
  } = useAttendanceStore()

  const coursesStore = useCoursesStore()
  const academicStore = useAcademicStore()

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [availableSections, setAvailableSections] = useState([])
  const [selectedDate, setSelectedDate] = useState(getTodayLima())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState(1) // Bimestre seleccionado (1-4)
  const [teacherCourses, setTeacherCourses] = useState([])
  const [classData, setClassData] = useState(null)
  const [viewMode, setViewMode] = useState('registro')
  const [searchTerm, setSearchTerm] = useState('')
  const [showJustifyModal, setShowJustifyModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [justification, setJustification] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTeacherCourses()
  }, [user])

  useEffect(() => {
    if (selectedCourse) {
      loadSections()
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedCourse && selectedSection) {
      loadClassData()
    }
  }, [selectedCourse, selectedSection, selectedDate])

  const loadTeacherCourses = async () => {
    if (!user?.id) return

    try {
      // Inicializar stores si es necesario
      await Promise.all([
        coursesStore.courses.length === 0 ? coursesStore.initialize(user.id) : Promise.resolve(),
        academicStore.grades.length === 0 ? academicStore.initialize() : Promise.resolve()
      ])

      let coursesList = []

      // Si es admin (role_id 1) o secretaria (role_id 2), mostrar TODOS los cursos
      // Si es profesor (role_id 3), mostrar solo sus cursos asignados
      if (user.role_id === 1 || user.role_id === 2) {
        // Admin o Secretaria: ver todos los cursos
        coursesList = coursesStore.courses
      } else {
        // Profesor: solo sus cursos
        coursesList = coursesStore.courses.filter(course => {
          const teacherId = course.teacher_id
          return teacherId === user.id
        })
      }

      const grades = academicStore.grades || []
      const sections = academicStore.sections || []

      const coursesWithDetails = coursesList.map(course => {
        const gradeId = course.grade_id
        const sectionId = course.section_id

        const grade = grades.find(g => g.id === gradeId)
        const section = sections.find(s => s.id === sectionId)

        return {
          ...course,
          gradeName: grade?.name,
          sectionName: section?.name
        }
      })

      // Eliminar duplicados (mismo curso puede estar varias veces para diferentes secciones)
      const uniqueCourses = coursesWithDetails.reduce((acc, course) => {
        const key = `${course.name}-${course.grade_id}`
        if (!acc.find(c => `${c.name}-${c.grade_id}` === key)) {
          acc.push(course)
        }
        return acc
      }, [])

      setTeacherCourses(uniqueCourses)

      if (uniqueCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(uniqueCourses[0])
      }
    } catch (error) {
      console.error('Error loading teacher courses:', error)
      setTeacherCourses([])
    }
  }

  const loadSections = () => {
    if (!selectedCourse) return

    const sections = academicStore.sections || []
    const gradeId = selectedCourse.grade_id

    const courseSections = sections.filter(s => {
      const sectionGradeId = s.grade_id
      return sectionGradeId === gradeId
    })

    setAvailableSections(courseSections)

    if (courseSections.length > 0 && !selectedSection) {
      setSelectedSection(courseSections[0])
    }
  }

  const loadClassData = () => {
    if (!selectedCourse || !selectedSection) return

    const data = getClassAttendance(
      selectedCourse.grade_id,
      selectedSection.id,
      selectedDate
    )

    setClassData(data)
  }

  const handleRegisterAttendance = async (studentId, estado) => {
    try {
      setSaving(true)
      await registerManualAttendance(studentId, selectedDate, estado, user.id)
      loadClassData()
      setSaving(false)
    } catch (error) {
      console.error('Error registrando asistencia:', error)
      setSaving(false)
      alert('Error al registrar asistencia: ' + error.message)
    }
  }

  const handleJustifyTardanza = async () => {
    if (!justification.trim()) {
      alert('Por favor ingrese una justificación')
      return
    }

    try {
      setSaving(true)
      await justifyLateArrival(selectedRecord.id, justification, user.id)
      setShowJustifyModal(false)
      setJustification('')
      setSelectedRecord(null)
      loadClassData()
      setSaving(false)
    } catch (error) {
      console.error('Error justificando tardanza:', error)
      setSaving(false)
      alert('Error al justificar tardanza: ' + error.message)
    }
  }

  /**
   * Toggle de justificación de tardanza (solo botón, sin comentarios)
   */
  const toggleLateJustified = async (recordId) => {
    try {
      setSaving(true)
      const record = classData?.records?.find(r => r.id === recordId)
      if (!record) return

      await attendanceService.updateRecord(recordId, {
        late_justified: !record.tardanzaJustificada
      })
      loadClassData()
      setSaving(false)
    } catch (error) {
      console.error('Error toggling late justified:', error)
      setSaving(false)
      alert('Error al cambiar justificación: ' + error.message)
    }
  }

  /**
   * Toggle de justificación de inasistencia (solo botón, sin comentarios)
   */
  const toggleAbsenceJustified = async (recordId) => {
    try {
      setSaving(true)
      const record = classData?.records?.find(r => r.id === recordId)
      if (!record) return

      await attendanceService.updateRecord(recordId, {
        absence_justified: !record.faltaJustificada
      })
      loadClassData()
      setSaving(false)
    } catch (error) {
      console.error('Error toggling absence justified:', error)
      setSaving(false)
      alert('Error al cambiar justificación: ' + error.message)
    }
  }

  const exportToExcel = async () => {
    if (!selectedCourse || !selectedSection || !classData) return

    try {
      const allStudents = await studentsService.getAll()
      const gradeId = selectedCourse.grade_id

      const classStudents = allStudents.filter(s => {
        const studentGradeId = s.grade_id
        const studentSectionId = s.section_id
        return studentGradeId === gradeId && studentSectionId === selectedSection.id
      })

      const excelData = classStudents.map(student => {
        const stats = getMonthlyStats(student.id, selectedYear, selectedMonth)
        const todayRecord = classData.records.find(r => r.student_id === student.id)

        return {
          'Nombre': `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() + `, ${student.first_names || ''}${student.last_names ? ' ' + student.last_names : ''}`,
          'DNI': student.dni,
          'Estado Hoy': todayRecord ? getStatusText(todayRecord.estadoEntrada) : 'Sin registro',
          'Total Días': stats.total,
          'Asistió': stats.asistio || 0,
          'Tardanzas': stats.tardanzas,
          'Faltas': stats.faltas,
          'Blanco': stats.blanco || 0,
          '% Asistencia': `${stats.porcentajeAsistencia}%`
        }
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      const colWidths = [
        { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Asistencia')

      const courseName = selectedCourse.name
      const fileName = `Asistencia_${courseName}_${selectedCourse.gradeName}_Seccion${selectedSection.name}_${selectedMonth}-${selectedYear}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error al exportar a Excel')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'asistio':
        return 'bg-green-100 text-green-800'
      case 'tardanza':
        return 'bg-yellow-100 text-yellow-800'
      case 'falta':
        return 'bg-red-100 text-red-800'
      case 'blanco':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'asistio':
        return 'Asistió'
      case 'tardanza':
        return 'Tardanza'
      case 'falta':
        return 'Falta'
      case 'blanco':
        return 'Blanco'
      default:
        return 'Sin registro'
    }
  }

  const getStudentRecord = (studentId) => {
    if (!classData) return null
    return classData.records.find(r => r.student_id === studentId)
  }

  const [filteredStudents, setFilteredStudents] = useState([])

  useEffect(() => {
    const loadFilteredStudents = async () => {
      if (!selectedCourse || !selectedSection) {
        setFilteredStudents([])
        return
      }

      try {
        const allStudents = await studentsService.getAll()
        const gradeId = selectedCourse.grade_id

        let classStudents = allStudents.filter(s => {
          const studentGradeId = s.grade_id
          const studentSectionId = s.section_id
          return studentGradeId === gradeId && studentSectionId === selectedSection.id
        })

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          classStudents = classStudents.filter(s =>
            s.first_names.toLowerCase().includes(term) ||
            s.last_names.toLowerCase().includes(term) ||
            s.dni.includes(term)
          )
        }

        const sorted = classStudents.sort((a, b) =>
          `${a.paternal_last_name || ''} ${a.maternal_last_name || ''} ${a.first_names || ''}`.localeCompare(`${b.paternal_last_name || ''} ${b.maternal_last_name || ''} ${b.first_names || ''}`)
        )

        setFilteredStudents(sorted)
      } catch (error) {
        console.error('Error loading filtered students:', error)
        setFilteredStudents([])
      }
    }

    loadFilteredStudents()
  }, [selectedCourse, selectedSection, searchTerm])

  return {
    // State
    selectedCourse,
    setSelectedCourse,
    selectedSection,
    setSelectedSection,
    availableSections,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedQuarter,
    setSelectedQuarter,
    teacherCourses,
    classData,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    showJustifyModal,
    setShowJustifyModal,
    selectedRecord,
    setSelectedRecord,
    justification,
    setJustification,
    saving,

    // Functions
    handleRegisterAttendance,
    handleJustifyTardanza,
    toggleLateJustified,
    toggleAbsenceJustified,
    exportToExcel,
    getStatusColor,
    getStatusText,
    getStudentRecord,
    filteredStudents, // Ahora es un estado, no una función
    getMonthlyStats
  }
}
