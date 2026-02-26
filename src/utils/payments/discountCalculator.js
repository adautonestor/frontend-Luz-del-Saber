import { discountConfigsService } from '../../services/discountConfigsService.js'
import studentsService from '../../services/studentsService.js'

/**
 * Calcula el descuento aplicable basado en el número de hijos y nivel educativo
 * Integrado con APIs reales del backend
 * @param {number} cantidadHijos - Número de hijos matriculados
 * @param {string} nivel - Nivel educativo (inicial, primaria, secundaria)
 * @returns {Promise<number>} Porcentaje de descuento (0-100)
 */
export async function calculateDiscount(cantidadHijos, nivel) {
  try {
    const currentYear = new Date().getFullYear()
    const discountConfigs = await discountConfigsService.getAll({
      state: 'activo',
      academic_year: currentYear
    })

    // Buscar descuento aplicable (priorizar coincidencia exacta, luego usar 4+ para 4 o más hijos)
    let applicableDiscount = discountConfigs.find(d => {
      const cantidad = d.cantidad_hijos || d.cantidadHijos
      const nivelDiscount = d.nivel || d.level
      return cantidad === cantidadHijos && (nivelDiscount === nivel || nivelDiscount === 'todos')
    })

    // Si no hay coincidencia exacta y tiene 4+ hijos, usar el descuento de 4+
    if (!applicableDiscount && cantidadHijos >= 4) {
      applicableDiscount = discountConfigs.find(d => {
        const cantidad = d.cantidad_hijos || d.cantidadHijos
        const nivelDiscount = d.nivel || d.level
        return cantidad === 4 && (nivelDiscount === nivel || nivelDiscount === 'todos')
      })
    }

    const porcentaje = applicableDiscount
      ? (applicableDiscount.porcentaje_descuento || applicableDiscount.porcentajeDescuento || 0)
      : 0

    return porcentaje
  } catch (error) {
    console.error('Error calculating discount:', error)
    return 0
  }
}

/**
 * Obtiene el descuento para un estudiante específico
 * Integrado con APIs reales del backend
 * @param {Object} student - Objeto estudiante con padreId y nivel
 * @returns {Promise<number>} Porcentaje de descuento
 */
export async function getStudentDiscount(student) {
  const parent_id = student.parent_id || student.parent_id
  if (!padreId) return 0

  try {
    // Obtener todos los estudiantes del mismo padre
    const allStudents = await studentsService.getAll()
    const siblings = allStudents.filter(s => {
      const studentPadreId = s.parent_id || s.parent_id
      return studentPadreId === padreId
    })

    const numberOfChildren = siblings.length
    const studentLevel = student.nivel?.toLowerCase()

    const discountPercentage = await calculateDiscount(numberOfChildren, studentLevel)

    if (discountPercentage > 0) {
      console.log(`Aplicando ${discountPercentage}% de descuento por ${numberOfChildren} hijos en nivel ${studentLevel}`)
    }

    return discountPercentage
  } catch (error) {
    console.error('Error getting student discount:', error)
    return 0
  }
}
