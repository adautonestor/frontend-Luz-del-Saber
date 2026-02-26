import React from 'react'
import { motion } from 'framer-motion'
import {
  X, User, Calendar, Mail, Phone, MapPin, GraduationCap,
  Users, Star, FileText, BarChart3, Award, BookOpen
} from 'lucide-react'

const StudentDetailView = ({
  student,
  course,
  courseCompetencies = [],
  getCompetencyAverage,
  formatGradeValue,
  getGradeColor,
  getGradeColorFromAvg,
  onClose
}) => {
  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Calcular promedio anual de una competencia (promedio de los 4 bimestres)
  const calculateCompetencyYearlyAverage = (competencyId) => {
    let sum = 0
    let count = 0
    for (let bim = 1; bim <= 4; bim++) {
      const avgData = getCompetencyAverage(student.id, competencyId, bim)
      if (avgData && avgData.average_value !== null && avgData.average_value !== undefined) {
        sum += avgData.average_value
        count++
      }
    }
    return count > 0 ? sum / count : null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
      >
        {/* Student Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {student.first_names?.charAt(0)}{student.last_names?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {student.first_names} {student.last_names}
                </h2>
                <p className="text-blue-100 text-lg">DNI: {student.dni}</p>
                {student.notaPromedio && (
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(student.notaPromedio)} bg-white/20`}>
                      Promedio General: {student.notaPromedio?.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Student Details */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="mr-2 text-blue-600" size={20} />
                Información Personal
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <Calendar className="mr-3 text-gray-400" size={16} />
                  <div>
                    <span className="text-sm text-gray-600">Fecha de Nacimiento:</span>
                    <p className="font-medium">
                      {student.birth_date ? new Date(student.birth_date).toLocaleDateString('es-PE') : '-'}
                      {student.birth_date && (
                        <span className="text-gray-500 ml-2">
                          ({calculateAge(student.birth_date)} años)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="mr-3 text-gray-400" size={16} />
                  <div>
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <p className="font-medium">{student.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="mr-3 text-gray-400 mt-1" size={16} />
                  <div>
                    <span className="text-sm text-gray-600">Dirección:</span>
                    <p className="font-medium">{student.address || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <GraduationCap className="mr-3 text-gray-400" size={16} />
                  <div>
                    <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
                    <p className="font-medium">
                      {student.matriculation_date
                        ? new Date(student.matriculation_date).toLocaleDateString('es-PE')
                        : student.enrollment_date
                          ? new Date(student.enrollment_date).toLocaleDateString('es-PE')
                          : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Padres/Tutores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="mr-2 text-blue-600" size={20} />
                Información de Padres/Tutores
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {student.parent_name ? (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 capitalize">
                      {student.parent_relationship || 'Apoderado'}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="mr-3 text-gray-400" size={16} />
                        <span className="font-medium">{student.parent_name}</span>
                      </div>
                      {student.parent_phone && (
                        <div className="flex items-center">
                          <Phone className="mr-3 text-gray-400" size={16} />
                          <span>{student.parent_phone}</span>
                        </div>
                      )}
                      {student.parent_email && (
                        <div className="flex items-center">
                          <Mail className="mr-3 text-gray-400" size={16} />
                          <span>{student.parent_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No hay información de tutor registrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notas por Competencia */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <BarChart3 className="mr-2 text-blue-600" size={20} />
              Notas por Competencia - {course.name}
            </h3>

            {courseCompetencies.length > 0 ? (
              <div className="space-y-4">
                {courseCompetencies.map((comp, index) => {
                  const yearlyAvg = calculateCompetencyYearlyAverage(comp.id)

                  return (
                    <div key={comp.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {/* Header de competencia */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-700 font-semibold text-sm">C{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{comp.name}</h4>
                              {comp.code && (
                                <span className="text-xs text-gray-500">{comp.code}</span>
                              )}
                            </div>
                          </div>
                          {yearlyAvg !== null && (
                            <div className="text-right">
                              <span className="text-xs text-gray-500">Promedio Anual</span>
                              <div className={`px-3 py-1 rounded-lg font-semibold ${getGradeColorFromAvg({
                                average_value: yearlyAvg,
                                grading_system: comp.grading_system || 'literal'
                              })}`}>
                                {formatGradeValue({
                                  average_value: yearlyAvg,
                                  grading_system: comp.grading_system || 'literal'
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notas por bimestre */}
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map(bim => {
                            const avgData = getCompetencyAverage(student.id, comp.id, bim)
                            const displayValue = formatGradeValue(avgData)
                            const colorClass = getGradeColorFromAvg(avgData)

                            return (
                              <div key={bim} className="text-center">
                                <div className="text-xs text-gray-500 mb-1">Bim {bim}</div>
                                <div className={`py-2 px-3 rounded-lg font-semibold ${colorClass}`}>
                                  {displayValue}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No hay competencias configuradas para este curso</p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          {student.observations && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="mr-2 text-blue-600" size={20} />
                Observaciones del Docente
              </h3>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {student.observations}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default StudentDetailView
