import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  X, Upload, DollarSign, Calendar, FileText,
  CreditCard, Hash, User, AlertCircle, Check,
  Image, File, Trash2
} from 'lucide-react'
import { usePaymentsStore } from '../../stores/paymentsStore'
import { getTodayLima, formatDateSafe } from '../../utils/dateUtils'

const ManualPaymentModal = ({ obligation, student, onClose, onSuccess }) => {
  const fileInputRef = useRef(null)
  const { registerManualPayment } = usePaymentsStore()

  const [formData, setFormData] = useState({
    // Usar getTodayLima() para obtener la fecha correcta en zona horaria de Lima
    payment_date: getTodayLima(),
    metodoPago: 'efectivo',
    operation_number: '',
    paid_amount: obligation?.amount || 0,
    observations: ''
  })

  const [voucher, setVoucher] = useState(null)
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const paymentMethods = [
    { id: 'efectivo', name: 'Efectivo', icon: DollarSign },
    { id: 'transferencia', name: 'Transferencia Bancaria', icon: CreditCard },
    { id: 'yape', name: 'Yape', icon: Image },
    { id: 'plin', name: 'Plin', icon: Image },
    { id: 'deposito', name: 'Depósito Bancario', icon: FileText }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        voucher: 'Solo se permiten imágenes (JPG, PNG) o PDF'
      }))
      return
    }

    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        voucher: 'El archivo no debe superar los 5MB'
      }))
      return
    }

    setVoucher(file)
    setErrors(prev => ({
      ...prev,
      voucher: ''
    }))

    // Crear preview si es imagen
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setVoucherPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setVoucherPreview(null)
    }
  }

  const removeVoucher = () => {
    setVoucher(null)
    setVoucherPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.payment_date) {
      newErrors.payment_date = 'La fecha de pago es requerida'
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = 'Seleccione un método de pago'
    }

    if (formData.metodoPago !== 'efectivo' && !formData.operation_number) {
      newErrors.operation_number = 'El número de operación es requerido'
    }

    if (!formData.paid_amount || formData.paid_amount <= 0) {
      newErrors.paid_amount = 'El monto debe ser mayor a 0'
    }

    if (formData.paid_amount > obligation.amount) {
      newErrors.paid_amount = `El monto no puede ser mayor a S/. ${obligation.amount}`
    }

    if (!voucher && formData.metodoPago !== 'efectivo') {
      newErrors.voucher = 'El voucher es requerido para pagos no en efectivo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Preparar datos del pago
      const paymentData = {
        obligation_id: obligation.id,
        student_id: student.id,
        concept_id: obligation.concept_id,
        payment_date: formData.payment_date,
        metodoPago: formData.metodoPago,
        operation_number: formData.operation_number,
        paid_amount: parseFloat(formData.paid_amount),
        observations: formData.observations
      }

      // Registrar el pago con el archivo (si existe)
      await registerManualPayment(paymentData, voucher)

      // Llamar onSuccess si está definido
      if (typeof onSuccess === 'function') {
        onSuccess({
          ...paymentData,
          estudiante: student,
          concepto: obligation.concepto
        })
      }

      // Cerrar el modal
      onClose()
    } catch (error) {
      console.error('Error al registrar el pago:', error)
      setErrors({
        submit: error.message || 'Error al registrar el pago. Por favor, intente nuevamente.'
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign size={28} />
              <div>
                <h2 className="text-xl font-bold">Registrar Pago Manual</h2>
                <p className="text-blue-100 text-sm">
                  Confirmar pago realizado fuera del sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Información del pago */}
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Estudiante:</span>
              <p className="font-semibold text-gray-900">
                {student?.paternal_last_name || ''} {student?.maternal_last_name || ''}, {student?.first_names}{student?.last_names ? ` ${student.last_names}` : ''}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Concepto:</span>
              <p className="font-semibold text-gray-900">{obligation?.concepto}</p>
            </div>
            <div>
              <span className="text-gray-600">Monto a pagar:</span>
              <p className="font-semibold text-gray-900">
                S/. {obligation?.amount?.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Vencimiento:</span>
              <p className="font-semibold text-gray-900">
                {formatDateSafe(obligation?.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          {/* Fecha de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Pago *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                max={getTodayLima()}
                className={`input pl-10 ${errors.payment_date ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.payment_date && (
              <p className="text-red-500 text-sm mt-1">{errors.payment_date}</p>
            )}
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {paymentMethods.map(method => {
                const Icon = method.icon
                return (
                  <label
                    key={method.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${formData.metodoPago === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={method.id}
                      checked={formData.metodoPago === method.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <Icon size={18} />
                    <span className="text-sm font-medium">{method.name}</span>
                  </label>
                )
              })}
            </div>
            {errors.metodoPago && (
              <p className="text-red-500 text-sm mt-1">{errors.metodoPago}</p>
            )}
          </div>

          {/* Número de operación */}
          {formData.metodoPago !== 'efectivo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Operación *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="operation_number"
                  value={formData.operation_number}
                  onChange={handleChange}
                  placeholder="Ej: 001234567"
                  className={`input pl-10 ${errors.operation_number ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.operation_number && (
                <p className="text-red-500 text-sm mt-1">{errors.operation_number}</p>
              )}
            </div>
          )}

          {/* Monto pagado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto Pagado *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                S/.
              </span>
              <input
                type="number"
                name="paid_amount"
                value={formData.paid_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                max={obligation?.amount}
                className={`input pl-12 ${errors.paid_amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.paid_amount && (
              <p className="text-red-500 text-sm mt-1">{errors.paid_amount}</p>
            )}
          </div>

          {/* Upload de voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voucher/Comprobante {formData.metodoPago !== 'efectivo' && '*'}
            </label>

            {!voucher ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                  ${errors.voucher
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Haz clic para subir el voucher
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o PDF (máx. 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                <div className="flex items-start gap-3">
                  {voucherPreview ? (
                    <img
                      src={voucherPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <File className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{voucher.name}</p>
                    <p className="text-xs text-gray-500">
                      {(voucher.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={removeVoucher}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.voucher && (
              <p className="text-red-500 text-sm mt-1">{errors.voucher}</p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              placeholder="Notas adicionales sobre el pago..."
              className="input"
            />
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </>
            ) : (
              <>
                <Check size={18} />
                Confirmar Pago
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ManualPaymentModal