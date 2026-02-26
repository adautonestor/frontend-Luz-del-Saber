import { exportChildBoletaToExcel, exportToPDF } from '@/utils/reportCards'
import { downloadFinalReportCard } from '@/components/parent/FinalReportCardPDF'

/**
 * Hook personalizado para manejar exportaciones de boletas
 * @param {Object} selectedChild - Estudiante seleccionado
 * @param {number} selectedYear - Año escolar
 * @param {string} selectedBimestre - Bimestre seleccionado
 * @param {Array} boletaData - Datos de la boleta
 * @param {Object} behaviorData - Datos de conducta (opcional)
 * @returns {Object} Funciones de exportación
 */
export const useReportCardExport = (selectedChild, selectedYear, selectedBimestre, boletaData, behaviorData = null) => {
  /**
   * Exporta la boleta del estudiante actual a Excel
   */
  const exportToExcel = () => {
    if (!selectedChild || !boletaData) return
    exportChildBoletaToExcel(selectedChild, boletaData, selectedYear, selectedBimestre)
  }

  /**
   * Exporta la boleta de un estudiante específico a Excel
   * @param {Object} child - Estudiante a exportar
   */
  const exportChildExcel = (child) => {
    if (!boletaData) return
    exportChildBoletaToExcel(child, boletaData, selectedYear, selectedBimestre)
  }

  /**
   * Exporta la boleta a PDF
   */
  const exportPDF = async () => {
    if (!boletaData || !selectedChild) return
    await exportToPDF('boleta-content', selectedChild, selectedYear)
  }

  /**
   * Exporta la boleta final oficial
   */
  const exportFinalReportCard = async () => {
    if (!boletaData || !selectedChild) return

    // Incluir datos de conducta en el estudiante
    const studentWithBehaviors = {
      ...selectedChild,
      studentBehaviors: behaviorData?.studentBehaviors || []
    }

    await downloadFinalReportCard(studentWithBehaviors, boletaData, selectedYear)
  }

  return {
    exportToExcel,
    exportChildExcel,
    exportPDF,
    exportFinalReportCard
  }
}
