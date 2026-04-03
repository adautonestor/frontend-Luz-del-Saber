import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useCoursesStore } from '../stores/coursesStore'
import { useGradesStore } from '../stores/gradesStore.jsx'
import { useAcademicStore } from '../stores/academicStore'
import studentsService from '../services/studentsService'
import evaluationStructuresService from '../services/evaluationStructuresService'
import gradesService from '../services/gradesService'
import { useGradingConfig } from './useGradingConfig'
import {
  convertGradeToNumeric,
  convertAverageValueToLetter,
  formatGradeForDisplay2
} from '../utils/gradeConversion'

/**
 * Hook para gestión de datos y lógica de calificaciones del profesor
 * Maneja estado, cálculos y operaciones CRUD de notas
 * Integrado con APIs reales del backend
 */
export const useTeacherGradesData = () => {
  const { user } = useAuthStore()
  const { courses, initialize, studentsByCourse } = useCoursesStore()
  const { evaluationStructures, initialize: initializeGrades } = useGradesStore()
  const academicStore = useAcademicStore()

  // Hook para configuración dinámica de calificaciones desde system_settings
  const { getGradingMode, getScaleForLevel, getPassingGradeForLevel, isGradePassing: checkGradePassing, getLiteralGradeOptionsForLevel, getLiteralGradeOptionsByLevelId, rawConfig, loading: gradingConfigLoading } = useGradingConfig()

  // Estado de filtros y selección
  const [selectedCourse, _setSelectedCourse] = useState('')
  const [selectedBimester, setSelectedBimester] = useState('')
  const [selectedLevel, _setSelectedLevel] = useState('')
  const [selectedGrade, _setSelectedGrade] = useState('')
  const [selectedSection, _setSelectedSection] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Handlers personalizados que implementan limpieza de filtros dependientes

  // Handler para nivel: limpia curso, grado, sección
  const setSelectedLevel = (newLevel) => {
    // Si cambió el nivel, limpiar todos los filtros dependientes
    _setSelectedLevel(newLevel)
    _setSelectedCourse('')
    setSelectedBimester('')
    _setSelectedGrade('')
    _setSelectedSection('')
    setSearchTerm('')
    setGradesInternal({})
  }

  // Handler para curso: solo limpia si el curso se vacía
  const setSelectedCourse = (newCourse) => {
    _setSelectedCourse(newCourse)

    // Si se limpia el curso, limpiar también grado y sección
    if (!newCourse) {
      _setSelectedGrade('')
      _setSelectedSection('')
      setGradesInternal({})
    }
  }

  // Handler para grado: solo limpia si el grado se vacía
  const setSelectedGrade = (newGrade) => {
    _setSelectedGrade(newGrade)

    // Si se limpia el grado, limpiar también sección
    if (!newGrade) {
      _setSelectedSection('')
      setGradesInternal({})
    }
  }

  // Handler para sección (sin dependientes)
  const setSelectedSection = (newSection) => {
    _setSelectedSection(newSection)
  }

  // Estado de notas y columnas
  const [grades, setGradesInternal] = useState({})

  // Wrapper para setGrades con logging
  const setGrades = (newGrades) => {
    setGradesInternal(newGrades)
  }

  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 })
  const [customColumns, setCustomColumns] = useState([])

  const gradesRef = useRef(grades) // Ref para acceder siempre al estado más reciente

  // Actualizar ref cada vez que cambia el estado de grades
  useEffect(() => {
    gradesRef.current = grades
  }, [grades])

  // Obtener niveles disponibles (solo los que tienen cursos asignados al profesor)
  const availableLevels = useMemo(() => {
    if (!courses || courses.length === 0) return []

    // Obtener level_ids únicos de los cursos asignados
    const levelIdsWithCourses = new Set(
      courses.map(course => course.level_id).filter(Boolean)
    )

    // Filtrar solo niveles que tienen cursos asignados
    return (academicStore.levels || [])
      .filter(level => levelIdsWithCourses.has(level.id))
      .map(level => ({
        id: level.id,
        name: level.name || level.name
      }))
  }, [academicStore.levels, courses])

  // Obtener datos reales desde stores - Filtrar cursos por nivel seleccionado
  const availableCourses = useMemo(() => {
    let filteredCourses = courses || []

    // Si hay un nivel seleccionado, filtrar cursos por ese nivel
    if (selectedLevel) {
      const levelIdNum = parseInt(selectedLevel)
      filteredCourses = filteredCourses.filter(course =>
        course.level_id === levelIdNum
      )
    }

    return filteredCourses.map(course => ({
      id: course.id,
      name: course.name || course.name,
      level_id: course.level_id
    }))
  }, [courses, selectedLevel])

  // Filtrar grados basados en las asignaciones del profesor y filtros seleccionados
  const availableGrades = useMemo(() => {
    if (!courses || courses.length === 0) return []

    // Obtener los grade_ids únicos de los cursos asignados al profesor
    const assignedGradeIds = new Set()
    const { teacherAssignments } = useCoursesStore.getState()

    // Filtrar cursos relevantes según nivel y curso seleccionado
    let relevantCourses = courses

    // Si hay nivel seleccionado, filtrar por nivel
    if (selectedLevel) {
      const levelIdNum = parseInt(selectedLevel)
      relevantCourses = relevantCourses.filter(course => course.level_id === levelIdNum)
    }

    // Si hay curso seleccionado, filtrar por ese curso específico
    if (selectedCourse) {
      const courseIdNum = parseInt(selectedCourse)
      relevantCourses = relevantCourses.filter(course => course.id === courseIdNum)
    }

    // Obtener grade_ids de los cursos relevantes
    relevantCourses.forEach(course => {
      const assignment = (teacherAssignments || []).find(a => a.course_id === course.id)
      if (assignment && assignment.grade_id) {
        assignedGradeIds.add(assignment.grade_id)
      }
    })

    // Filtrar grados por:
    // 1. Asignaciones del profesor
    // 2. Nivel seleccionado (si existe)
    let filteredGrades = (academicStore.grades || [])
      .filter(grade => assignedGradeIds.has(grade.id))

    // Si hay nivel seleccionado, también filtrar por level_id
    if (selectedLevel) {
      const levelIdNum = parseInt(selectedLevel)
      filteredGrades = filteredGrades.filter(grade => grade.level_id === levelIdNum)
    }

    return filteredGrades.map(grade => ({
      id: grade.id,
      name: grade.name || grade.name,
      level_id: grade.level_id
    }))
  }, [academicStore.grades, courses, selectedLevel, selectedCourse])

  // Filtrar secciones del grado seleccionado
  const availableSections = useMemo(() => {
    if (!selectedGrade) {
      // Si no hay grado seleccionado, no mostrar secciones
      return []
    }

    // Convertir selectedGrade a número para comparar correctamente
    const gradeIdNum = parseInt(selectedGrade)

    // Filtrar secciones que pertenecen al grado seleccionado
    return (academicStore.sections || [])
      .filter(section => section.grade_id === gradeIdNum)
      .map(section => ({
        id: section.id,
        name: section.name || section.name
      }))
  }, [academicStore.sections, selectedGrade])

  // Obtener el nombre del nivel seleccionado
  const selectedLevelName = useMemo(() => {
    if (!selectedLevel) return null
    const level = availableLevels.find(l => l.id === parseInt(selectedLevel))
    return level ? level.name : null
  }, [selectedLevel, availableLevels])

  // Determinar sistema de calificación actual basado en la configuración de system_settings
  const currentGradingSystem = useMemo(() => {
    if (!selectedLevelName) return 'literal' // Default
    // Usar configuración dinámica de system_settings
    const mode = getGradingMode(selectedLevelName)
    return mode === 'numeric' ? 'vigesimal' : 'literal'
  }, [selectedLevelName, getGradingMode])

  // Opciones de escala literal para el nivel seleccionado (para ExcelGradeCell)
  // Formato: [{ value: 'AA', label: 'Logro destacado', numericValue: 4, color: '#22c55e' }, ...]
  // IMPORTANTE: Usa el ID del nivel (selectedLevel) para evitar ambigüedades con niveles duplicados
  const literalGradeOptions = useMemo(() => {
    if (!selectedLevel) return null
    if (currentGradingSystem === 'vigesimal') return null // No necesario para numérico
    if (gradingConfigLoading) return null // Esperar a que cargue la config

    // USAR ID del nivel en lugar de nombre para evitar confusión con niveles duplicados
    const options = getLiteralGradeOptionsByLevelId(selectedLevel)
    return options
  }, [selectedLevel, selectedLevelName, currentGradingSystem, getLiteralGradeOptionsByLevelId, rawConfig, gradingConfigLoading])

  // Obtener estructura de evaluación configurada dinámicamente
  const currentEvaluationStructure = useMemo(() => {
    if (!selectedCourse || !selectedGrade || !selectedBimester || !evaluationStructures) {
      return null
    }

    const structure = evaluationStructures.find(s =>
      parseInt(s.course_id) === parseInt(selectedCourse) &&
      parseInt(s.grade_id) === parseInt(selectedGrade) &&
      parseInt(s.quarter) === parseInt(selectedBimester)
    )

    return structure
  }, [evaluationStructures, selectedCourse, selectedGrade, selectedBimester])

  // Cargar estructura de evaluación cuando se seleccionan los filtros
  useEffect(() => {
    const loadStructure = async () => {
      // Solo ejecutar si están todos los filtros necesarios
      if (!selectedCourse || !selectedGrade || !selectedBimester) {
        return
      }

      // Si ya existe en el store, no hacer nada
      const existingStructure = evaluationStructures?.find(s => {
        const match = parseInt(s.course_id) === parseInt(selectedCourse) &&
                     parseInt(s.grade_id) === parseInt(selectedGrade) &&
                     parseInt(s.quarter) === parseInt(selectedBimester)

        return match
      })

      if (existingStructure) {
        return
      }

      try {
        // Llamar al endpoint para obtener la estructura (NO auto-crea)
        const response = await evaluationStructuresService.getOrCreate(
          parseInt(selectedCourse),
          parseInt(selectedGrade),
          parseInt(selectedBimester),
          null // academicYearId (puede ser null para usar el año activo)
        )

        if (response && response.exists && response.id) {
          // Recargar el store para incluir la estructura
          await initializeGrades()
        }
      } catch (error) {
        console.error('❌ Error al obtener estructura:', error)
      }
    }

    loadStructure()
  }, [selectedCourse, selectedGrade, selectedBimester, evaluationStructures])

  // Convertir estructura de evaluación a formato de evaluationTypes
  const evaluationTypes = useMemo(() => {
    if (!currentEvaluationStructure) {
      // No retornar mock data - esperar a que se cargue la estructura real
      return []
    }

    // ✅ CORREGIDO: Soportar tanto 'competencias' (español) como 'competencies' (inglés)
    const items = currentEvaluationStructure.competencias ||
                  currentEvaluationStructure.competencies ||
                  currentEvaluationStructure.categories ||
                  []

    const colors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100']

    // Si es objeto (categories), convertir a array
    const itemsArray = Array.isArray(items)
      ? items
      : Object.keys(items).map(key => ({
          ...items[key],
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1)
        }))

    return itemsArray.map((item, index) => {
      const competenceName = item.nombreCompetencia || item.name || `Competencia ${item.numero || index + 1}`
      const competenceId = item.id || `COMP_${competenceName.replace(/\s+/g, '_').toUpperCase()}`

      // Procesar subcategorías
      let subcategorias = []
      if (item.subcategorias && Array.isArray(item.subcategorias)) {
        subcategorias = item.subcategorias.map((sub, subIndex) => {
          // Si es string, convertir a objeto
          if (typeof sub === 'string') {
            return {
              id: `${competenceId}_${sub.replace(/\s+/g, '_').toUpperCase()}`,
              name: sub,
              weight: 1 / item.subcategorias.length, // Dividir equitativamente
              isCustom: false
            }
          }
          // Si ya es objeto
          return {
            id: sub.id || `${competenceId}_${sub.name.replace(/\s+/g, '_').toUpperCase()}`,
            name: sub.name,
            weight: sub.peso ? sub.peso / 100 : (1 / item.subcategorias.length),
            isCustom: sub.isCustom || false
          }
        })
      }

      return {
        id: competenceId,
        name: competenceName,
        weight: item.peso ? item.peso / 100 : 0,
        color: colors[index % colors.length],
        subcategorias,
        nombreCompetencia: competenceName // ✅ Agregar también en español
      }
    })
  }, [currentEvaluationStructure])

  // Cargar columnas personalizadas desde la estructura de evaluación
  useEffect(() => {
    if (!currentEvaluationStructure) {
      setCustomColumns([])
      return
    }

    // ✅ CORREGIDO: Soportar tanto 'competencias' como 'competencies'
    const items = currentEvaluationStructure.competencias ||
                  currentEvaluationStructure.competencies ||
                  currentEvaluationStructure.categories ||
                  []

    // Si es objeto (categories), convertir a array
    const itemsArray = Array.isArray(items)
      ? items
      : Object.keys(items).map(key => ({
          ...items[key],
          id: key
        }))

    // Extraer columnas personalizadas de todas las competencias
    const customCols = []
    itemsArray.forEach(item => {
      const competenceId = item.id || `COMP_${item.nombreCompetencia?.replace(/\s+/g, '_').toUpperCase()}`

      if (item.subcategorias && Array.isArray(item.subcategorias)) {
        item.subcategorias.forEach(sub => {
          if (sub.isCustom) {
            customCols.push({
              id: sub.id,
              name: sub.name,
              weight: sub.peso / 100,
              color: 'bg-indigo-100',
              isCustom: true,
              parentId: competenceId
            })
          }
        })
      }
    })

    setCustomColumns(customCols)
  }, [currentEvaluationStructure])

  // Obtener subcategorías de una competencia (incluyendo personalizadas)
  const getSubcategoriasWithCustom = (competenceId, subcategorias = []) => {
    // Las subcategorías personalizadas ya vienen incluidas desde la BD
    // Solo necesitamos filtrar las que no están marcadas como custom
    const regularSubs = subcategorias.filter(sub => !sub.isCustom)
    const customSubs = customColumns.filter(col => col.parentId === competenceId)
    return [...regularSubs, ...customSubs]
  }

  // Obtener todas las subcategorías aplanadas
  const allSubcategorias = useMemo(() => {
    const allSubs = []
    evaluationTypes.forEach(comp => {
      const subsWithCustom = getSubcategoriasWithCustom(comp.id, comp.subcategorias)
      subsWithCustom.forEach(sub => {
        allSubs.push({
          ...sub,
          parentId: comp.id,
          parentColor: comp.color
        })
      })
    })
    return allSubs
  }, [evaluationTypes, customColumns])

  // Obtener estudiantes reales del curso seleccionado
  const [courseStudents, setCourseStudents] = useState([])

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourse || !selectedGrade || !selectedSection) {
        setCourseStudents([])
        return
      }

      try {
        // Obtener estudiantes del curso desde el store
        const studentsInCourse = studentsByCourse[selectedCourse] || []

        // Convertir valores seleccionados a números para comparar
        const gradeIdNum = parseInt(selectedGrade)
        const sectionIdNum = parseInt(selectedSection)

        // Filtrar por grado y sección
        const filteredStudents = studentsInCourse.filter(student => {
          const studentGradoId = student.grade_id
          const studentSeccionId = student.section_id

          const match = studentGradoId === gradeIdNum && studentSeccionId === sectionIdNum

          return match
        })

        setCourseStudents(filteredStudents)
      } catch (error) {
        console.error('Error loading students:', error)
        setCourseStudents([])
      }
    }

    loadStudents()
  }, [selectedCourse, selectedGrade, selectedSection, studentsByCourse])

  const mockStudents = courseStudents

  // Filtrar estudiantes por búsqueda
  const filteredStudents = mockStudents.filter(student =>
    `${student.first_names} ${student.last_names}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni.includes(searchTerm)
  )

  // Verificar si todas las selecciones están completas
  const canShowGradesTable = selectedCourse && selectedBimester && selectedGrade && selectedSection

  // ✅ CORREGIDO: Calcular promedio por competencia usando pesos de las columnas
  // Ahora usa el sistema de calificación correcto según el nivel
  const calculateCompetenceAverage = (studentId, competenceId) => {
    const studentGrades = grades[studentId] || {}
    const comp = evaluationTypes.find(c => c.id === competenceId)
    if (!comp) return null

    const subsWithCustom = getSubcategoriasWithCustom(comp.id, comp.subcategorias)
    let weightedSum = 0
    let totalWeight = 0

    subsWithCustom.forEach(sub => {
      const gradeData = studentGrades[sub.id]
      const weight = sub.weight || 0

      if (gradeData !== undefined && gradeData !== null && weight > 0) {
        // Extraer el valor de la nota (puede ser objeto o valor directo)
        let gradeValue = typeof gradeData === 'object' ? (gradeData.average || gradeData.value) : gradeData

        // ✅ USAR FUNCIÓN DE CONVERSIÓN CORRECTA
        const numericValue = convertGradeToNumeric(gradeValue, currentGradingSystem)

        if (numericValue !== null && !isNaN(numericValue)) {
          const contribution = numericValue * weight
          weightedSum += contribution
          totalWeight += weight
        }
      }
    })

    if (totalWeight === 0) {
      return null
    }

    // Calcular promedio ponderado
    const numericAverage = weightedSum // Ya viene ponderado

    // ✅ Retornar formato según sistema de calificación
    if (currentGradingSystem === 'literal') {
      // Para Inicial/Primaria: convertir a letra
      const letterGrade = convertAverageValueToLetter(numericAverage)

      return {
        numeric: numericAverage,
        formatted: letterGrade,
        display: letterGrade
      }
    } else {
      // Para Secundaria/Bachiller: mantener número
      const formattedNumeric = numericAverage.toFixed(1)

      return {
        numeric: numericAverage,
        formatted: formattedNumeric,
        display: formattedNumeric
      }
    }
  }

  // ✅ CORREGIDO: Calcular promedio del estudiante
  // Ahora retorna objeto {numeric, formatted, display}
  const calculateAverage = (studentId) => {
    let total = 0
    let count = 0

    evaluationTypes.forEach(comp => {
      const compAverage = calculateCompetenceAverage(studentId, comp.id)

      if (compAverage !== null) {
        // ✅ Extraer el valor numérico del objeto retornado
        const numericValue = typeof compAverage === 'object' ? compAverage.numeric : parseFloat(compAverage)

        if (!isNaN(numericValue)) {
          const contribution = numericValue * comp.weight
          total += contribution
          count += comp.weight
        }
      }
    })

    if (count === 0) {
      return null
    }

    const numericAverage = total / count

    // ✅ Retornar formato según sistema de calificación
    if (currentGradingSystem === 'literal') {
      const letterGrade = convertAverageValueToLetter(numericAverage)

      return {
        numeric: numericAverage,
        formatted: letterGrade,
        display: letterGrade
      }
    } else {
      const formattedNumeric = numericAverage.toFixed(1)

      return {
        numeric: numericAverage,
        formatted: formattedNumeric,
        display: formattedNumeric
      }
    }
  }

  // Obtener color según la nota
  const getGradeColor = (grade) => {
    if (!grade) return ''
    const numGrade = parseFloat(grade)
    if (numGrade >= 18) return 'text-green-600 font-semibold'
    if (numGrade >= 14) return 'text-blue-600'
    if (numGrade >= 11) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Estadísticas del curso
  const getCourseStats = () => {
    const allAverages = filteredStudents.map(student => {
      const avg = calculateAverage(student.id)
      return avg ? parseFloat(avg) : null
    }).filter(avg => avg !== null)

    if (allAverages.length === 0) return null

    return {
      promedio: (allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(1),
      aprobados: allAverages.filter(avg => avg >= 11).length,
      desaprobados: allAverages.filter(avg => avg < 11).length,
      mejorNota: Math.max(...allAverages).toFixed(1),
      peorNota: Math.min(...allAverages).toFixed(1)
    }
  }

  const stats = getCourseStats()

  // Guardar notas en la base de datos
  const saveGrades = async () => {
    try {
      const gradesToSave = []

      // Recorrer todas las calificaciones pendientes
      Object.keys(gradesRef.current).forEach(studentId => {
        Object.keys(gradesRef.current[studentId]).forEach(subcategoryId => {
          const gradeData = gradesRef.current[studentId][subcategoryId]

          // Encontrar a qué competencia/categoría pertenece esta subcategoría
          let parentCategoryId = null
          let parentCategoryName = null

          // Buscar en evaluationTypes
          for (const evalType of evaluationTypes) {
            const subsWithCustom = getSubcategoriasWithCustom(evalType.id, evalType.subcategorias)
            const foundSub = subsWithCustom.find(sub => sub.id === subcategoryId)

            if (foundSub) {
              parentCategoryId = evalType.id
              parentCategoryName = evalType.name
              break
            }
          }

          if (!parentCategoryId) {
            return
          }

          // Extraer el valor real (puede ser un objeto o un valor directo)
          let gradeValue = gradeData
          if (typeof gradeData === 'object' && gradeData !== null) {
            // 🆕 Si es un objeto, buscar la propiedad que contiene el valor
            // Prioridad: value > grade > grades[0] > raw > average > el objeto mismo
            gradeValue = gradeData.value ||
                        gradeData.grade ||
                        (gradeData.grades && gradeData.grades[0]) ||
                        gradeData.raw ||
                        gradeData.average ||
                        gradeData
          }

          // Convertir a string si es número
          if (typeof gradeValue === 'number') {
            gradeValue = gradeValue.toString()
          }

          // Solo guardar si hay un valor válido
          if (gradeValue && gradeValue !== '--' && gradeValue !== null && gradeValue !== '') {
            // Usar configuración dinámica de system_settings para determinar grading_system
            const gradingSystem = currentGradingSystem

            gradesToSave.push({
              student_id: parseInt(studentId),
              course_id: parseInt(selectedCourse),
              quarter: parseInt(selectedBimester),
              category_id: parentCategoryId,        // ID de la categoría/competencia
              subcategory_id: subcategoryId,         // ID de la subcategoría/columna
              value: gradeValue.toString(),
              grading_system: gradingSystem,
              observation: null,
              teacher_id: user?.id
            })
          }
        })
      })

      // 🆕 ACTUALIZADO: Guardar cada calificación usando competency-grades (con UPSERT automático)
      for (const gradeData of gradesToSave) {
        try {
          const result = await gradesService.createCompetencyGrade(gradeData)
        } catch (error) {
          console.error(`❌ Error guardando calificación para estudiante ${gradeData.student_id}:`, error)
        }
      }

      return true // Retornar éxito

    } catch (error) {
      console.error('❌ Error general al guardar calificaciones:', error)
      return false // Retornar fallo
    }
  }

  // Manejar cambio de nota con guardado inmediato
  const handleGradeChange = async (studentId, evalTypeId, value) => {
    // Actualizar estado local primero
    if (value === null) {
      setGrades(prev => {
        const newGrades = { ...prev }
        if (newGrades[studentId]) {
          delete newGrades[studentId][evalTypeId]
        }
        return newGrades
      })
    } else {
      setGrades(prev => {
        const updated = {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [evalTypeId]: value
          }
        }
        return updated
      })
    }

    // 🆕 GUARDADO INMEDIATO: Guardar esta calificación específica en la BD
    await saveGradeImmediately(studentId, evalTypeId, value)
  }

  // 🆕 NUEVA FUNCIÓN: Guardar una calificación individual inmediatamente
  const saveGradeImmediately = async (studentId, evalTypeId, value) => {
    try {
      // Si el valor es null, no guardamos (es un borrado)
      if (value === null || value === undefined) {
        return { success: true, message: 'Calificación eliminada' }
      }

      // ⚠️ VALIDACIÓN CRÍTICA: Verificar que evaluationTypes esté cargado
      if (!evaluationTypes || evaluationTypes.length === 0) {
        throw new Error('La estructura de evaluación no está cargada. Por favor, recarga la página.')
      }

      // Encontrar a qué competencia/categoría pertenece esta subcategoría
      let parentCategoryId = null
      let parentCategoryName = null

      for (const evalType of evaluationTypes) {
        const subsWithCustom = getSubcategoriasWithCustom(evalType.id, evalType.subcategorias)

        const foundSub = subsWithCustom.find(sub => sub.id === evalTypeId)

        if (foundSub) {
          parentCategoryId = evalType.id
          parentCategoryName = evalType.name
          break
        }
      }

      if (!parentCategoryId) {
        throw new Error(`No se encontró la categoría padre para la columna de evaluación. Subcategoría ID: ${evalTypeId}`)
      }

      // Extraer el valor real
      let gradeValue = value
      if (typeof value === 'object' && value !== null) {
        gradeValue = value.value ||
                    value.grade ||
                    (value.grades && value.grades[0]) ||
                    value.raw ||
                    value.average ||
                    value
      }

      // Convertir a string si es número
      if (typeof gradeValue === 'number') {
        gradeValue = gradeValue.toString()
      }

      // Validar que hay un valor válido
      if (!gradeValue || gradeValue === '--' || gradeValue === '') {
        return { success: false, message: 'Valor inválido' }
      }

      // ⚠️ VALIDACIÓN: Verificar que tenemos todos los filtros necesarios
      if (!selectedCourse || !selectedBimester || !selectedGrade || !selectedSection) {
        throw new Error('Faltan filtros necesarios. Asegúrate de seleccionar Curso, Bimestre, Grado y Sección.')
      }

      // ✅ CORREGIDO: Usar el sistema de calificación ya determinado
      // Ya no necesitamos calcular aquí, usamos currentGradingSystem
      const gradingSystem = currentGradingSystem

      // Extraer comentario del objeto value si existe
      const observationComment = (typeof value === 'object' && value !== null) ? (value.comment || null) : null

      // Preparar datos para guardar
      const gradeData = {
        student_id: parseInt(studentId),
        course_id: parseInt(selectedCourse),
        quarter: parseInt(selectedBimester),
        category_id: parentCategoryId,
        subcategory_id: evalTypeId,
        value: gradeValue.toString(),
        grading_system: gradingSystem,
        observation: observationComment,
        teacher_id: user?.id
      }

      // Guardar usando el servicio (hace UPSERT automático)
      const result = await gradesService.createCompetencyGrade(gradeData)

      return {
        success: true,
        message: 'Nota registrada correctamente',
        data: result
      }

    } catch (error) {
      // Extraer mensaje de error más específico
      let errorMessage = 'Error al guardar la calificación'

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage) // Re-lanzar para que lo capture el toast
    }
  }

  // Inicializar stores
  useEffect(() => {
    const initStores = async () => {
      if (user?.id) {
        await Promise.all([
          initialize(user.id),
          initializeGrades(),
          academicStore.levels.length === 0 ? academicStore.initialize() : Promise.resolve()
        ])
      }
    }

    initStores()
  }, [user])

  // ==================== CARGAR NOTAS EXISTENTES ====================
  useEffect(() => {
    if (!selectedCourse || !selectedBimester || !selectedGrade || !selectedSection || !currentEvaluationStructure) {
      return
    }

    const loadGrades = async () => {
      try {
        // ✅ CORREGIDO: Llamar directamente a la API de competency_grades
        const allGrades = await gradesService.getAllCompetencyGrades({
          course_id: selectedCourse,
          quarter: selectedBimester
        })

        const loaded = {}

        // Ya viene filtrado por curso y bimestre desde la API
        const relevant = allGrades || []

      // Mapear notas usando category_id y subcategory_id
      relevant.forEach(grade => {
        // Inicializar objeto del estudiante si no existe
        if (!loaded[grade.student_id]) {
          loaded[grade.student_id] = {}
        }

        // Usar directamente subcategory_id como clave
        const subcategoryKey = grade.subcategory_id
        const gradeValue = grade.value

        if (subcategoryKey && gradeValue) {
          loaded[grade.student_id][subcategoryKey] = gradeValue
        }
      })

        setGrades(loaded)
      } catch (error) {
        console.error('❌ Error cargando notas desde competency_grades:', error)
        setGrades({}) // Limpiar estado en caso de error
      }
    }

    loadGrades()
  }, [selectedCourse, selectedBimester, selectedGrade, selectedSection, currentEvaluationStructure])

  return {
    // Estado
    selectedCourse,
    setSelectedCourse,
    selectedBimester,
    setSelectedBimester,
    selectedLevel,
    setSelectedLevel,
    selectedLevelName, // Nombre del nivel seleccionado
    currentGradingSystem, // ✅ Sistema de calificación actual (literal/vigesimal)
    literalGradeOptions, // ✅ Opciones de escala literal para ExcelGradeCell
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    searchTerm,
    setSearchTerm,
    grades,
    setGrades,
    focusedCell,
    setFocusedCell,
    customColumns,
    setCustomColumns,

    // Data
    courses,
    mockCourses: availableCourses, // Usar datos reales
    mockGrades: availableGrades,   // Usar datos reales
    mockSections: availableSections, // Usar datos reales
    mockLevels: availableLevels,   // Usar datos reales
    mockStudents,
    filteredStudents,
    currentEvaluationStructure,
    evaluationTypes,
    allSubcategorias,
    canShowGradesTable,
    stats,
    user,

    // Funciones
    getSubcategoriasWithCustom,
    calculateCompetenceAverage,
    calculateAverage,
    getGradeColor,
    getCourseStats,
    handleGradeChange,
    saveGrades,
    saveGradeImmediately,
    refreshStructures: initializeGrades // Para recargar estructuras sin perder filtros
  }
}
