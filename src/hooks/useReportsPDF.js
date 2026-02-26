import { useCallback } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Custom hook para generar PDFs de reportes
 */
export const useReportsPDF = () => {
  const downloadPDF = useCallback(async (selectedReport) => {
    if (!selectedReport) return

    const element = document.getElementById('report-content')
    if (!element) return

    try {
      // Hide the modal buttons during capture
      const buttons = document.querySelector('.modal-buttons')
      if (buttons) buttons.style.display = 'none'

      // Capture the content as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      // Show buttons again
      if (buttons) buttons.style.display = 'flex'

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

      const fileName = `Boleta_${selectedReport.student.replace(' ', '_')}_${selectedReport.period}_${selectedReport.year}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    }
  }, [])

  return {
    downloadPDF
  }
}
