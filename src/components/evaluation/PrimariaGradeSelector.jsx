import React from 'react'
import { motion } from 'framer-motion'
import { Users, CheckSquare, Layers, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * Selector especial para grados de Primaria
 * Permite elegir: aplicar a todos los grados o seleccionar específicos
 */
const PrimariaGradeSelector = ({
  applyToAllGrades,
  setApplyToAllGrades,
  selectedGrades,
  setSelectedGrades,
  filteredGrades
}) => {
  return (
    <div className="md:col-span-2">
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-3 border-purple-400 rounded-xl p-6 shadow-lg">
        {/* Header de la sección */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-purple-200">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-purple-900">
              Configuración para Primaria
            </h4>
            <p className="text-sm text-purple-700">
              Elige cómo aplicar esta rúbrica a los grados de primaria
            </p>
          </div>
        </div>

        {/* Opción 1: Aplicar a todos */}
        <div
          className={`mb-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            applyToAllGrades
              ? 'bg-purple-100 border-purple-500 shadow-md'
              : 'bg-white border-gray-300 hover:border-purple-300'
          }`}
          onClick={() => {
            setApplyToAllGrades(true)
            setSelectedGrades([])
          }}
        >
          <div className="flex items-start gap-3">
            <div className="pt-1">
              <input
                type="radio"
                id="applyToAllGrades"
                name="primarySelection"
                checked={applyToAllGrades}
                onChange={() => {
                  setApplyToAllGrades(true)
                  setSelectedGrades([])
                }}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="applyToAllGrades" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-base font-bold text-purple-900">
                    Aplicar a TODOS los grados de Primaria
                  </span>
                </div>
                <p className="text-sm text-purple-700 ml-7">
                  La rúbrica se creará automáticamente para 1°, 2°, 3°, 4°, 5° y 6° grado de primaria
                </p>
                {applyToAllGrades && (
                  <div className="mt-3 ml-7 p-3 bg-white rounded-md border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Se crearán 6 rúbricas (una por cada grado)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Opción 2: Selección manual */}
        <div
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            !applyToAllGrades
              ? 'bg-purple-100 border-purple-500 shadow-md'
              : 'bg-white border-gray-300 hover:border-purple-300'
          }`}
          onClick={() => setApplyToAllGrades(false)}
        >
          <div className="flex items-start gap-3">
            <div className="pt-1">
              <input
                type="radio"
                id="applyToSelectedGrades"
                name="primarySelection"
                checked={!applyToAllGrades}
                onChange={() => setApplyToAllGrades(false)}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="applyToSelectedGrades" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-5 w-5 text-purple-600" />
                  <span className="text-base font-bold text-purple-900">
                    Seleccionar grados específicos
                  </span>
                </div>
                <p className="text-sm text-purple-700 ml-7 mb-3">
                  Marca solo los grados donde quieres aplicar esta rúbrica
                </p>
              </label>

              {/* Grid de checkboxes - solo visible si esta opción está activa */}
              {!applyToAllGrades && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="ml-7 mt-4 p-4 bg-white rounded-lg border-2 border-purple-200"
                >
                  <p className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Selecciona al menos un grado:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredGrades
                      ?.sort((a, b) => a.name.localeCompare(b.name))
                      .map(grade => (
                        <label
                          key={grade.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedGrades.includes(grade.id)
                              ? 'bg-purple-50 border-purple-400 shadow-sm'
                              : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`grade-${grade.id}`}
                            checked={selectedGrades.includes(grade.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGrades([...selectedGrades, grade.id])
                              } else {
                                setSelectedGrades(selectedGrades.filter(id => id !== grade.id))
                              }
                            }}
                            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                          />
                          <span className={`text-sm font-medium ${
                            selectedGrades.includes(grade.id)
                              ? 'text-purple-900'
                              : 'text-gray-700'
                          }`}>
                            {grade.name}
                          </span>
                        </label>
                      ))}
                  </div>
                  {selectedGrades.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-md border border-purple-200">
                      <p className="text-xs font-semibold text-purple-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Se crearán {selectedGrades.length} rúbrica(s) para los grados seleccionados
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrimariaGradeSelector
