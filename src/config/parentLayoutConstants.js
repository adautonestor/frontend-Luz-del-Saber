import {
  Home, Users, CreditCard, MessageSquare, FileText, User,
  GraduationCap, FolderOpen, Barcode, Megaphone, Clock, Brain
} from 'lucide-react'

/**
 * Navegación del Portal de Padres
 */
export const PARENT_NAVIGATION = [
  { name: 'Dashboard', href: '/padre', icon: Home, exact: true },
  { name: 'Mis Hijos', href: '/padre/hijos', icon: Users },
  { name: 'Notas Académicas', href: '/padre/notas', icon: GraduationCap },
  { name: 'Asistencia', href: '/padre/asistencia', icon: Barcode },
  { name: 'Informes Psicológicos', href: '/padre/informes-psicologicos', icon: Brain },
  { name: 'Pagos', href: '/padre/pagos', icon: CreditCard },
  { name: 'Comunicados', href: '/padre/comunicados', icon: MessageSquare },
  { name: 'Avisos', href: '/padre/avisos', icon: Megaphone },
  { name: 'Horarios', href: '/padre/horarios', icon: Clock },
  { name: 'Documentos', href: '/padre/documentos', icon: FolderOpen },
  { name: 'Boletas', href: '/padre/boletas', icon: FileText },
  { name: 'Mi Perfil', href: '/padre/perfil', icon: User },
]

/**
 * Días de la semana
 */
export const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

/**
 * Configuración de colores por estado académico
 */
export const ACADEMIC_STATUS_COLORS = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  regular: 'bg-red-100 text-red-800'
}

/**
 * Configuración de colores por promedio
 */
export const AVERAGE_COLORS = {
  excellent: 'text-green-600', // >= 17
  good: 'text-yellow-600',     // >= 14
  poor: 'text-red-600'          // < 14
}

/**
 * Límites de avisos a mostrar en dashboard
 */
export const MAX_AVISOS_DASHBOARD = 3

/**
 * Límites de días a mostrar en horarios
 */
export const MAX_DAYS_SCHEDULE_PREVIEW = 3
