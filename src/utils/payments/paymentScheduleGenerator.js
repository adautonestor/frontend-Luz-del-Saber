import { paymentsService } from '../../services/paymentsService.js'
import { getStudentDiscount } from './discountCalculator.js'

/**
 * Genera el cronograma de pagos completo para un estudiante
 * Integrado con APIs reales del backend
 * @param {Object} student - Objeto estudiante con todos sus datos
 * @returns {Promise<void>} - Guarda los pagos directamente en la base de datos
 */
export async function generatePaymentSchedule(student) {
  try {
    // Obtener conceptos de pago desde la API
    const concepts = await paymentsService.getAllConcepts()

    // Filtrar conceptos activos para el nivel y año lectivo del estudiante
    const studentLevel = student.nivel?.toLowerCase()
    const studentAcademicYearId = student.academic_year_id || student.ano_lectivo_id

    const applicableConcepts = concepts.filter(concept => {
      const state = concept.state || concept.status
      const levels = concept.niveles || concept.levels || []
      const conceptAcademicYearId = concept.academic_year_id || concept.ano_lectivo_id

      // Verificar estado activo
      const isActive = state === 'activo' || state === 'active'

      // Verificar nivel (si el concepto aplica a todos o al nivel específico)
      const appliesToLevel = concept.applies_to_all || levels.length === 0 || levels.includes(studentLevel)

      // Verificar año lectivo (debe coincidir con el del estudiante)
      const sameAcademicYear = !conceptAcademicYearId || conceptAcademicYearId === studentAcademicYearId

      return isActive && appliesToLevel && sameAcademicYear
    })

    if (applicableConcepts.length === 0) {
      console.log('No hay conceptos aplicables para el nivel del estudiante')
      return
    }

    // Obtener porcentaje de descuento para el estudiante
    const discountPercentage = await getStudentDiscount(student)

    const currentYear = new Date().getFullYear()
    const paymentSchedule = []

    // Procesar cada concepto aplicable
    applicableConcepts.forEach(concept => {
      // Verificar si el estudiante está excluido de este concepto
      const excluded_students = concept.excluded_students || []
      const student_id = student.id
      if (student_id && excluded_students.includes(student_id)) {
        console.log(`Estudiante ${student.paternal_last_name || ''} ${student.maternal_last_name || ''}, ${student.first_names} (ID: ${student_id}) excluido del concepto "${concept.name || 'Sin nombre'}"`)
        return // Saltar este concepto
      }

      const type = concept.type || 'mensualidad'
      if (type === 'mensualidad' || type === 'mensual') {
        const monthlyPayments = generateMonthlyPayments(student, concept, discountPercentage, currentYear)
        paymentSchedule.push(...monthlyPayments)
      } else if (type === 'unico' || type === 'matricula') {
        const oneTimePayment = generateOneTimePayment(student, concept, discountPercentage, currentYear)
        paymentSchedule.push(oneTimePayment)
      }
    })

    // Guardar obligaciones de pago usando el servicio
    if (paymentSchedule.length > 0) {
      // Crear cada obligación individualmente
      for (const obligation of paymentSchedule) {
        try {
          await paymentsService.createObligation(obligation)
        } catch (error) {
          console.error('Error creando obligación:', error)
        }
      }
      console.log(`Cronograma de pagos generado: ${paymentSchedule.length} pagos creados para ${student.paternal_last_name || ''} ${student.maternal_last_name || ''}, ${student.first_names}${discountPercentage > 0 ? ` con ${discountPercentage}% de descuento` : ''}`)
    }
  } catch (error) {
    console.error('Error generando cronograma de pagos:', error)
    throw error
  }
}

/**
 * Genera pagos mensuales para un concepto de tipo mensualidad
 * @param {Object} student - Estudiante
 * @param {Object} concept - Concepto de pago
 * @param {number} discountPercentage - Porcentaje de descuento
 * @param {number} currentYear - Año actual
 * @returns {Array} Array de obligaciones de pago mensuales
 */
