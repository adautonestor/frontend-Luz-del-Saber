import React from 'react'
import { Download, FileText } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useParentGradesState } from '../../hooks/useParentGradesState'
import { PDFDownloadButton } from './GradesPDF'
import GradesSummaryCards from './GradesSummaryCards'
import SubjectCard from './SubjectCard'
import GradesSidebar from './GradesSidebar'
import PDFDownloadModal from './PDFDownloadModal'

const ParentGrades = () => {
  const { user } = useAuthStore()
  const state = useParentGradesState(user)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notas Académicas</h1>
        <p className="mt-2 text-gray-600">
          Seguimiento detallado del rendimiento académico de tus hijos
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Child Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante
              </label>
              <select
                value={state.selectedChild}
                onChange={(e) => state.setSelectedChild(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {state.children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - {child.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={state.selectedPeriod}
                onChange={(e) => state.setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {state.periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name} {period.status === 'current' ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {state.selectedChild && state.selectedChildGrades && (
              <div className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <Download className="mr-2" size={16} />
                <PDFDownloadButton
                  studentData={state.children.find(c => c.id === state.selectedChild)}
                  gradesData={state.selectedChildGrades}
                  periodData={state.periods.find(p => p.id === state.selectedPeriod)}
                  className=""
                />
              </div>
            )}

            <button
              onClick={state.handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FileText className="mr-2" size={16} />
              Generar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <GradesSummaryCards
        selectedChildGrades={state.selectedChildGrades}
        getGradeColor={state.getGradeColor}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Detail */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Materias - {state.selectedPeriodData?.name}
          </h2>

          {state.selectedChildGrades?.subjects?.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={index}
              expandedSubject={state.expandedSubject}
              toggleSubject={state.toggleSubject}
              getGradeColor={state.getGradeColor}
              getTrendIcon={state.getTrendIcon}
              formatDate={state.formatDate}
            />
          ))}
        </div>

        {/* Sidebar */}
        <GradesSidebar
          selectedChildGrades={state.selectedChildGrades}
          getGradeColor={state.getGradeColor}
          handleDownloadPDF={state.handleDownloadPDF}
        />
      </div>

      {/* PDF Download Modal */}
      <PDFDownloadModal
        show={state.showDownloadModal}
        pdfUrl={state.pdfUrl}
        onDownload={state.downloadPDF}
        onClose={state.closePDFModal}
      />
    </div>
  )
}

export default ParentGrades