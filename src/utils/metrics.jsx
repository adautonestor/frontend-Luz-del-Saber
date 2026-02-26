// Metrics calculation utilities - Anti-hardcoding policy compliant

/**
 * Calculates academic metrics only with available data
 * Returns insufficient-data status when data is missing
 */
export class MetricsCalculator {
  constructor() {
    this.requiredFields = {
      studentMetrics: ['students', 'grades', 'courses'],
      paymentMetrics: ['payments', 'obligations', 'concepts'],
      communicationMetrics: ['communications', 'confirmations'],
      academicMetrics: ['students', 'grades', 'evaluationStructures']
    }
  }

  /**
   * Calculate student enrollment metrics
   */
  calculateEnrollmentMetrics(data) {
    const required = this.requiredFields.studentMetrics
    const missing = required.filter(field => !data[field] || data[field].length === 0)
    
    if (missing.length > 0) {
      return {
        status: 'insufficient-data',
        missing: missing,
        message: `Datos insuficientes para calcular métricas de matrícula. Faltan: ${missing.join(', ')}`
      }
    }

    const { students = [], sections = [], levels = [] } = data
    
    // Calculate by level
    const byLevel = levels.map(level => {
      const levelStudents = students.filter(s => s.nivel === level.name && s.state === 'activo')
      return {
        level: level.name,
        count: levelStudents.length,
        capacity: sections.filter(sec => sec.grade_id?.includes(level.name)).length * 30 // Assuming 30 per section
      }
    })

    // Calculate by section occupancy
    const sectionOccupancy = sections.map(section => {
      const sectionStudents = students.filter(s => 
        s.grado === section.grade_id && 
        s.seccion === section.name && 
        s.state === 'activo'
      )
      return {
        section: `${section.grade_id} ${section.name}`,
        current: sectionStudents.length,
        capacity: section.capacidad || 30,
        occupancy: ((sectionStudents.length / (section.capacidad || 30)) * 100).toFixed(1)
      }
    })

    return {
      status: 'success',
      data: {
        total: students.filter(s => s.state === 'activo').length,
        byLevel,
        sectionOccupancy,
        averageOccupancy: (sectionOccupancy.reduce((sum, s) => sum + parseFloat(s.occupancy), 0) / sectionOccupancy.length).toFixed(1)
      }
    }
  }

