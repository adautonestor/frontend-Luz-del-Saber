// UI Constants - Centralized configuration for all visible texts
export const UI_TEXTS = {
  // Authentication
  AUTH: {
    LOGIN_TITLE: 'Iniciar Sesión',
    LOGIN_SUBTITLE: 'Accede a tu cuenta del sistema educativo',
    EMAIL_LABEL: 'Correo Electrónico',
    PASSWORD_LABEL: 'Contraseña',
    LOGIN_BUTTON: 'Iniciar Sesión',
    LOGOUT_BUTTON: 'Cerrar Sesión',
    REMEMBER_ME: 'Recordarme',
    FORGOT_PASSWORD: '¿Olvidaste tu contraseña?',
    DEMO_ACCOUNTS_TITLE: 'Cuentas de demostración:'
  },

  // Navigation
  NAV: {
    ADMIN: {
      DASHBOARD: 'Dashboard',
      USERS: 'Usuarios',
      ENROLLMENT: 'Matrícula',
      ACADEMIC_STRUCTURE: 'Estructura Académica',
      PAYMENTS: 'Pagos',
      COMMUNICATIONS: 'Comunicados',
      REPORTS: 'Reportes',
      SETTINGS: 'Configuración'
    },
    TEACHER: {
      DASHBOARD: 'Dashboard',
      COURSES: 'Mis Cursos',
      GRADES: 'Notas',
      STUDENTS: 'Estudiantes',
      COMMUNICATIONS: 'Comunicados',
      SCHEDULE: 'Horarios'
    },
    PARENT: {
      DASHBOARD: 'Dashboard',
      CHILDREN: 'Mis Hijos',
      ENROLLMENT_REQUEST: 'Solicitar Matrícula',
      GRADES: 'Notas Académicas',
      PAYMENTS: 'Pagos',
      COMMUNICATIONS: 'Comunicados',
      REPORTS: 'Boletas',
      PROFILE: 'Mi Perfil'
    }
  },

  // Common
  COMMON: {
    LOADING: 'Cargando...',
    SEARCH_PLACEHOLDER: 'Buscar...',
    NO_DATA: 'No hay datos disponibles',
    ERROR_OCCURRED: 'Ha ocurrido un error',
    TRY_AGAIN: 'Intentar nuevamente',
    SAVE: 'Guardar',
    CANCEL: 'Cancelar',
    DELETE: 'Eliminar',
    EDIT: 'Editar',
    ADD: 'Agregar',
    VIEW: 'Ver',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    PRINT: 'Imprimir',
    DOWNLOAD: 'Descargar'
  },

  // Status
  STATUS: {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    COMPLETED: 'Completado',
    IN_PROGRESS: 'En Progreso',
    OVERDUE: 'Vencido',
    PARTIAL: 'Parcial'
  },

  // Academic
  ACADEMIC: {
    STUDENT: 'Estudiante',
    STUDENTS: 'Estudiantes',
    TEACHER: 'Docente',
    TEACHERS: 'Docentes',
    PARENT: 'Tutor',
    PARENTS: 'Tutores',
    GRADE: 'Grado',
    GRADES: 'Grados',
    SECTION: 'Sección',
    SECTIONS: 'Secciones',
    COURSE: 'Curso',
    COURSES: 'Cursos',
    LEVEL: 'Nivel',
    LEVELS: 'Niveles',
    BIMESTER: 'Bimestre',
    BIMESTERS: 'Bimestres',
    AVERAGE: 'Promedio',
    EVALUATION: 'Evaluación',
    EVALUATIONS: 'Evaluaciones'
  },

  // Enrollment
  ENROLLMENT: {
    TITLE: 'Solicitud de Matrícula',
    SUBTITLE: 'Registra tu solicitud de matrícula para el nuevo año escolar',
    NEW_REQUEST: 'Nueva Solicitud',
    MY_REQUESTS: 'Mis Solicitudes',
    REQUEST_HISTORY: 'Historial de Solicitudes',
    PENDING_REQUESTS: 'Solicitudes Pendientes',
    PROCESSED_REQUESTS: 'Solicitudes Procesadas',
    STUDENT_DATA: 'Datos del Estudiante',
    ACADEMIC_SELECTION: 'Selección Académica',
    DATA_CONFIRMATION: 'Confirmación de Datos',
    PERSONAL_DATA: 'Datos Personales del Estudiante',
    FIRST_NAME: 'Nombres',
    LAST_NAME: 'Apellidos',
    DNI: 'DNI',
    BIRTH_DATE: 'Fecha de Nacimiento',
    GENDER: 'Género',
    ADDRESS: 'Dirección',
    PHONE: 'Teléfono',
    EMAIL: 'Email',
    OBSERVATIONS: 'Observaciones',
    APPROVE: 'Aprobar',
    REJECT: 'Rechazar',
    APPROVE_REQUEST: 'Aprobar Solicitud',
    REJECT_REQUEST: 'Rechazar Solicitud',
    REJECTION_REASON: 'Motivo del rechazo',
    REQUEST_DATE: 'Fecha de Solicitud',
    APPROVE_DATE: 'Fecha de Aprobación',
    REJECT_DATE: 'Fecha de Rechazo',
    NO_REQUESTS: 'No hay solicitudes registradas',
    NO_REQUESTS_DESC: 'Aún no has enviado ninguna solicitud de matrícula.',
    CREATE_FIRST_REQUEST: 'Crear Primera Solicitud',
    SUBMIT_REQUEST: 'Enviar Solicitud',
    REQUEST_SUBMITTED: 'Solicitud enviada exitosamente',
    REQUEST_APPROVED: 'Solicitud aprobada exitosamente',
    REQUEST_REJECTED: 'Solicitud rechazada',
    STUDENT_ENROLLED: 'Estudiante matriculado exitosamente'
  },

  // Payment
  PAYMENT: {
    CONCEPT: 'Concepto',
    CONCEPTS: 'Conceptos',
    METHOD: 'Medio de Pago',
    METHODS: 'Medios de Pago',
    AMOUNT: 'Monto',
    PAID_AMOUNT: 'Monto Pagado',
    PENDING_AMOUNT: 'Saldo Pendiente',
    DUE_DATE: 'Fecha de Vencimiento',
    PAYMENT_DATE: 'Fecha de Pago',
    OPERATION_NUMBER: 'Número de Operación',
    VOUCHER: 'Comprobante',
    MONTHLY: 'Mensual',
    ANNUAL: 'Anual',
    UNIQUE: 'Único',
    TUITION: 'Matrícula',
    MONTHLY_FEE: 'Mensualidad',
    INSURANCE: 'Seguro',
    UNIFORM: 'Uniforme',
    MATERIALS: 'Materiales'
  },

  // Communication
  COMMUNICATION: {
    TITLE: 'Título',
    CONTENT: 'Contenido',
    TYPE: 'Tipo',
    PRIORITY: 'Prioridad',
    RECIPIENTS: 'Destinatarios',
    SENT_DATE: 'Fecha de Envío',
    READ_DATE: 'Fecha de Lectura',
    CONFIRMATION_REQUIRED: 'Requiere Confirmación',
    CONFIRM_READING: 'Confirmar Lectura',
    ATTACHMENTS: 'Archivos Adjuntos',
    GENERAL: 'General',
    URGENT: 'Urgente',
    INFORMATIVE: 'Informativo',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
    READ: 'Leído',
    UNREAD: 'No Leído',
    CONFIRMED: 'Confirmado',
    PENDING_CONFIRMATION: 'Pendiente de Confirmación'
  },

  // Dashboard
  DASHBOARD: {
    WELCOME: 'Bienvenido',
    RECENT_ACTIVITY: 'Actividad Reciente',
    PENDING_TASKS: 'Tareas Pendientes',
    IMPORTANT_ALERTS: 'Alertas Importantes',
    QUICK_STATS: 'Estadísticas Rápidas',
    TODAY_SCHEDULE: 'Horario de Hoy',
    MY_CHILDREN: 'Mis Hijos',
    FAMILY_SUMMARY: 'Resumen Familiar'
  },

  // Forms
  FORMS: {
    REQUIRED_FIELD: 'Campo requerido',
    INVALID_EMAIL: 'Correo electrónico no válido',
    INVALID_DNI: 'DNI debe tener 8 dígitos',
    INVALID_PHONE: 'Teléfono no válido',
    PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
    PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
    SELECT_OPTION: 'Selecciona una opción',
    ENTER_VALUE: 'Ingresa un valor',
    INVALID_DATE: 'Fecha no válida',
    INVALID_NUMBER: 'Número no válido'
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      SAVED: 'Guardado exitosamente',
      DELETED: 'Eliminado exitosamente',
      UPDATED: 'Actualizado exitosamente',
      LOGIN: 'Inicio de sesión exitoso',
      LOGOUT: 'Sesión cerrada exitosamente',
      PAYMENT_CONFIRMED: 'Pago confirmado exitosamente',
      MESSAGE_SENT: 'Mensaje enviado exitosamente'
    },
    ERROR: {
      GENERAL: 'Ha ocurrido un error inesperado',
      NETWORK: 'Error de conexión. Verifica tu internet.',
      UNAUTHORIZED: 'No tienes permisos para esta acción',
      NOT_FOUND: 'Recurso no encontrado',
      VALIDATION: 'Error de validación en los datos',
      SERVER: 'Error del servidor. Intenta más tarde.'
    },
    CONFIRMATION: {
      DELETE: '¿Estás seguro de eliminar este elemento?',
      LOGOUT: '¿Estás seguro de cerrar sesión?',
      CANCEL: '¿Estás seguro de cancelar? Se perderán los cambios.',
      SUBMIT: '¿Estás seguro de enviar esta información?'
    }
  }
}

