import React, { useState, useEffect, useMemo } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'
import { useStudentsStore } from '../../stores/studentsStore'
import { useAcademicStore } from '../../stores/academicStore'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { matriculationService } from '../../services/matriculationService'
import { usePaymentSchedule } from '../../hooks/usePaymentSchedule'
import studentsService from '../../services/studentsService'
import PaymentScheduleTable from './PaymentScheduleTable'

/**
 * Modal para editar un estudiante existente y su matrícula EN CASCADA.
 *
 * Permite cambiar nivel/grado/sección/año lectivo de un alumno ya matriculado.
 * Al confirmar, el backend sincroniza en una transacción:
 *   matriculation + students (code) + sections.students + cronograma de pagos.
 * Las notas/pagos ya realizados se preservan como histórico (con advertencia).
 */
const EditStudentModal = ({ student, onClose, onSuccess }) => {
  const { updateStudent } = useStudentsStore()
  const {
    levels,
    grades,
    sections,
    academicYears,
    initialize: initializeAcademic
  } = useAcademicStore()
  const { concepts, initialize: initializePayments } = usePaymentsStore()

  const isEnrolled = !!(student.academic_year_id && student.level_id && student.grade_id && student.section_id)

  // Valores académicos originales (para detectar cambios)
  const original = useMemo(() => ({
    academic_year_id: student.academic_year_id || '',
    level_id: student.level_id || '',
    grade_id: student.grade_id || '',
    section_id: student.section_id || ''
  }), [student])

  const [matriculation, setMatriculation] = useState(null)
  const [editImpact, setEditImpact] = useState(null)
  const [parentChildren, setParentChildren] = useState([])
  const [confirmedImpact, setConfirmedImpact] = useState(false)

  // Fecha de ingreso para el cálculo del cronograma
  const initialEnrollmentDate = (() => {
    const d = student.enrollment_date || student.matriculation_date
    if (d) {
      const s = typeof d === 'string' ? d : new Date(d).toISOString()
      return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.split('T')[0] : new Date(d).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })()

  const [formData, setFormData] = useState({
    first_names: student.first_names || '',
    last_names: student.last_names || '',
    paternal_last_name: student.paternal_last_name || '',
    maternal_last_name: student.maternal_last_name || '',
    dni: student.dni || '',
    birth_date: student.birth_date ? (typeof student.birth_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(student.birth_date) ? student.birth_date : new Date(student.birth_date).toISOString().split('T')[0]) : '',
    gender: student.gender || '',
    address: student.address || '',
    phone: student.phone || '',
    academic_year_id: student.academic_year_id || '',
    nivel: student.level_id || student.nivel || '',
    grado: student.grade_id || student.grado || '',
    seccion: student.section_id || student.seccion || '',
    fechaIngreso: initialEnrollmentDate,
    observations: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Detección de cambios académicos
  const academicChanged =
    String(formData.academic_year_id) !== String(original.academic_year_id) ||
    String(formData.nivel) !== String(original.level_id) ||
    String(formData.grado) !== String(original.grade_id) ||
    String(formData.seccion) !== String(original.section_id)

  // Cambios que obligan a regenerar el cronograma de pagos (nivel o año)
  const paymentRelevantChange =
    String(formData.nivel) !== String(original.level_id) ||
    String(formData.academic_year_id) !== String(original.academic_year_id)

  // Año lectivo (valor numérico) para el encabezado del cronograma
  const anoLectivoValue = useMemo(() => {
    const y = academicYears.find(a => String(a.id) === String(formData.academic_year_id))
    return y ? (y.year || y.año || y.name) : ''
  }, [academicYears, formData.academic_year_id])

  // Hook del cronograma de pagos (reutiliza la misma lógica que la matrícula)
  const parentId = useMemo(() => {
    if (student.parent_id) return student.parent_id
    if (Array.isArray(student.parents) && student.parents.length > 0) {
      const primary = student.parents.find(p => p.is_primary && p.user_id) || student.parents.find(p => p.user_id)
      return primary?.user_id || null
    }
    return null
  }, [student])

  const scheduleFormData = useMemo(() => ({
    nivel: formData.nivel,
    grado: formData.grado,
    seccion: formData.seccion,
    fechaIngreso: formData.fechaIngreso,
    anoLectivo: anoLectivoValue,
    studentId: student.id
  }), [formData.nivel, formData.grado, formData.seccion, formData.fechaIngreso, anoLectivoValue, student.id])

  const {
    paymentSchedule,
    handleScheduleAmountChange,
    handleScheduleDateChange,
    handleScheduleExoneradoChange
  } = usePaymentSchedule(
    scheduleFormData,
    parentId,
    false,            // isNewStudent
    {},               // newStudentData
    parentChildren,
    student.id,
    student            // foundStudent
  )

  useEffect(() => {
    const loadData = async () => {
      // Estructura académica y conceptos de pago (necesarios para el cronograma)
      if (!levels.length || !academicYears.length) {
        await initializeAcademic()
      }
      if (!concepts || concepts.length === 0) {
        try { await initializePayments() } catch (e) { console.error('Error cargando conceptos:', e) }
      }

      // Cargar matrícula del año actual (para observaciones e id de cascada)
      if (student.id && student.academic_year_id) {
        try {
          const matriculas = await matriculationService.getByStudent(student.id)
          const currentMatriculation = Array.isArray(matriculas)
            ? matriculas.find(m => m.academic_year_id === student.academic_year_id)
            : null
          if (currentMatriculation) {
            setMatriculation(currentMatriculation)
            setFormData(prev => ({ ...prev, observations: currentMatriculation.observations || '' }))

            // Impacto de edición (notas/pagos existentes)
            try {
              const impact = await matriculationService.getEditImpact(currentMatriculation.id)
              setEditImpact(impact)
            } catch (e) {
              console.error('Error al obtener impacto de edición:', e)
            }
          }
        } catch (error) {
          console.error('Error al cargar matrícula:', error)
        }
      }

      // Hermanos del mismo padre (para descuento por número de hijos)
      if (parentId) {
        try {
          const all = await studentsService.getAll()
          const siblings = (all || []).filter(s => {
            if (s.parent_id) return s.parent_id === parentId
            if (Array.isArray(s.parents)) return s.parents.some(p => p.user_id === parentId)
            return false
          })
          setParentChildren(siblings)
        } catch (e) {
          console.error('Error al cargar hermanos:', e)
        }
      }
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.first_names.trim()) newErrors.first_names = 'Nombres son requeridos'
    if (!formData.paternal_last_name.trim()) newErrors.paternal_last_name = 'Apellido Paterno es requerido'
    if (!formData.dni.trim()) newErrors.dni = 'DNI es requerido'
    else if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'DNI debe tener 8 dígitos'
    if (!formData.birth_date) newErrors.birth_date = 'Fecha de nacimiento es requerida'
    if (!formData.gender) newErrors.gender = 'Sexo es requerido'
    if (!formData.academic_year_id) newErrors.academic_year_id = 'Año lectivo es requerido'
    if (!formData.nivel) newErrors.nivel = 'Nivel es requerido'
    if (!formData.grado) newErrors.grado = 'Grado es requerido'
    if (!formData.seccion) newErrors.seccion = 'Sección es requerida'

    // Confirmación obligatoria si hay notas y se cambia grado/nivel
    if (academicChanged && editImpact?.hasGrades && !confirmedImpact) {
      newErrors.confirm = 'Debe confirmar que entiende el impacto sobre las notas existentes'
    }
    // Evitar regeneración con cronograma aún no cargado
    if (paymentRelevantChange && (!concepts || concepts.length === 0)) {
      newErrors.submit = 'Espere a que cargue el cronograma de pagos antes de guardar'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // 1. Datos personales del estudiante (el merge del backend preserva lo académico)
      const personalData = {
        first_names: formData.first_names,
        last_names: formData.last_names,
        paternal_last_name: formData.paternal_last_name,
        maternal_last_name: formData.maternal_last_name,
        dni: formData.dni,
        birth_date: formData.birth_date,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone
      }
      await updateStudent(student.id, personalData)

      // 2. Matrícula
      if (matriculation?.id) {
        if (academicChanged && isEnrolled) {
          const payload = {
            academic_year_id: parseInt(formData.academic_year_id),
            level_id: parseInt(formData.nivel),
            grade_id: parseInt(formData.grado),
            section_id: parseInt(formData.seccion),
            observations: formData.observations || null
          }
          // Sólo regenerar pagos cuando cambia nivel o año
          if (paymentRelevantChange) {
            payload.paymentSchedule = (paymentSchedule || []).map(p => ({
              concept_id: p.concept_id,
              due_month: p.due_month || null,
              due_date: p.due_date,
              total_amount: p.total_amount,
              exonerado: p.exonerado === true
            }))
          }
          await matriculationService.updateCascade(matriculation.id, payload)
        } else {
          // Sólo observaciones (sin cambios académicos)
          await matriculationService.update(matriculation.id, { observations: formData.observations || null })
        }
      }

      onSuccess()
    } catch (error) {
      setErrors({ submit: error?.response?.data?.error || error.message || 'Error al actualizar' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGradesForLevel = (levelId) => {
    if (!levelId) return []
    return grades.filter(g => g.level_id === parseInt(levelId) || g.nivel === parseInt(levelId))
  }

  const getSectionsForGrade = (gradeId) => {
    if (!gradeId) return []
    return sections.filter(s => s.grade_id === parseInt(gradeId) || s.grado === parseInt(gradeId))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Estudiante: {student.first_names} {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input type="text" name="first_names" value={formData.first_names} onChange={handleChange}
                className={`input ${errors.first_names ? 'border-red-500' : ''}`} placeholder="Nombres del estudiante" />
              {errors.first_names && <p className="text-red-500 text-xs mt-1">{errors.first_names}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre</label>
              <input type="text" name="last_names" value={formData.last_names} onChange={handleChange}
                className="input" placeholder="Segundo nombre (opcional)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
              <input type="text" name="paternal_last_name" value={formData.paternal_last_name} onChange={handleChange}
                className={`input ${errors.paternal_last_name ? 'border-red-500' : ''}`} placeholder="Apellido paterno" />
              {errors.paternal_last_name && <p className="text-red-500 text-xs mt-1">{errors.paternal_last_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
              <input type="text" name="maternal_last_name" value={formData.maternal_last_name} onChange={handleChange}
                className="input" placeholder="Apellido materno" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input type="text" name="dni" value={formData.dni} onChange={handleChange}
                className={`input ${errors.dni ? 'border-red-500' : ''}`} placeholder="12345678" maxLength="8" />
              {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento *</label>
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                className={`input ${errors.birth_date ? 'border-red-500' : ''}`} />
              {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
              <select name="gender" value={formData.gender} onChange={handleChange}
                className={`input ${errors.gender ? 'border-red-500' : ''}`}>
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="input" placeholder="+51 987 654 321" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange}
              className="input" placeholder="Dirección de domicilio" />
          </div>

          {/* Asignación Académica (EDITABLE en cascada) */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Asignación Académica</h4>

            {isEnrolled && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
                <Info className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-blue-800">
                  Al cambiar nivel, grado, sección o año lectivo, los cambios se aplican <strong>en cascada</strong>:
                  estudiante, sección y cronograma de pagos se sincronizan automáticamente.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Año Lectivo *</label>
                <select name="academic_year_id" value={formData.academic_year_id} onChange={handleChange}
                  className={`input ${errors.academic_year_id ? 'border-red-500' : ''}`}>
                  <option value="">Seleccionar año lectivo...</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.name} ({year.year})</option>
                  ))}
                </select>
                {errors.academic_year_id && <p className="text-red-500 text-xs mt-1">{errors.academic_year_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                <select name="nivel" value={formData.nivel}
                  onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, grado: '', seccion: '' })) }}
                  className={`input ${errors.nivel ? 'border-red-500' : ''}`}>
                  <option value="">Seleccionar nivel...</option>
                  {levels.map(level => (<option key={level.id} value={level.id}>{level.name}</option>))}
                </select>
                {errors.nivel && <p className="text-red-500 text-xs mt-1">{errors.nivel}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                <select name="grado" value={formData.grado}
                  onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, seccion: '' })) }}
                  className={`input ${errors.grado ? 'border-red-500' : ''}`} disabled={!formData.nivel}>
                  <option value="">Seleccionar grado...</option>
                  {getGradesForLevel(formData.nivel).map(grade => (<option key={grade.id} value={grade.id}>{grade.name}</option>))}
                </select>
                {errors.grado && <p className="text-red-500 text-xs mt-1">{errors.grado}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sección *</label>
                <select name="seccion" value={formData.seccion} onChange={handleChange}
                  className={`input ${errors.seccion ? 'border-red-500' : ''}`} disabled={!formData.grado}>
                  <option value="">Seleccionar sección...</option>
                  {getSectionsForGrade(formData.grado).map(section => (<option key={section.id} value={section.id}>{section.name}</option>))}
                </select>
                {errors.seccion && <p className="text-red-500 text-xs mt-1">{errors.seccion}</p>}
              </div>
            </div>
          </div>

          {/* Advertencias de impacto (notas / pagos) */}
          {academicChanged && editImpact && (editImpact.hasGrades || editImpact.hasPaidObligations || paymentRelevantChange) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center text-amber-800 font-medium">
                <AlertTriangle className="mr-2" size={18} />
                Impacto del cambio académico
              </div>
              <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                {editImpact.hasGrades && (
                  <li>
                    El estudiante tiene <strong>{editImpact.gradesCount}</strong> nota(s) registrada(s). Se conservarán
                    como histórico y <strong>no aparecerán en la boleta del nuevo grado</strong>.
                  </li>
                )}
                {editImpact.hasPaidObligations && (
                  <li>
                    Tiene <strong>{editImpact.paidObligationsCount}</strong> pago(s) realizado(s): esas obligaciones
                    <strong> no se eliminarán</strong>.
                  </li>
                )}
                {paymentRelevantChange && (
                  <li>
                    Se regenerará el cronograma de pagos para el nuevo nivel/año
                    (se eliminarán <strong>{editImpact.pendingObligationsCount}</strong> cuota(s) pendiente(s) y se crearán las nuevas).
                  </li>
                )}
              </ul>

              {editImpact.hasGrades && (
                <label className="flex items-center gap-2 mt-2 text-sm text-amber-900">
                  <input type="checkbox" checked={confirmedImpact}
                    onChange={(e) => { setConfirmedImpact(e.target.checked); if (errors.confirm) setErrors(prev => ({ ...prev, confirm: '' })) }}
                    className="w-4 h-4" />
                  Entiendo que las notas existentes se conservarán como histórico.
                </label>
              )}
              {errors.confirm && <p className="text-red-500 text-xs">{errors.confirm}</p>}
            </div>
          )}

          {/* Cronograma de pagos editable (sólo cuando cambia nivel o año) */}
          {paymentRelevantChange && (
            <PaymentScheduleTable
              paymentSchedule={paymentSchedule}
              formData={{ anoLectivo: anoLectivoValue }}
              handleScheduleAmountChange={handleScheduleAmountChange}
              handleScheduleDateChange={handleScheduleDateChange}
              handleScheduleExoneradoChange={handleScheduleExoneradoChange}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea name="observations" value={formData.observations} onChange={handleChange}
              className="input h-20 resize-none" placeholder="Observaciones adicionales..." />
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1" disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStudentModal
