/**
 * Servicios centralizados para reemplazar mockDb
 * Todos los servicios conectan con las APIs reales del backend
 */

// Servicios de autenticación y usuarios
export { authService } from './authService'
export { usersService } from './usersService'
export { rolesService } from './rolesService'

// Servicios académicos
export { default as academicYearService } from './academic/academicYearService'
export { default as courseService } from './academic/courseService'
export { default as structureService } from './academic/structureService'
export { courseAssignmentsService } from './courseAssignmentsService'
export { evaluationStructuresService } from './evaluationStructuresService'

// Servicios de estudiantes y padres
export { studentsService } from './studentsService'
export { parentStudentRelationsService } from './parentStudentRelationsService'

// Servicios de calificaciones
export { gradesService } from './gradesService'
export { studentBehaviorsService } from './studentBehaviorsService'

// Servicios de pagos
export { paymentsService } from './paymentsService'
export { discountConfigsService } from './discountConfigsService'

// Servicios de asistencia
export { attendanceService } from './attendanceService'

// Servicios de comunicaciones
export { communicationsService } from './communicationsService'
export { avisosService } from './avisosService'

// Servicios de documentos
export { documentsService } from './documentsService'

// Servicios de reportes
export { psychologicalReportsService } from './psychologicalReportsService'
export { reportCardVisibilityService } from './reportCardVisibilityService'

// Servicios de horarios
export { schedulesService } from './schedulesService'

// Servicios de matriculación
export { matriculationService } from './matriculationService'

// Servicios de reuniones de padres
export { parentMeetingsService } from './parentMeetingsService'
export { meetingAttendancesService } from './meetingAttendancesService'

// Servicios de dashboard y estadísticas
export { dashboardService } from './dashboardService'
