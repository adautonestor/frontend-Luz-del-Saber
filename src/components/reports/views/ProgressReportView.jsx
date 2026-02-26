import React from 'react'
import { TrendingUp, CheckCircle, Target } from 'lucide-react'

/**
 * Vista de Reporte de Progreso
 */
const ProgressReportView = ({ selectedReport }) => {
  return (
    <div className="space-y-8">
      {/* Progress Comparison */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación de Progreso</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{selectedReport.comparison.previousPeriod}</div>
            <div className="text-sm text-gray-500">Período Anterior</div>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedReport.comparison.currentPeriod}</div>
            <div className="text-sm text-gray-500">Período Actual</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{selectedReport.comparison.improvement}</div>
            <div className="text-sm text-gray-500">Mejora</div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso por Materia</h3>
        <div className="space-y-3">
          {selectedReport.subjectProgress.map((subject, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{subject.subject}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Anterior: {subject.previous}</span>
                  <span>Actual: {subject.current}</span>
                </div>
              </div>
              <TrendingUp className={`w-5 h-5 ${subject.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fortalezas</h3>
          <div className="space-y-2">
            {selectedReport.strengths.map((strength, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Mejora</h3>
          <div className="space-y-2">
            {selectedReport.improvementAreas.map((area, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                <Target className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas para el Próximo Período</h3>
        <div className="space-y-2">
          {selectedReport.goals.map((goal, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">{goal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressReportView
