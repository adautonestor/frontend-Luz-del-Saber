/**
 * Configuración para la generación de Boletas Finales
 * Centraliza todas las constantes y configuraciones del sistema educativo
 */

// Información institucional
export const INSTITUTION_INFO = {
  dre: 'DRE JUNÍN',
  ugel: 'UGEL Huancayo',
  codigoModular: '1429349-0',
  nombreInstitucion: 'LUZ DEL SABER',
  seccionDefecto: 'UNICA'
}

// Rutas de imágenes
export const IMAGES = {
  logoMinisterio: '/Ministerio_de_Educación_del_Perú.png',
  logoColegio: '/logoColegio.png'
}

// Mapping de nombres de cursos a áreas curriculares oficiales del MINEDU
export const CURSO_TO_AREA_MAP = {
  // Inglés
  'INGLES': 'INGLÉS COMO LENGUA EXTRANJERA',
  'ENGLISH': 'INGLÉS COMO LENGUA EXTRANJERA',

  // Personal Social
  'PERSONAL': 'PERSONAL SOCIAL',
  'SOCIAL': 'PERSONAL SOCIAL',

  // Religión
  'RELIGION': 'EDUCACIÓN RELIGIOSA',
  'RELIGIOSA': 'EDUCACIÓN RELIGIOSA',

  // Educación Física
  'FISICA': 'EDUCACIÓN FÍSICA',
  'EDUCACION FISICA': 'EDUCACIÓN FÍSICA',

  // Comunicación
  'COMUNICACION': 'COMUNICACIÓN',
  'LENGUAJE': 'COMUNICACIÓN',

  // Arte y Cultura
  'ARTE': 'ARTE Y CULTURA',
  'CULTURA': 'ARTE Y CULTURA',
  'CREATIVIDAD': 'ARTE Y CULTURA',

  // Matemática
  'MATEMATICA': 'MATEMÁTICA',
  'MATH': 'MATEMÁTICA',

  // Ciencia y Tecnología
  'CIENCIA': 'CIENCIA Y TECNOLOGÍA',
  'TECNOLOGIA': 'CIENCIA Y TECNOLOGÍA',
  'AMBIENTE': 'CIENCIA Y TECNOLOGÍA',

  // Castellano como Segunda Lengua
  'CASTELLANO': 'CASTELLANO COMO SEGUNDA LENGUA',

  // Psicomotricidad (Inicial)
  'PSICOMOTRICIDAD': 'PSICOMOTRICIDAD',
  'MOTRICIDAD': 'PSICOMOTRICIDAD',
  'MOTORA': 'PSICOMOTRICIDAD'
}

// Niveles de logro según MINEDU
export const NIVELES_LOGRO = {
  AD: {
    code: 'AD',
    name: 'LOGRO DESTACADO',
    description: 'Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia. Esto quiere decir que demuestra aprendizajes que van más allá del nivel esperado.'
  },
  A: {
    code: 'A',
    name: 'LOGRO ESPERADO',
    description: 'Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio en el tiempo programado.'
  },
  B: {
    code: 'B',
    name: 'EN PROCESO',
    description: 'Cuando el estudiante está próximo o cerca al nivel esperado respecto a la competencia, para lo cual requiere acompañamiento durante un tiempo razonable para lograrlo.'
  },
  C: {
    code: 'C',
    name: 'EN INICIO',
    description: 'Cuando el estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado. Evidencia con frecuencia dificultades en el desarrollo de las tareas, por lo que necesita mayor tiempo de acompañamiento e intervención del docente.'
  }
}

// Justificaciones de asistencia
export const JUSTIFICACIONES = [
  'Tardanza',
  'Inasistencia',
  'Situación del estudiante/traslado/retiro/lectivo'
]

// Períodos académicos
export const PERIODOS = {
  BIMESTRE_1: 'PRIMER BIMESTRE',
  BIMESTRE_2: 'SEGUNDO BIMESTRE',
  BIMESTRE_3: 'TERCER BIMESTRE',
  BIMESTRE_4: 'CUARTO BIMESTRE'
}

// Códigos de bimestre
export const BIMESTRES = ['B1', 'B2', 'B3', 'B4']

// Placeholder para tutor (puede ser reemplazado por datos reales)
export const DEFAULT_TUTOR = 'ESPEJO SOLIS, PAMELA'
