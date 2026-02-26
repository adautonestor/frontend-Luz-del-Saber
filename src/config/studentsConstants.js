/**
 * Constantes para el módulo de gestión de estudiantes
 */

// Opciones de filtro por nivel
export const NIVELES = [
  { value: '', label: 'Todos los niveles' },
  { value: 'inicial', label: 'Inicial' },
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' }
]

// Opciones de filtro por grado
export const GRADOS = [
  { value: '', label: 'Todos los grados' },
  { value: '1', label: '1°' },
  { value: '2', label: '2°' },
  { value: '3', label: '3°' },
  { value: '4', label: '4°' },
  { value: '5', label: '5°' },
  { value: '6', label: '6°' }
]

// Configuración de anchos de columnas para exportación Excel
export const EXCEL_COLUMN_WIDTHS = [
  { wch: 5 },  // N°
  { wch: 12 }, // Código
  { wch: 10 }, // DNI
  { wch: 18 }, // Apellido Paterno
  { wch: 18 }, // Apellido Materno
  { wch: 20 }, // Nombres
  { wch: 15 }, // Fecha Nacimiento
  { wch: 12 }, // Género
  { wch: 12 }, // Nivel
  { wch: 8 },  // Grado
  { wch: 10 }, // Sección
  { wch: 12 }, // Año Escolar
  { wch: 30 }, // Dirección
  { wch: 12 }, // Teléfono
  { wch: 25 }, // Email
  { wch: 20 }, // Nombre Padre
  { wch: 10 }, // DNI Padre
  { wch: 12 }, // Teléfono Padre
  { wch: 20 }, // Nombre Madre
  { wch: 10 }, // DNI Madre
  { wch: 12 }, // Teléfono Madre
  { wch: 10 }  // Estado
]
