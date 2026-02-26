import { AGE_LIMITS } from '../config/enrollmentConstants'

/**
 * Valida el formulario de solicitud de matrícula
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Objeto con errores de validación (vacío si no hay errores)
 */
export const validateEnrollmentForm = (formData) => {
  const errors = {}

  // Validar nombres
  if (!formData.first_names.trim()) {
    errors.first_names = 'Nombres son requeridos'
  }

  // Validar apellidos
  if (!formData.last_names.trim()) {
    errors.last_names = 'Apellidos son requeridos'
  }

  // Validar DNI (8 dígitos)
  if (!/^\d{8}$/.test(formData.dni)) {
    errors.dni = 'DNI debe tener 8 dígitos'
  }

  // Validar fecha de nacimiento
  if (!formData.fechaNacimiento) {
    errors.fechaNacimiento = 'Fecha de nacimiento es requerida'
  } else {
    // Validar edad
    const birthDate = new Date(formData.fechaNacimiento)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    if (age < AGE_LIMITS.MIN || age > AGE_LIMITS.MAX) {
      errors.fechaNacimiento = `La edad debe estar entre ${AGE_LIMITS.MIN} y ${AGE_LIMITS.MAX} años`
    }
  }

  // Validar género
  if (!formData.genero) {
    errors.genero = 'Género es requerido'
  }

  // Validar dirección
  if (!formData.direccion.trim()) {
    errors.direccion = 'Dirección es requerida'
  }

  // Validar nivel académico
  if (!formData.nivel) {
    errors.nivel = 'Nivel es requerido'
  }

  // Validar grado
  if (!formData.grado) {
    errors.grado = 'Grado es requerido'
  }

  // Validar sección
  if (!formData.seccion) {
    errors.seccion = 'Sección es requerida'
  }

  return errors
}
