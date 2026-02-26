import React from 'react'
import { Users } from 'lucide-react'

/**
 * Vista de tabla básica para reportes
 * Muestra datos tabulares con niveles, grados y estadísticas
 */
const TableView = ({ reportData }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {reportData.headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reportData.data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  row.level?.toLowerCase() === 'inicial' ? 'bg-blue-100 text-blue-800' :
                  row.level?.toLowerCase() === 'primaria' ? 'bg-green-100 text-green-800' :
                  row.level?.toLowerCase() === 'secundaria' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {row.level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row.grade}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                  {row.section}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-gray-400" />
                  {row.studentCount}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span className={`font-semibold ${
                  parseFloat(row.averageGrade) >= 16 ? 'text-green-600' :
                  parseFloat(row.averageGrade) >= 14 ? 'text-blue-600' :
                  parseFloat(row.averageGrade) >= 11 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {row.averageGrade}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        parseFloat(row.passingRate) >= 80 ? 'bg-green-500' :
                        parseFloat(row.passingRate) >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${row.passingRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{row.passingRate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableView
