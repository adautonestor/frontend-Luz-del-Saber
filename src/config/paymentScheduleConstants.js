/**
 * Constantes para el modal de cronograma de pagos
 */

// Colores de estados de pago
export const PAYMENT_STATUS_COLORS = {
  pagado: 'bg-green-100 text-green-800 border-green-300',
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  vencido: 'bg-red-100 text-red-800 border-red-300',
  exonerado: 'bg-gray-100 text-gray-600 border-gray-300',
  en_verificacion: 'bg-blue-100 text-blue-800 border-blue-300',
  parcial: 'bg-orange-100 text-orange-800 border-orange-300'
}

// Anchos de columna para Excel
export const EXCEL_COLUMN_WIDTHS = {
  anoEscolar: { wch: 12 },
  estudiante: { wch: 30 },
  concepto: { wch: 35 },
  mes: { wch: 12 },
  due_date: { wch: 18 },
  amount: { wch: 15 },
  state: { wch: 15 },
  payment_date: { wch: 15 }
}

// Encabezados de tabla para Excel
export const EXCEL_TABLE_HEADERS_BASE = ['Año Escolar']
export const EXCEL_TABLE_HEADERS_EXTENDED = ['Concepto', 'Mes', 'Fecha Vencimiento', 'Monto (S/)', 'Estado', 'Fecha Pago']

// Mensajes de información
export const INFO_MESSAGES = {
  multipleStudents: (count) => `Este cronograma incluye las deudas de ${count} estudiante(s) asociados a este padre/tutor, de todos los años escolares.`,
  singleStudent: 'Este cronograma incluye todas las deudas del estudiante de todos los años escolares.',
  noSchedule: 'Este estudiante no tiene un cronograma de pagos generado.',
  searchPrompt: 'Escribe el DNI del estudiante para ver su cronograma de pagos'
}

// Textos de estados
export const STATUS_LABELS = {
  exonerado: 'Exonerado',
  pagado: 'Pagado',
  vencido: 'Vencido',
  pendiente: 'Pendiente',
  en_verificacion: 'En Verificación',
  parcial: 'Parcial'
}
