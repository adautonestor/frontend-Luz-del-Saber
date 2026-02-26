import React from 'react'
import { Calendar, FileText, Download, Info } from 'lucide-react'
import { AVAILABLE_YEARS, BIMESTRE_OPTIONS } from '@/constants/reportCards'

/**
 * Barra de selección de año, bimestre y acciones de exportación
 */
const YearAndActionsBar = ({
  selectedYear,
  setSelectedYear,
  availableYears,
  selectedBimestre,
  setSelectedBimestre,
  showLetterGrades,
  setShowLetterGrades,
  onExportExcel,
  onExportFinalReportCard
}) => {
  // Usar años dinámicos de API o fallback a constantes
  const yearsToShow = availableYears?.length > 0 ? availableYears : AVAILABLE_YEARS
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Año Escolar:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {yearsToShow.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Bimester Selector */}
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Bimestre para descarga:</label>
            <select
              value={selectedBimestre}
              onChange={(e) => setSelectedBimestre(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-blue-50 border-blue-300"
            >
              {BIMESTRE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Letter Grades Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-300 rounded-md">
            <Info className="w-5 h-5 text-purple-600" />
            <label className="text-sm font-medium text-purple-900 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLetterGrades}
                onChange={(e) => setShowLetterGrades(e.target.checked)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              Mostrar Notas en Letras
            </label>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2">
          <button
            onClick={onExportExcel}
            className="btn btn-secondary flex items-center gap-2"
            title={selectedBimestre === 'anual' ? 'Descargar boleta anual completa' : `Descargar solo Bimestre ${selectedBimestre}`}
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={onExportFinalReportCard}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            title="Descargar Boleta Final Oficial"
          >
            <FileText size={18} />
            Boleta Final
          </button>
        </div>
      </div>
    </div>
  )
}

export default YearAndActionsBar
