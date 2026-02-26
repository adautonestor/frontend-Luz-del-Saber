import {
  UserPlus, BookOpen, Users, Clock, CheckSquare, FileText,
  CreditCard, MessageSquare, BarChart3, Settings, Upload,
  GraduationCap, Edit2, Bell, FolderOpen, Barcode, Calendar, Megaphone
} from 'lucide-react'

/**
 * Configuración de flujos de trabajo por rol
 * Cada flujo define los pasos principales que un usuario debe seguir en su rol
 */

export const SECRETARY_WORKFLOW = [
  {
    id: 'secretary-1',
    title: 'Matrícula de Estudiantes',
    description: 'Registrar nuevos estudiantes en el sistema, asignar grados y secciones. Vincular estudiantes con sus padres o apoderados.',
    icon: UserPlus,
    color: 'bg-green-500',
    link: '/admin/matricula',
    actions: [
      'Registrar datos del estudiante',
      'Asignar grado y sección',
      'Vincular con padre/apoderado',
      'Generar código de estudiante'
    ]
  },
  {
    id: 'secretary-2',
    title: 'Gestión de Pagos',
    description: 'Registrar pagos de matrícula y pensiones. Generar recibos y comprobantes. Hacer seguimiento de pagos pendientes.',
    icon: CreditCard,
    color: 'bg-yellow-500',
    link: '/admin/pagos',
    actions: [
      'Registrar pagos recibidos',
      'Generar comprobantes de pago',
      'Consultar cronogramas de pago',
      'Hacer seguimiento de morosidad'
    ]
  },
  {
    id: 'secretary-3',
    title: 'Comunicados a Padres',
    description: 'Enviar comunicados y notificaciones a padres de familia sobre eventos, pagos y asuntos administrativos.',
    icon: MessageSquare,
    color: 'bg-pink-500',
    link: '/admin/comunicados',
    actions: [
      'Redactar comunicados administrativos',
      'Seleccionar destinatarios',
      'Enviar notificaciones de pago',
      'Hacer seguimiento de lectura'
    ]
  },
  {
    id: 'secretary-4',
    title: 'Publicar Avisos',
    description: 'Publicar avisos generales e información importante para toda la comunidad educativa.',
    icon: Megaphone,
    color: 'bg-orange-500',
    link: '/admin/avisos',
    actions: [
      'Crear avisos generales',
      'Publicar eventos e información',
      'Gestionar avisos activos'
    ]
  },
  {
    id: 'secretary-5',
    title: 'Gestión de Documentos',
    description: 'Administrar certificados, constancias y documentos oficiales del colegio.',
    icon: Upload,
    color: 'bg-indigo-500',
    link: '/admin/documentos',
    actions: [
      'Subir documentos oficiales',
      'Generar certificados',
      'Gestionar constancias',
      'Organizar archivo digital'
    ]
  }
]

export const ADMIN_WORKFLOW = [
  {
    id: 'admin-1',
    title: 'Gestión de Usuarios',
    description: 'Crear y administrar cuentas de profesores, personal administrativo y estudiantes. Asignar roles y permisos según las responsabilidades de cada usuario.',
    icon: Users,
    color: 'bg-blue-500',
    link: '/admin/usuarios',
    actions: [
      'Crear nuevos usuarios del sistema',
      'Asignar roles y permisos',
      'Gestionar credenciales de acceso'
    ]
  },
  {
    id: 'admin-2',
    title: 'Matrícula de Estudiantes',
    description: 'Registrar nuevos estudiantes en el sistema, asignar grados y secciones. Vincular estudiantes con sus padres o apoderados.',
    icon: UserPlus,
    color: 'bg-green-500',
    link: '/admin/matricula',
    actions: [
      'Registrar datos del estudiante',
      'Asignar grado y sección',
      'Vincular con padre/apoderado',
      'Generar código de estudiante'
    ]
  },
  {
    id: 'admin-3',
    title: 'Estructura Académica',
    description: 'Configurar la estructura del año escolar: crear períodos académicos, definir grados, secciones, cursos y asignar profesores.',
    icon: BookOpen,
    color: 'bg-purple-500',
    link: '/admin/estructura',
    actions: [
      'Configurar períodos académicos',
      'Crear grados y secciones',
      'Definir cursos y asignaturas',
      'Asignar profesores a cursos'
    ]
  },
  {
    id: 'admin-4',
    title: 'Rúbricas de Evaluación',
    description: 'Establecer criterios de evaluación y rúbricas que los profesores utilizarán para calificar a los estudiantes en cada curso.',
    icon: CheckSquare,
    color: 'bg-indigo-500',
    link: '/admin/rubricas',
    actions: [
      'Definir criterios de evaluación',
      'Crear rúbricas por curso',
      'Establecer pesos de evaluación'
    ]
  },
  {
    id: 'admin-5',
    title: 'Gestión de Horarios',
    description: 'Crear y administrar horarios de clases para cada grado y sección. Asignar aulas y horarios específicos a cada curso.',
    icon: Clock,
    color: 'bg-orange-500',
    link: '/admin/horarios',
    actions: [
      'Crear horarios por sección',
      'Asignar aulas y horarios',
      'Evitar conflictos de profesores'
    ]
  },
  {
    id: 'admin-6',
    title: 'Sistema de Pagos',
    description: 'Configurar conceptos de pago (matrícula, pensiones), registrar pagos de familias y generar reportes financieros.',
    icon: CreditCard,
    color: 'bg-yellow-500',
    link: '/admin/pagos',
    actions: [
      'Configurar conceptos de pago',
      'Registrar pagos recibidos',
      'Generar cronogramas de pago',
      'Hacer seguimiento de morosidad'
    ]
  },
  {
    id: 'admin-7',
    title: 'Comunicaciones',
    description: 'Enviar comunicados a padres, profesores y estudiantes. Gestionar notificaciones importantes del colegio.',
    icon: MessageSquare,
    color: 'bg-pink-500',
    link: '/admin/comunicados',
    actions: [
      'Redactar comunicados',
      'Seleccionar destinatarios',
      'Programar envíos',
      'Hacer seguimiento de lectura'
    ]
  },
  {
    id: 'admin-8',
    title: 'Reportes y Análisis',
    description: 'Generar reportes académicos, financieros y administrativos. Analizar el desempeño general del colegio.',
    icon: BarChart3,
    color: 'bg-teal-500',
    link: '/admin/reportes',
    actions: [
      'Reportes académicos por período',
      'Reportes financieros',
      'Estadísticas de asistencia',
      'Análisis de desempeño'
    ]
  }
]

