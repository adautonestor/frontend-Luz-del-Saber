/**
 * Utilidades para transformación de datos de boletas de notas
 * Funciones puras - los datos deben ser provistos por el llamador desde servicios/stores
 */

import {
  convertAverageValueToLetter
} from '@/utils/gradeConversion.jsx'

/**
 * Construye las competencias con notas para un curso
 * @param {Object} course - Curso
 * @param {Array} evaluationStructures - Estructuras de evaluación
 * @param {Array} studentGrades - Calificaciones del estudiante (notas individuales)
 * @param {Object} selectedChild - Estudiante seleccionado
 * @param {Array} competencyAverages - Promedios por competencia del backend (fuente de verdad)
 * @returns {Array} Array de competencias con notas
 */
export const buildCompetenciasConNotas = (course, evaluationStructures, studentGrades, selectedChild, competencyAverages = []) => {
  const course_id = Number(course.course_id || course.id)

  const courseStructures = evaluationStructures.filter(s => {
    const structureCursoId = Number(s.course_id)
    return structureCursoId === course_id
  })

  // Si no hay estructura de evaluación, retornar competencia genérica para mostrar el curso
  if (courseStructures.length === 0) {
    return [{
      name: 'Competencia general',
      bimestre1: null,
      bimestre2: null,
      bimestre3: null,
      bimestre4: null,
      notas1: [],
      notas2: [],
      notas3: [],
      notas4: []
    }]
  }

  const structure = courseStructures[0]
  // competencies puede ser un objeto con propiedad "competencias" o directamente un array
  const competenciesData = structure.competencies || structure.competencias || structure.categorias
  const competencias = competenciesData?.competencias || competenciesData || []

  // Si no hay competencias definidas, retornar competencia genérica
  if (!competencias || competencias.length === 0) {
    return [{
      name: 'Competencia general',
      bimestre1: null,
      bimestre2: null,
      bimestre3: null,
      bimestre4: null,
      notas1: [],
      notas2: [],
      notas3: [],
      notas4: []
    }]
  }

  return competencias.map((competencia, idx) => {
    const bimesters = [null, null, null, null]
    const bimesterNotas = [[], [], [], []]

    // Generar ID de competencia para buscar en notas
    // El formato en DB es: COMP_NOMBRE_COMPETENCIA (snake_case, mayúsculas)
    const competenciaName = competencia.nombreCompetencia || competencia.name || ''
    const generatedCompId = 'COMP_' + competenciaName
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim()

    // Fill bimesters - USAR PROMEDIOS DEL BACKEND (fuente de verdad)
    for (let bim = 1; bim <= 4; bim++) {
      // Buscar el promedio del backend para esta competencia y bimestre
      const averageRecord = competencyAverages.find(avg => {
        const avgCourseId = Number(avg.course_id)
        const avgQuarter = Number(avg.quarter)
        const avgCategoryId = avg.category_id

        // Comparar por ID generado, ID directo, o número de competencia
        const matchesCompetencia = avgCategoryId === generatedCompId ||
                                   avgCategoryId === competencia.id ||
                                   avgCategoryId === `COMP_${competencia.numero}`
        const matchesCourse = avgCourseId === course_id
        const matchesBimester = avgQuarter === bim

        return matchesCourse && matchesCompetencia && matchesBimester
      })

      if (averageRecord) {
        // Usar el promedio calculado por el backend (ya incluye ponderación)
        // NOTA: average_value puede venir como string desde Prisma (tipo Decimal)
        const rawValue = averageRecord.average_value
        const avgValue = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue
        const gradingSystem = averageRecord.grading_system

        // Convertir a letra si es sistema literal
        // Pasar levelId del estudiante para que el store use la configuración correcta
        const studentLevelId = selectedChild?.level_id || null
        let displayValue = avgValue
        if (gradingSystem === 'literal' && !isNaN(avgValue)) {
          displayValue = convertAverageValueToLetter(avgValue, studentLevelId)
        }

        bimesters[bim - 1] = displayValue

        // Buscar notas individuales para mostrar detalles (opcional)
        const individualGrades = studentGrades.filter(g => {
          const gradeCursoId = Number(g.course_id)
          const gradeQuarter = Number(g.quarter)
          const gradeCategoriaId = g.category_id || g.categoria_id || g.categoriaId
          const matchesCompetencia = gradeCategoriaId === generatedCompId ||
                                     gradeCategoriaId === competencia.id ||
                                     gradeCategoriaId === `COMP_${competencia.numero}`
          return gradeCursoId === course_id && gradeQuarter === bim && matchesCompetencia
        })

        bimesterNotas[bim - 1] = individualGrades.map((g, idx) => ({
          valor: g.value || g.valor,
          description: `Evaluación ${idx + 1}`,
          comentario: g.observation || g.observacion || ''
        }))
      } else {
        // Fallback: buscar nota individual si no hay promedio
        const gradeRecord = studentGrades.find(g => {
          const gradeCursoId = Number(g.course_id)
          const gradeQuarter = Number(g.quarter)
          const gradeCategoriaId = g.category_id || g.categoria_id || g.categoriaId
          const matchesCompetencia = gradeCategoriaId === generatedCompId ||
                                     gradeCategoriaId === competencia.id ||
                                     gradeCategoriaId === `COMP_${competencia.numero}`
          return gradeCursoId === course_id && matchesCompetencia && gradeQuarter === bim
        })

        if (gradeRecord) {
          const gradeValue = gradeRecord.value || gradeRecord.valor
          bimesters[bim - 1] = gradeValue
          bimesterNotas[bim - 1] = [{
            valor: gradeValue,
            description: 'Nota',
            comentario: gradeRecord.observation || gradeRecord.observacion || ''
          }]
        }
      }
    }

    return {
      name: competencia.nombreCompetencia || competencia.name || `Competencia ${competencia.numero}`,
      bimestre1: bimesters[0],
      bimestre2: bimesters[1],
      bimestre3: bimesters[2],
      bimestre4: bimesters[3],
      notas1: bimesterNotas[0],
      notas2: bimesterNotas[1],
      notas3: bimesterNotas[2],
      notas4: bimesterNotas[3]
    }
  })
}

/**
 * Genera los datos de la boleta para un estudiante
 * @param {Object} child - Estudiante
 * @param {Array} courses - Lista de cursos
 * @param {Array} evaluationStructures - Estructuras de evaluación
 * @param {Array} allGrades - Todas las calificaciones (notas individuales)
 * @param {Array} competencyAverages - Promedios por competencia del backend (fuente de verdad)
 * @returns {Array} Array de datos de cursos con competencias
 */
export const generateBoletaData = (child, courses = [], evaluationStructures = [], allGrades = [], competencyAverages = []) => {
  try {
    // Los cursos ya vienen filtrados desde el hook, no filtrar de nuevo
    const studentCourses = courses

    // Las notas ya vienen filtradas desde el hook, no filtrar de nuevo
    const studentGrades = allGrades

    const boletaStructure = studentCourses.map(course => {
      const competenciasConNotas = buildCompetenciasConNotas(
        course,
        evaluationStructures,
        studentGrades,
        child,
        competencyAverages  // Pasar promedios del backend
      )

      return {
        cursoNombre: course.name,
        competencias: competenciasConNotas
      }
    }).filter(c => c !== null)

    return boletaStructure
  } catch (error) {
    console.error('Error generating boleta data:', error)
    return []
  }
}
