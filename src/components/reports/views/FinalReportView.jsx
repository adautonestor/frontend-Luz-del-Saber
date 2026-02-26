import React from 'react'
import { countFailedCompetencies } from '@/utils/reports'
import FinalStatusBanner from '../FinalStatusBanner'
import FinalGradesTable from '../FinalGradesTable'
import AcademicStatusSection from '../AcademicStatusSection'
import YearSummarySection from '../YearSummarySection'
import RemedialPlanSection from '../RemedialPlanSection'
import SignaturesSection from '../SignaturesSection'

/**
 * Vista de Reporte Final
 */
const FinalReportView = ({ selectedReport }) => {
  const failedCompetencies = countFailedCompetencies(selectedReport.subjects)
  const isApproved = failedCompetencies <= 12
  const finalStatus = isApproved ? 'APROBADO' : 'DESAPROBADO'
  const nextGrade = failedCompetencies >= 13
    ? `Repetir ${selectedReport.grade}`
    : selectedReport.nextGrade

  return (
    <div className="space-y-8">
      <FinalStatusBanner
        isApproved={isApproved}
        finalStatus={finalStatus}
        overallGrade={selectedReport.overallGrade}
        nextGrade={nextGrade}
      />

      <FinalGradesTable subjects={selectedReport.subjects} />

      <AcademicStatusSection
        failedCompetencies={failedCompetencies}
        subjects={selectedReport.subjects}
      />

      <YearSummarySection yearSummary={selectedReport.yearSummary} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{selectedReport.finalComments}</p>
        </div>
      </div>

      <RemedialPlanSection
        passed={selectedReport.passed}
        remedialPlan={selectedReport.remedialPlan}
      />

      <SignaturesSection
        tutor={selectedReport.tutor}
        director={selectedReport.director}
      />
    </div>
  )
}

export default FinalReportView
