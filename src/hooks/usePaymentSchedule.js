import { useState, useEffect } from 'react'
import { usePaymentsStore } from '../stores/paymentsStore'
import { useAcademicStore } from '../stores/academicStore'
import { discountConfigsService } from '../services/discountConfigsService'

/**
 * Hook para gestión del cronograma de pagos
 * Genera y maneja el cronograma personalizable de pagos del estudiante
 * Integrado con APIs reales del backend
 * @param {Object} formData - Datos del formulario de matrícula
 * @param {string} selectedParentId - ID del padre seleccionado
 * @param {boolean} isNewStudent - Si es estudiante nuevo
 * @param {Object} newStudentData - Datos del nuevo estudiante
 * @param {Array} parentChildren - Hijos del padre
 * @param {number|string} studentId - ID del estudiante (para validar conceptos específicos)
 * @param {Object} foundStudent - Estudiante encontrado (para validar si hay estudiante seleccionado)
 */
export const usePaymentSchedule = (formData, selectedParentId, isNewStudent, newStudentData, parentChildren, studentId = null, foundStudent = null) => {
  const [paymentSchedule, setPaymentSchedule] = useState([])
  const [discountConfigs, setDiscountConfigs] = useState([])
  const currentYear = new Date().getFullYear()

  // Obtener conceptos de pago y niveles del store
  const { concepts } = usePaymentsStore()
  const { levels } = useAcademicStore()

  // Cargar configuraciones de descuento al montar
  useEffect(() => {
    loadDiscountConfigs()
  }, [])

  const loadDiscountConfigs = async () => {
    try {
      const configs = await discountConfigsService.getAll({
        state: 'activo',
        academic_year: currentYear
      })
      setDiscountConfigs(configs || [])
    } catch (error) {
      console.error('Error loading discount configs:', error)
      setDiscountConfigs([])
    }
  }

  // Generar cronograma cuando cambien los datos relevantes
  useEffect(() => {
    const hasAcademicData = formData.nivel && formData.grado && formData.seccion
    const hasStudentOrParent = selectedParentId || isNewStudent || foundStudent || studentId || formData.studentId

    if (hasAcademicData && hasStudentOrParent) {
      generatePaymentSchedulePreview()
    } else {
      setPaymentSchedule([])
    }
  }, [formData.nivel, formData.grado, formData.seccion, formData.fechaIngreso, formData.studentId, selectedParentId, isNewStudent, newStudentData.parent_id, parentChildren, concepts, discountConfigs, levels, foundStudent, studentId])

  const generatePaymentSchedulePreview = () => {
    try {
      // Convertir nivel ID a nombre de nivel
      let studentLevel = formData.nivel
      if (typeof studentLevel === 'number' || !isNaN(studentLevel)) {
        const levelObj = levels.find(l => l.id === parseInt(studentLevel))
        studentLevel = levelObj?.name?.toLowerCase() || ''
      } else {
        studentLevel = studentLevel?.toLowerCase() || ''
      }

      const currentStudentId = studentId || formData.studentId || newStudentData.id

      const applicableConcepts = concepts.filter(concept => {
        const state = concept.state || concept.status
        const levels = concept.levels || []
        const appliesToAll = concept.applies_to_all ?? true
        const specificStudents = concept.specific_students || []
        const excludedStudents = concept.excluded_students || []

        // 1. Validar estado y nivel
        if (state !== 'active') return false
        if (!levels.includes(studentLevel)) return false

        // 2. Si no tenemos studentId, aceptar por defecto (modo preview)
        if (!currentStudentId) return true

        // 3. Validar si está EXCLUIDO (prioridad máxima)
        const isExcluded = excludedStudents.length > 0 && excludedStudents.includes(parseInt(currentStudentId))
        if (isExcluded) return false

        // 4. Validar si aplica a todos
        if (appliesToAll) return true

        // 5. Validar si está en lista ESPECÍFICA
        if (specificStudents.length > 0) {
          return specificStudents.includes(parseInt(currentStudentId))
        }

        // 6. Si no aplica a todos y no hay lista específica → NO aplica
        return false
      })

      if (applicableConcepts.length === 0) {
        setPaymentSchedule([])
        return
      }

      // Calcular descuento según número de hijos
      let discountPercentage = 0
      const parentId = isNewStudent ? newStudentData.parent_id: selectedParentId

      if (parentId) {
        const siblings = parentChildren.length + (isNewStudent ? 1 : 0)

        let applicableDiscount = discountConfigs.find(d => {
          const cantidadHijos = d.children_quantity || d.cantidad_hijos || d.cantidadHijos
          const nivel = d.level || d.nivel
          const añoEscolar = d.academic_year

          return cantidadHijos === siblings &&
            (nivel === studentLevel || nivel === 'todos') &&
            añoEscolar === currentYear
        })

        // Si no hay exacta y tiene 4+ hermanos, usar la de 4
        if (!applicableDiscount && siblings >= 4) {
          applicableDiscount = discountConfigs.find(d => {
            const cantidadHijos = d.children_quantity || d.cantidad_hijos || d.cantidadHijos
            const nivel = d.level || d.nivel
            const añoEscolar = d.academic_year

            return cantidadHijos === 4 &&
              (nivel === studentLevel || nivel === 'todos') &&
              añoEscolar === currentYear
          })
        }

        discountPercentage = applicableDiscount
          ? (applicableDiscount.discount_percentage || applicableDiscount.porcentaje_descuento || applicableDiscount.porcentajeDescuento || 0)
          : 0
      }

      const schedule = []
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

      // Determinar mes de inicio basado en fechaIngreso
      let startMonthIndex = 0
      let startYear = currentYear
      if (formData.fechaIngreso) {
        const ingresoDate = new Date(formData.fechaIngreso)
        startMonthIndex = ingresoDate.getMonth()
        startYear = ingresoDate.getFullYear()
      }

      applicableConcepts.forEach(concept => {
        const tipo = (concept.type || '').toLowerCase().trim()
        const monto = parseFloat(concept.amount) || 0
        const meses = concept.applicable_months || []

        // Verificar si es mensualidad (múltiples variantes)
        const esMensualidad = tipo === 'mensualidad' || tipo === 'mensual' ||
                             tipo.includes('mensual') || meses.length > 0

        if (esMensualidad && meses.length > 0) {
          meses.forEach(mesNombre => {
            const monthIndex = monthNames.indexOf(mesNombre)

            // Lógica mejorada para determinar si debe generar el pago
            const debeGenerarPago = monthIndex !== -1 && (
              startYear < currentYear ||
              monthIndex >= startMonthIndex ||
              startMonthIndex > 6
            )

            if (debeGenerarPago) {
              const diaVencimiento = concept.due_day || 30
              const dueDate = new Date(currentYear, monthIndex, diaVencimiento)
              const originalAmount = monto
              const discountAmount = (originalAmount * discountPercentage) / 100
              const finalAmount = originalAmount - discountAmount

              schedule.push({
                id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                concept_id: concept.id,
                concepto: concept.name,
                mes: mesNombre,
                due_month: monthIndex + 1,
                montoOriginal: originalAmount,
                montoDescuento: discountAmount,
                porcentajeDescuento: discountPercentage,
                total_amount: finalAmount,
                due_date: dueDate.toISOString().split('T')[0],
                type: 'mensualidad',
                exonerado: false
              })
            }
          })
        } else if (tipo === 'unico' || tipo === 'matricula' || !esMensualidad) {
          const fechaUnica = concept.unique_payment_date || concept.fecha_unica || concept.fechaUnica
          const fechaUnicaDate = fechaUnica ? new Date(fechaUnica) : new Date()
          const originalAmount = monto
          const discountAmount = (originalAmount * discountPercentage) / 100
          const finalAmount = originalAmount - discountAmount

          schedule.push({
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            concept_id: concept.id,
            concepto: concept.name,
            mes: null,
            montoOriginal: originalAmount,
            montoDescuento: discountAmount,
            porcentajeDescuento: discountPercentage,
            total_amount: finalAmount,
            due_date: fechaUnicaDate.toISOString().split('T')[0],
            type: 'unico',
            exonerado: false
          })
        }
      })

      setPaymentSchedule(schedule)
    } catch (error) {
      console.error('Error generando cronograma:', error)
      setPaymentSchedule([])
    }
  }

  const handleScheduleAmountChange = (id, value) => {
    setPaymentSchedule(prev =>
      prev.map(item =>
        item.id === id ? { ...item, total_amount: parseFloat(value) || 0 } : item
      )
    )
  }

  const handleScheduleDateChange = (id, value) => {
    setPaymentSchedule(prev =>
      prev.map(item =>
        item.id === id ? { ...item, due_date: value } : item
      )
    )
  }

  const handleScheduleExoneradoChange = (id, checked) => {
    setPaymentSchedule(prev =>
      prev.map(item =>
        item.id === id ? { ...item, exonerado: checked } : item
      )
    )
  }

  return {
    paymentSchedule,
    handleScheduleAmountChange,
    handleScheduleDateChange,
    handleScheduleExoneradoChange
  }
}
