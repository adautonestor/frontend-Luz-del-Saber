import React, { useState } from 'react'
import { X, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal completo para crear/editar conceptos de pago
 * Incluye todos los campos avanzados: descripción, tipo, niveles,
 * estudiantes específicos, exclusión de padres, fechas, etc.
 */
const PaymentConceptModal = ({
  isOpen,
  isEditing,
  conceptForm,
  onFormChange,
  onClose,
  onSubmit,
  estudiantes = [],
  levels = [],
  onNivelChange,
  onMesChange,
  onEstudianteExcluidoChange,
  showSuccessAnimation,
  showErrorAnimation,
  successMessage,
  errorMessage
}) => {
  const [searchEstudiantes, setSearchEstudiantes] = useState('')

  if (!isOpen) return null

  const mesesEscolares = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const handleSelectAllMeses = () => {
    const allSelected = mesesEscolares.every(mes => conceptForm.applicable_months?.includes(mes))
    const newMeses = allSelected ? [] : [...mesesEscolares]
    onFormChange('applicable_months', newMeses)
  }

  const filteredEstudiantes = estudiantes.filter(estudiante => {
    const searchLower = searchEstudiantes.toLowerCase()
    return searchLower === '' ||
           estudiante.first_names?.toLowerCase().includes(searchLower) ||
           estudiante.last_names?.toLowerCase().includes(searchLower) ||
           estudiante.code?.toLowerCase().includes(searchLower) ||
           estudiante.dni?.includes(searchLower)
  })

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar Concepto' : 'Nuevo Concepto de Pago'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Nombre y Monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Concepto *
              </label>
              <input
                type="text"
                value={conceptForm.name || ''}
                onChange={(e) => onFormChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Pensión, Matrícula"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto (S/.) *
              </label>
              <input
                type="number"
                step="0.01"
                value={conceptForm.amount || ''}
                onChange={(e) => onFormChange('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={conceptForm.description || ''}
              onChange={(e) => onFormChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows="2"
              placeholder="Descripción del concepto..."
            />
          </div>

          {/* Tipo de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Pago *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="unico"
                    checked={conceptForm.type === 'unico'}
                    onChange={(e) => onFormChange('type', e.target.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Pago Único</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Para conceptos que se pagan una sola vez (matrícula, uniformes, libros, materiales, seguro)
                    </div>
                  </div>
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="mensualidad"
                    checked={conceptForm.type === 'mensualidad'}
                    onChange={(e) => onFormChange('type', e.target.value)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Pago Recurrente</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Para conceptos que se cobran mensualmente (pensión, fondo de ahorro, alimentación)
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Niveles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveles Aplicables *
            </label>
            {levels.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {levels
                  .filter(level => level.status === 'active')
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  // Eliminar duplicados por nombre (mantener el primero de cada nombre)
                  .filter((level, index, self) =>
                    index === self.findIndex(l => l.name.toLowerCase() === level.name.toLowerCase())
                  )
                  .map(level => (
                    <label key={level.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conceptForm.levels?.includes(level.name.toLowerCase()) || false}
                        onChange={() => onNivelChange(level.name.toLowerCase())}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{level.name}</span>
                    </label>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Cargando niveles...
              </div>
            )}
          </div>

          {/* Aplicar a estudiantes específicos */}
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿A quién aplicar este concepto?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aplicarA"
                  value="todos"
                  checked={conceptForm.aplicarA === 'todos'}
                  onChange={(e) => {
                    onFormChange('aplicarA', e.target.value)
                    onFormChange('specific_students', [])
                  }}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Todos los estudiantes de los niveles seleccionados</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aplicarA"
                  value="estudiantes"
                  checked={conceptForm.aplicarA === 'estudiantes'}
                  onChange={(e) => onFormChange('aplicarA', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Solo estudiantes específicos</span>
              </label>
            </div>

            {/* Selector de estudiantes específicos */}
            {conceptForm.aplicarA === 'estudiantes' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Estudiantes ({conceptForm.specific_students?.length || 0} seleccionados)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                  {estudiantes.map(est => (
                    <label key={est.id} className="flex items-center py-1 hover:bg-gray-50 px-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conceptForm.specific_students?.includes(est.id) || false}
                        onChange={(e) => {
                          const currentList = conceptForm.specific_students || []
                          const newList = e.target.checked
                            ? [...currentList, est.id]
                            : currentList.filter(id => id !== est.id)
                          onFormChange('specific_students', newList)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {est.paternal_last_name || ''} {est.maternal_last_name || ''}, {est.first_names}{est.last_names ? ` ${est.last_names}` : ''} - {est.grado || 'Sin grado'} ({est.dni})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuración para Pago Recurrente */}
          {conceptForm.type === 'mensualidad' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Meses de Aplicación *
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllMeses}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                  >
                    {mesesEscolares.every(mes => conceptForm.applicable_months?.includes(mes))
                      ? 'Deseleccionar todo'
                      : 'Seleccionar todo'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {mesesEscolares.map(mes => (
                    <label key={mes} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={conceptForm.applicable_months?.includes(mes) || false}
                        onChange={() => onMesChange(mes)}
                        className="mr-2"
                      />
                      <span className="text-sm">{mes}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de Vencimiento
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={conceptForm.due_day || 30}
                  onChange={(e) => onFormChange('due_day', parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Día del mes en que vence el pago</p>
              </div>
            </>
          )}

          {/* Configuración para Pago Único */}
          {conceptForm.type === 'unico' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Pago Único *
              </label>
              <input
                type="date"
                value={conceptForm.unique_payment_date || ''}
                onChange={(e) => onFormChange('unique_payment_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Excluir Estudiantes Específicos */}
          {(conceptForm.type === 'unico' || conceptForm.type === 'mensualidad') && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Excluir Estudiantes Específicos (Opcional)
                </label>
                <span className="text-xs text-gray-500">
                  {conceptForm.excluded_students?.length || 0} excluidos
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Selecciona los estudiantes que NO deben pagar este concepto. Quedarán exentos.
              </p>

              {/* Buscador de estudiantes */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre, código o DNI..."
                  value={searchEstudiantes}
                  onChange={(e) => setSearchEstudiantes(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Lista de estudiantes con checkbox */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white">
                {filteredEstudiantes.map(estudiante => (
                  <label
                    key={estudiante.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={conceptForm.excluded_students?.includes(estudiante.id) || false}
                      onChange={() => onEstudianteExcluidoChange(estudiante.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {estudiante.paternal_last_name || ''} {estudiante.maternal_last_name || ''}, {estudiante.first_names || ''}{estudiante.last_names ? ` ${estudiante.last_names}` : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        Código: {estudiante.code || 'N/A'} • DNI: {estudiante.dni || 'N/A'}
                      </div>
                    </div>
                  </label>
                ))}
                {filteredEstudiantes.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No se encontraron estudiantes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={conceptForm.status || 'active'}
              onChange={(e) => onFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? 'Actualizar' : 'Crear'} Concepto
          </button>
        </div>

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
                  {successMessage || '¡Concepto guardado exitosamente!'}
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
      </div>
    </div>
  )
}

export default PaymentConceptModal
