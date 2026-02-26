import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exporta la boleta a PDF desde un elemento HTML
 * @param {string} elementId - ID del elemento HTML a exportar
 * @param {Object} child - Estudiante
 * @param {number} year - Año escolar
 * @returns {Promise<void>}
 */
export const exportToPDF = async (elementId, child, year) => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with id '${elementId}' not found`)
    return
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  })

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
  pdf.save(`Boleta_${child.first_names}_${child.last_names}_${year}.pdf`)
}
