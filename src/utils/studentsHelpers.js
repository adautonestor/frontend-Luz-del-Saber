/**
 * Utilidades para gestión de estudiantes
 * Funciones puras - los datos deben ser provistos por el llamador desde servicios/stores
 */

import * as XLSX from 'xlsx'
import { EXCEL_COLUMN_WIDTHS } from '../config/studentsConstants'

/**
 * Obtiene los nombres completos del estudiante (primer nombre + segundo nombre)
 * last_names almacena el "segundo nombre", NO los apellidos
 */
export const getStudentNombres = (student) => {
  if (!student) return '-'
  const first = student.first_names || ''
  const second = student.last_names || ''
  return second ? `${first} ${second}`.trim() : first
}

/**
 * Obtiene los apellidos completos (paterno + materno)
 * NO usa last_names como fallback (ese campo es el segundo nombre)
 */
export const getStudentApellidos = (student) => {
  if (!student) return '-'
  const paterno = student.paternal_last_name || student.apellidoPaterno || ''
  const materno = student.maternal_last_name || student.apellidoMaterno || ''
  return `${paterno} ${materno}`.trim() || '-'
}

/**
 * Nombre completo para mostrar en formato "Apellidos, Nombres"
 */
export const getStudentFullDisplay = (student) => {
  if (!student) return '-'
  return `${getStudentApellidos(student)}, ${getStudentNombres(student)}`
}

/**
 * Filtra estudiantes según criterios de búsqueda, nivel y grado
 * @param {Array} students - Array de estudiantes
 * @param {Function} searchFunction - Función de búsqueda del store
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} filterNivel - Nivel a filtrar
 * @param {string} filterGrado - Grado a filtrar
 * @param {string} sortOrder - Orden de clasificación ('asc' o 'desc')
 * @returns {Array} Estudiantes filtrados y ordenados
 */
export const filterAndSortStudents = (students, searchFunction, searchTerm, filterNivel, filterGrado, sortOrder) => {
  let filtered = students || []

  // El backend ya filtra los eliminados, no es necesario filtrar aquí
  // Solo se muestran estudiantes con status: 'active' o 'inactive'

  // Aplicar búsqueda
  if (searchTerm) {
    filtered = searchFunction(searchTerm)
  }

  // Aplicar filtro de nivel
  if (filterNivel) {
    filtered = filtered.filter(s => s.level_name?.toLowerCase() === filterNivel.toLowerCase())
  }

  // Aplicar filtro de grado
  if (filterGrado) {
    filtered = filtered.filter(s => s.grade_name === filterGrado)
  }

  // Aplicar ordenamiento por apellidos
  filtered = filtered.sort((a, b) => {
    const apellidoPaternoA = (a.paternal_last_name || a.apellidoPaterno || '').toLowerCase()
    const apellidoPaternoB = (b.paternal_last_name || b.apellidoPaterno || '').toLowerCase()
    const apellidoMaternoA = (a.apellidoMaterno || '').toLowerCase()
    const apellidoMaternoB = (b.apellidoMaterno || '').toLowerCase()

    if (sortOrder === 'asc') {
      const paternoCompare = apellidoPaternoA.localeCompare(apellidoPaternoB, 'es')
      if (paternoCompare !== 0) return paternoCompare
      return apellidoMaternoA.localeCompare(apellidoMaternoB, 'es')
    } else {
      const paternoCompare = apellidoPaternoB.localeCompare(apellidoPaternoA, 'es')
      if (paternoCompare !== 0) return paternoCompare
      return apellidoMaternoB.localeCompare(apellidoMaternoA, 'es')
    }
  })

  return filtered
}

/**
 * Exporta estudiantes a formato Excel
 * FORMATO HOMOLOGADO CON IMPORTACIÓN POR LOTE
 * @param {Array} students - Array de estudiantes a exportar
 */
