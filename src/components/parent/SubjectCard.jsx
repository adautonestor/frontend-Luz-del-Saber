import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronUp, FileText } from 'lucide-react'

const SubjectCard = ({
  subject,
  index,
  expandedSubject,
  toggleSubject,
  getGradeColor,
  getTrendIcon,
  formatDate
}) => {
  const TrendingUp = ({ className }) => <div className={className}>↗</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card overflow-hidden"
    >
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleSubject(subject.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
              <p className="text-sm text-gray-600">Prof. {subject.teacher}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">
                Evaluación por Competencias
              </p>
              <p className="text-xs text-gray-500">
                Ver detalles abajo
              </p>
            </div>

            <button className="p-1 text-gray-400">
              {expandedSubject === subject.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Competencias Preview */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {subject.competencias?.map((competencia, idx) => (
            <div key={idx} className="text-center">
              <div className={`w-full h-2 ${competencia.color} rounded-full mb-1`} />
              <p className="text-xs text-gray-600">{competencia.name}</p>
              <p className="text-sm font-medium">
                {competencia.averageDisplay !== null && competencia.averageDisplay !== undefined
                  ? competencia.averageDisplay
                  : (competencia.average !== null ? competencia.average : '-')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Detail */}
      {expandedSubject === subject.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200 p-6 bg-gray-50"
        >
          <div className="space-y-6">
            {/* Evaluaciones Grouped by Competencia */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Evaluaciones</h4>
              <div className="space-y-4">
                {subject.competencias?.map((competencia, compIdx) => {
                  const competenciaEvaluations = subject.evaluations.filter(
                    e => e.competenciaId === competencia.id
                  )

                  return (
                    <div key={compIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Competencia Header */}
                      <div className={`px-4 py-3 ${competencia.color} bg-opacity-10 border-b border-gray-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${competencia.color} rounded-full`}></div>
                            <h5 className="font-semibold text-gray-900">{competencia.name}</h5>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-600 mr-2">Promedio:</span>
                            <span className={`text-lg font-bold ${
                              competencia.average !== null ? getGradeColor(competencia.average) : 'text-gray-400'
                            }`}>
                              {competencia.averageDisplay !== null && competencia.averageDisplay !== undefined
                                ? competencia.averageDisplay
                                : (competencia.average !== null ? competencia.average : '-')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evaluations Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Evaluación</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Nota</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Fecha de Registro</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Comentario</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Peso</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {competenciaEvaluations.length > 0 ? (
                              competenciaEvaluations.map((evaluation, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{evaluation.name}</td>
                                  <td className={`px-4 py-2 text-center text-sm font-semibold ${
                                    evaluation.grade !== null && evaluation.grade !== 0 ? getGradeColor(evaluation.grade) : 'text-gray-400'
                                  }`}>
                                    {evaluation.grade !== null && evaluation.grade !== 0 ? (evaluation.gradeDisplay || evaluation.grade) : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-center text-sm text-gray-600">
                                    {evaluation.registration_date ? formatDate(evaluation.registration_date) : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600 max-w-xs">
                                    {evaluation.comment ? (
                                      <div className="group relative">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-blue-500" />
                                          <span className="text-blue-600 font-medium cursor-help">Ver comentario</span>
                                        </div>
                                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                                          <div className="mb-1 font-semibold text-blue-200">Comentario del profesor:</div>
                                          {evaluation.comment}
                                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic text-xs">Sin comentario</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center text-sm text-gray-600">{evaluation.weight}%</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-400 italic">
                                  No hay evaluaciones registradas para esta competencia
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Observations */}
            {subject.observations && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observaciones del Docente</h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{subject.observations}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default SubjectCard
