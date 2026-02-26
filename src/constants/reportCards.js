/**
 * Opciones de años escolares disponibles (FALLBACK)
 * Los datos dinámicos se cargan desde academicYearService.getAll()
 * Esta constante se usa solo como respaldo si la API falla
 */
export const AVAILABLE_YEARS = [2024, 2025, 2026]

/**
 * Opciones de bimestres para descarga
 */
export const BIMESTRE_OPTIONS = [
  { value: 'anual', label: 'Boleta Anual (4 Bimestres)' },
  { value: '1', label: 'Solo Bimestre I' },
  { value: '2', label: 'Solo Bimestre II' },
  { value: '3', label: 'Solo Bimestre III' },
  { value: '4', label: 'Solo Bimestre IV' }
]

/**
 * Array de bimestres (1-4)
 */
export const BIMESTRES = [1, 2, 3, 4]

/**
 * Año actual por defecto
 */
export const DEFAULT_YEAR = new Date().getFullYear()

/**
 * Bimestre por defecto (anual)
 */
export const DEFAULT_BIMESTRE = 'anual'