export const TEACHER_WORKFLOW = [
  {
    id: 'teacher-1',
    title: 'Revisar Mis Cursos',
    description: 'Acceder a la lista de cursos asignados. Revisar información de cada curso, estudiantes matriculados y horarios de clase.',
    icon: BookOpen,
    color: 'bg-blue-500',
    link: '/profesor/cursos',
    actions: [
      'Ver cursos asignados',
      'Revisar lista de estudiantes',
      'Consultar horarios de clase'
    ]
  },
  {
    id: 'teacher-2',
    title: 'Registro de Asistencia',
    description: 'Tomar asistencia diaria de los estudiantes en cada clase. Marcar asistencias, tardanzas y faltas justificadas o injustificadas.',
    icon: Barcode,
    color: 'bg-green-500',
    link: '/profesor/asistencia',
    actions: [
      'Registrar asistencia diaria',
      'Marcar tardanzas',
      'Justificar inasistencias',
      'Generar reportes de asistencia'
    ]
  },
  {
    id: 'teacher-3',
    title: 'Registro de Notas',
    description: 'Ingresar calificaciones de tareas, prácticas, exámenes y trabajos. Aplicar las rúbricas de evaluación establecidas por el colegio.',
    icon: Edit2,
    color: 'bg-purple-500',
    link: '/profesor/notas',
    actions: [
      'Registrar calificaciones',
      'Aplicar rúbricas de evaluación',
      'Calcular promedios',
      'Revisar desempeño de estudiantes'
    ]
  },
  {
    id: 'teacher-4',
    title: 'Comunicación con Padres',
    description: 'Enviar comunicados a padres de familia sobre el desempeño académico, comportamiento o eventos importantes relacionados con sus hijos.',
    icon: MessageSquare,
    color: 'bg-pink-500',
    link: '/profesor/comunicados',
    actions: [
      'Enviar comunicados individuales',
      'Comunicados grupales por curso',
      'Responder consultas de padres',
      'Programar reuniones'
    ]
  },
  {
    id: 'teacher-5',
    title: 'Gestión de Documentos',
    description: 'Subir y compartir material educativo, tareas, guías de estudio y recursos didácticos con los estudiantes.',
    icon: FolderOpen,
    color: 'bg-orange-500',
    link: '/profesor/documentos',
    actions: [
      'Subir material de clase',
      'Compartir tareas y actividades',
      'Organizar recursos por curso',
      'Descargar trabajos de estudiantes'
    ]
  },
  {
    id: 'teacher-6',
    title: 'Consultar Horarios',
    description: 'Revisar horarios de clases, reuniones y actividades programadas. Verificar disponibilidad de aulas y recursos.',
    icon: Calendar,
    color: 'bg-indigo-500',
    link: '/profesor/horarios',
    actions: [
      'Consultar horario semanal',
      'Ver aulas asignadas',
      'Revisar actividades programadas'
    ]
  }
]

