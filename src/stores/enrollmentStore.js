import { create } from 'zustand'
import { matriculationService } from '../services/matriculationService'
import studentsService from '../services/studentsService'
import { paymentsService } from '../services/paymentsService'
import { generatePaymentSchedule, generateCustomPaymentSchedule } from '../utils/payments/paymentScheduleGenerator.js'
import { getTodayLima } from '../utils/dateUtils'

/**
 * Enrollment Store - Gestión de Matrícula Anual
 * Integrado con APIs reales del backend
 */
export const useEnrollmentStore = create((set, get) => ({
  // State
  students: [],
  matriculations: [],
  academicPeriods: [],
  parentStudentRelations: [],
  isLoading: false,
  error: null,
  currentPeriod: null,

  // Filters
  filters: {
    level: '',
    grade: '',
    section: '',
    status: '',
    search: '',
    academic_year: '' // Vacío = "Todos los años" por defecto
  },

  // ==================== INITIALIZE ====================
  initialize: async () => {
    set({ isLoading: true, error: null })

    try {
      // Cargar datos desde APIs reales
      const [students, matriculations] = await Promise.all([
        studentsService.getAll(),
        matriculationService.getAll()
      ])

      // Get current academic period
      const currentYear = new Date().getFullYear()
      const currentPeriod = {
        id: `period-${currentYear}`,
        year: currentYear,
        startDate: `${currentYear}-03-01`,
        endDate: `${currentYear}-12-15`,
        enrollmentStart: `${currentYear - 1}-11-01`,
        enrollmentEnd: `${currentYear}-02-28`,
        status: 'active'
      }

      set({
        students: students || [],
        matriculations: matriculations || [],
        currentPeriod,
        isLoading: false
      })

      return { students, matriculations }
    } catch (error) {
      console.error('Error loading enrollment data:', error)
      set({
        error: error.message || 'Error al cargar datos de matrícula',
        isLoading: false
      })
      throw error
    }
  },

  // ==================== MATRICULATION ====================
  createMatriculation: async (matriculationData) => {
    set({ isLoading: true, error: null })

    try {
      // Handle parent enrollment request (includes student data)
      if (matriculationData.estudianteData) {
        const { estudianteData, ...requestData } = matriculationData

        // Check for duplicate DNI
        const existingStudents = await studentsService.getByDni(estudianteData.dni)
        if (existingStudents && existingStudents.length > 0) {
          throw new Error('Ya existe un estudiante registrado con este DNI')
        }

        // Check for existing matriculation request with same DNI
        const existingMatriculations = await matriculationService.getAll({
          dni: estudianteData.dni,
          academic_year_id: requestData.academic_year_id
        })

        if (existingMatriculations && existingMatriculations.length > 0) {
          throw new Error('Ya existe una solicitud de matrícula para un estudiante con este DNI')
        }

        // Create parent enrollment request with embedded student data
        const newMatriculation = await matriculationService.create({
          ...requestData,
          estudiante_data: estudianteData,
          state: 'pendiente',
          fecha_solicitud: new Date().toISOString()
        })

        set(state => ({
          matriculations: [...state.matriculations, newMatriculation],
          isLoading: false
        }))

        console.log('✅ Matriculation request created:', newMatriculation.id)
        return newMatriculation
      } else {
        // Handle admin direct enrollment
        // Check for existing matriculation
        const existing = await matriculationService.getAll({
          student_id: matriculationData.student_id,
          academic_year_id: matriculationData.academic_year_id
        })

        if (existing && existing.length > 0) {
          throw new Error('Ya existe una matrícula para este estudiante en el año especificado')
        }

        const newMatriculation = await matriculationService.create({
          student_id: matriculationData.student_id,
          level_id: matriculationData.level_id,
          grade_id: matriculationData.grade_id,
          section_id: matriculationData.section_id,
          academic_year_id: matriculationData.academic_year_id,
          state: 'pendiente',
          fecha_matricula: new Date().toISOString()
        })

        set(state => ({
          matriculations: [...state.matriculations, newMatriculation],
          isLoading: false
        }))

        console.log('✅ Direct matriculation created:', newMatriculation.id)
        return newMatriculation
      }
    } catch (error) {
      console.error('❌ Error creating matriculation:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Approve matriculation
  approveMatriculation: async (matriculationId) => {
    set({ isLoading: true, error: null })

    try {
      // Get matriculation details
      const matriculation = await matriculationService.getById(matriculationId)
      if (!matriculation) {
        throw new Error('Solicitud de matrícula no encontrada')
      }

      // Approve the matriculation
      const updatedMatriculation = await matriculationService.approve(matriculationId)

      let newStudent = null

      // If this is a parent request with student data, create the student
      if (matriculation.estudiante_data || matriculation.estudianteData) {
        const estudianteData = matriculation.estudiante_data || matriculation.estudianteData
        const currentYear = new Date().getFullYear()

        // Use DNI as student code
        const code = estudianteData.dni

        // Create the student with approved data
        newStudent = await studentsService.create({
          ...estudianteData,
          codigo,
          nivel: matriculation.nivel,
          grado: matriculation.grado,
          seccion: matriculation.seccion || matriculation.section,
          academic_year: currentYear,
          status: 'enrolled',
          fecha_matricula: new Date().toISOString(),
          parent_id: matriculation.solicitante_id || matriculation.solicitanteId
        })

        console.log('✅ New student created from matriculation:', newStudent.code)

        // Generate payment schedule for the new student
        try {
          await generatePaymentSchedule(newStudent)
          console.log('✅ Payment schedule generated for student:', newStudent.id)
        } catch (paymentError) {
          console.warn('Could not generate payment schedule:', paymentError)
        }
      } else {
        // Handle admin direct enrollment
        const studentId = matriculation.student_id || matriculation.student_id
        if (studentId) {
          await studentsService.update(studentId, {
            status: 'enrolled',
            nivel: matriculation.nivel,
            grado: matriculation.grado,
            seccion: matriculation.seccion || matriculation.section
          })
        }
      }

      // Refresh data
      await get().initialize()

      set({ isLoading: false })
      console.log('✅ Matriculation approved:', matriculationId)

      return { matriculation: updatedMatriculation, student: newStudent }
    } catch (error) {
      console.error('❌ Error approving matriculation:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Reject matriculation
  rejectMatriculation: async (matriculationId, reason) => {
    set({ isLoading: true, error: null })

    try {
      const updatedMatriculation = await matriculationService.reject(matriculationId, reason)

      if (!updatedMatriculation) {
        throw new Error('Matrícula no encontrada')
      }

      set(state => ({
        matriculations: state.matriculations.map(m =>
          m.id === matriculationId ? updatedMatriculation : m
        ),
        isLoading: false
      }))

      console.log('✅ Matriculation rejected:', matriculationId)
      return updatedMatriculation
    } catch (error) {
      console.error('❌ Error rejecting matriculation:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Enroll student - Direct enrollment with payment schedule
  enrollStudent: async (enrollmentData) => {
    set({ isLoading: true, error: null })

    try {
      // Validate required fields (_id fields)
      if (!enrollmentData.studentId || !enrollmentData.nivel || !enrollmentData.grado || !enrollmentData.seccion || !enrollmentData.anoLectivo) {
        throw new Error('Faltan campos obligatorios para la matrícula (studentId, nivel_id, grado_id, seccion_id, academic_year_id)')
      }

      // Get student data
      const student = await studentsService.getById(enrollmentData.studentId)
      if (!student) {
        throw new Error('Estudiante no encontrado')
      }

      // CRITICAL VALIDATION: Verify student has a parent assigned
      // Buscar padre en el campo parents (JSON array)
      let hasParent = false
      if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
        const primaryParent = student.parents.find(p => p.is_primary) || student.parents[0]
        hasParent = !!primaryParent.user_id
      }
      // Fallback a campos antiguos
      if (!hasParent && (student.parent_id || student.parentId)) {
        hasParent = true
      }

      if (!hasParent) {
        throw new Error('❌ MATRÍCULA BLOQUEADA: El estudiante NO tiene un padre/tutor asignado. Por favor, asigne un padre/tutor antes de matricular.')
      }

      // Check if student is already enrolled for this academic year
      const existingMatricula = await matriculationService.getAll({
        student_id: enrollmentData.studentId,
        academic_year_id: enrollmentData.anoLectivo
      })

      if (existingMatricula && existingMatricula.length > 0) {
        throw new Error('El estudiante ya está matriculado para este año lectivo')
      }

      // Create matriculation record with FormData if there's a contract file
      let newMatriculation;
      if (enrollmentData.contratoFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('student_id', parseInt(enrollmentData.studentId));
        formData.append('level_id', parseInt(enrollmentData.nivel));
        formData.append('grade_id', parseInt(enrollmentData.grado));
        formData.append('section_id', parseInt(enrollmentData.seccion));
        formData.append('academic_year_id', parseInt(enrollmentData.anoLectivo));
        formData.append('enrollment_date', enrollmentData.fechaIngreso || getTodayLima());
        formData.append('status', 'active');
        formData.append('contract', enrollmentData.contratoFile); // The actual file

        console.log('📤 Datos de matrícula con archivo a enviar:', {
          student_id: parseInt(enrollmentData.studentId),
          level_id: parseInt(enrollmentData.nivel),
          grade_id: parseInt(enrollmentData.grado),
          section_id: parseInt(enrollmentData.seccion),
          academic_year_id: parseInt(enrollmentData.anoLectivo),
          contract_file: enrollmentData.contratoFile?.name
        });

        newMatriculation = await matriculationService.createWithFile(formData);
      } else {
        // No file, send as JSON
        const matriculationData = {
          student_id: parseInt(enrollmentData.studentId),
          level_id: parseInt(enrollmentData.nivel),
          grade_id: parseInt(enrollmentData.grado),
          section_id: parseInt(enrollmentData.seccion),
          academic_year_id: parseInt(enrollmentData.anoLectivo),
          enrollment_date: enrollmentData.fechaIngreso || getTodayLima(),
          status: 'active'
        };

        // Verificar que todos los IDs sean números válidos
        if (!matriculationData.student_id || isNaN(matriculationData.student_id)) {
          throw new Error('student_id inválido');
        }
        if (!matriculationData.level_id || isNaN(matriculationData.level_id)) {
          throw new Error('level_id inválido - Asegúrate de seleccionar un nivel');
        }
        if (!matriculationData.grade_id || isNaN(matriculationData.grade_id)) {
          throw new Error('grade_id inválido - Asegúrate de seleccionar un grado');
        }
        if (!matriculationData.section_id || isNaN(matriculationData.section_id)) {
          throw new Error('section_id inválido - Asegúrate de seleccionar una sección');
        }
        if (!matriculationData.academic_year_id || isNaN(matriculationData.academic_year_id)) {
          throw new Error('academic_year_id inválido - Asegúrate de seleccionar un año lectivo');
        }

        newMatriculation = await matriculationService.create(matriculationData);
      }

      // Update student record with enrollment info
      // Los _id ya vienen desde enrollmentData, no necesitamos mapear
      const updatedStudent = await studentsService.update(enrollmentData.studentId, {
        level_id: parseInt(enrollmentData.nivel),  // Ahora es ID, no nombre
        grade_id: parseInt(enrollmentData.grado),  // Ahora es ID, no nombre
        section_id: parseInt(enrollmentData.seccion),  // Ahora es ID, no nombre
        academic_year_id: parseInt(enrollmentData.anoLectivo),  // Ahora es ID, no año
        enrollment_date: new Date().toISOString(),
        status: 'active',
        ...(enrollmentData.contratoNombre && {
          attached_contract: enrollmentData.contratoNombre
        })
      })

      // Generate or save custom payment schedule
      if (enrollmentData.customPaymentSchedule && enrollmentData.customPaymentSchedule.length > 0) {
        await generateCustomPaymentSchedule(updatedStudent, enrollmentData.customPaymentSchedule, enrollmentData.anoLectivo)
      } else {
        await generatePaymentSchedule(updatedStudent)
      }

      // Refresh data
      await get().initialize()

      set({ isLoading: false })
      console.log('✅ Student enrolled successfully:', enrollmentData.studentId)

      return newMatriculation

    } catch (error) {
      console.error('❌ Error enrolling student:', error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  // Get enrollment statistics
  getEnrollmentStats: () => {
    const { students, filters } = get()
    const academic_year_filter = filters.academic_year // Ahora es un ID o vacío

    // Filter students by academic year (usando academic_year_id)
    const studentsInYear = students.filter(s => {
      // Si no hay filtro de año, mostrar todos los estudiantes matriculados
      if (!academic_year_filter) {
        return s.academic_year_id // Solo mostrar los que tienen año asignado
      }
      // Comparar con academic_year_id
      return s.academic_year_id === academic_year_filter ||
             parseInt(s.academic_year_id) === parseInt(academic_year_filter)
    })

    // Estudiantes matriculados o activos (estados reales del sistema)
    const activeStudents = studentsInYear.filter(s =>
      s.state === 'enrolled' || s.status === 'enrolled' ||
      s.state === 'active' || s.status === 'active'
    )

    const byLevel = {
      inicial: activeStudents.filter(s => s.level_id === 5 || s.nivel === 'inicial').length,
      primaria: activeStudents.filter(s => s.level_id === 6 || s.nivel === 'primaria').length,
      secundaria: activeStudents.filter(s => s.level_id === 7 || s.nivel === 'secundaria').length
    }

    // Estados reales del sistema: enrolled, active, inactive
    const byStatus = {
      enrolled: studentsInYear.filter(s => s.state === 'enrolled' || s.status === 'enrolled').length,
      active: studentsInYear.filter(s => s.state === 'active' || s.status === 'active').length,
      inactive: studentsInYear.filter(s => s.state === 'inactive' || s.status === 'inactive').length
    }

    return {
      total: activeStudents.length,
      byLevel,
      byStatus,
      newEnrollments: studentsInYear.filter(s => {
        // Contar como nueva matrícula si tiene fecha de matrícula este año
        const enrollmentDate = new Date(s.fecha_matricula || s.fechaMatricula || s.enrollment_date)
        return enrollmentDate.getFullYear() === new Date().getFullYear()
      }).length
    }
  },

  // Get matriculation by student
  getStudentMatriculation: async (studentId, academicYearId) => {
    try {
      const matriculations = await matriculationService.getByStudent(studentId)

      if (academicYearId) {
        return matriculations.find(m => m.academic_year_id === academicYearId)
      }

      return matriculations
    } catch (error) {
      console.error('Error getting student matriculation:', error)
      return null
    }
  },

  // Get pending matriculations
  getPendingMatriculations: () => {
    const { matriculations } = get()
    return matriculations.filter(m => m.state === 'pendiente')
  },

  // Get approved matriculations
  getApprovedMatriculations: () => {
    const { matriculations } = get()
    return matriculations.filter(m => m.state === 'aprobada' || m.state === 'approved')
  },

  // Update filters
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },

  // Clear error
  clearError: () => set({ error: null })
}))
