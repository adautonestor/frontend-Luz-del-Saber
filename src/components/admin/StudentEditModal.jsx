import React, { useState, useEffect } from 'react'
import { X, User, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentsStore } from '../../stores/studentsStore'
import { usersService } from '../../services/usersService'
import studentsService from '../../services/studentsService'
const StudentEditModal = ({ isOpen, onClose, student }) => {
  const { updateStudent } = useStudentsStore()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [parents, setParents] = useState([])
  const [searchParent, setSearchParent] = useState('')
  const [showParentDropdown, setShowParentDropdown] = useState(false)

  const [formData, setFormData] = useState({
    first_names: '',
    second_name: '', // Segundo nombre (guardado en last_names)
    paternal_last_name: '',
    maternal_last_name: '',
    document_type: 'DNI', // DNI o CE (Carnet de Extranjería)
    dni: '',
    barcode: '',
    birth_date: '',
    gender: 'M',
    address: '',
    phone: '',
    parent_id: null // Se usará temporalmente para el UI, luego se convierte a parents JSON
  })

  // Cargar datos del estudiante cuando se abre el modal
  useEffect(() => {
    const loadData = async () => {
      if (isOpen && student) {
        // Detectar tipo de documento basado en el formato del DNI
        const documentType = student.document_type || (student.dni && /^[0-9]{8}$/.test(student.dni) ? 'DNI' : 'CE')

        // Extraer parent_id del campo parents (JSON)
        let parentId = null
        if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
          const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
          parentId = primaryParent.user_id || null
        }

        // Formatear fecha de nacimiento para input type="date" (YYYY-MM-DD)
        let birthDate = ''
        if (student.birth_date) {
          const date = new Date(student.birth_date)
          birthDate = date.toISOString().split('T')[0]
        }

        setFormData({
          first_names: student.first_names || '',
          second_name: student.last_names || '', // Segundo nombre viene de last_names
          paternal_last_name: student.paternal_last_name || '',
          maternal_last_name: student.maternal_last_name || '',
          document_type: documentType,
          dni: student.dni || '',
          barcode: student.barcode || '',
          birth_date: birthDate,
          gender: student.gender || 'M',
          address: student.address || '',
          phone: student.phone || '',
          parent_id: parentId
        })

        try {
          // Cargar lista de padres y ordenar alfabéticamente
          const users = await usersService.getAll() || []
          const allParents = users.filter(u => u.rol === 'Padre')
          const sortedParents = allParents.sort((a, b) => {
            const apellidoA = (a.last_names || '')
            const apellidoB = (b.last_names || '')
            return apellidoA.localeCompare(apellidoB)
          })
          setParents(sortedParents)

          // Establecer el texto de búsqueda con el padre actual
          // Recordar: parentId ya fue extraído del campo parents JSON arriba
          if (parentId) {
            const parent = sortedParents.find(p => p.id === parseInt(parentId))
            if (parent) {
              const fullName = `${parent.first_name || ''} ${parent.last_names || ''}`.trim()
              setSearchParent(`${fullName} - DNI: ${parent.dni}`)
            }
          } else {
            setSearchParent('')
          }
          setShowParentDropdown(false)
        } catch (error) {
          console.error('Error loading parents:', error)
          setParents([])
        }
      }
    }
    loadData()
  }, [isOpen, student])

  // Filtrar padres según búsqueda (mínimo 2 caracteres)
  const filteredParents = parents.filter(parent => {
    if (!searchParent || searchParent.trim().length < 2) return false
    const searchLower = searchParent.toLowerCase()
    const fullName = `${parent.first_name || ''} ${parent.last_names || ''}`.toLowerCase()
    const dni = parent.dni || ''
    return fullName.includes(searchLower) || dni.includes(searchLower)
  })

  // Obtener nombre del padre seleccionado
  const getSelectedParentName = () => {
    if (!formData.parent_id) return ''
    const parent = parents.find(p => p.id === formData.parent_id)
    if (!parent) return ''
    const fullName = `${parent.first_name || ''} ${parent.last_names || ''}`.trim()
    return `${fullName} - DNI: ${parent.dni}`
  }

  // Manejar selección de padre
  const handleSelectParent = (parentId) => {
    const parent = parents.find(p => p.id === parentId)
    if (parent) {
      const fullName = `${parent.first_name || ''} ${parent.last_names || ''}`.trim()
      setSearchParent(`${fullName} - DNI: ${parent.dni}`)
      // Autocompletar la dirección del estudiante con la dirección del padre si existe
      setFormData(prev => ({
        ...prev,
        parent_id: parentId,
        address: parent.address || prev.address // Solo actualizar si el padre tiene dirección
      }))
    } else {
      setFormData(prev => ({ ...prev, parent_id: parentId }))
    }
    setShowParentDropdown(false)
  }

  // Limpiar selección de padre
  const handleClearParent = async () => {
    setFormData(prev => ({ ...prev, parent_id: null }))
    setSearchParent('')
  }

  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    try {
      // Validaciones básicas
      if (!formData.first_names || !formData.paternal_last_name || !formData.dni) {
        setError('Por favor complete todos los campos obligatorios (Nombres, Apellido Paterno y DNI)')
        return
      }

      // Validar que el DNI no esté duplicado (excepto el estudiante actual)
      const students = await studentsService.getAll() || []
      const dniExists = students.some(s => s.dni === formData.dni && s.id !== student.id)
      if (dniExists) {
        setError('Ya existe otro estudiante con este DNI')
        return
      }

      // Preparar datos para enviar al backend
      // El backend espera los nombres de campos de la DB
      const dataToSend = {
        first_names: formData.first_names,
        last_names: formData.second_name || '', // Segundo nombre
        paternal_last_name: formData.paternal_last_name,
        maternal_last_name: formData.maternal_last_name,
        dni: formData.dni,
        document_type: formData.document_type,
        barcode: formData.barcode,
        birth_date: formData.birth_date,
        gender: formData.gender,
        address: formData.address,
        phone: formData.phone,
        parent_id: formData.parent_id // El backend lo convertirá a JSON parents
      }

      // Actualizar estudiante
      await updateStudent(student.id, dataToSend)

      // Mostrar animación de éxito
      setShowSuccessAnimation(true)

      // Esperar 2 segundos para mostrar la animación, luego cerrar
      setTimeout(() => {
        setShowSuccessAnimation(false)
        onClose()
        setSuccess(false)
        setError('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al actualizar el estudiante')
    }
  }

  if (!isOpen || !student) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Estudiante</h2>
              <p className="text-sm text-gray-500 mt-1">
                {student.first_names} {student.last_names}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Alerts */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">¡Estudiante actualizado exitosamente!</span>
              </div>
            )}

            {/* Datos del Estudiante */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Datos del Estudiante
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    name="first_names"
                    value={formData.first_names}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Ej: Juan Carlos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segundo Nombre
                  </label>
                  <input
                    type="text"
                    name="second_name"
                    value={formData.second_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Miguel (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    name="paternal_last_name"
                    value={formData.paternal_last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Ej: García"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="maternal_last_name"
                    value={formData.maternal_last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: López"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.document_type === 'DNI' ? 'DNI *' : 'Carnet de Extranjería *'}
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={(e) => {
                      const value = e.target.value
                      // Para DNI: solo números, máx 8
                      // Para CE: alfanumérico, máx 12
                      if (formData.document_type === 'DNI') {
                        const cleanValue = value.replace(/\D/g, '').slice(0, 8)
                        setFormData(prev => ({ ...prev, dni: cleanValue, barcode: cleanValue }))
                      } else {
                        const cleanValue = value.toUpperCase().slice(0, 12)
                        setFormData(prev => ({ ...prev, dni: cleanValue, barcode: cleanValue }))
                      }
                    }}
                    maxLength={formData.document_type === 'DNI' ? '8' : '12'}
                    placeholder={formData.document_type === 'DNI' ? '12345678' : 'ABC123456'}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.document_type === 'DNI'
                      ? '8 dígitos numéricos'
                      : 'Hasta 12 caracteres alfanuméricos'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 font-mono cursor-not-allowed"
                    placeholder="Se genera automáticamente del DNI"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se genera automáticamente a partir del DNI</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexo *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Selección de Padre/Tutor */}
            <div className="mb-6">
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <Users className="mr-2" size={20} />
                Padre/Tutor
              </h3>
              <p className="mb-3 text-sm text-gray-600">
                <strong>Importante:</strong> Escribe al menos 2 letras del nombre, apellido o DNI del padre para buscarlo en el sistema
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Buscar Padre/Tutor
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchParent}
                      onChange={(e) => {
                        setSearchParent(e.target.value)
                        if (e.target.value.trim().length >= 2) {
                          setShowParentDropdown(true)
                        } else {
                          setShowParentDropdown(false)
                        }
                      }}
                      onFocus={(e) => {
                        if (e.target.value.trim().length >= 2) {
                          setShowParentDropdown(true)
                        }
                      }}
                      placeholder="Escribe al menos 2 letras para buscar..."
                      className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={!!formData.parent_id}
                    />
                    {formData.parent_id && (
                      <button
                        type="button"
                        onClick={handleClearParent}
                        className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2 hover:text-gray-600"
                        title="Cambiar padre/tutor"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown de resultados */}
                  {showParentDropdown && searchParent.trim().length >= 2 && (
                    <>
                      {/* Overlay para cerrar el dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowParentDropdown(false)}
                      />

                      {/* Lista de padres */}
                      <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-60">
                        {filteredParents.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-center text-gray-500">
                            <p className="font-medium">No se encontraron resultados</p>
                            <p className="mt-1 text-xs">Intenta buscar por apellido, nombre o DNI</p>
                          </div>
                        ) : (
                          <>
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                              {filteredParents.length} {filteredParents.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                            </div>
                            {filteredParents.map((parent) => (
                              <button
                                key={parent.id}
                                type="button"
                                onClick={() => handleSelectParent(parent.id)}
                                className={`w-full px-3 py-2 text-left hover:bg-primary-50 transition-colors border-b last:border-b-0 ${
                                  formData.parent_id === parent.id ? 'bg-primary-100 border-l-4 border-l-primary-500' : ''
                                }`}
                              >
                                <div className="font-medium text-gray-900">
                                  {parent.last_names}, {parent.first_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  DNI: {parent.dni}
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* Mensajes de ayuda */}
                  <div className="mt-2">
                    {formData.parent_id ? (
                      <div className="flex items-start p-2 text-sm bg-green-50 border border-green-200 rounded">
                        <span className="text-green-600 font-medium">✓ Padre asignado:</span>
                        <span className="ml-1 text-green-700">{getSelectedParentName()}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Busca y selecciona un padre/tutor registrado en el sistema
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional (solo lectura) */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Académica (Solo lectura)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Código:</span>
                  <p className="font-mono font-medium text-gray-900">{student.code}</p>
                </div>
                <div>
                  <span className="text-gray-600">Nivel:</span>
                  <p className="font-medium text-gray-900 capitalize">{student.level_name || student.nivel || 'No asignado'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Grado/Sección:</span>
                  <p className="font-medium text-gray-900">
                    {(student.grade_name || student.grado) && (student.section_name || student.seccion) ? `${student.grade_name || student.grado} ${student.section_name || student.seccion}` : 'No asignado'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * La información académica (nivel, grado, sección) se actualiza desde el módulo de Matrículas
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>

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
                  El estudiante ha sido actualizado correctamente
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}

export default StudentEditModal
