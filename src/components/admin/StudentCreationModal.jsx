
import React, { useState, useEffect } from 'react'
import { X, User, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentsStore } from '../../stores/studentsStore'
import { usersService } from '../../services/usersService'

const StudentCreationModal = ({ isOpen, onClose }) => {
  const { createStudent } = useStudentsStore()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [parents, setParents] = useState([])
  const [searchParent, setSearchParent] = useState('')
  const [showParentDropdown, setShowParentDropdown] = useState(false)

  const [formData, setFormData] = useState({
    first_names: '',
    second_name: '', // Segundo nombre (guardado en last_names)
    apellidoPaterno: '',
    apellidoMaterno: '',
    tipoDocumento: 'DNI', // DNI o CE (Carnet de Extranjería)
    dni: '',
    codigoBarras: '',
    fechaNacimiento: '',
    sexo: 'M',
    direccion: '',
    telefono: '',
    // Padre/tutor seleccionado
    parent_id: null
  })


  // Cargar padres al abrir el modal y ordenarlos alfabéticamente por apellido
  useEffect(() => {
    const loadParents = async () => {
      if (isOpen) {
        try {
          const allParents = await usersService.getByRole('padre') || []
          // Ordenar alfabéticamente por apellidos
          const sortedParents = allParents.sort((a, b) => {
            const apellidoA = a.last_names || ''
            const apellidoB = b.last_names || ''
            return apellidoA.localeCompare(apellidoB)
          })
          setParents(sortedParents)
          setSearchParent('')
          setShowParentDropdown(false)
        } catch (error) {
          console.error('Error loading parents:', error)
          setParents([])
        }
      }
    }
    loadParents()
  }, [isOpen])

  // Actualizar el texto del search cuando se selecciona un padre
  useEffect(() => {
    if (formData.parent_id && parents.length > 0) {
      const parent = parents.find(p => p.id === formData.parent_id)
      if (parent) {
        setSearchParent(`${parent.first_name} ${parent.last_names} - DNI: ${parent.dni}`)
      }
    }
  }, [formData.parent_id, parents])

  // Filtrar padres según búsqueda (mínimo 2 caracteres)
  const filteredParents = parents.filter(parent => {
    if (!searchParent || searchParent.trim().length < 2) return false
    const searchLower = searchParent.toLowerCase()
    const fullName = `${parent.first_name} ${parent.last_names}`.toLowerCase()
    const dni = parent.dni || ''
    return fullName.includes(searchLower) || dni.includes(searchLower)
  })

  // Obtener nombre del padre seleccionado
  const getSelectedParentName = () => {
    if (!formData.parent_id) return ''
    const parent = parents.find(p => p.id === formData.parent_id)
    return parent ? `${parent.first_name} ${parent.last_names} - DNI: ${parent.dni}` : ''
  }

  // Manejar selección de padre
  const handleSelectParent = (parentId) => {
    const parent = parents.find(p => p.id === parentId)
    if (parent) {
      setSearchParent(`${parent.first_name} ${parent.last_names} - DNI: ${parent.dni}`)
      // Autocompletar la dirección del estudiante con la dirección del padre si existe
      setFormData(prev => ({
        ...prev,
        parent_id: parentId,
        direccion: parent.address || prev.direccion // Solo actualizar si el padre tiene dirección
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
      if (!formData.first_names || !formData.apellidoPaterno || !formData.dni || !formData.codigoBarras) {
        setError('Por favor complete todos los campos obligatorios del estudiante (Nombres, Apellido Paterno, DNI y Código de Barras)')
        return
      }

      // Validación obligatoria de padre/tutor
      if (!formData.parent_id) {
        setError('⚠️ Es obligatorio asignar un padre/tutor al estudiante.\n\nPor favor, busque y seleccione un padre/tutor existente en la sección "Padre/Tutor".')
        return
      }

      // Mapear datos del frontend al formato del backend
      const studentData = {
        // code será generado automáticamente por el backend en formato EST-{AÑO}-{SECUENCIA}
        barcode: formData.codigoBarras, // El barcode es el DNI del estudiante
        first_names: formData.first_names,
        last_names: formData.second_name || '', // Segundo nombre
        paternal_last_name: formData.apellidoPaterno,
        maternal_last_name: formData.apellidoMaterno || null,
        dni: formData.dni,
        document_type: formData.tipoDocumento,
        birth_date: formData.fechaNacimiento,
        gender: formData.sexo,
        address: formData.direccion || '', // Campo requerido en DB, usar string vacío si no hay valor
        phone: formData.telefono || null,
        parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null, // Asegurar que sea número o null
        status: 'active'
      }

      // Crear estudiante
      await createStudent(studentData)

      // Mostrar animación de éxito
      setShowSuccessAnimation(true)

      // Esperar 2 segundos para mostrar la animación, luego cerrar
      setTimeout(() => {
        setShowSuccessAnimation(false)
        onClose()

        // Reset form después de cerrar
        setFormData({
          first_names: '',
          second_name: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          tipoDocumento: 'DNI',
          dni: '',
          codigoBarras: '',
          fechaNacimiento: '',
          sexo: 'M',
          direccion: '',
          telefono: '',
          parent_id: null
        })
        setError('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al crear el estudiante')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Estudiante</h2>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form con scroll */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Contenido con scroll */}
            <div className="p-6 overflow-y-auto flex-1">
            {/* Alerts */}
            {error && (
              <div className="flex items-start p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
                <span className="text-sm text-green-700">¡Estudiante creado exitosamente!</span>
              </div>
            )}

            {/* Datos del Estudiante */}
            <div className="mb-6">
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <User className="mr-2" size={20} />
                Datos del Estudiante
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">
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
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Apellido Paterno *
                  </label>
                  <input
                    type="text"
                    name="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    placeholder="Ej: García"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    name="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: López"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Tipo de Documento *
                  </label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {formData.tipoDocumento === 'DNI' ? 'DNI *' : 'Carnet de Extranjería *'}
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={(e) => {
                      const value = e.target.value
                      // Para DNI: solo números, máx 8
                      // Para CE: alfanumérico, máx 12
                      if (formData.tipoDocumento === 'DNI') {
                        const cleanValue = value.replace(/\D/g, '').slice(0, 8)
                        // Actualizar DNI y código de barras simultáneamente
                        setFormData(prev => ({ ...prev, dni: cleanValue, codigoBarras: cleanValue }))
                      } else {
                        const cleanValue = value.toUpperCase().slice(0, 12)
                        // Actualizar DNI y código de barras simultáneamente
                        setFormData(prev => ({ ...prev, dni: cleanValue, codigoBarras: cleanValue }))
                      }
                    }}
                    maxLength={formData.tipoDocumento === 'DNI' ? '8' : '12'}
                    placeholder={formData.tipoDocumento === 'DNI' ? '12345678' : 'ABC123456'}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.tipoDocumento === 'DNI'
                      ? '8 dígitos numéricos'
                      : 'Hasta 12 caracteres alfanuméricos'}
                  </p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Código de Barras (Generado automáticamente)
                  </label>
                  <input
                    type="text"
                    name="codigoBarras"
                    value={formData.codigoBarras}
                    readOnly
                    className="w-full px-3 py-2 font-mono text-gray-700 border rounded-lg cursor-not-allowed bg-gray-50"
                    placeholder="Se generará automáticamente con el DNI"
                  />
                  <p className="mt-1 text-xs text-blue-600">El código de barras se genera automáticamente usando el número de DNI</p>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Sexo *
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>


            {/* Selección de Padre/Tutor */}
            <div className="mb-6">
              <h3 className="flex items-center mb-4 text-lg font-semibold">
                <Users className="mr-2" size={20} />
                Padre/Tutor <span className="ml-1 text-red-600">*</span>
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
                      disabled={formData.parent_id !== null}
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
                      <p className="text-sm text-amber-600">
                        ⚠️ Debes escribir el nombre, apellido o DNI del padre para buscarlo y seleccionarlo
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Footer fijo con botones */}
            <div className="flex justify-end px-6 py-4 space-x-3 border-t bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Crear Estudiante
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
                  El estudiante ha sido creado correctamente
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}

export default StudentCreationModal