// Role-specific configurations
export const ROLE_CONFIG = {
  Director: {
    name: 'Director',
    color: 'purple',
    description: 'Máximo nivel jerárquico - Gestión completa',
    icon: '👔'
  },
  Secretaria: {
    name: 'Secretaria',
    color: 'primary',
    description: 'Gestión administrativa del sistema',
    icon: '👨‍💼'
  },
  Profesor: {
    name: 'Docente',
    color: 'blue',
    description: 'Gestión de notas y estudiantes',
    icon: '👨‍🏫'
  },
  Padre: {
    name: 'Tutor',
    color: 'green',
    description: 'Seguimiento académico y pagos',
    icon: '👨‍👩‍👧‍👦'
  }
}

// Academic year configuration
export const ACADEMIC_CONFIG = {
  CURRENT_YEAR: 2024,
  BIMESTERS: [
    { number: 1, name: 'Primer Bimestre', start: '2024-03-01', end: '2024-04-30' },
    { number: 2, name: 'Segundo Bimestre', start: '2024-05-01', end: '2024-06-30' },
    { number: 3, name: 'Tercer Bimestre', start: '2024-08-01', end: '2024-09-30' },
    { number: 4, name: 'Cuarto Bimestre', start: '2024-10-01', end: '2024-11-30' }
  ],
  // @deprecated: Usar useGradingScales hook en su lugar
  // Esta constante se mantiene por retrocompatibilidad pero
  // los valores reales se cargan desde /api/system-settings/grading-scales
  GRADE_SCALE: {
    MIN: 0,
    MAX: 20,
    PASSING: 11
  }
}

// School information
export const SCHOOL_INFO = {
  NAME: 'Colegio Luz del Saber',
  LOCATION: 'Huancayo, Perú',
  DIRECTOR: 'Carlos Mendoza Pérez',
  PHONE: '987654321',
  EMAIL: 'admin@luzdelsaber.edu.pe',
  ADDRESS: 'Jr. Real 123, Huancayo',
  LOGO: '/images/logo.png'
}