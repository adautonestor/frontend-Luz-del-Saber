import React, { useState, useEffect, useRef } from 'react'
import { AlertCircle, Check, MessageSquare, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'

// Convierte color hexadecimal a clases de Tailwind
const getColorClass = (hexColor) => {
  const colorMap = {
    '#22c55e': 'text-green-600 bg-green-50',
    '#3b82f6': 'text-blue-600 bg-blue-50',
    '#eab308': 'text-yellow-600 bg-yellow-50',
    '#ef4444': 'text-red-600 bg-red-50'
  }
  return colorMap[hexColor?.toLowerCase()] || 'text-gray-600 bg-gray-50'
}

const ExcelGradeCell = ({
  studentId,
  evalTypeId,
  value = '',
  onChange,
  onNavigate,
  autoFocus = false,
  disabled = false,
  gradingMode = 'numeric', // 'numeric' (0-20) o 'literal' (A/B/C/D)
  literalGradeOptions = null // Opciones dinámicas desde useGradingScales (opcional)
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [grades, setGrades] = useState([])
  const [average, setAverage] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [comment, setComment] = useState('')
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentError, setCommentError] = useState(false)
  const [userHasEdited, setUserHasEdited] = useState(false)
  const inputRef = useRef(null)
  const cellRef = useRef(null)

  // Opciones de calificación literal - usa las dinámicas si se proporcionan
  // Valores por defecto consistentes con la configuración central (A=4, B=3, C=2, D=1)
  const DEFAULT_LITERAL_GRADES = [
    { value: 'A', label: 'A', description: 'A - Logro destacado (4)', numeric: 4, color: 'text-green-600 bg-green-50' },
    { value: 'B', label: 'B', description: 'B - Logro esperado (3)', numeric: 3, color: 'text-blue-600 bg-blue-50' },
    { value: 'C', label: 'C', description: 'C - En proceso (2)', numeric: 2, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'D', label: 'D', description: 'D - En inicio (1)', numeric: 1, color: 'text-red-600 bg-red-50' }
  ]

  // Usar opciones dinámicas si se proporcionan, sino usar defaults
  const LITERAL_GRADES = literalGradeOptions?.length > 0
    ? literalGradeOptions.map(opt => ({
        value: opt.value,
        label: opt.value,
        description: `${opt.value} - ${opt.label} (${opt.numericValue})`,
        numeric: opt.numericValue,
        color: getColorClass(opt.color)
      }))
    : DEFAULT_LITERAL_GRADES

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      if (typeof value === 'object' && value.grades) {
        setGrades(value.grades)
        setAverage(value.average)
        setComment(value.comment || '')
        setInputValue(value.grades.join(', '))
      } else if (typeof value === 'string') {
        // ✅ CORREGIDO: Detectar si es calificación literal usando opciones dinámicas
        const upperValue = value.trim().toUpperCase()
        // Obtener lista de valores válidos de LITERAL_GRADES (puede ser personalizada: AA, BB, etc.)
        const validLiteralValues = LITERAL_GRADES.map(g => g.value.toUpperCase())
        if (gradingMode === 'literal' && validLiteralValues.includes(upperValue)) {
          // Es una calificación literal - guardarla directamente
          setGrades([upperValue])
          // Buscar el valor numérico correspondiente
          const literalGrade = LITERAL_GRADES.find(g => g.value.toUpperCase() === upperValue)
          setAverage(literalGrade ? literalGrade.numeric : null)
          setInputValue(upperValue)
        } else {
          // Es una calificación numérica - parsear como antes
          const parsedGrades = parseGrades(value)
          setGrades(parsedGrades)
          setAverage(calculateAverage(parsedGrades))
          setInputValue(value)
        }
      } else if (typeof value === 'number') {
        setGrades([value])
        setAverage(value)
        setInputValue(value.toString())
      }
    }
  }, [value, gradingMode])

  // Función para parsear diferentes formatos de entrada
  const parseGrades = (input) => {
    if (!input || input.trim() === '') return []

    // Remover caracteres no válidos (solo permitir números, espacios, comas, puntos)
    const cleaned = input
      .trim()
      .replace(/[^0-9.,\s\-]/g, '')  // Remover todo excepto números, puntos, comas, espacios y guiones

    // Remover espacios extras y convertir diferentes separadores a comas
    const normalized = cleaned
      .replace(/\s+/g, ',')        // Convertir espacios a comas
      .replace(/\-+/g, ',')        // Convertir guiones a comas
      .replace(/,+/g, ',')         // Remover comas múltiples
      .replace(/^,|,$/g, '')       // Remover comas al inicio/final

    // Dividir y convertir a números
    const grades = normalized
      .split(',')
      .map(g => {
        const num = parseFloat(g.trim())
        return isNaN(num) ? null : Math.min(20, Math.max(0, num))
      })
      .filter(g => g !== null)

    return grades
  }

  // Calcular promedio
  const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return null
    const sum = grades.reduce((acc, grade) => acc + grade, 0)
    return Math.round((sum / grades.length) * 10) / 10
  }

  // Validar entrada
  const validateInput = (input) => {
    const grades = parseGrades(input)
    if (grades.length === 0 && input.trim() !== '') {
      return false
    }
    return grades.every(g => g >= 0 && g <= 20)
  }

  // Manejar inicio de edición
  const startEditing = () => {
    if (disabled) return
    // Permitir edición tanto en modo literal como numérico, incluso si ya tiene nota
    setIsEditing(true)
    setUserHasEdited(false) // Resetear bandera al iniciar edición
    setInputValue(grades.length > 0 ? grades.join(', ') : '')
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  // Manejar fin de edición
  const finishEditing = (save = true, valueToSave = null) => {
    // 🔧 FIX: Usar valueToSave si se proporciona, sino usar inputValue
    const finalValue = valueToSave !== null ? valueToSave : inputValue

    console.log('🟢 finishEditing llamado - save:', save, 'valueToSave:', valueToSave, 'inputValue:', inputValue, 'finalValue:', finalValue, 'gradingMode:', gradingMode)

    if (save && finalValue.trim()) {
      // 🆕 Para modo literal, manejar directamente las letras
      if (gradingMode === 'literal') {
        console.log('🟢 Modo LITERAL detectado, buscando grade para:', finalValue.trim().toUpperCase())
        // Comparación case-insensitive para soportar escalas personalizadas (AA, BB, etc.)
        const literalGrade = LITERAL_GRADES.find(g => g.value.toUpperCase() === finalValue.trim().toUpperCase())

        console.log('🟢 LiteralGrade encontrado:', literalGrade)

        if (literalGrade) {
          const newGrades = [literalGrade.value]
          const newAverage = literalGrade.numeric

          setGrades(newGrades)
          setAverage(newAverage)
          setHasError(false)
          setIsSaving(true)

          const dataToSend = {
            grades: newGrades,
            average: newAverage,
            comment: comment,
            raw: finalValue,
            value: literalGrade.value
          }

          console.log('🟢 Llamando a onChange con:', {
            studentId,
            evalTypeId,
            data: dataToSend
          })

          // Notificar cambio al componente padre
          onChange(studentId, evalTypeId, dataToSend)

          setTimeout(() => setIsSaving(false), 500)
          setIsEditing(false)
          setUserHasEdited(false)
          return
        } else {
          console.log('❌ NO se encontró literalGrade')
        }
      }

      // Para modo numérico, usar la lógica original
      const newGrades = parseGrades(finalValue)
      if (newGrades.length > 0) {
        const newAverage = calculateAverage(newGrades)

        // Verificar si necesita comentario obligatorio (nota < 11)
        if (newAverage < 11 && !comment.trim()) {
          setGrades(newGrades)
          setAverage(newAverage)
          setIsEditing(false)
          setShowCommentModal(true)
          setCommentError(true)
          return
        }

        setGrades(newGrades)
        setAverage(newAverage)
        setHasError(false)
        setIsSaving(true)

        // Notificar cambio al componente padre
        onChange(studentId, evalTypeId, {
          grades: newGrades,
          average: newAverage,
          comment: comment,
          raw: finalValue
        })

        setTimeout(() => setIsSaving(false), 500)
      } else {
        setHasError(true)
      }
    } else if (!save) {
      // Restaurar valor anterior
      setInputValue(grades.join(', '))
      setHasError(false)
    } else if (inputValue.trim() === '') {
      // Limpiar celda SOLO si el usuario realmente editó el campo
      // Si el campo estaba vacío y el usuario no escribió nada, no borrar
      if (userHasEdited && grades.length > 0) {
        setGrades([])
        setAverage(null)
        setComment('')
        onChange(studentId, evalTypeId, null)
      }
      // Si el usuario no editó o no había valor previo, no hacer nada
    }

    setIsEditing(false)
    setUserHasEdited(false) // Resetear bandera
  }

  // Guardar comentario
  const saveComment = () => {
    const trimmedComment = comment.trim()

    if (average < 11) {
      if (!trimmedComment) {
        setCommentError(true)
        return
      }

      if (trimmedComment.length < 20) {
        setCommentError(true)
        return
      }
    }

    setCommentError(false)
    setShowCommentModal(false)
    setIsSaving(true)

    onChange(studentId, evalTypeId, {
      grades: grades,
      average: average,
      comment: comment,
      raw: inputValue
    })

    setTimeout(() => setIsSaving(false), 500)
  }

  // Manejar teclas
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('down')
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('down')  // Tab baja a la siguiente fila
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('up')  // Shift+Tab sube a la fila anterior
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('right')  // Flecha derecha va a la siguiente columna
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('left')  // Flecha izquierda va a la columna anterior
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      finishEditing(true)
      onNavigate?.('down')
    } else if (e.key === 'Escape') {
      finishEditing(false)
    }
  }

  // Manejar cambio de input
  const handleInputChange = (e) => {
    let value = e.target.value

    // Permitir solo números, comas, espacios, puntos decimales y guiones
    // Bloquear letras y caracteres especiales excepto separadores
    const filtered = value.replace(/[^0-9.,\s\-]/g, '')

    setInputValue(filtered)
    setUserHasEdited(true) // Marcar que el usuario hizo un cambio

    // Validación en tiempo real
    if (filtered.trim()) {
      const isValid = validateInput(filtered)
      setHasError(!isValid)

      // Si el usuario intenta escribir letras, mostrar error brevemente
      if (value !== filtered) {
        setHasError(true)
        setTimeout(() => {
          if (validateInput(filtered)) {
            setHasError(false)
          }
        }, 500)
      }
    } else {
      setHasError(false)
    }
  }

  // Obtener color según el promedio - usa store SSOT
  const getGradeColor = () => {
    if (!average) return ''

    const store = getGradingScalesStore()

    // Para modo literal, convertir a letra y obtener color
    if (gradingMode === 'literal') {
      const letter = store.convertNumericToLetter(average)
      const hexColor = store.getGradeColor(letter)
      return getColorClass(hexColor)
    }

    // Para modo numérico, obtener color directamente
    const hexColor = store.getGradeColor(average)
    return getColorClass(hexColor)
  }

  // Auto-focus si es necesario
  useEffect(() => {
    if (autoFocus) {
      startEditing()
    }
  }, [autoFocus])

  return (
    <div
      ref={cellRef}
      className={`relative group ${disabled ? 'opacity-60' : ''}`}
      onDoubleClick={startEditing}
    >
      {isEditing ? (
        <div className="relative" onBlur={(e) => {
          // Cerrar si el clic fue fuera del contenedor
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsEditing(false)
          }
        }}>
          {gradingMode === 'literal' ? (
            /* Selector de letras A/B/C/D */
            <div className="flex gap-1 p-1 bg-white border-2 border-blue-500 rounded" tabIndex={-1}>
              {LITERAL_GRADES.map((grade) => {
                // Verificar si esta es la nota actual (comparación case-insensitive)
                const isCurrentGrade = inputValue?.toUpperCase() === grade.value.toUpperCase() || grades[0]?.toUpperCase() === grade.value.toUpperCase()
                return (
                  <button
                    key={grade.value}
                    onClick={() => {
                      setInputValue(grade.value)
                      setGrades([grade.value])
                      setAverage(grade.numeric)
                      setHasError(false)
                      finishEditing(true, grade.value)
                    }}
                    className={`flex-1 px-2 py-1 text-sm font-bold rounded transition-all ${
                      isCurrentGrade
                        ? grade.color + ' shadow-md ring-2 ring-offset-1 ring-blue-400'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={grade.description}
                  >
                    {grade.label}
                  </button>
                )
              })}
            </div>
          ) : (
            /* Input numérico tradicional */
            <>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={() => finishEditing(true)}
                className={`w-full px-2 py-1 text-sm border-2 rounded transition-colors ${
                  hasError
                    ? 'border-red-500 bg-red-50'
                    : 'border-blue-500 bg-blue-50'
                } focus:outline-none`}
                placeholder="15, 18, 16..."
                title="Ingrese números separados por comas o espacios (0-20)"
                autoComplete="off"
              />
              {hasError && (
                <AlertCircle
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500"
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div
          className={`relative cursor-pointer rounded transition-all hover:shadow-md ${
            average ? getGradeColor() : 'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => !disabled && startEditing()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'F2') {
              e.preventDefault()
              startEditing()
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              onNavigate?.('up')
            } else if (e.key === 'ArrowDown' || e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault()
              onNavigate?.('down')
            } else if (e.key === 'Tab' && e.shiftKey) {
              e.preventDefault()
              onNavigate?.('up')
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              onNavigate?.('left')
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              onNavigate?.('right')
            }
          }}
          tabIndex={disabled ? -1 : 0}
        >
          {average !== null || grades.length > 0 ? (
            <div className="px-2 py-1">
              <div className="text-lg font-bold text-center">
                {gradingMode === 'literal' && grades.length > 0 ? grades[0] : average}
              </div>
              {gradingMode === 'numeric' && grades.length > 1 && (
                <div className="text-xs text-gray-600 text-center truncate">
                  {grades.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 py-3 text-center text-gray-400 text-sm">
              --
            </div>
          )}

          {/* Indicador de guardado */}
          {isSaving && (
            <div className="absolute -top-1 -right-1">
              <Check size={14} className="text-green-500 bg-white rounded-full" />
            </div>
          )}

          {/* Indicador de múltiples notas */}
          {grades.length > 1 && !isEditing && (
            <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {grades.length}
            </div>
          )}
        </div>
      )}

      {/* Tooltip con instrucciones */}
      {!isEditing && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {gradingMode === 'literal'
            ? (grades.length > 0 ? 'Click para cambiar nota' : 'Click para seleccionar (A/B/C/D)')
            : 'Doble click o F2 para editar'}
        </div>
      )}

      {/* Botón de comentario */}
      {!isEditing && average !== null && (
        (() => {
          // Determinar si es nota desaprobatoria según el modo
          const isFailingGrade = gradingMode === 'literal'
            ? average < 2 // D=1 es desaprobatoria en literal
            : average < 11 // <11 es desaprobatoria en numérico

          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowCommentModal(true)
              }}
              className={`absolute top-1 right-1 p-1 rounded-full transition-all ${
                comment
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : isFailingGrade
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
              title={comment ? 'Ver/Editar comentario' : isFailingGrade ? '¡Comentario obligatorio!' : 'Agregar comentario'}
            >
              <MessageSquare size={12} />
            </button>
          )
        })()
      )}

      {/* Modal de comentario */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCommentModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {average < 11 ? '⚠️ Comentario Obligatorio' : 'Comentario de la Nota'}
              </h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Nota:</span>
                <span className={`text-lg font-bold ${getGradeColor()}`}>
                  {average}
                </span>
              </div>
              {average < 11 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-700">
                    <strong>¡Atención!</strong> El estudiante tiene una nota desaprobatoria.
                    El comentario es <strong>obligatorio</strong> para explicar la situación.
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario {average < 11 && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  setCommentError(false)
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  commentError
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : average < 11 && comment.trim().length > 0 && comment.trim().length < 20
                    ? 'border-orange-400 focus:ring-orange-500 bg-orange-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                rows="4"
                placeholder={
                  average < 11
                    ? 'Explique por qué el estudiante no alcanzó la nota mínima...'
                    : 'Comentario opcional sobre el desempeño del estudiante...'
                }
                maxLength={250}
                autoFocus
              />
              <div className="flex justify-between items-center mt-1">
                {commentError && (
                  <p className="text-red-500 text-sm">
                    {!comment.trim()
                      ? 'El comentario es obligatorio para notas desaprobatorias'
                      : 'El comentario debe tener al menos 20 caracteres'}
                  </p>
                )}
                <p className={`text-xs ${commentError ? '' : 'ml-auto'} ${
                  comment.length > 250
                    ? 'text-red-500 font-semibold'
                    : average < 11 && comment.trim().length < 20
                    ? 'text-orange-600 font-semibold'
                    : 'text-gray-400'
                }`}>
                  {comment.length}/250
                  {average < 11 && comment.trim().length < 20 && (
                    <span className="ml-1">(mín. 20)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCommentModal(false)
                  setCommentError(false)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={saveComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ExcelGradeCell