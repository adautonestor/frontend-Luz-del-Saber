import { CURSO_TO_AREA_MAP, DEFAULT_TUTOR } from '../config/reportCardConfig'

/**
 * Organiza los datos de calificaciones por curso (usando nombre original del curso)
 * @param {Array} gradesData - Array de cursos con competencias y notas
 * @returns {Map} Map con nombres de cursos como keys y arrays de competencias como values
 */
export const organizeByArea = (gradesData) => {
  const areaMap = new Map()

  gradesData.forEach(course => {
    // Usar el nombre original del curso en mayúsculas
    const cursoNombre = course.cursoNombre?.toUpperCase() || 'SIN NOMBRE'

    if (!areaMap.has(cursoNombre)) {
      areaMap.set(cursoNombre, [])
    }

    course.competencias.forEach(comp => {
      areaMap.get(cursoNombre).push({
        area: cursoNombre,
        competencia: comp.name,
        bim1: {
          nota: comp.bimestre1,
          conclusion: extractConclusion(comp.notas1)
        },
        bim2: {
          nota: comp.bimestre2,
          conclusion: extractConclusion(comp.notas2)
        },
        bim3: {
          nota: comp.bimestre3,
          conclusion: extractConclusion(comp.notas3)
        },
        bim4: {
          nota: comp.bimestre4,
          conclusion: extractConclusion(comp.notas4)
        },
        // Soportar ambos nombres: promedioFinal (nuevo) y promedio (legacy)
        promedioFinal: comp.promedioFinal ?? comp.promedio
      })
    })
  })

  return areaMap
}

/**
 * Determina el área curricular oficial basándose en el nombre del curso
 * @param {string} courseName - Nombre del curso
 * @returns {string} Área curricular oficial del MINEDU
 */
export const determineArea = (courseName) => {
  const name = courseName.toUpperCase()

  // Buscar coincidencia en el mapping
  for (const [keyword, area] of Object.entries(CURSO_TO_AREA_MAP)) {
    if (name.includes(keyword)) {
      return area
    }
  }

  // Si no hay coincidencia, usar el nombre del curso en mayúsculas
  return courseName.toUpperCase()
}

/**
 * Extrae la conclusión descriptiva del array de notas
 * @param {Array} notasArray - Array de objetos con notas y comentarios
 * @returns {string} Conclusión descriptiva o string vacío
 */
export const extractConclusion = (notasArray) => {
  if (!notasArray || notasArray.length === 0) return ''

  // Buscar la primera nota con comentario
  const notaConComentario = notasArray.find(nota => nota.comentario && nota.comentario.trim() !== '')

  return notaConComentario ? notaConComentario.comentario : ''
}

/**
 * Obtiene el nombre del tutor del estudiante
 * @param {Object} studentData - Datos del estudiante (puede incluir info del tutor)
 * @returns {string} Nombre del tutor
 */
export const getTutorName = (studentData) => {
  // Si hay información del tutor en los datos del estudiante, usarla
  if (studentData?.tutorNombre) {
    return studentData.tutorNombre
  }

  if (studentData?.tutor_name) {
    return studentData.tutor_name
  }

  if (studentData?.tutor) {
    return studentData.tutor
  }

  // De lo contrario, usar el valor por defecto
  return DEFAULT_TUTOR
}
