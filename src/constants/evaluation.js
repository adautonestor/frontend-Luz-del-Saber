/**
 * Plantillas de evaluación para el sistema educativo
 */
export const evaluationTemplates = {
  competencies: {
    name: 'Por Competencias',
    description: 'Evaluación basada en competencias específicas (sistema base del colegio)',
    competencias: [
      {
        numero: 1,
        nombreCompetencia: 'Resuelve problemas de cantidad',
        description: 'Capacidad para resolver problemas matemáticos de cantidad'
      },
      {
        numero: 2,
        nombreCompetencia: 'Resuelve problemas de regularidad',
        description: 'Capacidad para identificar y resolver patrones'
      },
      {
        numero: 3,
        nombreCompetencia: 'Resuelve problemas de forma',
        description: 'Capacidad para trabajar con formas geométricas'
      },
      {
        numero: 4,
        nombreCompetencia: 'Gestiona datos e incertidumbre',
        description: 'Capacidad para analizar e interpretar datos'
      }
    ]
  }
}

export const BIMESTERS = [
  { value: '1', label: 'Bimestre 1' },
  { value: '2', label: 'Bimestre 2' },
  { value: '3', label: 'Bimestre 3' },
  { value: '4', label: 'Bimestre 4' }
]

export const EDUCATIONAL_LEVELS_INFO = {
  inicial: {
    label: 'Inicial',
    description: '(3, 4, 5 años)',
    icon: 'Baby',
    colorClass: 'blue'
  },
  primaria: {
    label: 'Primaria',
    description: '(1° a 6° grado)',
    icon: 'Backpack',
    colorClass: 'purple'
  },
  secundaria: {
    label: 'Secundaria',
    description: '(1° a 5° año)',
    icon: 'GraduationCap',
    colorClass: 'green'
  }
}
