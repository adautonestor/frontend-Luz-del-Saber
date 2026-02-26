import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Maneja la salida del PDF (descarga o impresion)
 * @param {jsPDF} doc - Documento PDF
 * @param {string} fileName - Nombre del archivo
 * @param {string} mode - 'download' o 'print'
 */
const outputPDF = (doc, fileName, mode = 'download') => {
  if (mode === 'print') {
    // Abrir en nueva ventana para imprimir
    const pdfBlob = doc.output('blob')
    const blobUrl = URL.createObjectURL(pdfBlob)
    const printWindow = window.open(blobUrl, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    }
  } else {
    // Descargar
    doc.save(fileName)
  }
}

/**
 * Configuracion base para PDFs
 */
const PDF_CONFIG = {
  schoolName: 'INSTITUCION EDUCATIVA "LUZ DEL SABER"',
  margins: { top: 20, left: 15, right: 15 },
  colors: {
    primary: [41, 128, 185],
    secondary: [52, 73, 94],
    success: [39, 174, 96],
    warning: [243, 156, 18],
    danger: [231, 76, 60],
    light: [236, 240, 241]
  }
}

/**
 * Genera el encabezado del PDF
 */
const generateHeader = (doc, title, subtitle = null) => {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Fondo del header
  doc.setFillColor(...PDF_CONFIG.colors.primary)
  doc.rect(0, 0, pageWidth, 35, 'F')

  // Nombre de la institucion
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(PDF_CONFIG.schoolName, pageWidth / 2, 15, { align: 'center' })

  // Titulo del reporte
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(title, pageWidth / 2, 25, { align: 'center' })

  if (subtitle) {
    doc.setFontSize(10)
    doc.text(subtitle, pageWidth / 2, 32, { align: 'center' })
  }

  // Reset color
  doc.setTextColor(0, 0, 0)

  return 45 // Retorna la posicion Y donde continuar
}

/**
 * Genera el pie de pagina
 */
const generateFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)

    // Linea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15)

    // Texto del footer
    doc.text(
      `Generado por Sistema de Gestion Escolar - Luz del Saber`,
      15,
      pageHeight - 8
    )
    doc.text(
      `Pagina ${i} de ${pageCount}`,
      pageWidth - 15,
      pageHeight - 8,
      { align: 'right' }
    )
  }
}

/**
 * Genera PDF de Resumen de Notas
 */
