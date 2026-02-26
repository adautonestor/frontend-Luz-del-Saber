import { Smartphone, Building2, Banknote } from 'lucide-react'

/**
 * Configuración para el módulo de pagos
 */

// Métodos de pago disponibles
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
