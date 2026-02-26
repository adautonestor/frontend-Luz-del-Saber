import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Calendar, Eye } from 'lucide-react'

const GradesSidebar = ({
  selectedChildGrades,
  getGradeColor,
  handleDownloadPDF
}) => {
  const navigate = useNavigate()

  const handleViewSchedule = () => {
    navigate('/padre/horarios')
  }
  return (
    <div className="space-y-6">
      {/* Progreso por Bimestre */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso por Bimestre</h3>
        <div className="space-y-3">
          {selectedChildGrades?.previousQuarters?.map((average, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{index + 1}° Bimestre</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(average / 20) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getGradeColor(average)}`}>
                  {average}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Download className="mr-3 text-green-600" size={18} />
              <span className="text-sm font-medium">Descargar Boleta</span>
            </div>
            <Download size={16} className="text-green-600" />
          </button>

          <button
            onClick={handleViewSchedule}
            className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Calendar className="mr-3 text-purple-600" size={18} />
              <span className="text-sm font-medium">Ver Cronograma</span>
            </div>
            <Eye size={16} className="text-purple-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GradesSidebar