export const generateGradesSummaryPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `RESUMEN DE NOTAS - AÑO ${academicYear || new Date().getFullYear()}`,
    `Fecha de generacion: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Tabla principal de resumen
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text('RESUMEN POR NIVEL, GRADO Y SECCION', PDF_CONFIG.margins.left, yPos)
  yPos += 5

  // Preparar datos para la tabla
  const tableData = reportData.data?.map(row => [
    row.level || row.nivel || '',
    row.grade || row.grado || '',
    row.section || row.seccion || '',
    row.studentCount || row.estudiantes || 0,
    row.gradesCount || row.notas_registradas || 0,
    row.averageGrade || row.promedio || '---',
    row.passingRate || row.tasa_aprobacion || '---'
  ]) || []

  const tableResult = autoTable(doc, {
    startY: yPos,
    head: [['Nivel', 'Grado', 'Seccion', 'Estudiantes', 'Notas', 'Promedio', 'Aprobacion']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 9
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 25 },
      1: { halign: 'left', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center', cellWidth: 25 }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  yPos = doc.lastAutoTable.finalY + 15

  // Estadisticas generales
  const totalStudents = tableData.reduce((sum, row) => sum + (parseInt(row[3]) || 0), 0)
  const totalGrades = tableData.reduce((sum, row) => sum + (parseInt(row[4]) || 0), 0)

  // Cuadro de estadisticas
  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 35, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text('ESTADISTICAS GENERALES', PDF_CONFIG.margins.left + 5, yPos + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Estudiantes con Notas: ${totalStudents}`, PDF_CONFIG.margins.left + 5, yPos + 20)
  doc.text(`Total Notas Registradas: ${totalGrades}`, PDF_CONFIG.margins.left + 5, yPos + 28)

  // Calcular promedio general
  const validAverages = tableData.filter(row => row[5] !== '---' && row[5] !== 'Sin notas' && !isNaN(parseFloat(row[5])))
  const avgGeneral = validAverages.length > 0
    ? (validAverages.reduce((sum, row) => sum + parseFloat(row[5]), 0) / validAverages.length).toFixed(1)
    : '---'

  doc.text(`Promedio General Institucional: ${avgGeneral}`, pageWidth / 2, yPos + 20)

  // Secciones con notas
  const sectionsWithGrades = tableData.filter(row => parseInt(row[4]) > 0).length
  doc.text(`Secciones con Notas: ${sectionsWithGrades} de ${tableData.length}`, pageWidth / 2, yPos + 28)

  // Footer
  generateFooter(doc)

  // Guardar
  outputPDF(doc, `Resumen_Notas_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Cuadro de Honor
 */
export const generateHonorRollPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()

  // Header
  let yPos = generateHeader(
    doc,
    `CUADRO DE HONOR - AÑO ${academicYear || new Date().getFullYear()}`,
    `Estudiantes Destacados - ${new Date().toLocaleDateString('es-PE')}`
  )

  // Tabla de honor
  const tableData = reportData.data?.map(student => [
    student.rank || '',
    student.studentName || '',
    student.studentCode || '',
    student.level || '',
    student.grade || '',
    student.section || '',
    student.averageGrade || '',
    student.excellentGrades || student.excellentCount || 0
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Estudiante', 'Codigo', 'Nivel', 'Grado', 'Sec.', 'Promedio', 'A/AD']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 156, 18], // Dorado
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 45 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'center', cellWidth: 20 },
      7: { halign: 'center', cellWidth: 15 }
    },
    didDrawCell: (data) => {
      // Destacar los 3 primeros
      if (data.section === 'body' && data.column.index === 0) {
        const rank = parseInt(data.cell.text[0])
        if (rank === 1) {
          doc.setFillColor(255, 215, 0) // Oro
          doc.circle(data.cell.x + 6, data.cell.y + 5, 4, 'F')
        } else if (rank === 2) {
          doc.setFillColor(192, 192, 192) // Plata
          doc.circle(data.cell.x + 6, data.cell.y + 5, 4, 'F')
        } else if (rank === 3) {
          doc.setFillColor(205, 127, 50) // Bronce
          doc.circle(data.cell.x + 6, data.cell.y + 5, 4, 'F')
        }
      }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Cuadro_Honor_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Estudiantes Desaprobados
 */
export const generateFailedStudentsPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `REPORTE DE ESTUDIANTES DESAPROBADOS - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Estadisticas
  const stats = reportData.stats || {}

  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 25, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Desaprobados: ${stats.totalFailedStudents || 0}`, PDF_CONFIG.margins.left + 5, yPos + 10)
  doc.text(`Total Estudiantes: ${stats.totalStudents || 0}`, pageWidth / 2 - 20, yPos + 10)
  doc.text(`Tasa: ${stats.failureRate || 0}%`, pageWidth - 50, yPos + 10)

  yPos += 35

  // Tabla de estudiantes
  const tableData = reportData.data?.map(student => [
    student.studentName || '',
    student.studentCode || '',
    student.level || '',
    student.grade || '',
    student.section || '',
    student.failedSubjectsCount || student.failedCoursesCount || 0,
    student.parentContact || ''
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Estudiante', 'Codigo', 'Nivel', 'Grado', 'Sec.', 'Cursos', 'Contacto']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.danger,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 40 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'left', cellWidth: 35 }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Estadisticas por materia si hay
  if (stats.subjectStats && stats.subjectStats.length > 0) {
    yPos = doc.lastAutoTable.finalY + 15

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_CONFIG.colors.secondary)
    doc.text('ANALISIS POR MATERIA', PDF_CONFIG.margins.left, yPos)
    yPos += 5

    const subjectData = stats.subjectStats.map(s => [
      s.name || '',
      s.area || '',
      s.failedCount || 0,
      `${s.failurePercentage || 0}%`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Materia', 'Area', 'Desaprobados', '% Desaprobacion']],
      body: subjectData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_CONFIG.colors.warning,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
    })
  }

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Estudiantes_Desaprobados_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Padres Morosos
 */
export const generateDelinquentParentsPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `REPORTE DE PADRES MOROSOS - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Estadisticas
  const stats = reportData.stats || {}

  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 20, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Morosos: ${stats.totalDelinquentParents || 0}`, PDF_CONFIG.margins.left + 10, yPos + 12)
  doc.text(`Deuda Total: S/ ${(stats.totalDebt || 0).toLocaleString('es-PE')}`, pageWidth / 3, yPos + 12)
  doc.text(`Deuda Promedio: S/ ${stats.averageDebt || 0}`, pageWidth * 2 / 3, yPos + 12)

  yPos += 30

  // Tabla
  const tableData = reportData.data?.map(parent => [
    parent.parentName || '',
    parent.studentName || '',
    parent.level || '',
    parent.grade || '',
    parent.section || '',
    parent.parentPhone || '',
    `S/ ${(parent.totalDebt || 0).toFixed(2)}`,
    parent.obligationsCount || 0,
    (parent.concepts || []).slice(0, 2).join(', ')
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Padre/Madre', 'Estudiante', 'Nivel', 'Grado', 'Sec.', 'Telefono', 'Deuda', 'Oblig.', 'Conceptos']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.danger,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 40 },
      1: { halign: 'left', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'right', cellWidth: 25 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'left', cellWidth: 50 }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Padres_Morosos_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Personal Docente
 */
export const generateTeachingStaffPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF('landscape')

  // Header
  let yPos = generateHeader(
    doc,
    `PERSONAL DOCENTE - CARGA HORARIA ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  const stats = reportData.stats || {}

  // Estadisticas
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Docentes: ${stats.totalTeachers || 0}`, PDF_CONFIG.margins.left, yPos + 5)
  doc.text(`Total Horas/Semana: ${stats.totalHours || 0}h`, 100, yPos + 5)
  doc.text(`Promedio Horas: ${stats.averageHours || 0}h`, 180, yPos + 5)

  yPos += 15

  // Tabla
  const tableData = reportData.data?.map(teacher => [
    teacher.teacherName || '',
    teacher.email || '',
    teacher.phone || '',
    teacher.coursesCount || 0,
    teacher.gradesCount || 0,
    `${teacher.totalWeeklyHours || 0}h`,
    Array.isArray(teacher.levels) ? teacher.levels.join(', ') : (teacher.levels || '')
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Docente', 'Email', 'Telefono', 'Cursos', 'Grados', 'Horas/Sem', 'Niveles']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.success,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Personal_Docente_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Estadisticas de Matricula
 */
export const generateEnrollmentPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()

  // Header
  let yPos = generateHeader(
    doc,
    `ESTADISTICAS DE MATRICULA - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  const stats = reportData.stats || {}

  // Estadisticas generales
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Matriculados: ${stats.totalEnrolled || 0}`, PDF_CONFIG.margins.left, yPos + 5)
  doc.text(`Total Secciones: ${stats.totalSections || 0}`, 100, yPos + 5)

  yPos += 15

  // Tabla por nivel
  const tableData = reportData.data?.map(item => [
    item.levelName || item.level || '',
    item.totalStudents || 0,
    item.enrolledStudents || 0,
    item.sectionsCount || 0,
    item.enrollmentRate || '0%'
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Nivel', 'Total Estudiantes', 'Matriculados', 'Secciones', 'Tasa Matricula']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10
    },
    columnStyles: {
      0: { halign: 'left' }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Estadisticas_Matricula_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Estadisticas Financieras
 */
export const generateFinancialStatsPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `ESTADISTICAS FINANCIERAS - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  const data = reportData.data?.stats || reportData.data || {}

  // Cuadro resumen principal
  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 80, 3, 3, 'F')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text('RESUMEN FINANCIERO', pageWidth / 2, yPos + 15, { align: 'center' })

  yPos += 25

  // Grid de estadisticas (2x2)
  const statBoxWidth = (pageWidth - 50) / 2
  const statBoxHeight = 25
  const startX = PDF_CONFIG.margins.left + 5

  // Total por Cobrar
  doc.setFillColor(...PDF_CONFIG.colors.primary)
  doc.roundedRect(startX, yPos, statBoxWidth, statBoxHeight, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('Total por Cobrar', startX + 5, yPos + 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`S/ ${(data.totalAmount || 0).toFixed(2)}`, startX + 5, yPos + 18)

  // Total Cobrado
  doc.setFillColor(...PDF_CONFIG.colors.success)
  doc.roundedRect(startX + statBoxWidth + 10, yPos, statBoxWidth, statBoxHeight, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Total Cobrado', startX + statBoxWidth + 15, yPos + 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`S/ ${(data.totalPaid || 0).toFixed(2)}`, startX + statBoxWidth + 15, yPos + 18)

  yPos += statBoxHeight + 5

  // Total Pendiente
  doc.setFillColor(...PDF_CONFIG.colors.warning)
  doc.roundedRect(startX, yPos, statBoxWidth, statBoxHeight, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Total Pendiente', startX + 5, yPos + 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`S/ ${(data.totalPending || 0).toFixed(2)}`, startX + 5, yPos + 18)

  // Tasa de Cobranza
  doc.setFillColor(155, 89, 182) // Purple
  doc.roundedRect(startX + statBoxWidth + 10, yPos, statBoxWidth, statBoxHeight, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Tasa de Cobranza', startX + statBoxWidth + 15, yPos + 8)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.collectionRate || '0%'}`, startX + statBoxWidth + 15, yPos + 18)

  yPos += statBoxHeight + 20

  // Monto Vencido (si existe)
  if (data.overdueAmount > 0) {
    doc.setFillColor(...PDF_CONFIG.colors.danger)
    doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 30, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('MONTO VENCIDO', PDF_CONFIG.margins.left + 10, yPos + 12)
    doc.setFontSize(16)
    doc.text(`S/ ${(data.overdueAmount || 0).toFixed(2)}`, PDF_CONFIG.margins.left + 10, yPos + 24)

    // Advertencia
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('* Monto total de obligaciones con fecha de vencimiento pasada', pageWidth / 2 + 20, yPos + 18)
  }

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Estadisticas_Financieras_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Cursos sin Notas Registradas
 */
export const generateCoursesWithoutGradesPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `CURSOS SIN NOTAS REGISTRADAS - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Estadisticas
  const stats = reportData.stats || {}

  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 25, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text(`Cursos sin Notas: ${stats.coursesWithoutGrades || 0}`, PDF_CONFIG.margins.left + 10, yPos + 10)
  doc.text(`Total Cursos: ${stats.totalCourses || 0}`, PDF_CONFIG.margins.left + 70, yPos + 10)
  doc.text(`Porcentaje: ${stats.percentageWithoutGrades || 0}%`, PDF_CONFIG.margins.left + 130, yPos + 10)

  // Cursos criticos en rojo
  doc.setTextColor(...PDF_CONFIG.colors.danger)
  doc.text(`Criticos: ${stats.criticalCourses || 0}`, PDF_CONFIG.margins.left + 190, yPos + 10)

  yPos += 35

  // Tabla principal
  const tableData = reportData.data?.map(course => [
    course.courseName || course.course_name || '',
    course.courseArea || course.area || '',
    `${course.level || ''} - ${course.grade || ''}`,
    course.assignedTeacher || 'Sin asignar',
    course.teacherContact || '-',
    `${course.weeklyHours || 0}h`,
    course.lastGradeDate || 'Nunca',
    course.status || 'Normal'
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Curso', 'Area', 'Nivel/Grado', 'Docente', 'Contacto', 'Horas', 'Ultimo Reg.', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.warning,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 40 },
      1: { halign: 'left', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 35 },
      3: { halign: 'left', cellWidth: 40 },
      4: { halign: 'left', cellWidth: 35 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 25 },
      7: { halign: 'center', cellWidth: 22 }
    },
    didParseCell: (data) => {
      // Colorear estado segun criticidad
      if (data.section === 'body' && data.column.index === 7) {
        const status = data.cell.text[0]
        if (status === 'Critico') {
          data.cell.styles.textColor = PDF_CONFIG.colors.danger
          data.cell.styles.fontStyle = 'bold'
        } else if (status === 'Urgente') {
          data.cell.styles.textColor = PDF_CONFIG.colors.warning
        }
      }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Resumen por docente si hay estadisticas
  if (stats.teacherStats && stats.teacherStats.length > 0) {
    yPos = doc.lastAutoTable.finalY + 15

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_CONFIG.colors.secondary)
    doc.text('RESUMEN POR DOCENTE', PDF_CONFIG.margins.left, yPos)
    yPos += 5

    const teacherData = stats.teacherStats.slice(0, 10).map(t => [
      t.name || '',
      t.contact || '-',
      t.coursesWithoutGrades || 0,
      `${t.totalHours || 0}h`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Docente', 'Contacto', 'Cursos sin Notas', 'Horas Totales']],
      body: teacherData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_CONFIG.colors.secondary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 9 },
      margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
    })
  }

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Cursos_Sin_Notas_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Cuentas por Cobrar
 */
export const generateAccountsReceivablePDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `CUENTAS POR COBRAR - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Estadisticas principales
  const stats = reportData.stats || {}

  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 35, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text('RESUMEN FINANCIERO', PDF_CONFIG.margins.left + 5, yPos + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Conceptos: ${stats.totalConcepts || 0}`, PDF_CONFIG.margins.left + 5, yPos + 20)

  doc.setTextColor(...PDF_CONFIG.colors.warning)
  doc.text(`Total Pendiente: S/ ${(stats.totalPending || 0).toFixed(2)}`, PDF_CONFIG.margins.left + 60, yPos + 20)

  doc.setTextColor(...PDF_CONFIG.colors.danger)
  doc.text(`Total Vencido: S/ ${(stats.totalOverdue || 0).toFixed(2)}`, PDF_CONFIG.margins.left + 130, yPos + 20)

  yPos += 45

  // Tabla de conceptos
  const tableData = reportData.data?.map(item => [
    item.conceptName || item.concept || '',
    item.conceptType || item.type || '',
    item.obligationsCount || 0,
    `S/ ${(item.totalAmount || 0).toFixed(2)}`,
    `S/ ${(item.paidAmount || 0).toFixed(2)}`,
    `S/ ${(item.pendingBalance || 0).toFixed(2)}`,
    `S/ ${(item.overdueAmount || 0).toFixed(2)}`,
    item.collectionRate || '0%'
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Concepto', 'Tipo', 'Oblig.', 'Total', 'Cobrado', 'Pendiente', 'Vencido', 'Tasa']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 35 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 25 },
      6: { halign: 'right', cellWidth: 25 },
      7: { halign: 'center', cellWidth: 18 }
    },
    didParseCell: (data) => {
      // Colorear tasa de cobranza
      if (data.section === 'body' && data.column.index === 7) {
        const rate = parseFloat(data.cell.text[0])
        if (rate >= 80) {
          data.cell.styles.textColor = PDF_CONFIG.colors.success
        } else if (rate >= 50) {
          data.cell.styles.textColor = PDF_CONFIG.colors.warning
        } else {
          data.cell.styles.textColor = PDF_CONFIG.colors.danger
        }
        data.cell.styles.fontStyle = 'bold'
      }
      // Colorear monto vencido en rojo
      if (data.section === 'body' && data.column.index === 6) {
        const amount = parseFloat(data.cell.text[0].replace('S/ ', ''))
        if (amount > 0) {
          data.cell.styles.textColor = PDF_CONFIG.colors.danger
        }
      }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Cuentas_Por_Cobrar_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF de Metodos de Pago
 */
export const generatePaymentMethodsPDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  let yPos = generateHeader(
    doc,
    `ANALISIS DE METODOS DE PAGO - ${academicYear || new Date().getFullYear()}`,
    `Fecha: ${new Date().toLocaleDateString('es-PE')}`
  )

  // Estadisticas principales
  const stats = reportData.stats || {}

  doc.setFillColor(...PDF_CONFIG.colors.light)
  doc.roundedRect(PDF_CONFIG.margins.left, yPos, pageWidth - 30, 30, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PDF_CONFIG.colors.secondary)
  doc.text('RESUMEN DE TRANSACCIONES', PDF_CONFIG.margins.left + 5, yPos + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Transacciones: ${stats.totalTransactions || 0}`, PDF_CONFIG.margins.left + 5, yPos + 23)
  doc.text(`Monto Total: S/ ${(stats.totalAmount || 0).toFixed(2)}`, pageWidth / 2, yPos + 23)

  yPos += 40

  // Tabla de metodos
  const tableData = reportData.data?.map(method => [
    method.name || method.method || '',
    method.transactionsCount || method.transactions_count || 0,
    `S/ ${(method.totalAmount || method.total_amount || 0).toFixed(2)}`,
    `${method.percentage || 0}%`,
    `S/ ${(method.averageAmount || (method.totalAmount / method.transactionsCount) || 0).toFixed(2)}`
  ]) || []

  autoTable(doc, {
    startY: yPos,
    head: [['Metodo de Pago', 'Transacciones', 'Monto Total', 'Porcentaje', 'Promedio']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PDF_CONFIG.colors.success,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 50 },
      1: { halign: 'center', cellWidth: 35 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 35 }
    },
    margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
  })

  yPos = doc.lastAutoTable.finalY + 20

  // Grafico simple de barras (representacion textual)
  if (reportData.data && reportData.data.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PDF_CONFIG.colors.secondary)
    doc.text('DISTRIBUCION PORCENTUAL', PDF_CONFIG.margins.left, yPos)
    yPos += 10

    const maxPercentage = Math.max(...reportData.data.map(m => parseFloat(m.percentage || 0)))
    const barMaxWidth = pageWidth - 80

    reportData.data.forEach((method, index) => {
      const percentage = parseFloat(method.percentage || 0)
      const barWidth = (percentage / maxPercentage) * barMaxWidth

      // Nombre del metodo
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(method.name || method.method || '', PDF_CONFIG.margins.left, yPos + 5)

      // Barra
      const colors = [
        [52, 152, 219],  // Azul
        [46, 204, 113],  // Verde
        [155, 89, 182],  // Morado
        [241, 196, 15],  // Amarillo
        [231, 76, 60]    // Rojo
      ]
      doc.setFillColor(...(colors[index % colors.length]))
      doc.roundedRect(PDF_CONFIG.margins.left + 45, yPos, barWidth, 8, 1, 1, 'F')

      // Porcentaje
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`${percentage}%`, PDF_CONFIG.margins.left + 50 + barWidth, yPos + 6)

      yPos += 15
    })
  }

  // Footer
  generateFooter(doc)

  outputPDF(doc, `Metodos_Pago_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

/**
 * Genera PDF generico para tablas
 */
export const generateGenericTablePDF = (reportData, academicYear, mode = 'download') => {
  const doc = new jsPDF()

  // Header
  let yPos = generateHeader(
    doc,
    reportData.title || 'REPORTE',
    `Año ${academicYear || new Date().getFullYear()} - ${new Date().toLocaleDateString('es-PE')}`
  )

  // Tabla
  if (reportData.data && reportData.headers) {
    const tableData = reportData.data.map(row => {
      if (Array.isArray(row)) return row
      return Object.values(row)
    })

    autoTable(doc, {
      startY: yPos,
      head: [reportData.headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: PDF_CONFIG.colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right }
    })
  }

  // Footer
  generateFooter(doc)

  const fileName = (reportData.title || 'Reporte').replace(/\s+/g, '_')
  outputPDF(doc, `${fileName}_${academicYear || new Date().getFullYear()}.pdf`, mode)
}

export default {
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
}
