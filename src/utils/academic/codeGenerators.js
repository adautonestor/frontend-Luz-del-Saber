/**
 * Utilidades para generación de códigos académicos
 * Funciones puras - los datos deben ser provistos por el llamador desde servicios/stores
 */

/**
 * Generar código automático del curso (solo por nivel, sin grado)
 * @param {string} nombre - Nombre del curso
 * @param {string} nivel - Nombre del nivel educativo
 * @param {Array} courses - Lista de cursos existentes (desde servicio/store)
 * @param {string|null} excludeId - ID del curso a excluir (para edición)
 * @param {number|null} academicYear - Año del año lectivo seleccionado
 * @returns {string} Código generado
 */
export const generateCourseCode = (nombre, nivel, courses = [], excludeId = null, academicYear = null) => {
  try {
    if (!nombre || !nivel) {
      return ''
    }

    // Usar el año lectivo seleccionado o el año actual como fallback
    const currentYear = academicYear || new Date().getFullYear()

    // Obtener las 3 primeras letras del nombre (sin espacios ni acentos)
    let nameClean = ''
    try {
      nameClean = nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/\s+/g, '') // Quitar espacios
        .substring(0, 3)
        .toUpperCase()
    } catch (e) {
      nameClean = nombre.substring(0, 3).toUpperCase()
    }

    // Mapear el nivel a su abreviatura usando las 3 primeras letras
    let levelCode
    const levelMap = {
      'inicial': 'INI',
      'primaria': 'PRI',
      'secundaria': 'SEC'
    }

    // Primero intentar con el mapa hardcodeado, sino usar las 3 primeras letras
    const nivelLower = nivel.toLowerCase()
    if (levelMap[nivelLower]) {
      levelCode = levelMap[nivelLower]
    } else {
      // Generar código automático con las 3 primeras letras
      levelCode = nivel
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .substring(0, 3)
        .toUpperCase()
    }

    // Código base: XXX-NIV-AAAA (sin grado)
    const baseCode = `${nameClean}-${levelCode}-${currentYear}`

    // Filtrar cursos que coincidan con el código base (excluyendo el curso actual si se está editando)
    const existingCodes = courses
      .filter(course => {
        // Excluir el curso actual si se está editando
        if (excludeId && course.id === excludeId) {
          return false
        }
        // Buscar códigos que empiecen con el código base
        const code = course.code || course.codigo
        return code && code.startsWith(baseCode)
      })
      .map(course => course.code || course.codigo)

    // Si no hay códigos existentes, usar el código base
    if (existingCodes.length === 0) {
      return baseCode
    }

    // Buscar el número más alto en los códigos existentes
    let maxNumber = 0
    const baseCodePattern = baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escapar caracteres especiales

    existingCodes.forEach(code => {
      // Casos posibles:
      // 1. Código exacto: "MAT-SEC-2024"
      // 2. Código con sufijo: "MAT-SEC-2024-01", "MAT-SEC-2024-02", etc.

      if (code === baseCode) {
        // El código base existe, considerarlo como -00 o -01
        maxNumber = Math.max(maxNumber, 1)
      } else if (code.startsWith(baseCode + '-')) {
        // Extraer el número del sufijo
        const suffix = code.substring(baseCode.length + 1)
        const number = parseInt(suffix)
        if (!isNaN(number)) {
          maxNumber = Math.max(maxNumber, number)
        }
      }
    })

    // Generar el siguiente número
    const nextNumber = maxNumber + 1
    const finalCode = `${baseCode}-${nextNumber.toString().padStart(2, '0')}`

    return finalCode

  } catch (error) {
    console.error('Error in generateCourseCode:', error)
    return 'XXX-XXX-2024-01'
  }
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * await coursesService.updateExistingCourseCodes()
 *
 * Esta es una operación de migración/actualización masiva que debe estar en el servicio de cursos.
 * La función debe:
 * 1. Obtener todos los cursos y niveles desde el backend
 * 2. Actualizar códigos de cursos antiguos al nuevo formato
 * 3. Migrar cursos con gradoId a usar nivelId
 * 4. Guardar los cambios en el backend
 *
 * Por ahora se mantiene como helper para compatibilidad, pero debe moverse al servicio.
 */
export const updateExistingCourseCodes = (courses = [], levels = [], grades = []) => {
  try {

    // Recopilar todas las actualizaciones sin guardar
    let updatedCount = 0
    const updatedCourses = courses.map(course => {
      const level_id = course.level_id || course.level_id
      const grade_id = course.grade_id || course.grade_id

      // Cursos nuevos tienen nivelId, cursos viejos tienen gradoId
      if (!nivelId && gradoId) {
        // Migrar cursos antiguos: encontrar nivel a partir del gradoId
        const grade = grades.find(g => g.id === gradoId)
        const gradeNivelId = grade?.level_id || grade?.level_id

        if (grade && gradeNivelId) {
          const level = levels.find(l => l.id === gradeNivelId)
          if (level) {
            updatedCount++
            return {
              ...course,
              level_id: gradeNivelId,
              level_id: gradeNivelId,
              grade_id: undefined,
              grade_id: undefined,
              code: generateCourseCode(course.name || course.name, level.name || level.name, courses, course.id)
            }
          }
        }
        return course
      }

      // Encontrar el nivel del curso
      const level = levels.find(l => l.id === nivelId)
      if (!level) return course

      // Generar nuevo código si no tiene o está en formato antiguo
      const newCode = generateCourseCode(course.name || course.name, level.name || level.name, courses, course.id)

      // Actualizar solo si el código es diferente
      const currentCode = course.code || course.code
      if (currentCode !== newCode) {
        updatedCount++
        return { ...course, code: newCode, code: newCode }
      }

      return course
    })

    return { updatedCourses, updatedCount }

  } catch (error) {
    console.error('❌ Error actualizando códigos de cursos:', error)
    return { updatedCourses: courses, updatedCount: 0 }
  }
}
