import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Search, Filter, Calendar, Edit, Eye } from 'lucide-react'
import { downloadFinalReportCard } from '../parent/FinalReportCardPDF'
import { useAuthStore } from '../../stores/authStore'
import { useAcademicStore } from '../../stores/academicStore'
import { useBehaviorEditor } from '../../hooks/useBehaviorEditor'
import BehaviorModal from '../reportCards/BehaviorModal'
import BoletaPreviewModal from '../reportCards/BoletaPreviewModal'
import studentsService from '../../services/studentsService'
import gradesService from '../../services/gradesService'
import courseService from '../../services/academic/courseService'
import evaluationStructuresService from '../../services/evaluationStructuresService'
import studentBehaviorsService from '../../services/studentBehaviorsService'
import {
  convertAverageValueToLetter,
  convertLetterToAverageValue,
  calculateFinalCourseAverage
} from '../../utils/gradeConversion'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'
import { attendanceService } from '../../services/attendanceService'
import { generateAttendanceDataForReportCard } from '../../utils/attendanceCalculator'

const FinalReportCards = () => {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [grades, setGrades] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showBoletaModal, setShowBoletaModal] = useState(false)
  const [boletaPreviewData, setBoletaPreviewData] = useState(null)

  // Filters object para el hook de conducta
  const filters = {
    academicYear: selectedYear ? selectedYear.toString() : '',
    nivel: '',
    grade: selectedGrade
  }

  // Hook para gestión de conducta
  const {
    selectedStudent,
    showBehaviorModal,
    behaviorData,
    saveSuccess,
    validationErrors,
    openBehaviorModal,
    closeBehaviorModal,
    handleBimesterChange,
    handleBehaviorDataChange,
    saveBehaviorData
  } = useBehaviorEditor(filters, user)

  // Inicializar: cargar años académicos del store y estudiantes
  useEffect(() => {
    initializeData()
  }, [])

  // Cuando cambia el año seleccionado, cargar grados de ese año
  useEffect(() => {
    if (!selectedYear || academicYears.length === 0) return
    loadGradesForYear()
  }, [selectedYear, academicYears])

  // Filtrar estudiantes cuando cambian los filtros
  useEffect(() => {
    filterStudents()
  }, [students, selectedYear, selectedGrade, searchTerm, grades])

  const initializeData = async () => {
    try {
      // Inicializar el store académico si no tiene años cargados
      const storeState = useAcademicStore.getState()
      if (!storeState.academicYears || storeState.academicYears.length === 0) {
        await storeState.initialize()
      }

      const updatedState = useAcademicStore.getState()
      const years = updatedState.academicYears || []
      setAcademicYears(years)

      // Establecer el año activo como selección inicial
      const activeYear = updatedState.selectedAcademicYear
      if (activeYear) {
        setSelectedYear(activeYear.año || activeYear.year)
      } else if (years.length > 0) {
        setSelectedYear(years[0].año || years[0].year)
      }

      // Cargar grados del año activo (ya cargados por initialize)
      setGrades(updatedState.grades || [])

      // Cargar estudiantes
      const studentsData = await studentsService.getAll() || []
      setStudents(studentsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadGradesForYear = async () => {
    try {
      const yearObj = academicYears.find(y => Number(y.año) === Number(selectedYear))
      if (!yearObj) return

      const storeState = useAcademicStore.getState()
      await storeState.loadAcademicStructure(yearObj)
      const updatedState = useAcademicStore.getState()
      setGrades(updatedState.grades || [])
    } catch (error) {
      console.error('Error cargando grados del año:', error)
    }
  }

  const filterStudents = () => {
    // Solo mostrar estudiantes que tienen grado asignado
    let filtered = students.filter(s => s.grade_id != null)

    // Filtrar por año lectivo
    if (selectedYear) {
      filtered = filtered.filter(s =>
        Number(s.academic_year) === Number(selectedYear)
      )
    }

    // Filtrar por grado
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.grade_id === parseInt(selectedGrade))
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.first_names?.toLowerCase().includes(term) ||
        s.last_names?.toLowerCase().includes(term) ||
        s.dni?.includes(term)
      )
    }

    setFilteredStudents(filtered)
  }

  const generateBoletaData = async (student) => {
    try {
      // Calcular level_id del estudiante desde su grado si no viene directamente
      // (el estudiante del backend puede no tener level_id, pero sí grade_id)
      let studentLevelId = student.level_id

      if (!studentLevelId && student.grade_id) {
        // Usar comparación numérica para evitar problemas de tipo
        const grade = grades.find(g => Number(g.id) === Number(student.grade_id))
        studentLevelId = grade?.level_id
      }

      // Obtener todos los cursos y filtrar por nivel del estudiante
      // (los cursos se asocian a niveles, no a grados - grade_id es siempre null)
      const courses = await courseService.getAllCourses() || []
      const studentCourses = courses.filter(c => Number(c.level_id) === Number(studentLevelId))

      // Obtener estructuras de evaluación filtradas por grado del estudiante
      const evaluationStructures = await evaluationStructuresService.getAll() || []
      const gradeStructures = evaluationStructures.filter(
        s => Number(s.grade_id) === Number(student.grade_id)
      )

      // Obtener año académico activo para buscar promedios
      const storeState = useAcademicStore.getState()
      const activeYear = storeState.selectedAcademicYear
      const academicYearId = activeYear?.id

      // Obtener promedios por competencia del estudiante (de competency_quarter_averages)
      let allAverages = []
      for (let quarter = 1; quarter <= 4; quarter++) {
        try {
          const quarterAverages = await gradesService.getCompetencyAverages({
            student_id: student.id,
            quarter: quarter,
            academic_year_id: academicYearId
          }) || []
          allAverages = [...allAverages, ...quarterAverages]
        } catch (err) {
          // Silenciar errores de bimestres sin datos
        }
      }

      // Determinar si el nivel usa sistema numérico o literal
      // IDs de niveles en la BD: Inicial=5, Primaria=6, Secundaria=7
      const levelId = studentLevelId
      const isNumericSystem = Number(levelId) === 7 // Solo Secundaria (level 7) usa vigesimal

      // Función para convertir valor numérico a literal (A, B, C, D)
      // IMPORTANTE: La decisión de convertir a letra se basa en el NIVEL del estudiante
      const convertToLiteral = (numericValue, gradingSystem) => {
        if (!numericValue && numericValue !== 0) return null

        // Parsear el valor a número si es string
        const numValue = typeof numericValue === 'string' ? parseFloat(numericValue) : numericValue

        // Para Secundaria (level 7) → retornar número
        if (isNumericSystem) {
          return Math.round(numValue)
        }

        // Para Inicial (level 5) y Primaria (level 6) → SIEMPRE convertir a letra
        let letterValue = convertAverageValueToLetter(numValue, levelId)

        // Fallback directo si la conversión no funciona
        if (!letterValue || letterValue === '-' || typeof letterValue === 'number') {
          if (numValue >= 4.0) letterValue = 'A'
          else if (numValue >= 3.0) letterValue = 'B'
          else if (numValue >= 2.0) letterValue = 'C'
          else letterValue = 'D'
        }

        return letterValue
      }

      // Función para calcular el promedio de una competencia (igual que dataTransformers.js)
      const calculateCompetencyAverage = (bimesters, isNumeric) => {
        const validGrades = bimesters.filter(g => g !== null)
        if (validGrades.length === 0) return null

        if (isNumeric || typeof validGrades[0] === 'number') {
          // Sistema numérico: promedio directo
          const sum = validGrades.reduce((acc, g) => acc + (typeof g === 'number' ? g : parseFloat(g)), 0)
          return Math.round((sum / validGrades.length) * 100) / 100
        } else {
          // Sistema literal: convertir a numérico, promediar, reconvertir
          const numericValues = validGrades
            .map(g => convertLetterToAverageValue(g, levelId))
            .filter(v => v !== null)

          if (numericValues.length === 0) return null

          const avgNumeric = numericValues.reduce((acc, v) => acc + v, 0) / numericValues.length
          return convertAverageValueToLetter(avgNumeric, levelId)
        }
      }

      // Función para calcular el promedio final del curso (igual que dataTransformers.js)
      const calculateCourseAverage = (competenciasConNotas, isNumeric) => {
        const competencyAverages = competenciasConNotas
          .map(c => c.promedioFinal)
          .filter(p => p !== null)

        if (competencyAverages.length === 0) return null

        if (isNumeric || typeof competencyAverages[0] === 'number') {
          // Sistema numérico
          const sum = competencyAverages.reduce((acc, p) => acc + (typeof p === 'number' ? p : parseFloat(p)), 0)
          return Math.round((sum / competencyAverages.length) * 100) / 100
        } else {
          // Sistema literal - usar función centralizada
          const result = calculateFinalCourseAverage(competencyAverages, levelId)
          return result.letter
        }
      }

      // Construir estructura de boleta
      const boletaStructure = studentCourses.map(course => {
        // Buscar estructuras de evaluación para este curso Y grado del estudiante
        const courseStructures = gradeStructures.filter(s => s.course_id === course.id)
        if (courseStructures.length === 0) return null

        const structure = courseStructures[0]
        // El backend retorna el campo como 'competencies' (inglés) o 'categories'
        // El JSON interno puede estar envuelto como { competencias: [...] } o ser un array directo
        const rawCompetencies = structure.competencies || structure.categories || []
        const competencias = rawCompetencies.competencias || rawCompetencies

        // Si no es un array, no hay competencias
        if (!Array.isArray(competencias) || competencias.length === 0) return null

        const competenciasConNotas = competencias.map((competencia, index) => {
          const bimesters = [null, null, null, null]

          // Generar el ID de la competencia de la misma manera que el backend
          const competencyId = competencia.id ||
            `COMP_${(competencia.nombreCompetencia || competencia.name || `Competencia ${competencia.numero || index + 1}`).replace(/\s+/g, '_').toUpperCase()}`

          // Función de normalización para comparación tolerante
          const normalizeId = (id) => {
            if (!id) return ''
            return id
              .trim()
              .toUpperCase()
              .replace(/\s+/g, '_')
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          }

          const normalizedCompetencyId = normalizeId(competencyId)

          for (let bim = 1; bim <= 4; bim++) {
            // Buscar el promedio guardado en competency_quarter_averages
            // Usar comparación tolerante: normalizar ambos IDs antes de comparar
            let averageRecord = allAverages.find(
              a => a.course_id === course.id &&
                   a.category_id === competencyId &&
                   a.quarter === bim
            )

            // Si no hay match exacto, intentar con comparación normalizada
            if (!averageRecord) {
              averageRecord = allAverages.find(
                a => a.course_id === course.id &&
                     normalizeId(a.category_id) === normalizedCompetencyId &&
                     a.quarter === bim
              )
            }

            // Último fallback: si solo hay una competencia y un promedio para este curso/bimestre
            if (!averageRecord && competencias.length === 1) {
              const fallback = allAverages.find(
                a => a.course_id === course.id && a.quarter === bim
              )
              if (fallback) {
                averageRecord = fallback
              }
            }

            if (averageRecord) {
              // Convertir el valor numérico a literal si es necesario
              bimesters[bim - 1] = convertToLiteral(
                averageRecord.average_value,
                averageRecord.grading_system
              )
            }
          }

          // Calcular promedio anual de la competencia (IGUAL que dataTransformers.js)
          const promedioFinal = calculateCompetencyAverage(bimesters, isNumericSystem)

          return {
            name: competencia.nombreCompetencia || competencia.name || `Competencia ${competencia.numero}`,
            bimestre1: bimesters[0],
            bimestre2: bimesters[1],
            bimestre3: bimesters[2],
            bimestre4: bimesters[3],
            promedioFinal
          }
        })

        // Calcular promedio final del curso (IGUAL que dataTransformers.js)
        const promedioFinalCurso = calculateCourseAverage(competenciasConNotas, isNumericSystem)

        return {
          cursoNombre: course.name,
          competencias: competenciasConNotas,
          promedioFinal: promedioFinalCurso
        }
      }).filter(c => c && c.competencias.length > 0)

      return boletaStructure
    } catch (error) {
      console.error('Error generating boleta data:', error)
      return []
    }
  }

  // Enriquecer estudiante con información adicional
  const enrichStudent = async (student) => {
    const grade = grades.find(g => g.id === student.grade_id)
    const storeState = useAcademicStore.getState()

    // Obtener nombre del nivel desde el store
    // Usar Number() para asegurar comparación correcta de tipos
    const levels = storeState.levels || []
    const levelId = grade?.level_id
    const level = levels.find(l => Number(l.id) === Number(levelId))
    const nivelNombre = level?.name || ''

    // Obtener escala de calificación configurada para el nivel del estudiante
    const gradingScalesStore = getGradingScalesStore()
    const gradingScale = gradingScalesStore.getScaleForLevel(grade?.level_id)

    // Obtener nombre del tutor desde la sección del estudiante
    let tutorNombre = ''
    if (student.section_id) {
      const sections = storeState.sections || []
      const section = sections.find(s => s.id === student.section_id)
      if (section?.tutor_name) {
        tutorNombre = section.tutor_name
      }
    }

    // Cargar comportamientos del estudiante
    let studentBehaviors = []
    try {
      const allBehaviors = await studentBehaviorsService.getAll({ student_id: student.id }) || []
      studentBehaviors = allBehaviors.filter(
        b => b.student_id === student.id && b.academic_year === selectedYear
      )
    } catch (error) {
      console.error('Error cargando behaviors:', error)
    }

    // Cargar datos de asistencia del estudiante para la boleta
    let attendanceData = {}
    try {
      const attendanceRecords = await attendanceService.getAllRecords({ student_id: student.id }) || []
      attendanceData = generateAttendanceDataForReportCard(attendanceRecords, student.id)
    } catch (error) {
      console.error('Error cargando asistencia:', error)
    }

    return {
      ...student,
      gradeName: grade?.name || '',
      nivel: nivelNombre,
      level_id: grade?.level_id || null,
      gradingSystem: grade?.level_id === 7 ? 'secundaria' : 'literal',
      gradingScale,
      tutorNombre,
      studentBehaviors,
      attendanceData
    }
  }

  // Abrir modal de vista previa
  const openBoletaPreview = async (student) => {
    const boletaData = await generateBoletaData(student) || []
    const enrichedStudent = await enrichStudent(student)

    setBoletaPreviewData({
      student: enrichedStudent,
      boletaData,
      year: selectedYear
    })
    setShowBoletaModal(true)
  }

  // Cerrar modal de vista previa
  const closeBoletaModal = async () => {
    setShowBoletaModal(false)
    setBoletaPreviewData(null)
  }

  const handleDownloadBoleta = async (student) => {
    setLoading(true)
    try {
      const boletaData = await generateBoletaData(student)
      const enrichedStudent = await enrichStudent(student)

      await downloadFinalReportCard(enrichedStudent, boletaData, selectedYear)
    } catch (error) {
      console.error('Error downloading boleta:', error)
      alert('Error al generar la boleta. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDownload = async () => {
    if (filteredStudents.length === 0) {
      alert('No hay estudiantes para descargar boletas.')
      return
    }

    setLoading(true)
    for (const student of filteredStudents) {
      await handleDownloadBoleta(student)
      // Add small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Boletas de Notas Finales</h1>
        <p className="mt-2 text-gray-600">
          Genera y descarga las boletas de notas oficiales de los estudiantes
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value))
                setSelectedGrade('all')
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccionar año</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.año}>
                  {year.año} {year.state === 'activo' ? '(Vigente)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos los grados</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 md:col-span-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredStudents.length} estudiante(s) encontrado(s)
          </p>
          <button
            onClick={handleBulkDownload}
            disabled={loading || filteredStudents.length === 0}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Descargar Todas las Boletas
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => {
              const grade = grades.find(g => g.id === student.grade_id)
              // Obtener el nivel desde el store para tener acceso al nombre
              // Usar Number() para asegurar comparación correcta de tipos
              const storeState = useAcademicStore.getState()
              const levels = storeState.levels || []
              const level = levels.find(l => Number(l.id) === Number(grade?.level_id))

              return (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.last_names}, {student.first_names}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{student.dni || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{grade?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          // Enriquecer estudiante con datos del grado y nivel antes de abrir modal
                          const enrichedStudent = {
                            ...student,
                            gradeName: grade?.name || '',
                            nivel: level?.name || '',
                            level_id: grade?.level_id || null,
                            gradingSystem: grade?.level_id === 7 ? 'secundaria' : 'literal'
                          }
                          openBehaviorModal(enrichedStudent)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
                        title="Registrar Conducta"
                      >
                        <Edit size={16} />
                        Registrar Conducta
                      </button>
                      <button
                        onClick={() => openBoletaPreview(student)}
                        className="p-2 text-blue-600 hover:text-blue-900 rounded-lg hover:bg-blue-50"
                        title="Ver Boleta"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron estudiantes
            </h3>
            <p className="text-gray-600">
              Ajusta los filtros o realiza otra búsqueda
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-700 font-medium">Generando boleta(s)...</p>
          </div>
        </div>
      )}

      {/* Modal de Conducta */}
      <BehaviorModal
        isOpen={showBehaviorModal}
        onClose={closeBehaviorModal}
        student={selectedStudent}
        behaviorData={behaviorData}
        onBimesterChange={handleBimesterChange}
        onDataChange={handleBehaviorDataChange}
        onSave={saveBehaviorData}
        saveSuccess={saveSuccess}
        validationErrors={validationErrors}
      />

      {/* Modal de Vista Previa de Boleta */}
      {boletaPreviewData && (
        <BoletaPreviewModal
          isOpen={showBoletaModal}
          onClose={closeBoletaModal}
          student={boletaPreviewData.student}
          boletaData={boletaPreviewData.boletaData}
          year={boletaPreviewData.year}
        />
      )}
    </div>
  )
}

export default FinalReportCards