function generateMonthlyPayments(student, concept, discountPercentage, currentYear) {
  const payments = []
  const meses = concept.applicable_months || []
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  // Determinar el mes de inicio para pagos (si hay fecha de ingreso)
  let startMonthIndex = 0 // Enero por defecto
  const fechaIngreso = student.fecha_ingreso || student.fechaIngreso
  if (fechaIngreso) {
    const ingresoDate = new Date(fechaIngreso)
    startMonthIndex = ingresoDate.getMonth() // 0-11
    console.log(`Estudiante ${student.paternal_last_name || ''} ${student.maternal_last_name || ''}, ${student.first_names} ingresó en ${monthNames[startMonthIndex]}. Generando pagos desde ese mes.`)
  }

  meses.forEach(mesNombre => {
    const monthIndex = monthNames.indexOf(mesNombre)
    if (monthIndex !== -1 && monthIndex >= startMonthIndex) {
      const due_day = concept.due_day || 30
      const dueDate = new Date(currentYear, monthIndex, due_day)

      // Aplicar descuento al monto
      const originalAmount = concept.amount || 0
      const discountAmount = (originalAmount * discountPercentage) / 100
      const finalAmount = originalAmount - discountAmount

      payments.push({
        student_id: student.id,
        concept_id: concept.id,
        concepto: concept.name || 'Sin nombre',
        mes: mesNombre,
        due_month: monthIndex + 1,
        monto_original: originalAmount,
        monto_descuento: discountAmount,
        porcentaje_descuento: discountPercentage,
        total_amount: finalAmount,
        paid_amount: 0,
        pending_balance: finalAmount,
        due_date: dueDate.toISOString().split('T')[0],
        state: 'pendiente',
        academic_year: currentYear,
        fecha_generacion: new Date().toISOString()
      })
    }
  })

  return payments
}

/**
 * Genera un pago único para un concepto de tipo único
 * @param {Object} student - Estudiante
 * @param {Object} concept - Concepto de pago
 * @param {number} discountPercentage - Porcentaje de descuento
 * @param {number} currentYear - Año actual
 * @returns {Object} Obligación de pago única
 */
function generateOneTimePayment(student, concept, discountPercentage, currentYear) {
  const fechaUnica = concept.fecha_unica || concept.fechaUnica
  const fechaUnicaDate = fechaUnica ? new Date(fechaUnica) : new Date()

  // Aplicar descuento al monto
  const originalAmount = concept.amount || 0
  const discountAmount = (originalAmount * discountPercentage) / 100
  const finalAmount = originalAmount - discountAmount

  return {
    student_id: student.id,
    concept_id: concept.id,
    concepto: concept.name || 'Sin nombre',
    monto_original: originalAmount,
    monto_descuento: discountAmount,
    porcentaje_descuento: discountPercentage,
    total_amount: finalAmount,
    paid_amount: 0,
    pending_balance: finalAmount,
    due_date: fechaUnicaDate.toISOString().split('T')[0],
    state: 'pendiente',
    academic_year: currentYear,
    due_month: null,
    type: 'unico',
    fecha_generacion: new Date().toISOString()
  }
}

/**
 * Genera cronograma de pagos personalizado desde datos de matrícula
 * Integrado con APIs reales del backend
 * @param {Object} student - Estudiante
 * @param {Array} customPayments - Array de pagos personalizados
 * @param {number} anoLectivo - Año lectivo
 * @returns {Promise<void>} - Guarda los pagos en la base de datos
 */
export async function generateCustomPaymentSchedule(student, customPayments, anoLectivo) {
  if (!customPayments || customPayments.length === 0) return

  try {
    const obligations = customPayments.map(payment => {
      // Validar que concept_id sea un número válido
      const conceptId = payment.concept_id && !isNaN(payment.concept_id)
        ? parseInt(payment.concept_id)
        : null

      if (!conceptId) {
        console.error(`⚠️ Payment sin concept_id válido:`, payment)
        throw new Error(`El concepto "${payment.concepto}" no tiene un concept_id válido`)
      }

      return {
        student_id: student.id,
        concept_id: conceptId,
        academic_year: anoLectivo,
        due_month: payment.due_month || null,
        due_date: new Date(payment.due_date).toISOString().split('T')[0],
        total_amount: payment.total_amount,
        paid_amount: 0,
        pending_balance: payment.total_amount,
        status: payment.exonerado ? 'exonerado' : 'pending',
        generation_date: new Date()
      }
    })

    // Crear cada obligación individualmente
    for (const obligation of obligations) {
      try {
        await paymentsService.createObligation(obligation)
      } catch (error) {
        console.error('Error creando obligación personalizada:', error)
      }
    }

    console.log(`Cronograma personalizado generado: ${obligations.length} pagos para ${student.paternal_last_name || ''} ${student.maternal_last_name || ''}, ${student.first_names}`)
  } catch (error) {
    console.error('Error generando cronograma personalizado:', error)
    throw error
  }
}