  /**
   * Calculate payment metrics
   */
  calculatePaymentMetrics(data) {
    const required = this.requiredFields.paymentMetrics
    const missing = required.filter(field => !data[field] || data[field].length === 0)
    
    if (missing.length > 0) {
      return {
        status: 'insufficient-data',
        missing: missing,
        message: `Datos insuficientes para calcular métricas de pagos. Faltan: ${missing.join(', ')}`
      }
    }

    const { obligations = [], payments = [], concepts = [] } = data
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Monthly income calculation
    const monthlyIncome = payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt)
        return paymentDate.getMonth() + 1 === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               p.state === 'confirmado'
      })
      .reduce((sum, p) => sum + p.amount, 0)

    // Expected monthly income
    const monthlyStudents = obligations.filter(o => 
      o.due_month === currentMonth && 
      o.academic_year === currentYear
    ).length

    const mensualidadConcept = concepts.find(c => c.name === 'Mensualidad')
    const expectedMonthlyIncome = monthlyStudents * (mensualidadConcept?.amount || 0)

    // Delinquency rate
    const overdueObligations = obligations.filter(o => {
      const dueDate = new Date(o.due_date)
      const today = new Date()
      return dueDate < today && o.state === 'pendiente'
    })

    const delinquencyRate = obligations.length > 0 ? 
      ((overdueObligations.length / obligations.length) * 100).toFixed(1) : 0

    // Payment status distribution
    const statusDistribution = {
      pending: obligations.filter(o => o.state === 'pendiente').length,
      partial: obligations.filter(o => o.state === 'parcial').length,
      completed: obligations.filter(o => o.state === 'completo').length,
      overdue: overdueObligations.length
    }

    return {
      status: 'success',
      data: {
        monthlyIncome,
        expectedMonthlyIncome,
        collectionRate: expectedMonthlyIncome > 0 ? 
          ((monthlyIncome / expectedMonthlyIncome) * 100).toFixed(1) : 0,
        delinquencyRate,
        statusDistribution,
        totalPending: overdueObligations.reduce((sum, o) => sum + o.pending_balance, 0)
      }
    }
  }

  /**
   * Calculate academic performance metrics
   */
  calculateAcademicMetrics(data) {
    const required = this.requiredFields.academicMetrics
    const missing = required.filter(field => !data[field] || data[field].length === 0)
    
    if (missing.length > 0) {
      return {
        status: 'insufficient-data',
        missing: missing,
        message: `Datos insuficientes para calcular métricas académicas. Faltan: ${missing.join(', ')}`
      }
    }

    const { students = [], grades = [], averages = [], courses = [] } = data
    const currentYear = new Date().getFullYear()

    // Overall pass rate
    const studentsWithGrades = averages.filter(avg => 
      avg.academic_year === currentYear && 
      avg.promedioAcumulado !== null
    )

    if (studentsWithGrades.length === 0) {
      return {
        status: 'insufficient-data',
        missing: ['student_averages'],
        message: 'No hay promedios disponibles para calcular métricas académicas'
      }
    }

    const passRate = (studentsWithGrades.filter(avg => avg.promedioAcumulado >= 11).length / studentsWithGrades.length * 100).toFixed(1)
    
    // Average by level
    const levelAverages = ['inicial', 'primaria', 'secundaria'].map(level => {
      const levelStudents = studentsWithGrades.filter(avg => {
        const student = students.find(s => s.id === avg.student_id)
        return student?.nivel === level
      })
      
      if (levelStudents.length === 0) return { level, average: null, count: 0 }
      
      const average = levelStudents.reduce((sum, avg) => sum + avg.promedioAcumulado, 0) / levelStudents.length
      return {
        level,
        average: average.toFixed(1),
        count: levelStudents.length
      }
    }).filter(item => item.count > 0)

    // Course performance
    const coursePerformance = courses.map(course => {
      const courseAverages = averages.filter(avg => avg.course_id === course.id)
      if (courseAverages.length === 0) return null
      
      const average = courseAverages.reduce((sum, avg) => sum + avg.promedioParcial, 0) / courseAverages.length
      const passCount = courseAverages.filter(avg => avg.promedioParcial >= 11).length
      
      return {
        courseName: course.name,
        average: average.toFixed(1),
        passRate: ((passCount / courseAverages.length) * 100).toFixed(1),
        studentCount: courseAverages.length
      }
    }).filter(Boolean)

    return {
      status: 'success',
      data: {
        overallAverage: (studentsWithGrades.reduce((sum, avg) => sum + avg.promedioAcumulado, 0) / studentsWithGrades.length).toFixed(1),
        passRate,
        levelAverages,
        coursePerformance: coursePerformance.slice(0, 10), // Top 10 courses
        totalStudentsEvaluated: studentsWithGrades.length
      }
    }
  }

  /**
   * Calculate communication metrics
   */
  calculateCommunicationMetrics(data) {
    const required = this.requiredFields.communicationMetrics
    const missing = required.filter(field => !data[field] || data[field].length === 0)
    
    if (missing.length > 0) {
      return {
        status: 'insufficient-data',
        missing: missing,
        message: `Datos insuficientes para calcular métricas de comunicación. Faltan: ${missing.join(', ')}`
      }
    }

    const { communications = [], confirmations = [] } = data
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Monthly communications
    const monthlyComms = communications.filter(comm => {
      const sentDate = new Date(comm.fechaEnvio)
      return sentDate.getMonth() + 1 === currentMonth && 
             sentDate.getFullYear() === currentYear &&
             comm.state === 'enviado'
    })

    if (monthlyComms.length === 0) {
      return {
        status: 'insufficient-data',
        missing: ['monthly_communications'],
        message: 'No hay comunicados enviados este mes para calcular métricas'
      }
    }

    // Read rate calculation
    const totalSent = confirmations.filter(conf => 
      monthlyComms.some(comm => comm.id === conf.comunicadoId)
    ).length

    const totalRead = confirmations.filter(conf => 
      monthlyComms.some(comm => comm.id === conf.comunicadoId) && conf.fechaLectura
    ).length

    const totalConfirmed = confirmations.filter(conf => 
      monthlyComms.some(comm => comm.id === conf.comunicadoId) && conf.fechaConfirmacion
    ).length

    // Communication types distribution
    const typeDistribution = monthlyComms.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + 1
      return acc
    }, {})

    return {
      status: 'success',
      data: {
        totalSent: monthlyComms.length,
        readRate: totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : 0,
        confirmationRate: totalSent > 0 ? ((totalConfirmed / totalSent) * 100).toFixed(1) : 0,
        typeDistribution,
        averageReadTime: this.calculateAverageReadTime(confirmations, monthlyComms),
        pendingReads: totalSent - totalRead,
        pendingConfirmations: totalRead - totalConfirmed
      }
    }
  }

  /**
   * Calculate average time to read communications
   */
  calculateAverageReadTime(confirmations, communications) {
    const readTimes = confirmations
      .filter(conf => conf.fechaLectura && 
        communications.some(comm => comm.id === conf.comunicadoId))
      .map(conf => {
        const comm = communications.find(c => c.id === conf.comunicadoId)
        if (!comm) return null
        
        const sentTime = new Date(conf.fechaEnvio).getTime()
        const readTime = new Date(conf.fechaLectura).getTime()
        return readTime - sentTime
      })
      .filter(Boolean)

    if (readTimes.length === 0) return '0 horas'

    const averageMs = readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length
    const averageHours = Math.round(averageMs / (1000 * 60 * 60))

    if (averageHours < 1) return '< 1 hora'
    if (averageHours < 24) return `${averageHours} horas`
    return `${Math.round(averageHours / 24)} días`
  }

  /**
   * Generate dashboard metrics for specific role
   */
  generateDashboardMetrics(role, data) {
    const metrics = {}

    try {
      // Common metrics for all roles
      if (data.students) {
        const enrollmentResult = this.calculateEnrollmentMetrics(data)
        if (enrollmentResult.status === 'success') {
          metrics.enrollment = enrollmentResult.data
        }
      }

      // Role-specific metrics
      switch (role) {
        case 'administrador':
          if (data.payments) {
            const paymentResult = this.calculatePaymentMetrics(data)
            if (paymentResult.status === 'success') {
              metrics.payments = paymentResult.data
            }
          }
          
          if (data.communications) {
            const commResult = this.calculateCommunicationMetrics(data)
            if (commResult.status === 'success') {
              metrics.communications = commResult.data
            }
          }
          break

        case 'profesor':
          if (data.grades) {
            const academicResult = this.calculateAcademicMetrics(data)
            if (academicResult.status === 'success') {
              metrics.academic = academicResult.data
            }
          }
          break

        case 'padre':
          // Parent-specific metrics would be calculated here
          // Focus on their children's data only
          break
      }

      return {
        status: 'success',
        data: metrics,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        status: 'error',
        message: 'Error al calcular métricas del dashboard',
        error: error.message
      }
    }
  }
}

