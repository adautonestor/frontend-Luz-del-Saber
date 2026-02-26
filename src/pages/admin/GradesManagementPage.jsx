import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Users, Save, Search, BookOpen, CheckCircle,
  AlertCircle, Edit, Calendar, Filter, Download, RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useGradingConfig } from '../../hooks/useGradingConfig'
import * as XLSX from 'xlsx'
import academicYearService from '../../services/academic/academicYearService'
import gradesService from '../../services/gradesService'
import courseService from '../../services/academic/courseService'
import studentsService from '../../services/studentsService'
import evaluationStructuresService from '../../services/evaluationStructuresService'

const GradesManagementPage = () => {
  const { user } = useAuthStore()
  const { getGradingSystemForLevel, getValidGradeOptions } = useGradingConfig()
  const [academicYears, setAcademicYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedNivel, setSelectedNivel] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBimester, setSelectedBimester] = useState(1)
  const [selectedCompetence, setSelectedCompetence] = useState('')

  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [evaluationStructures, setEvaluationStructures] = useState([])
  const [competences, setCompetences] = useState([])
  const [studentGrades, setStudentGrades] = useState({}) // { studentId: { valor, observacion } }

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedYear) {
      loadGrades()
    }
  }, [selectedYear])

  useEffect(() => {
    if (selectedNivel && selectedYear) {
      loadCourses()
    }
  }, [selectedNivel, selectedYear])

  useEffect(() => {
    if (selectedGrade && selectedYear) {
      loadStudents()
    }
  }, [selectedGrade, selectedYear])

  useEffect(() => {
    if (selectedCourse && selectedGrade && selectedYear) {
      loadEvaluationStructure()
    }
  }, [selectedCourse, selectedGrade, selectedYear])

  useEffect(() => {
    if (selectedCompetence && selectedBimester && selectedCourse && students.length > 0) {
      loadExistingGrades()
    }
  }, [selectedCompetence, selectedBimester, selectedCourse, students])

  const loadInitialData = async () => {
    const years = await academicYearService.getAll() || []
    setAcademicYears(years)

    const activeYear = years.find(y => y.state === 'activo')
    if (activeYear) {
      setSelectedYear(activeYear.id)
    }
  }

  const loadGrades = async () => {
    const gradesData = await gradesService.getAllCompetencyGrades() || []
    setGrades(gradesData)
  }

  const loadCourses = async () => {
    const coursesData = await courseService.getAll() || []
    const filteredCourses = coursesData.filter(c => {
      if (selectedNivel) {
        return c.level_id === selectedNivel
      }
      return true
    })
    setCourses(filteredCourses)
  }

  const loadStudents = async () => {
    const studentsData = await studentsService.getAll() || []
    const filteredStudents = studentsData.filter(s => s.grade_id === selectedGrade && s.state === 'activo')
      .sort((a, b) => a.last_names.localeCompare(b.last_names))
    setStudents(filteredStudents)
  }

  const loadEvaluationStructure = async () => {
    const structures = await evaluationStructuresService.getAll() || []
    setEvaluationStructures(structures)

    // Find structure for this course and grade
    const structure = structures.find(s =>
      s.course_id === selectedCourse &&
      s.grade_id === selectedGrade &&
      s.añoLectivoId === selectedYear
    )

    if (structure) {
      const comps = structure.competencias || structure.categorias || []
      setCompetences(comps)
      if (comps.length > 0 && !selectedCompetence) {
        setSelectedCompetence(comps[0].id || `comp-${comps[0].numero}`)
      }
    } else {
      setCompetences([])
      setSelectedCompetence('')
    }
  }

  const loadExistingGrades = async () => {
    const allGrades = await gradesService.getAllCompetencyGrades() || []
    const gradesMap = {}

    students.forEach(student => {
      const gradeRecord = allGrades.find(g =>
        g.student_id === student.id &&
        g.course_id === selectedCourse &&
        g.categoriaId === selectedCompetence &&
        g.quarter === selectedBimester &&
        g.academic_year === parseInt(selectedYear.split('-').pop())
      )

      if (gradeRecord) {
        gradesMap[student.id] = {
          valor: gradeRecord.valor,
          observacion: gradeRecord.observacion || ''
        }
      } else {
        gradesMap[student.id] = {
          valor: '',
          observacion: ''
        }
      }
    })

    setStudentGrades(gradesMap)
  }

  const handleGradeChange = async (studentId, field, value) => {
    setStudentGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const saveAllGrades = async () => {
    setErrors([])
    setSaving(true)

    try {
      const allGrades = await gradesService.getAllCompetencyGrades() || []
      const year = parseInt(selectedYear.split('-').pop())
      const selectedGradeData = grades.find(g => g.id === selectedGrade)

      // Obtener nombre del nivel para el hook de configuración
      const levelName = selectedGradeData?.level_name || 'secundaria'
      const config = getGradingSystemForLevel(levelName)

      let updatedCount = 0
      let createdCount = 0

      Object.entries(studentGrades).forEach(([studentId, gradeData]) => {
        if (!gradeData.valor) return // Skip empty grades

        // Validate grade value usando configuración dinámica
        if (config?.type === 'letters') {
          const validScale = config.scale || ['A', 'B', 'C', 'D']
          if (!validScale.includes(gradeData.valor)) {
            setErrors(prev => [...prev, `Nota inválida para estudiante ${studentId}: ${gradeData.valor}`])
            return
          }
        } else if (config?.type === 'numeric') {
          const numValue = parseFloat(gradeData.valor)
          const minVal = config.scale?.min ?? 0
          const maxVal = config.scale?.max ?? 20
          if (isNaN(numValue) || numValue < minVal || numValue > maxVal) {
            setErrors(prev => [...prev, `Nota fuera de rango para estudiante ${studentId}: ${gradeData.valor}`])
            return
          }
        }

        // Find existing grade record
        const existingIndex = allGrades.findIndex(g =>
          g.student_id === studentId &&
          g.course_id === selectedCourse &&
          g.categoriaId === selectedCompetence &&
          g.quarter === selectedBimester &&
          g.academic_year === year
        )

        const now = new Date().toISOString()

        if (existingIndex >= 0) {
          // Update existing
          allGrades[existingIndex] = {
            ...allGrades[existingIndex],
            valor: config.type === 'numeric' ? parseFloat(gradeData.valor) : gradeData.valor,
            observacion: gradeData.observacion || null,
            registradoPor: user.id,
            updatedAt: now
          }
          updatedCount++
        } else {
          // Create new
          const newGrade = {
            id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            student_id: studentId,
            course_id: selectedCourse,
            categoriaId: selectedCompetence,
            quarter: selectedBimester,
            academic_year: year,
            valor: config.type === 'numeric' ? parseFloat(gradeData.valor) : gradeData.valor,
            observacion: gradeData.observacion || null,
            notas: [{
              description: 'Nota',
              valor: config.type === 'numeric' ? parseFloat(gradeData.valor) : gradeData.valor,
              comentario: gradeData.observacion || ''
            }],
            registradoPor: user.id,
            createdAt: now,
            updatedAt: now
          }
          allGrades.push(newGrade)
          createdCount++
        }
      })

      // Save to database
      mockDb.data.grades = allGrades
      mockDb.saveToStorage()

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      console.log(`✅ Notas guardadas: ${createdCount} creadas, ${updatedCount} actualizadas`)
    } catch (error) {
      console.error('Error saving grades:', error)
      setErrors([error.message])
    } finally {
      setSaving(false)
    }
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()
    const data = []

    // Header
    data.push([
      'Estudiante',
      'DNI',
      'Nota',
      'Observación'
    ])

    // Data rows
    students.forEach(student => {
      const gradeData = studentGrades[student.id] || {}
      data.push([
        `${student.last_names}, ${student.first_names}`,
        student.dni,
        gradeData.valor || '',
        gradeData.observacion || ''
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Notas')

    const courseName = courses.find(c => c.id === selectedCourse)?.name || 'Curso'
    const competence = competences.find(c => (c.id || `comp-${c.numero}`) === selectedCompetence)
    const compName = competence?.nombreCompetencia || competence?.name || 'Competencia'

    XLSX.writeFile(wb, `Notas_${courseName}_${compName}_Bim${selectedBimester}.xlsx`)
  }

  const filteredGrades = grades.filter(g => {
    if (selectedNivel) {
      return g.level_id === selectedNivel
    }
    return true
  })

  const selectedGradeData = grades.find(g => g.id === selectedGrade)
  const levelName = selectedGradeData?.level_name || 'secundaria'
  const gradingConfig = getGradingSystemForLevel(levelName)

  const selectedCourseData = courses.find(c => c.id === selectedCourse)
  const selectedCompetenceData = competences.find(c => (c.id || `comp-${c.numero}`) === selectedCompetence)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Notas</h1>
          <p className="mt-2 text-gray-600">
            Ingresa y administra las calificaciones de los estudiantes por curso, competencia y bimestre
          </p>
        </div>
        {selectedCourse && selectedCompetence && students.length > 0 && (
          <button
            onClick={exportToExcel}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download size={18} />
            Exportar Excel
          </button>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border-2 border-green-300 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Notas guardadas exitosamente
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-2">Errores:</p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Filter size={20} />
          Seleccionar Contexto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año Lectivo *
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input w-full"
            >
              <option value="">Seleccionar año</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name} ({year.año})
                </option>
              ))}
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel *
            </label>
            <select
              value={selectedNivel}
              onChange={(e) => {
                setSelectedNivel(e.target.value)
                setSelectedGrade('')
                setSelectedCourse('')
              }}
              className="input w-full"
              disabled={!selectedYear}
            >
              <option value="">Seleccionar nivel</option>
              <option value="inicial">Inicial</option>
              <option value="primaria">Primaria</option>
              <option value="secundaria">Secundaria</option>
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grado *
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="input w-full"
              disabled={!selectedNivel}
            >
              <option value="">Seleccionar grado</option>
              {filteredGrades.map(grade => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input w-full"
              disabled={!selectedNivel}
            >
              <option value="">Seleccionar curso</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bimester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bimestre *
            </label>
            <select
              value={selectedBimester}
              onChange={(e) => setSelectedBimester(parseInt(e.target.value))}
              className="input w-full"
            >
              <option value={1}>Bimestre I</option>
              <option value={2}>Bimestre II</option>
              <option value={3}>Bimestre III</option>
              <option value={4}>Bimestre IV</option>
            </select>
          </div>

          {/* Competence */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competencia *
            </label>
            <select
              value={selectedCompetence}
              onChange={(e) => setSelectedCompetence(e.target.value)}
              className="input w-full"
              disabled={competences.length === 0}
            >
              <option value="">Seleccionar competencia</option>
              {competences.map((comp, idx) => {
                const compId = comp.id || `comp-${comp.numero}`
                const compName = comp.nombreCompetencia || comp.name || `Competencia ${comp.numero}`
                return (
                  <option key={compId} value={compId}>
                    {compName} {comp.peso ? `(${comp.peso}%)` : ''}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {competences.length === 0 && selectedCourse && selectedGrade && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  No hay estructura de evaluación configurada
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Debes crear una estructura de evaluación para este curso en la sección "Rubricas de Evaluación" antes de poder ingresar notas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Info */}
      {selectedCourse && selectedCompetence && students.length > 0 && (
        <div className="card p-4 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                Ingresando notas para:
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Curso:</strong> {selectedCourseData?.name} |
                <strong className="ml-2">Grado:</strong> {selectedGradeData?.name} |
                <strong className="ml-2">Bimestre:</strong> {selectedBimester} |
                <strong className="ml-2">Competencia:</strong> {selectedCompetenceData?.nombreCompetencia || selectedCompetenceData?.name}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Sistema:</strong> {gradingConfig?.type === 'letters' ? 'Letras (AD, A, B, C)' : 'Numérico (0-20)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grades Table */}
      {selectedCourse && selectedCompetence && students.length > 0 && (
        <div className="card">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Estudiantes ({students.length})
            </h3>
            <button
              onClick={saveAllGrades}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Todas las Notas
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '150px'}}>
                    Nota *
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => {
                  const gradeData = studentGrades[student.id] || { valor: '', observacion: '' }
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.last_names}, {student.first_names}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.dni}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {gradingConfig?.type === 'letters' ? (
                          <select
                            value={gradeData.valor}
                            onChange={(e) => handleGradeChange(student.id, 'valor', e.target.value)}
                            className="input text-center font-semibold"
                            style={{width: '120px'}}
                          >
                            <option value="">-</option>
                            {gradingConfig.scale.map(grade => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            min={gradingConfig?.scale?.min ?? 0}
                            max={gradingConfig?.scale?.max ?? 20}
                            step="0.1"
                            value={gradeData.valor}
                            onChange={(e) => handleGradeChange(student.id, 'valor', e.target.value)}
                            className="input text-center font-semibold"
                            style={{width: '100px'}}
                            placeholder="0-20"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={gradeData.observacion}
                          onChange={(e) => handleGradeChange(student.id, 'observacion', e.target.value)}
                          className="input w-full text-sm"
                          placeholder="Observación opcional..."
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Completa las notas y haz clic en "Guardar Todas las Notas" para guardar los cambios
            </p>
            <button
              onClick={saveAllGrades}
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!selectedCourse || !selectedCompetence || students.length === 0) && competences.length > 0 && (
        <div className="card p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona todos los filtros
          </h3>
          <p className="text-gray-600">
            Completa la selección de año, nivel, grado, curso, bimestre y competencia para comenzar a ingresar notas
          </p>
        </div>
      )}
    </div>
  )
}

export default GradesManagementPage