export const exportStudentsToExcel = (students) => {
  try {
    // Preparar los datos para exportar en el formato EXACTO de la plantilla de importación
    const dataToExport = students.map((student) => {
      // Extraer DNI del padre desde el campo JSON parents
      let dniPadreTutor = ''
      if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
        const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
        dniPadreTutor = primaryParent.dni || ''
      } else if (student.dniPadre) {
        dniPadreTutor = student.dniPadre
      }

      // Combinar apellidos (paterno + materno) para la columna "Apellidos"
      const apellidoPaterno = student.paternal_last_name || student.apellidoPaterno || student.last_names || ''
      const apellidoMaterno = student.maternal_last_name || student.apellidoMaterno || ''
      const apellidosCompletos = apellidoMaterno ? `${apellidoPaterno} ${apellidoMaterno}` : apellidoPaterno

      // Normalizar nivel a minúsculas (inicial/primaria/secundaria)
      let nivelNormalizado = ''
      if (student.level_name) {
        nivelNormalizado = student.level_name.toLowerCase()
      } else if (student.nivel) {
        nivelNormalizado = student.nivel.toLowerCase()
      }

      // Extraer solo el número del grado (ej: "1° Grado" -> "1")
      let gradoNumero = ''
      if (student.grade_name) {
        const match = student.grade_name.match(/(\d+)/)
        gradoNumero = match ? match[1] : ''
      } else if (student.grado) {
        gradoNumero = student.grado.toString()
      }

      // Formatear fecha de nacimiento (YYYY-MM-DD)
      let fechaNacimiento = ''
      if (student.birth_date) {
        const date = new Date(student.birth_date)
        fechaNacimiento = date.toISOString().split('T')[0]
      } else if (student.fechaNacimiento) {
        fechaNacimiento = student.fechaNacimiento
      }

      // Género en formato M/F
      const genero = student.gender || student.genero || student.sexo || 'M'

      // Incluir segundo nombre en la columna Nombres
      const nombresCompletos = student.last_names
        ? `${student.first_names || ''} ${student.last_names}`.trim()
        : (student.first_names || '')

      return {
        'Nombres': nombresCompletos,
        'Apellidos': apellidosCompletos,
        'DNI Estudiante': student.dni || '',
        'Fecha de Nacimiento': fechaNacimiento,
        'Sexo (M/F)': genero,
        'Nivel (inicial/primaria/secundaria)': nivelNormalizado,
        'Grado': gradoNumero,
        'Sección': student.section_name || student.seccion || '',
        'Dirección': student.address || student.direccion || '',
        'Teléfono': student.phone || student.telefono || '',
        'DNI Padre/Tutor': dniPadreTutor
      }
    })

    // Crear el libro de Excel
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')

    // Ajustar el ancho de las columnas (mismo formato que plantilla de importación)
    const colWidths = [
      { wch: 20 }, // Nombres
      { wch: 20 }, // Apellidos
      { wch: 15 }, // DNI Estudiante
      { wch: 20 }, // Fecha de Nacimiento
      { wch: 15 }, // Sexo
      { wch: 35 }, // Nivel
      { wch: 10 }, // Grado
      { wch: 10 }, // Sección
      { wch: 30 }, // Dirección
      { wch: 15 }, // Teléfono
      { wch: 18 }  // DNI Padre/Tutor
    ]
    ws['!cols'] = colWidths

    // Generar el archivo
    const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
    const fileName = `Estudiantes_${fecha}.xlsx`

    XLSX.writeFile(wb, fileName)

    console.log(`Exportación exitosa: ${students.length} estudiantes`)
    return true
  } catch (error) {
    console.error('Error al exportar estudiantes:', error)
    alert('Error al exportar los estudiantes. Por favor, intente nuevamente.')
    return false
  }
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * const parents = await usersService.getByRole('padre')
 *
 * Esta es una operación de consulta que debe estar en el servicio de usuarios.
 *
 * Carga la lista de padres/apoderados del sistema
 * @param {Array} parents - Lista de registros de padres (desde servicio/store)
 * @param {Array} users - Lista de usuarios (desde servicio/store)
 * @returns {Array} Array de padres con sus datos
 */
export const loadParentsList = (parents = [], users = []) => {
  // Obtener usuarios con rol 'padre' y sus datos asociados
  const parentUsers = users
    .filter(u => {
      const rol = u.rol || u.role
      return rol === 'Padre' || rol === 'parent'
    })
    .map(user => {
      const userId = user.id
      const parentData = parents.find(p => {
        const pUserId = p.user_id || p.userId
        return pUserId === userId
      })
      return {
        ...user,
        parentData
      }
    })

  return parentUsers
}

/**
 * TODO: Esta función debe ser reemplazada por:
 * await studentsService.changeParent(studentId, newParentId)
 *
 * Esta es una operación de actualización (CRUD) que debe estar en el servicio de estudiantes.
 * El servicio debe:
 * 1. Actualizar el padreId/padre_id del estudiante en el backend
 * 2. Crear registro de auditoría automáticamente
 * 3. Retornar el estudiante actualizado
 *
 * Cambia el apoderado de un estudiante (DEPRECATED - usar studentsService)
 * @param {Object} params - Parámetros para el cambio
 * @returns {Promise<boolean>} True si fue exitoso
 * @deprecated Usar studentsService.changeParent() en su lugar
 */
export const changeStudentParent = async (params) => {
  console.warn('⚠️ changeStudentParent debe ser reemplazada por studentsService.changeParent()')

  const { studentId, oldParentId, newParentId, newParent, user, onSuccess } = params

  try {
    console.log('Cambio de apoderado:', {
      studentId,
      oldParentId,
      newParentId,
      userId: user?.id
    })

    // Esta función ya no debe manipular datos directamente
    // Debe ser reemplazada por una llamada al servicio
    // Por ahora solo retornamos éxito para compatibilidad
    if (onSuccess) {
      onSuccess()
    }

    return true
  } catch (error) {
    console.error('Error changing parent:', error)
    alert('Error al cambiar el apoderado. Por favor, intente nuevamente.')
    return false
  }
}

/**
 * Calcula estadísticas por nivel educativo (dinámico)
 * @param {Array} students - Array de estudiantes
 * @returns {Object} Estadísticas por nivel
 */
export const calculateStudentStats = (students) => {
  // Contar estudiantes por nivel dinámicamente
  const porNivel = {}
  students.forEach(s => {
    if (s.level_name) {
      const nivelKey = s.level_name.toLowerCase()
      porNivel[nivelKey] = (porNivel[nivelKey] || 0) + 1
    }
  })

  return {
    total: students.length,
    porNivel, // Objeto con conteo por cada nivel encontrado
    // Mantener compatibilidad con nombres comunes
    inicial: porNivel['inicial'] || 0,
    primaria: porNivel['primaria'] || 0,
    secundaria: porNivel['secundaria'] || 0
  }
}