export const PARENT_WORKFLOW = [
  {
    id: 'parent-1',
    title: 'Información de Mis Hijos',
    description: 'Ver la información general de todos los hijos matriculados: grado, sección, tutor asignado y estado académico actual.',
    icon: Users,
    color: 'bg-green-500',
    link: '/padre/hijos',
    actions: [
      'Ver datos de cada hijo',
      'Consultar grado y sección',
      'Información del tutor',
      'Estado académico general'
    ]
  },
  {
    id: 'parent-2',
    title: 'Seguimiento Académico',
    description: 'Consultar las calificaciones y notas de cada hijo por curso y período académico. Revisar promedios y áreas que necesitan refuerzo.',
    icon: GraduationCap,
    color: 'bg-blue-500',
    link: '/padre/notas',
    actions: [
      'Ver notas por curso',
      'Consultar promedios',
      'Revisar evaluaciones',
      'Identificar áreas de mejora'
    ]
  },
  {
    id: 'parent-3',
    title: 'Registro de Asistencia',
    description: 'Verificar la asistencia diaria de los hijos. Revisar el historial de asistencias, tardanzas y faltas justificadas.',
    icon: Barcode,
    color: 'bg-purple-500',
    link: '/padre/asistencia',
    actions: [
      'Ver asistencia diaria',
      'Historial de asistencias',
      'Justificar inasistencias',
      'Revisar tardanzas'
    ]
  },
  {
    id: 'parent-4',
    title: 'Estado de Pagos',
    description: 'Consultar el estado de pagos de matrícula y pensiones. Ver cronograma de pagos, fechas de vencimiento y realizar pagos pendientes.',
    icon: CreditCard,
    color: 'bg-yellow-500',
    link: '/padre/pagos',
    actions: [
      'Ver estado de cuenta',
      'Consultar cronograma de pagos',
      'Revisar pagos pendientes',
      'Descargar comprobantes'
    ]
  },
  {
    id: 'parent-5',
    title: 'Comunicados del Colegio',
    description: 'Recibir y leer comunicados importantes enviados por el colegio, profesores o dirección. Confirmar lectura de mensajes urgentes.',
    icon: MessageSquare,
    color: 'bg-pink-500',
    link: '/padre/comunicados',
    actions: [
      'Leer comunicados recibidos',
      'Confirmar lectura',
      'Responder a consultas',
      'Ver historial de mensajes'
    ]
  },
  {
    id: 'parent-6',
    title: 'Avisos Importantes',
    description: 'Revisar avisos generales del colegio sobre eventos, actividades, fechas importantes y anuncios institucionales.',
    icon: Bell,
    color: 'bg-orange-500',
    link: '/padre/avisos',
    actions: [
      'Ver avisos activos',
      'Consultar eventos próximos',
      'Descargar circulares',
      'Acceder a enlaces importantes'
    ]
  },
  {
    id: 'parent-7',
    title: 'Boletas de Notas',
    description: 'Descargar las boletas de calificaciones oficiales de cada período académico. Revisar el desempeño integral de cada hijo.',
    icon: FileText,
    color: 'bg-indigo-500',
    link: '/padre/boletas',
    actions: [
      'Descargar boletas por período',
      'Ver calificaciones oficiales',
      'Revisar observaciones',
      'Imprimir boletas'
    ]
  },
  {
    id: 'parent-8',
    title: 'Documentos Escolares',
    description: 'Acceder a documentos importantes como certificados, constancias, material educativo y comunicaciones oficiales.',
    icon: FolderOpen,
    color: 'bg-teal-500',
    link: '/padre/documentos',
    actions: [
      'Descargar certificados',
      'Ver material educativo',
      'Acceder a constancias',
      'Revisar circulares'
    ]
  }
]

// Función helper para obtener el flujo según el rol
export const getWorkflowByRole = (role) => {
  switch (role) {
    case 'Director':
    case 'administrador':
      return {
        workflow: ADMIN_WORKFLOW,
        title: 'Flujo de Trabajo Administrativo',
        subtitle: 'Pasos principales para la gestión del colegio'
      }
    case 'Secretaria':
      return {
        workflow: SECRETARY_WORKFLOW,
        title: 'Flujo de Trabajo - Secretaría',
        subtitle: 'Pasos principales para gestión administrativa y pagos'
      }
    case 'Profesor':
      return {
        workflow: TEACHER_WORKFLOW,
        title: 'Flujo de Trabajo Docente',
        subtitle: 'Pasos principales para la gestión de clases'
      }
    case 'Padre':
      return {
        workflow: PARENT_WORKFLOW,
        title: 'Guía para Padres de Familia',
        subtitle: 'Pasos para el seguimiento académico de tus hijos'
      }
    default:
      return {
        workflow: [],
        title: 'Flujo de Trabajo',
        subtitle: ''
      }
  }
}
