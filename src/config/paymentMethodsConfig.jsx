import { Smartphone, Building2, Banknote } from 'lucide-react'

/**
 * Configuración de Métodos de Pago Disponibles
 * Define todos los métodos de pago soportados por el sistema
 */

/**
 * Métodos de pago disponibles para padres
 * @constant
 * @type {Array<Object>}
 */
export const PAYMENT_METHODS = [
  {
    id: 'yape',
    name: 'Yape',
    type: 'digital',
    phone: '987654321',
    qr: '/images/qr-yape.png',
    instructions: 'Escanea el código QR con tu app Yape y envía el comprobante por WhatsApp.',
    icon: Smartphone,
    color: 'bg-purple-500'
  },
  {
    id: 'plin',
    name: 'Plin',
    type: 'digital',
    phone: '987654321',
    qr: '/images/qr-plin.png',
    instructions: 'Escanea el código QR con tu app Plin y envía el comprobante por WhatsApp.',
    icon: Smartphone,
    color: 'bg-blue-500'
  },
  {
    id: 'bcp',
    name: 'BCP - Transferencia',
    type: 'bank',
    account: '1234567890',
    cci: '00212345678901234567',
    holder: 'Colegio Luz del Saber S.A.C.',
    instructions: 'Realiza la transferencia y envía el voucher al correo pagos@luzdelsaber.edu.pe',
    icon: Building2,
    color: 'bg-green-500'
  },
  {
    id: 'cash',
    name: 'Efectivo',
    type: 'physical',
    location: 'Oficina de Administración',
    hours: 'Lunes a Viernes 8:00 AM - 4:00 PM',
    instructions: 'Acércate a la oficina de administración en horario de atención.',
    icon: Banknote,
    color: 'bg-gray-500'
  }
]

/**
 * Obtiene un método de pago por su ID
 * @param {string} methodId - ID del método de pago
 * @returns {Object|null} Método de pago o null si no existe
 */
export const getPaymentMethodById = (methodId) => {
  return PAYMENT_METHODS.find(method => method.id === methodId) || null
}

/**
 * Obtiene métodos de pago filtrados por tipo
 * @param {string} type - Tipo de método ('digital', 'bank', 'physical')
 * @returns {Array<Object>} Métodos de pago del tipo especificado
 */
export const getPaymentMethodsByType = (type) => {
  return PAYMENT_METHODS.filter(method => method.type === type)
}

/**
 * Tipos de métodos de pago disponibles
 * @constant
 */
export const PAYMENT_METHOD_TYPES = {
  DIGITAL: 'digital',
  BANK: 'bank',
  PHYSICAL: 'physical'
}

/**
 * Validaciones para archivos de voucher
 * @constant
 */
export const VOUCHER_FILE_CONFIG = {
  validTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  maxSizeMB: 5,
  acceptAttribute: 'image/*,.pdf'
}

/**
 * Valida un archivo de voucher
 * @param {File} file - Archivo a validar
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateVoucherFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo' }
  }

  if (!VOUCHER_FILE_CONFIG.validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Por favor selecciona una imagen (JPG, PNG, WEBP) o un archivo PDF'
    }
  }

  if (file.size > VOUCHER_FILE_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo no puede ser mayor a ${VOUCHER_FILE_CONFIG.maxSizeMB}MB`
    }
  }

  return { valid: true, error: null }
}

/**
 * Formatea el tamaño de un archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado (ej: "2.45 MB")
 */
export const formatFileSize = (bytes) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

/**
 * Información de contacto para soporte de pagos
 * @constant
 */
export const PAYMENT_SUPPORT = {
  whatsapp: '987-654-321',
  email: 'pagos@luzdelsaber.edu.pe',
  hours: 'Lunes a Viernes 8:00 AM - 4:00 PM'
}
