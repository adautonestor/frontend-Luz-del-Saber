import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

const UserFormModal = ({
  isOpen,
  editingUser,
  formData,
  setFormData,
  currentUser,
  roles = [],
  showPassword,
  togglePasswordVisibility,
  onSubmit,
  onClose,
  isSubmitting,
  showSuccessAnimation = false,
  showErrorAnimation = false,
  successMessage = '',
  errorMessage = ''
}) => {
  if (!isOpen) return null

  // Mapeo de roles de la BD al formato del frontend - CORREGIDO según DB real
  const roleMapping = {
    'Director': 'director',
    'Profesor': 'profesor',
    'Padre': 'padre',
    'Secretaria': 'secretaria'
  }

  // Filtrar roles disponibles según el usuario actual - CORREGIDO
  const getAvailableRoles = () => {
    if (!currentUser || !currentUser.rol) return []

    const availableRoles = []

    // Nota: currentUser.rol ahora mantiene la capitalización correcta de la DB
    if (currentUser.rol === 'Director') {
      // Director puede crear: Todos los roles incluyendo otro Director
      availableRoles.push('director', 'secretaria', 'profesor', 'padre')
    } else if (currentUser.rol === 'Secretaria') {
      // Secretaria puede crear: Profesor, Padre
      availableRoles.push('profesor', 'padre')
    } else if (currentUser.rol === 'Profesor') {
      // Profesor no puede crear usuarios (o solo puede crear Padre si se requiere)
      availableRoles.push('padre')
    }

    // Filtrar roles de la API según los disponibles
    return roles
      .filter(role => {
        const mappedRole = roleMapping[role.name]
        return availableRoles.includes(mappedRole)
      })
      .map(role => ({
        value: roleMapping[role.name],
        label: role.name
      }))
  }

  const availableRoles = getAvailableRoles()

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-40"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      ></div>

      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg max-w-md w-full flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Contenido con scroll */}
              <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="label">Nombres</label>
                <input
                  type="text"
                  className="input"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Apellidos</label>
                <input
                  type="text"
                  className="input"
                  value={formData.last_names}
                  onChange={(e) => setFormData({ ...formData, last_names: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Email (Opcional)</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Se generará automáticamente si no se proporciona"
                />
              </div>

              <div>
                <label className="label">Rol</label>
                <select
                  className="input"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value, relationship: e.target.value === 'padre' ? formData.relationship : '' })}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.rol === 'padre' && (
                <div>
                  <label className="label">Tipo de Documento</label>
                  <select
                    className="input"
                    value={formData.document_type}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value, dni: '' })}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>
              )}

              <div>
                <label className="label">
                  {formData.rol === 'padre' && formData.document_type === 'CE'
                    ? 'Carnet de Extranjería'
                    : 'DNI'}
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.dni}
                  onChange={(e) => {
                    let value = e.target.value
                    if (formData.rol === 'padre' && formData.document_type === 'CE') {
                      const cleanValue = value.toUpperCase().slice(0, 12)
                      setFormData({ ...formData, dni: cleanValue, password: cleanValue })
                    } else {
                      const cleanValue = value.replace(/\D/g, '').slice(0, 8)
                      setFormData({ ...formData, dni: cleanValue, password: cleanValue })
                    }
                  }}
                  maxLength={formData.rol === 'padre' && formData.document_type === 'CE' ? '12' : '8'}
                  placeholder={formData.rol === 'padre' && formData.document_type === 'CE' ? 'ABC123456' : '12345678'}
                  required
                />
                {formData.rol === 'padre' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.document_type === 'DNI'
                      ? '8 dígitos numéricos'
                      : 'Hasta 12 caracteres alfanuméricos'}
                  </p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label className="label">
                    Contraseña automática por {formData.rol === 'padre' && formData.document_type === 'CE' ? 'documento' : 'DNI'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.form ? 'text' : 'password'}
                      className="input pr-10 bg-gray-50"
                      value={formData.dni}
                      readOnly
                      placeholder="Se generará automáticamente con el documento"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword.form ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    La contraseña será el mismo número de documento ingresado
                  </p>
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="label">Cambiar Contraseña (Opcional)</label>
                  <div className="relative">
                    <input
                      type={showPassword.form ? 'text' : 'password'}
                      className="input pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Dejar en blanco para mantener"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('form')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword.form ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Solo completa si deseas cambiar la contraseña
                  </p>
                </div>
              )}

              {formData.rol === 'padre' && (
                <div>
                  <label className="label">Parentesco</label>
                  <select
                    className="input"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar parentesco</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="abuelo">Abuelo</option>
                    <option value="abuela">Abuela</option>
                    <option value="tio">Tío</option>
                    <option value="tia">Tía</option>
                    <option value="tutor_legal">Tutor Legal</option>
                    <option value="hermano_mayor">Hermano Mayor</option>
                    <option value="hermana_mayor">Hermana Mayor</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              )}

              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '').slice(0, 9)
                    if (value.length > 0 && !value.startsWith('9')) {
                      value = '9' + value.slice(0, 8)
                    }
                    setFormData({ ...formData, phone: value })
                  }}
                  pattern="9[0-9]{8}"
                  maxLength="9"
                  placeholder="Ej: 987654321"
                  title="Debe empezar con 9 y tener exactamente 9 dígitos"
                />
                {formData.phone && formData.phone.length > 0 && (
                  formData.phone.length !== 9 || !formData.phone.startsWith('9')
                ) && (
                  <p className="text-sm text-red-600 mt-1">
                    El teléfono debe empezar con 9 y tener exactamente 9 dígitos
                  </p>
                )}
              </div>

              <div>
                <label className="label">Dirección</label>
                <input
                  type="text"
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Estado</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              </div>

              {/* Footer fijo con botones */}
              <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0 flex justify-end gap-4 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline px-4 py-2"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 flex items-center gap-2"
                  disabled={isSubmitting}
                  style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>{editingUser ? 'Actualizar' : 'Crear'} Usuario</>
                  )}
                </button>
              </div>
            </form>

            {/* Animación de éxito */}
            <AnimatePresence>
              {showSuccessAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-[100]"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      duration: 0.6
                    }}
                    className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border-2 border-green-200"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="bg-green-100 rounded-full p-6 mb-4"
                    >
                      <CheckCircle size={64} className="text-green-600" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      ¡Éxito!
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600 text-center"
                    >
                      {successMessage || '¡Usuario guardado exitosamente!'}
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animación de error */}
            <AnimatePresence>
              {showErrorAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-[100]"
                >
                  <motion.div
                    initial={{ scale: 0.5, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      duration: 0.6
                    }}
                    className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl max-w-md border-2 border-red-200"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                      className="bg-red-100 rounded-full p-6 mb-4"
                    >
                      <XCircle size={64} className="text-red-600" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      Error
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600 text-center"
                    >
                      {errorMessage || 'Ocurrió un error al guardar'}
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default UserFormModal
