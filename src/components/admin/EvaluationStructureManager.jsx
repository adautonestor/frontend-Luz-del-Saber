import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Edit, Trash2, X, Download, Calendar,
  Settings, BookOpen, Baby, Backpack, GraduationCap,
  AlertCircle, CheckCircle, Users, CheckSquare, Layers, Copy
} from 'lucide-react'
import { useGradesStore } from '../../stores/gradesStore.jsx'
import { useAcademicStore } from '../../stores/academicStore'
import { useEvaluationFilters, useEvaluationStructure, useCompetencias } from '../../hooks'
import { evaluationTemplates } from '@/constants/evaluation'
import PrimariaGradeSelector from '../evaluation/PrimariaGradeSelector'
import academicYearService from '../../services/academic/academicYearService'
import { structureService } from '../../services/academic/structureService'

/**
 * Gestor de Estructuras de Evaluación (Refactorizado)
 * Orquestador principal que coordina hooks y componentes
 */
const EvaluationStructureManager = () => {
  const {
    evaluationStructures,
    createEvaluationStructure,
    updateEvaluationStructure,
    initialize: initializeGrades
  } = useGradesStore()

  const { initialize: initializeAcademic } = useAcademicStore()

  const [academicYears, setAcademicYears] = useState([])
  const [activeTab, setActiveTab] = useState(null)

  // Estados locales para niveles, grados y cursos (dinámicos por año)
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loadingStructure, setLoadingStructure] = useState(false)

  // Hook de filtros
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    selectedCourse,
    setSelectedCourse,
    selectedGrade,
    setSelectedGrade,
    selectedBimester,
    setSelectedBimester,
    filteredStructures
  } = useEvaluationFilters(evaluationStructures, grades, activeTab)

  // Hook de gestión de estructuras
  const {
    showCreateModal,
    setShowCreateModal,
    editingStructure,
    validationError,
    setValidationError,
    structureData,
    setStructureData,
    formGrade,
    setFormGrade,
    selectedNivel,
    setSelectedNivel,
    applyToAllGrades,
    setApplyToAllGrades,
    selectedGrades,
    setSelectedGrades,
    handleNewStructureClick,
    saveStructure,
    editStructure,
    exportStructure
  } = useEvaluationStructure(
    selectedAcademicYear,
    selectedCourse,
    selectedGrade,
    selectedBimester,
    setSelectedBimester,
    evaluationStructures,
    createEvaluationStructure,
    updateEvaluationStructure,
    initializeGrades,
    grades,
    courses,
    academicYears
  )

  // Hook de competencias
  const { addCompetencia, updateCompetencia, removeCompetencia, applyTemplate } =
    useCompetencias(structureData, setStructureData)

  // Estado para modal de duplicación
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicatingStructure, setDuplicatingStructure] = useState(null)
  const [duplicateGrades, setDuplicateGrades] = useState([])
  const [isDuplicating, setIsDuplicating] = useState(false)

  useEffect(() => {
    initializeGrades()
    initializeAcademic()
    loadAcademicYears()
    cleanDuplicateStructures()
  }, [])

  // Recargar estructura académica cuando cambie el año lectivo
  useEffect(() => {
    const loadStructureForYear = async () => {
      if (!selectedAcademicYear) {
        setLevels([])
        setGrades([])
        setCourses([])
        return
      }

      setLoadingStructure(true)
      try {
        const yearObj = academicYears.find(y => y.id === Number(selectedAcademicYear))
        if (yearObj) {
          const structure = await structureService.loadAcademicStructure(yearObj)
          setLevels(structure.levels || [])
          setGrades(structure.grades || [])
          setCourses(structure.courses || [])

          // Reset activeTab cuando cambia el año
          if (structure.levels && structure.levels.length > 0) {
            setActiveTab(structure.levels[0].id.toString())
          } else {
            setActiveTab(null)
          }
        }
      } catch (error) {
        console.error('Error cargando estructura para el año:', error)
        setLevels([])
        setGrades([])
        setCourses([])
      } finally {
        setLoadingStructure(false)
      }
    }

    if (academicYears.length > 0) {
      loadStructureForYear()
    }
  }, [selectedAcademicYear, academicYears])

  useEffect(() => {
    setSelectedNivel(activeTab)
  }, [activeTab])

  // Establecer el primer nivel como activo cuando se carguen los niveles (solo si no hay activeTab)
  useEffect(() => {
    if (levels && levels.length > 0 && !activeTab) {
      setActiveTab(levels[0].id.toString())
    }
  }, [levels])

  const cleanDuplicateStructures = () => {
    try {
      const db = localStorage.getItem('luzDelSaberDB')
      if (db) {
        const data = JSON.parse(db)
        if (data.evaluationStructures) {
          const uniqueStructures = data.evaluationStructures.reduce((acc, structure) => {
            if (!acc.find(s => s.id === structure.id)) {
              acc.push(structure)
            }
            return acc
          }, [])
          if (uniqueStructures.length !== data.evaluationStructures.length) {
            data.evaluationStructures = uniqueStructures
            localStorage.setItem('luzDelSaberDB', JSON.stringify(data))
          }
        }
      }
    } catch (error) {
      console.error('Error limpiando estructuras duplicadas:', error)
    }
  }

  const loadAcademicYears = async () => {
    try {
      const years = await academicYearService.getAll() || []
      setAcademicYears(years)
      const activeYear = years.find(y => y.state === 'activo')
      if (activeYear && !selectedAcademicYear) {
        setSelectedAcademicYear(activeYear.id)
      }
    } catch (error) {
      console.error('Error loading academic years:', error)
      setAcademicYears([])
    }
  }

  const handleTabChange = (nivel) => {
    setActiveTab(nivel)
  }

  // Convertir el tabId (que ahora es el ID del nivel) a número
  const getLevelIdFromTab = (tabId) => {
    return tabId ? Number(tabId) : null
  }

  const activeLevelId = getLevelIdFromTab(activeTab)
  const filteredCourses = courses?.filter(course => course.level_id === activeLevelId) || []

  // Filtrar grados por nivel (ya están filtrados por año al cargar)
  const filteredGrades = grades?.filter(g => g.level_id === activeLevelId) || []

  // Función para abrir modal de duplicación
  const handleDuplicateStructure = (structure) => {
    setDuplicatingStructure(structure)
    // Filtrar grados del mismo nivel que NO tienen ya esta rúbrica (mismo curso y bimestre)
    const currentGradeLevel = grades?.find(g => g.id === structure.grade_id)?.level_id
    const gradesWithoutStructure = grades?.filter(g => {
      if (g.level_id !== currentGradeLevel) return false
      if (g.id === structure.grade_id) return false // Excluir el grado actual
      // Verificar si ya existe una rúbrica para este grado/curso/bimestre
      const exists = evaluationStructures?.some(s =>
        s.grade_id === g.id &&
        s.course_id === structure.course_id &&
        s.quarter === structure.quarter
      )
      return !exists
    }) || []
    setDuplicateGrades([])
    setShowDuplicateModal(true)
  }

  // Función para ejecutar la duplicación
  const executeDuplicate = async () => {
    if (!duplicatingStructure || duplicateGrades.length === 0) return

    setIsDuplicating(true)
    try {
      // Crear una copia de la estructura para cada grado seleccionado
      for (const gradeId of duplicateGrades) {
        const newStructure = {
          course_id: duplicatingStructure.course_id,
          grade_id: gradeId,
          quarter: duplicatingStructure.quarter,
          academic_year: duplicatingStructure.academic_year,
          academic_year_id: duplicatingStructure.academic_year_id || duplicatingStructure.añoLectivoId,
          grading_system: duplicatingStructure.grading_system || 'literal',
          competencias: JSON.parse(JSON.stringify(duplicatingStructure.competencias || duplicatingStructure.categorias || []))
        }
        await createEvaluationStructure(newStructure)
      }

      // Recargar datos
      await initializeGrades()

      setShowDuplicateModal(false)
      setDuplicatingStructure(null)
      setDuplicateGrades([])
    } catch (error) {
      console.error('Error al duplicar estructura:', error)
      alert('Error al duplicar la estructura: ' + error.message)
    } finally {
      setIsDuplicating(false)
    }
  }

  const countStructuresByLevel = (nivel) => {
    const nivelId = getLevelIdFromTab(nivel)
    return evaluationStructures?.filter(structure => {
      const grade = grades?.find(g => g.id === structure.grade_id)
      // Convertir ambos a number para comparar correctamente
      const matchesYear = !selectedAcademicYear || Number(structure.añoLectivoId) === Number(selectedAcademicYear)
      return grade?.level_id === nivelId && matchesYear
    }).length || 0
  }

  // Componente inline de tabs de nivel
  const LevelTabs = () => {
    // Mapeo de iconos y colores por nombre de nivel (fallback a iconos por defecto)
    const getStylesForLevel = (levelName, isActive) => {
      const name = levelName?.toLowerCase() || ''

      // Inicial - Azul
      if (name.includes('inicial')) {
        return {
          icon: Baby,
          buttonClass: isActive
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg scale-105'
            : 'bg-white hover:bg-blue-50 hover:shadow-md border-2 border-gray-200',
          iconContainerClass: isActive
            ? 'bg-white/20 ring-4 ring-white/30'
            : 'bg-blue-100',
          iconClass: isActive
            ? 'text-white'
            : 'text-blue-600',
          badgeClass: isActive
            ? 'bg-white/20 text-white'
            : 'bg-blue-100 text-blue-700'
        }
      }

      // Primaria - Púrpura
      if (name.includes('primaria')) {
        return {
          icon: Backpack,
          buttonClass: isActive
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg scale-105'
            : 'bg-white hover:bg-purple-50 hover:shadow-md border-2 border-gray-200',
          iconContainerClass: isActive
            ? 'bg-white/20 ring-4 ring-white/30'
            : 'bg-purple-100',
          iconClass: isActive
            ? 'text-white'
            : 'text-purple-600',
          badgeClass: isActive
            ? 'bg-white/20 text-white'
            : 'bg-purple-100 text-purple-700'
        }
      }

      // Secundaria - Verde
      if (name.includes('secundaria')) {
        return {
          icon: GraduationCap,
          buttonClass: isActive
            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg scale-105'
            : 'bg-white hover:bg-green-50 hover:shadow-md border-2 border-gray-200',
          iconContainerClass: isActive
            ? 'bg-white/20 ring-4 ring-white/30'
            : 'bg-green-100',
          iconClass: isActive
            ? 'text-white'
            : 'text-green-600',
          badgeClass: isActive
            ? 'bg-white/20 text-white'
            : 'bg-green-100 text-green-700'
        }
      }

      // Bachiller - Índigo
      if (name.includes('bachiller')) {
        return {
          icon: GraduationCap,
          buttonClass: isActive
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg scale-105'
            : 'bg-white hover:bg-indigo-50 hover:shadow-md border-2 border-gray-200',
          iconContainerClass: isActive
            ? 'bg-white/20 ring-4 ring-white/30'
            : 'bg-indigo-100',
          iconClass: isActive
            ? 'text-white'
            : 'text-indigo-600',
          badgeClass: isActive
            ? 'bg-white/20 text-white'
            : 'bg-indigo-100 text-indigo-700'
        }
      }

      // Por defecto - Gris
      return {
        icon: BookOpen,
        buttonClass: isActive
          ? 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg scale-105'
          : 'bg-white hover:bg-gray-50 hover:shadow-md border-2 border-gray-200',
        iconContainerClass: isActive
          ? 'bg-white/20 ring-4 ring-white/30'
          : 'bg-gray-100',
        iconClass: isActive
          ? 'text-white'
          : 'text-gray-600',
        badgeClass: isActive
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 text-gray-700'
      }
    }

    // Los niveles ya están filtrados por año (se cargan dinámicamente)
    const filteredLevels = levels || []

    if (!filteredLevels || filteredLevels.length === 0) {
      return (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Nivel Educativo</h3>
            </div>
          </div>
          <div className="p-6 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay niveles educativos para el año lectivo seleccionado</p>
            <p className="text-sm mt-1">Por favor, cree niveles en la sección de Estructura Académica</p>
          </div>
        </div>
      )
    }

    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Nivel Educativo</h3>
          </div>
        </div>
        <div className="p-2 bg-gray-50">
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(filteredLevels.length, 4)}, minmax(0, 1fr))` }}>
            {filteredLevels.map(level => {
              const isActive = activeTab === level.id.toString()
              const styles = getStylesForLevel(level.name, isActive)
              const Icon = styles.icon

              return (
                <button
                  key={level.id}
                  onClick={() => handleTabChange(level.id.toString())}
                  className={`group relative flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${styles.buttonClass}`}
                >
                  <div className={`flex items-center justify-center w-14 h-14 rounded-full ${styles.iconContainerClass}`}>
                    <Icon className={`h-8 w-8 ${styles.iconClass}`} />
                  </div>
                  <div className="text-center">
                    <h4 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {level.name}
                    </h4>
                    <div className={`text-sm font-semibold mt-1 px-3 py-1 rounded-full ${styles.badgeClass}`}>
                      {countStructuresByLevel(level.id.toString())} rúbricas
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Estructuras de Evaluación</h1>
        <p className="mt-2 text-gray-600">Configura las rubricas y criterios de evaluación por curso y bimestre</p>
      </div>

      {/* Selector de Año Lectivo */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Año Lectivo</h3>
              <p className="text-sm text-gray-600">Selecciona el año para gestionar sus estructuras</p>
            </div>
          </div>
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 w-64"
          >
            <option value="">Todos los años</option>
            {academicYears?.sort((a, b) => b.año - a.año).map(year => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.año}) {year.state === 'activo' ? ' - Activo' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs de Niveles */}
      <LevelTabs />

      {/* Filtros */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input">
              <option value="">Todos los cursos</option>
              {filteredCourses?.sort((a, b) => a.name.localeCompare(b.name)).map(course => (
                <option key={course.id} value={course.id}>
                  [ID-{course.id}] {course.name}
                </option>
              ))}
            </select>
            <select value={selectedBimester} onChange={(e) => setSelectedBimester(e.target.value)} className="input">
              <option value="">Todos</option>
              {(() => {
                const selectedYear = academicYears?.find(y => y.id === Number(selectedAcademicYear))
                const yearType = selectedYear?.type || 'regular'

                if (yearType === 'regular') {
                  return (
                    <>
                      <option value="1">1° Bimestre</option>
                      <option value="2">2° Bimestre</option>
                      <option value="3">3° Bimestre</option>
                      <option value="4">4° Bimestre</option>
                    </>
                  )
                } else {
                  // Vacacional o Recuperación - solo 1 período
                  return <option value="1">Periodo Unico</option>
                }
              })()}
            </select>
          </div>
          <button
            onClick={handleNewStructureClick}
            disabled={!selectedCourse || !selectedBimester}
            className={`px-4 py-2 flex items-center gap-2 rounded-md font-medium transition-all ${
              selectedCourse && selectedBimester
                ? 'btn btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={!selectedCourse || !selectedBimester ? 'Selecciona un curso y bimestre primero' : 'Crear nueva estructura'}
          >
            <Plus size={16} />
            Nueva Estructura
          </button>
        </div>
      </div>

      {/* Panel de resumen de filtros */}
      {(selectedCourse || selectedBimester) && (
        <div className="card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Filtros activos</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCourse && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Curso:</span>
                    <span className="text-gray-700">
                      {(() => {
                        const course = courses?.find(c => Number(c.id) === Number(selectedCourse))
                        return course ? `[ID-${course.id}] ${course.name}` : 'Desconocido'
                      })()}
                    </span>
                  </span>
                )}
                {selectedBimester && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Bimestre:</span>
                    <span className="text-gray-700">{selectedBimester}°</span>
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-700">
                    {filteredStructures.length} estructura{filteredStructures.length !== 1 ? 's' : ''} encontrada{filteredStructures.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {countStructuresByLevel(activeTab) > filteredStructures.length && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Hay {countStructuresByLevel(activeTab) - filteredStructures.length} estructura{(countStructuresByLevel(activeTab) - filteredStructures.length) !== 1 ? 's' : ''} más en otros filtros
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCourse('')
                setSelectedBimester('')
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpiar filtros"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Alerta de validación */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-4 ${validationError.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertCircle className={`h-5 w-5 mt-0.5 mr-3 ${validationError.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
              <div>
                <h3 className={`text-sm font-medium ${validationError.type === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                  {validationError.title}
                </h3>
                <p className={`text-sm mt-1 ${validationError.type === 'error' ? 'text-red-700' : 'text-yellow-700'}`}>
                  {validationError.message}
                </p>
              </div>
            </div>
            <button onClick={() => setValidationError(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista de Estructuras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStructures.map(structure => {
          const gradeName = grades?.find(g => g.id === structure.grade_id)?.name || 'Grado desconocido'
          const courseData = courses?.find(c => c.id === structure.course_id)
          const courseName = courseData?.name || 'Curso desconocido'
          const courseId = structure.course_id
          const yearData = academicYears?.find(y => y.id === structure.añoLectivoId)
          const competencias = structure.competencias || structure.categorias || []
          const gradingSystemLabels = {
            'literal': 'Literal (AD, A, B, C)',
            'numeric': 'Numérico (0-20)',
            'vigesimal': 'Vigesimal (0-20)'
          }

          // Obtener el profesor asignado al curso para el grado específico de esta estructura
          const getTeacherForGrade = () => {
            if (!courseData) return 'Sin asignar'

            // Buscar en assignments la asignación que coincida con el grade_id de esta estructura
            let assignments = courseData.assignments

            // Si assignments es un string JSON, parsearlo
            if (typeof assignments === 'string') {
              try {
                assignments = JSON.parse(assignments)
              } catch (e) {
                console.warn('Error parsing assignments JSON:', e)
                return 'Sin asignar'
              }
            }

            // Si hay asignaciones
            if (Array.isArray(assignments) && assignments.length > 0) {
              // Filtrar asignaciones que coincidan con el grade_id de la estructura
              const gradeAssignments = assignments.filter(
                a => a && Number(a.grade_id) === Number(structure.grade_id)
              )

              if (gradeAssignments.length === 0) return 'Sin asignar'

              // Si hay múltiples profesores para el mismo grado (por secciones diferentes)
              const teacherNames = gradeAssignments
                .map(a => a.teacher_name)
                .filter(name => name)

              if (teacherNames.length === 0) return 'Sin asignar'

              // Eliminar duplicados y unir con comas
              const uniqueTeachers = [...new Set(teacherNames)]
              return uniqueTeachers.join(', ')
            }

            return 'Sin asignar'
          }

          const teacherNames = getTeacherForGrade()

          return (
            <motion.div
              key={structure.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      {courseName}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      ID-{courseId}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {gradeName} • {structure.quarter}° Bimestre
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => editStructure(structure)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar estructura"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicateStructure(structure)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Duplicar a otros grados"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => exportStructure(structure)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Exportar PDF"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Año Lectivo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {yearData ? `${yearData.name} (${yearData.año})` : structure.academic_year || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Sistema</p>
                    <p className="text-sm font-medium text-gray-900">
                      {gradingSystemLabels[structure.grading_system || structure.gradingSystem] || 'Literal'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Profesor</p>
                    <p className="text-sm font-medium text-gray-900">
                      {teacherNames}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Competencias</p>
                    <p className="text-sm font-medium text-gray-900">
                      {competencias.length} configuradas
                    </p>
                  </div>
                </div>
              </div>

              {/* Competencias */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Competencias configuradas
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {competencias.length > 0 ? (
                    competencias.map((comp, index) => (
                      <div key={index} className="bg-white border border-gray-200 p-3 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                            {comp.numero || index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {comp.nombreCompetencia || `Competencia ${comp.numero || index + 1}`}
                            </p>
                            {comp.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {comp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Sin competencias configuradas
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredStructures.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay rúbricas de {activeTab}</h3>
        </div>
      )}

      {/* Modal (simplificado inline) - Esta es la versión reducida del modal original */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className={`p-6 border-b flex-shrink-0 ${editingStructure ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingStructure ? 'Editar Estructura de Evaluación' : 'Nueva Estructura de Evaluación'}
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              {/* Información del contexto */}
              <div className="space-y-2">
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-md">
                    <BookOpen className="h-4 w-4 text-blue-700" />
                    <span className="text-sm font-semibold text-blue-900">
                      {courses?.find(c => Number(c.id) === Number(selectedCourse))?.name || 'Curso no seleccionado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-md">
                    <Calendar className="h-4 w-4 text-green-700" />
                    <span className="text-sm font-semibold text-green-900">
                      {selectedBimester ? `${selectedBimester}° Bimestre` : 'Bimestre no seleccionado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-md">
                    <Layers className="h-4 w-4 text-purple-700" />
                    <span className="text-sm font-semibold text-purple-900">
                      {activeTab && levels?.find(l => l.id.toString() === activeTab)?.name || 'Nivel'}
                    </span>
                  </div>
                </div>

                {/* Profesor asignado */}
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-orange-200">
                  <Users className="h-4 w-4 text-orange-700" />
                  <span className="text-sm font-medium text-gray-700">Profesor(es) asignado(s):</span>
                  <span className="text-sm font-semibold text-orange-900">
                    {(() => {
                      const selectedCourseData = courses?.find(c => Number(c.id) === Number(selectedCourse))
                      if (!selectedCourseData) return 'Sin asignar'

                      // Intentar primero el campo 'teachers' (actualizado dinámicamente)
                      let teachers = selectedCourseData.teachers

                      // Si teachers es un string JSON, parsearlo
                      if (typeof teachers === 'string') {
                        try {
                          teachers = JSON.parse(teachers)
                        } catch (e) {
                          teachers = null
                        }
                      }

                      // Si no está disponible, usar 'assignments' (del JOIN)
                      if (!teachers && selectedCourseData.assignments) {
                        const validAssignments = selectedCourseData.assignments.filter(a => a && a.teacher_name)
                        teachers = validAssignments.map(a => ({
                          teacher_id: a.teacher_id,
                          teacher_name: a.teacher_name
                        }))
                      }

                      // Si hay profesores asignados
                      if (Array.isArray(teachers) && teachers.length > 0) {
                        // Filtrar profesores válidos (que no sean null)
                        const validTeachers = teachers.filter(t => t && t.teacher_name)

                        if (validTeachers.length === 0) return 'Sin asignar'

                        // Si hay un solo profesor, mostrar su nombre
                        if (validTeachers.length === 1) {
                          return validTeachers[0].teacher_name
                        }

                        // Si hay múltiples profesores, mostrar nombres únicos separados por comas
                        const uniqueTeachers = [...new Set(validTeachers.map(t => t.teacher_name))]
                        return uniqueTeachers.join(', ')
                      }

                      return 'Sin asignar'
                    })()}
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Selector de Grado - Solo en modo CREAR */}
              {!editingStructure ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-blue-900">Selección de Grado(s)</h4>
                        <p className="text-sm text-blue-700">
                          {activeTab && levels?.find(l => l.id.toString() === activeTab)?.name
                            ? `Selecciona el grado para ${levels.find(l => l.id.toString() === activeTab).name}`
                            : 'Selecciona el grado para esta rúbrica'}
                        </p>
                      </div>
                    </div>

                    {/* Botones de Selección */}
                    {filteredGrades?.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedGrades(filteredGrades.map(g => g.id))}
                          className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-300"
                        >
                          <CheckSquare className="h-4 w-4 inline mr-1" />
                          Seleccionar todos
                        </button>
                        {selectedGrades.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedGrades([])}
                            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                          >
                            <X className="h-4 w-4 inline mr-1" />
                            Limpiar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grid de grados */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredGrades?.sort((a, b) => a.order - b.order).map(grade => (
                      <label
                        key={grade.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedGrades.includes(grade.id)
                            ? 'bg-blue-100 border-blue-500 shadow-md'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGrades([...selectedGrades, grade.id])
                            } else {
                              setSelectedGrades(selectedGrades.filter(id => id !== grade.id))
                            }
                          }}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className={`text-sm font-medium ${
                          selectedGrades.includes(grade.id) ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {grade.name}
                        </span>
                      </label>
                    ))}
                  </div>

                  {filteredGrades?.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No hay grados disponibles para este nivel</p>
                    </div>
                  )}

                  {selectedGrades.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-md border border-blue-300">
                      <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Se crearán {selectedGrades.length} rúbrica(s) para los grados seleccionados
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Info del Grado actual - Solo en modo EDITAR */
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-600 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-900">Grado Asignado</h4>
                        <p className="text-sm text-green-700">
                          Esta rúbrica pertenece a: <span className="font-semibold">{grades?.find(g => g.id === editingStructure.grade_id)?.name || 'Grado'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg border border-green-300">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">
                        {grades?.find(g => g.id === editingStructure.grade_id)?.name}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-green-600 bg-green-100 p-2 rounded-md">
                    💡 Para aplicar esta rúbrica a otros grados, guarda los cambios y luego usa la opción "Duplicar" desde el menú de la rúbrica.
                  </p>
                </div>
              )}

              {/* Plantilla */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Plantilla Base</h4>
                {Object.entries(evaluationTemplates).map(([key, template]) => (
                  <button key={key} onClick={() => applyTemplate(template)} className="w-full text-left p-4 border-2 border-blue-200 bg-blue-50 rounded-md hover:border-blue-400">
                    <div className="font-medium text-blue-900">{template.name}</div>
                    <div className="text-sm text-blue-700 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>

              {/* Competencias */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Competencias</h4>
                  <button onClick={addCompetencia} className="btn btn-sm btn-primary">
                    <Plus size={14} className="mr-1" />
                    Agregar
                  </button>
                </div>
                {structureData.competencias.map((comp, index) => (
                  <div key={index} className="border p-3 rounded mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Competencia {comp.numero}</span>
                      <button onClick={() => removeCompetencia(index)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre de la competencia"
                      value={comp.nombreCompetencia}
                      onChange={(e) => updateCompetencia(index, 'nombreCompetencia', e.target.value)}
                      className="input w-full mb-2"
                    />
                    <textarea
                      placeholder="Descripción"
                      value={comp.description}
                      onChange={(e) => updateCompetencia(index, 'description', e.target.value)}
                      className="input w-full"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-3 bg-gray-50 flex-shrink-0">
              <button onClick={() => setShowCreateModal(false)} className="btn btn-outline px-6 py-2.5">
                Cancelar
              </button>
              <button onClick={saveStructure} className="btn btn-primary px-6 py-2.5">
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Duplicación */}
      {showDuplicateModal && duplicatingStructure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Copy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Duplicar Rúbrica</h3>
                    <p className="text-sm text-gray-600">
                      {courses?.find(c => c.id === duplicatingStructure.course_id)?.name} - {duplicatingStructure.quarter}° Bimestre
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false)
                    setDuplicatingStructure(null)
                    setDuplicateGrades([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los grados a los que deseas duplicar esta rúbrica:
              </p>

              {/* Lista de grados disponibles */}
              {(() => {
                const currentGradeLevel = grades?.find(g => g.id === duplicatingStructure.grade_id)?.level_id
                const availableGrades = grades?.filter(g => {
                  if (g.level_id !== currentGradeLevel) return false
                  if (g.id === duplicatingStructure.grade_id) return false
                  const exists = evaluationStructures?.some(s =>
                    s.grade_id === g.id &&
                    s.course_id === duplicatingStructure.course_id &&
                    s.quarter === duplicatingStructure.quarter
                  )
                  return !exists
                }).sort((a, b) => a.order - b.order) || []

                if (availableGrades.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No hay grados disponibles</p>
                      <p className="text-sm mt-1">Todos los grados de este nivel ya tienen esta rúbrica asignada.</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableGrades.map(grade => (
                      <label
                        key={grade.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          duplicateGrades.includes(grade.id)
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={duplicateGrades.includes(grade.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDuplicateGrades([...duplicateGrades, grade.id])
                            } else {
                              setDuplicateGrades(duplicateGrades.filter(id => id !== grade.id))
                            }
                          }}
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className={`font-medium ${duplicateGrades.includes(grade.id) ? 'text-purple-900' : 'text-gray-700'}`}>
                          {grade.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )
              })()}

              {duplicateGrades.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-900">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Se duplicará a {duplicateGrades.length} grado(s)
                  </p>
                </div>
              )}
            </div>

            <div className="border-t p-4 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowDuplicateModal(false)
                  setDuplicatingStructure(null)
                  setDuplicateGrades([])
                }}
                className="btn btn-outline px-4 py-2"
                disabled={isDuplicating}
              >
                Cancelar
              </button>
              <button
                onClick={executeDuplicate}
                disabled={duplicateGrades.length === 0 || isDuplicating}
                className="btn btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                {isDuplicating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Duplicando...
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Duplicar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default EvaluationStructureManager