// Singleton instance
export const metricsCalculator = new MetricsCalculator()

// Helper functions for specific calculations
export function calculateGradeAverage(grades, structure) {
  if (!grades || !structure || grades.length === 0) {
    return {
      status: 'insufficient-data',
      message: 'Datos insuficientes para calcular promedio'
    }
  }

  try {
    let totalWeight = 0
    let weightedSum = 0

    structure.categorias.forEach(categoria => {
      categoria.subcategorias.forEach(subcategoria => {
        const grade = grades.find(g => 
          g.categoriaId === categoria.id && 
          g.subcategoriaId === subcategoria.id
        )
        
        if (grade && grade.valor !== null) {
          const weight = (categoria.peso * subcategoria.peso) / 100
          weightedSum += grade.valor * weight
          totalWeight += weight
        }
      })
    })

    if (totalWeight === 0) {
      return {
        status: 'insufficient-data',
        message: 'No hay notas suficientes para calcular promedio'
      }
    }

    return {
      status: 'success',
      average: Math.round((weightedSum / totalWeight) * 100) / 100,
      totalWeight,
      breakdown: structure.categorias.map(cat => ({
        category: cat.name,
        weight: cat.peso,
        subcategories: cat.subcategorias.map(sub => {
          const grade = grades.find(g => 
            g.categoriaId === cat.id && 
            g.subcategoriaId === sub.id
          )
          return {
            name: sub.name,
            weight: sub.peso,
            grade: grade?.valor || null
          }
        })
      }))
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Error al calcular promedio',
      error: error.message
    }
  }
}

export function calculatePaymentStatus(obligation) {
  if (!obligation) return 'unknown'
  
  const now = new Date()
  const dueDate = new Date(obligation.due_date)
  
  if (obligation.paid_amount >= obligation.total_amount) {
    return 'completed'
  } else if (obligation.paid_amount > 0) {
    return 'partial'
  } else if (now > dueDate) {
    return 'overdue'
  } else {
    return 'pending'
  }
}