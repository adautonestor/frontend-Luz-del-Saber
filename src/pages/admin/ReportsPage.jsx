import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, PieChart, TrendingUp, Download,
  FileText, Calendar, Filter, Users,
  DollarSign, GraduationCap, Award,
  Activity, Eye, Printer, AlertCircle, X
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { reportsService } from '../../services/reportsService'
import {
  generateGradesSummaryPDF,
  generateHonorRollPDF,
  generateFailedStudentsPDF,
  generateDelinquentParentsPDF,
  generateTeachingStaffPDF,
  generateEnrollmentPDF,
  generateFinancialStatsPDF,
  generateCoursesWithoutGradesPDF,
  generateAccountsReceivablePDF,
  generatePaymentMethodsPDF,
  generateGenericTablePDF
} from '../../utils/pdfGenerators'
import FailedStudentsView from '../../components/reports/views/FailedStudentsView'
import PaymentMethodsView from '../../components/reports/views/PaymentMethodsView'
import DelinquentParentsView from '../../components/reports/views/DelinquentParentsView'
import TableView from '../../components/reports/views/TableView'
import ChartView from '../../components/reports/views/ChartView'
import MixedView from '../../components/reports/views/MixedView'
import CoursesWithoutGradesView from '../../components/reports/views/CoursesWithoutGradesView'
import SummaryView from '../../components/reports/views/SummaryView'
import QuickStatsSection from '../../components/reports/QuickStatsSection'
import FailedCoursesModal from '../../components/reports/FailedCoursesModal'
import { academicYearService } from '../../services/academic/academicYearService'

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('academic')
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [showCoursesModal, setShowCoursesModal] = useState(false)
  const [selectedStudentCourses, setSelectedStudentCourses] = useState(null)
  const [paymentCommitments, setPaymentCommitments] = useState({})
  const [failedStudentsFilters, setFailedStudentsFilters] = useState({
    nivel: 'todos',
    grado: 'todos',
    seccion: 'todos',
    minCursosDesaprobados: 0
  })

  // Cargar año lectivo activo
  useEffect(() => {
    const loadActiveYear = async () => {
      try {
        const years = await academicYearService.getAll() || []
        const activeYear = years.find(y => y.status === 'active' || y.state === 'activo')
        const yearsList = years.map(y => y.year || y.año).filter(Boolean).sort((a, b) => b - a)
        setSelectedYear(activeYear?.year || activeYear?.año || yearsList[0] || new Date().getFullYear())
      } catch (error) {
        console.error('Error loading year:', error)
        setSelectedYear(new Date().getFullYear())
      }
    }
    loadActiveYear()
  }, [])

  // Función para marcar/desmarcar compromiso de pago
  const togglePaymentCommitment = (parentEmail) => {
    const updatedCommitments = {
      ...paymentCommitments,
      [parentEmail]: {
        hasCommitment: !paymentCommitments[parentEmail]?.hasCommitment,
        date: new Date().toISOString(),
        markedBy: 'Director General'
      }
    }
    setPaymentCommitments(updatedCommitments)
  }

  // Función para exportar Padres Morosos a Excel
  const exportDelinquentParentsToExcel = () => {
    if (!reportData || reportData.type !== 'delinquent-table') return

    const excelData = reportData.data.map(parent => ({
      'Padre/Madre': parent.parentName,
      'Email': parent.parentEmail,
      'Estudiante': parent.studentName,
      'Nivel': parent.level,
      'Grado': parent.grade,
      'Seccion': parent.section,
      'Contacto': parent.parentPhone,
      'Deuda Total (S/.)': parent.totalDebt.toFixed(2),
      'Obligaciones Pendientes': parent.obligationsCount,
      'Conceptos': parent.concepts.join(', '),
      'Compromiso de Pago': paymentCommitments[parent.parentEmail]?.hasCommitment ? 'Si' : 'No'
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Padres Morosos')

    const statsData = [
      { 'Estadistica': 'Total Padres Morosos', 'Valor': reportData.stats.totalDelinquentParents },
      { 'Estadistica': 'Deuda Total (S/.)', 'Valor': reportData.stats.totalDebt },
      { 'Estadistica': 'Deuda Promedio (S/.)', 'Valor': reportData.stats.averageDebt }
    ]
    const statsWorksheet = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadisticas')

    const fileName = `Padres_Morosos_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const reports = {
    academic: [
      {
        id: 'grades-summary',
        title: 'Resumen de Notas',
        description: 'Promedio de notas por grado y seccion',
        icon: GraduationCap,
        color: 'blue'
      },
      {
        id: 'honor-roll',
        title: 'Cuadro de Honor',
        description: 'Estudiantes destacados por periodo',
        icon: Award,
        color: 'yellow'
      },
      {
        id: 'failed-students',
        title: 'Estudiantes Desaprobados',
        description: 'Estudiantes con notas C o D en competencias',
        icon: TrendingUp,
        color: 'red'
      },
      {
        id: 'courses-no-grades',
        title: 'Cursos sin Notas',
        description: 'Cursos y docentes sin notas registradas',
        icon: AlertCircle,
        color: 'orange'
      }
    ],
    financial: [
      {
        id: 'financial-stats',
        title: 'Estadisticas Financieras',
        description: 'Resumen de ingresos y cobros',
        icon: DollarSign,
        color: 'green'
      },
      {
        id: 'accounts-receivable',
        title: 'Cuentas por Cobrar',
        description: 'Pagos pendientes y vencidos',
        icon: FileText,
        color: 'red'
      },
      {
        id: 'delinquent-parents',
        title: 'Padres Morosos',
        description: 'Lista detallada de padres con pagos vencidos',
        icon: AlertCircle,
        color: 'orange'
      },
      {
        id: 'payment-methods',
        title: 'Metodos de Pago',
        description: 'Analisis de transacciones por metodo',
        icon: PieChart,
        color: 'blue'
      },
      {
        id: 'collection-rate',
        title: 'Tasa de Cobranza',
        description: 'Porcentaje de cobros efectivos',
        icon: Activity,
        color: 'purple'
      }
    ],
    administrative: [
      {
        id: 'enrollment',
        title: 'Matricula',
        description: 'Estado de matricula por nivel',
        icon: Users,
        color: 'blue'
      },
      {
        id: 'staff',
        title: 'Personal Docente',
        description: 'Distribucion de carga horaria',
        icon: Users,
        color: 'green'
      }
    ]
  }

  const generateReport = async (reportId) => {
    setLoading(true)
    setSelectedReport(reportId)

    try {
      let response
      const academicYear = selectedYear

      switch(reportId) {
        case 'grades-summary':
          response = await reportsService.getGradesSummary(academicYear)
          break
        case 'honor-roll':
          response = await reportsService.getHonorRoll(academicYear, 20)
          break
        case 'failed-students':
          response = await reportsService.getFailedStudents(academicYear)
          break
        case 'courses-no-grades':
          response = await reportsService.getCoursesWithoutGrades(academicYear)
          break
        case 'financial-stats':
          response = await reportsService.getFinancialStats(academicYear)
          setReportData({
            type: 'summary',
            title: 'Estadisticas Financieras',
            data: response
          })
          setLoading(false)
          return
        case 'accounts-receivable':
          response = await reportsService.getAccountsReceivable(academicYear)
          break
        case 'delinquent-parents':
          response = await reportsService.getDelinquentParents(academicYear)
          break
        case 'payment-methods':
          response = await reportsService.getPaymentMethods(academicYear)
          break
        case 'collection-rate':
          response = await reportsService.getCollectionRate(academicYear)
          setReportData({
            type: 'summary',
            title: 'Tasa de Cobranza',
            data: response
          })
          setLoading(false)
          return
        case 'enrollment':
          response = await reportsService.getEnrollmentStats(academicYear)
          break
        case 'staff':
          response = await reportsService.getTeachingStaff(academicYear)
          break
        default:
          response = { data: { type: 'table', title: 'Reporte', data: [] } }
      }

      // El servicio ya retorna el objeto con {type, headers, data}
      // NO extraer .data otra vez
      setReportData(response)
    } catch (error) {
      console.error('Error generating report:', error)
      setReportData({
        type: 'error',
        title: 'Error',
        message: 'No se pudo generar el reporte. Intente nuevamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Funcion para exportar Cursos sin Notas a Excel
  const exportCoursesWithoutGradesToExcel = () => {
    if (!reportData || reportData.type !== 'courses-no-grades-table') return

    const wb = XLSX.utils.book_new()

    // Hoja principal de cursos
    const excelData = reportData.data.map(course => ({
      'Curso': course.courseName || course.course_name || '',
      'Codigo': course.courseCode || course.code || '',
      'Area': course.courseArea || course.area || '',
      'Nivel': course.level || '',
      'Grado': course.grade || '',
      'Docente Asignado': course.assignedTeacher || 'Sin asignar',
      'Email Docente': course.teacherEmail || '',
      'Telefono Docente': course.teacherPhone || '',
      'Horas Semanales': course.weeklyHours || 0,
      'Ultimo Registro': course.lastGradeDate || 'Nunca',
      'Estado': course.status || 'Normal'
    }))

    const wsMain = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(wb, wsMain, 'Cursos sin Notas')

    // Hoja de estadisticas
    const stats = reportData.stats || {}
    const statsData = [
      { 'Estadistica': 'Cursos sin Notas', 'Valor': stats.coursesWithoutGrades || 0 },
      { 'Estadistica': 'Total Cursos', 'Valor': stats.totalCourses || 0 },
      { 'Estadistica': 'Porcentaje sin Notas', 'Valor': `${stats.percentageWithoutGrades || 0}%` },
      { 'Estadistica': 'Cursos Criticos', 'Valor': stats.criticalCourses || 0 }
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadisticas')

    // Hoja de docentes si hay
    if (stats.teacherStats && stats.teacherStats.length > 0) {
      const teacherData = stats.teacherStats.map(t => ({
        'Docente': t.name || '',
        'Contacto': t.contact || '',
        'Cursos sin Notas': t.coursesWithoutGrades || 0,
        'Horas Totales': t.totalHours || 0
      }))
      const wsTeachers = XLSX.utils.json_to_sheet(teacherData)
      XLSX.utils.book_append_sheet(wb, wsTeachers, 'Por Docente')
    }

    const fileName = `Cursos_Sin_Notas_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Funcion para exportar Cuentas por Cobrar a Excel
  const exportAccountsReceivableToExcel = () => {
    if (!reportData || reportData.type !== 'accounts-receivable') return

    const wb = XLSX.utils.book_new()

    // Hoja principal
    const excelData = reportData.data.map(item => ({
      'Concepto': item.conceptName || item.concept || '',
      'Tipo': item.conceptType || item.type || '',
      'Obligaciones': item.obligationsCount || 0,
      'Monto Total (S/.)': (item.totalAmount || 0).toFixed(2),
      'Monto Cobrado (S/.)': (item.paidAmount || 0).toFixed(2),
      'Saldo Pendiente (S/.)': (item.pendingBalance || 0).toFixed(2),
      'Monto Vencido (S/.)': (item.overdueAmount || 0).toFixed(2),
      'Tasa de Cobranza': item.collectionRate || '0%'
    }))

    const wsMain = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(wb, wsMain, 'Cuentas por Cobrar')

    // Hoja de resumen
    const stats = reportData.stats || {}
    const statsData = [
      { 'Estadistica': 'Total Conceptos', 'Valor': stats.totalConcepts || 0 },
      { 'Estadistica': 'Total Pendiente (S/.)', 'Valor': (stats.totalPending || 0).toFixed(2) },
      { 'Estadistica': 'Total Vencido (S/.)', 'Valor': (stats.totalOverdue || 0).toFixed(2) }
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Resumen')

    const fileName = `Cuentas_Por_Cobrar_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Funcion para exportar Metodos de Pago a Excel
  const exportPaymentMethodsToExcel = () => {
    if (!reportData || reportData.type !== 'payment-methods-detailed') return

    const wb = XLSX.utils.book_new()

    // Hoja principal
    const excelData = reportData.data.map(method => ({
      'Metodo de Pago': method.name || method.method || '',
      'Transacciones': method.transactionsCount || method.transactions_count || 0,
      'Monto Total (S/.)': (method.totalAmount || method.total_amount || 0).toFixed(2),
      'Porcentaje': `${method.percentage || 0}%`,
      'Promedio por Transaccion (S/.)': (method.averageAmount || ((method.totalAmount || 0) / (method.transactionsCount || 1))).toFixed(2)
    }))

    const wsMain = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(wb, wsMain, 'Metodos de Pago')

    // Hoja de resumen
    const stats = reportData.stats || {}
    const statsData = [
      { 'Estadistica': 'Total Transacciones', 'Valor': stats.totalTransactions || 0 },
      { 'Estadistica': 'Monto Total (S/.)', 'Valor': (stats.totalAmount || 0).toFixed(2) },
      { 'Estadistica': 'Metodos Utilizados', 'Valor': stats.methodsCount || reportData.data?.length || 0 }
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Resumen')

    const fileName = `Metodos_Pago_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Funcion para exportar Estudiantes Desaprobados a Excel (con cursos detallados)
  const exportFailedStudentsToExcel = () => {
    if (!reportData || reportData.type !== 'failed-students-report') return

    const wb = XLSX.utils.book_new()

    // Hoja principal de estudiantes
    const excelData = reportData.data.map(student => ({
      'Estudiante': student.studentName || '',
      'Codigo': student.studentCode || '',
      'Nivel': student.level || '',
      'Grado': student.grade || '',
      'Seccion': student.section || '',
      'Cursos Desaprobados': student.failedSubjectsCount || student.failedCoursesCount || (student.failedCourses?.length || 0),
      'Contacto Padre': student.parentContact || '',
      'Detalle Cursos': (student.failedCourses || []).map(c => `${c.courseName || c.name} (${c.grade || c.value})`).join('; ')
    }))

    const wsMain = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(wb, wsMain, 'Estudiantes Desaprobados')

    // Hoja de estadisticas
    const stats = reportData.stats || {}
    const statsData = [
      { 'Estadistica': 'Total Estudiantes Desaprobados', 'Valor': stats.totalFailedStudents || 0 },
      { 'Estadistica': 'Total Estudiantes', 'Valor': stats.totalStudents || 0 },
      { 'Estadistica': 'Tasa de Desaprobacion', 'Valor': `${stats.failureRate || 0}%` }
    ]
    const wsStats = XLSX.utils.json_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadisticas')

    // Hoja de analisis por materia
    if (stats.subjectStats && stats.subjectStats.length > 0) {
      const subjectData = stats.subjectStats.map(s => ({
        'Materia': s.name || '',
        'Area': s.area || '',
        'Desaprobados': s.failedCount || 0,
        'Porcentaje Desaprobacion': `${s.failurePercentage || 0}%`
      }))
      const wsSubjects = XLSX.utils.json_to_sheet(subjectData)
      XLSX.utils.book_append_sheet(wb, wsSubjects, 'Por Materia')
    }

    const fileName = `Estudiantes_Desaprobados_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleExport = (format) => {
    if (!reportData) return

    // Exportar a Excel
    if (format === 'excel') {
      // Usar funciones especificas segun el tipo de reporte
      switch (reportData.type) {
        case 'delinquent-table':
          exportDelinquentParentsToExcel()
          return
        case 'courses-no-grades-table':
          exportCoursesWithoutGradesToExcel()
          return
        case 'accounts-receivable':
          exportAccountsReceivableToExcel()
          return
        case 'payment-methods-detailed':
          exportPaymentMethodsToExcel()
          return
        case 'failed-students-report':
          exportFailedStudentsToExcel()
          return
        default:
          // Exportar datos genericos a Excel
          if (reportData.data && Array.isArray(reportData.data)) {
            const worksheet = XLSX.utils.json_to_sheet(reportData.data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
            const fileName = `${reportData.title?.replace(/\s+/g, '_') || 'Reporte'}_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`
            XLSX.writeFile(workbook, fileName)
          }
          return
      }
    }

    // Exportar a PDF o Imprimir
    if (format === 'pdf' || format === 'print') {
      const mode = format === 'print' ? 'print' : 'download'
      try {
        switch (reportData.type) {
          case 'table':
            generateGradesSummaryPDF(reportData, selectedYear, mode)
            break
          case 'honor-roll':
            generateHonorRollPDF(reportData, selectedYear, mode)
            break
          case 'failed-students-report':
            generateFailedStudentsPDF(reportData, selectedYear, mode)
            break
          case 'courses-no-grades-table':
            generateCoursesWithoutGradesPDF(reportData, selectedYear, mode)
            break
          case 'delinquent-table':
            generateDelinquentParentsPDF(reportData, selectedYear, mode)
            break
          case 'accounts-receivable':
            generateAccountsReceivablePDF(reportData, selectedYear, mode)
            break
          case 'payment-methods-detailed':
            generatePaymentMethodsPDF(reportData, selectedYear, mode)
            break
          case 'teaching-staff':
            generateTeachingStaffPDF(reportData, selectedYear, mode)
            break
          case 'enrollment-stats':
            generateEnrollmentPDF(reportData, selectedYear, mode)
            break
          case 'summary':
            generateFinancialStatsPDF(reportData, selectedYear, mode)
            break
          default:
            generateGenericTablePDF(reportData, selectedYear, mode)
        }
      } catch (error) {
        console.error('Error generando PDF:', error)
        alert('Error al generar el PDF. Intente nuevamente.')
      }
      return
    }
  }

  const tabs = [
    { id: 'academic', label: 'Academicos', icon: GraduationCap },
    { id: 'financial', label: 'Financieros', icon: DollarSign },
    { id: 'administrative', label: 'Administrativos', icon: Users }
  ]

  // Renderizar vista de honor roll
  const renderHonorRollView = () => {
    if (!reportData || reportData.type !== 'honor-roll') return null

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Total Estudiantes</p>
            <p className="text-2xl font-bold text-yellow-700">{reportData.stats?.totalStudents || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Mejor Promedio</p>
            <p className="text-2xl font-bold text-green-700">{reportData.stats?.topAverage || 'N/A'}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {reportData.headers?.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 text-left font-medium text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.data?.map((student, idx) => (
                <tr key={idx} className={idx < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      idx === 0 ? 'bg-yellow-400 text-white' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-orange-300 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {student.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{student.studentName}</td>
                  <td className="px-4 py-3 text-gray-600">{student.studentCode}</td>
                  <td className="px-4 py-3">{student.level}</td>
                  <td className="px-4 py-3">{student.grade}</td>
                  <td className="px-4 py-3">{student.section}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-green-600">{student.averageGrade}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {student.excellentGrades} notas A/AD
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.data?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay estudiantes con notas A o AD registradas
          </div>
        )}
      </div>
    )
  }

  // Renderizar vista de cuentas por cobrar
  const renderAccountsReceivableView = () => {
    if (!reportData || reportData.type !== 'accounts-receivable') return null

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Conceptos</p>
            <p className="text-2xl font-bold text-blue-700">{reportData.stats?.totalConcepts || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Total Pendiente</p>
            <p className="text-2xl font-bold text-orange-700">S/ {reportData.stats?.totalPending?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Total Vencido</p>
            <p className="text-2xl font-bold text-red-700">S/ {reportData.stats?.totalOverdue?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {reportData.headers?.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 text-left font-medium text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.data?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium">{item.conceptName}</td>
                  <td className="px-4 py-3">{item.conceptType}</td>
                  <td className="px-4 py-3">{item.obligationsCount}</td>
                  <td className="px-4 py-3">S/ {item.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-green-600">S/ {item.paidAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-orange-600">S/ {item.pendingBalance?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-red-600">S/ {item.overdueAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      parseFloat(item.collectionRate) >= 80 ? 'bg-green-100 text-green-700' :
                      parseFloat(item.collectionRate) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.collectionRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Renderizar vista de estadisticas de matricula
  const renderEnrollmentView = () => {
    if (!reportData || reportData.type !== 'enrollment-stats') return null

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Matriculados</p>
            <p className="text-2xl font-bold text-blue-700">{reportData.stats?.totalEnrolled || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Secciones</p>
            <p className="text-2xl font-bold text-green-700">{reportData.stats?.totalSections || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Niveles</p>
            <p className="text-2xl font-bold text-purple-700">{reportData.stats?.levelsCount || 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {reportData.headers?.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 text-left font-medium text-gray-700">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.data?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium">{item.levelName}</td>
                  <td className="px-4 py-3">{item.totalStudents}</td>
                  <td className="px-4 py-3 text-green-600">{item.enrolledStudents}</td>
                  <td className="px-4 py-3">{item.sectionsCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      parseFloat(item.enrollmentRate) >= 80 ? 'bg-green-100 text-green-700' :
                      parseFloat(item.enrollmentRate) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.enrollmentRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Renderizar vista de personal docente
  const renderTeachingStaffView = () => {
    if (!reportData || reportData.type !== 'teaching-staff') return null

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Docentes</p>
            <p className="text-2xl font-bold text-blue-700">{reportData.stats?.totalTeachers || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Horas/Sem</p>
            <p className="text-2xl font-bold text-green-700">{reportData.stats?.totalHours || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Promedio Horas</p>
            <p className="text-2xl font-bold text-purple-700">{reportData.stats?.averageHours || 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-40">Docente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-48">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-28">Telefono</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-20">Cursos</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-20">Grados</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-24">Horas/Sem</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Niveles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.data?.map((teacher, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{teacher.teacherName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs break-all">{teacher.email}</td>
                  <td className="px-4 py-3 text-gray-600">{teacher.phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      {teacher.coursesCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full font-semibold">
                      {teacher.gradesCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                      {teacher.totalWeeklyHours}h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {teacher.levels?.map((level, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {level}
                        </span>
                      ))}
                      {(!teacher.levels || teacher.levels.length === 0) && (
                        <span className="text-gray-400 text-xs">Sin niveles</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.data?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay docentes registrados
          </div>
        )}
      </div>
    )
  }

  // Renderizar vista de resumen/summary
  const renderFinancialSummary = () => {
    if (!reportData || reportData.type !== 'summary') return null

    const data = reportData.data?.stats || reportData.data || {}

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total por Cobrar</p>
            <p className="text-2xl font-bold text-blue-700">S/ {data.totalAmount?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Cobrado</p>
            <p className="text-2xl font-bold text-green-700">S/ {data.totalPaid?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600">Total Pendiente</p>
            <p className="text-2xl font-bold text-orange-700">S/ {data.totalPending?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Tasa de Cobranza</p>
            <p className="text-2xl font-bold text-purple-700">{data.collectionRate || '0%'}</p>
          </div>
        </div>

        {data.overdueAmount > 0 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-sm text-red-600">Monto Vencido</p>
            <p className="text-2xl font-bold text-red-700">S/ {data.overdueAmount?.toFixed(2) || '0.00'}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Analisis</h1>
        <p className="mt-2 text-gray-600">Genera reportes detallados del sistema</p>
      </div>


      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports[activeTab].map((report) => {
          const Icon = report.icon
          const colors = {
            blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            green: 'bg-green-100 text-green-600 hover:bg-green-200',
            purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200',
            red: 'bg-red-100 text-red-600 hover:bg-red-200',
            orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
          }

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="card hover:shadow-lg transition-all cursor-pointer"
              onClick={() => generateReport(report.id)}
            >
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-lg ${colors[report.color]} mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {report.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Report Preview */}
      {loading && (
        <div className="card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-gray-600">Generando reporte...</span>
          </div>
        </div>
      )}

      {reportData && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {reportData.title}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  className="btn btn-outline px-3 py-1 flex items-center gap-2"
                >
                  <Download size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="btn btn-outline px-3 py-1 flex items-center gap-2"
                >
                  <Download size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExport('print')}
                  className="btn btn-outline px-3 py-1 flex items-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
              </div>
            </div>

            {/* Report Content - Conditional Rendering */}
            {reportData.type === 'error' && (
              <div className="text-center py-8 text-red-500">
                {reportData.message}
              </div>
            )}

            {reportData.type === 'table' && (
              <TableView reportData={reportData} />
            )}

            {reportData.type === 'chart' && (
              <ChartView reportData={reportData} />
            )}

            {reportData.type === 'mixed' && (
              <MixedView reportData={reportData} />
            )}

            {reportData.type === 'delinquent-table' && (
              <DelinquentParentsView
                reportData={reportData}
                paymentCommitments={paymentCommitments}
                togglePaymentCommitment={togglePaymentCommitment}
              />
            )}

            {reportData.type === 'failed-students-report' && (
              <FailedStudentsView
                reportData={reportData}
                failedStudentsFilters={failedStudentsFilters}
                setFailedStudentsFilters={setFailedStudentsFilters}
                setSelectedStudentCourses={setSelectedStudentCourses}
                setShowCoursesModal={setShowCoursesModal}
              />
            )}

            {reportData.type === 'courses-no-grades-table' && (
              <CoursesWithoutGradesView reportData={reportData} />
            )}

            {reportData.type === 'payment-methods-detailed' && (
              <PaymentMethodsView reportData={reportData} />
            )}

            {reportData.type === 'summary' && renderFinancialSummary()}

            {reportData.type === 'honor-roll' && renderHonorRollView()}

            {reportData.type === 'accounts-receivable' && renderAccountsReceivableView()}

            {reportData.type === 'enrollment-stats' && renderEnrollmentView()}

            {reportData.type === 'teaching-staff' && renderTeachingStaffView()}
          </div>
        </motion.div>
      )}

      <QuickStatsSection academicYear={selectedYear} />

      <FailedCoursesModal
        isOpen={showCoursesModal}
        studentCourses={selectedStudentCourses}
        onClose={() => {
          setShowCoursesModal(false)
          setSelectedStudentCourses(null)
        }}
      />
    </div>
  )
}

export default ReportsPage
