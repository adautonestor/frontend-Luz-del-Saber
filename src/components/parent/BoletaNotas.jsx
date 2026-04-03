import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Award, AlertCircle, Info, Clock, CheckCircle, XCircle
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useReportCardData } from '@/hooks/useReportCardData'
import { useReportCardExport } from '@/hooks/useReportCardExport'
import { checkBimesterVisibility } from '@/utils/reportCards'
import { getLetterGradeColor, getAverageGradingScale } from '@/utils/gradeConversion.jsx'
import { BIMESTRES } from '@/constants/reportCards'
import {
  ChildrenSelector,
  YearAndActionsBar,
  CourseGradesTable
} from '@/components/reportCards'
import { generateAttendanceDataForReportCard, getYearlyAttendanceSummary } from '../../utils/attendanceCalculator'
import { getAttendanceSummaryForStudent } from '@/services/mock/schemas/parentMeetings'
import studentBehaviorsService from '../../services/studentBehaviorsService'
import parentMeetingsService from '../../services/parentMeetingsService'
import meetingAttendancesService from '../../services/meetingAttendancesService'
import { attendanceService } from '../../services/attendanceService'

const BoletaNotas = () => {
  const { user } = useAuthStore()
  const [selectedBimestre, setSelectedBimestre] = useState('anual')
  const [showLetterGrades, setShowLetterGrades] = useState(false)
  const [behaviorData, setBehaviorData] = useState({
    studentBehaviors: [],
    meetingAttendance: { formato: '-' }
  })
  const [attendanceData, setAttendanceData] = useState({
    attendanceRecords: [],
    attendanceByBimester: {},
    yearSummary: null
  })

  const {
    children,
    selectedChild,
    setSelectedChild,
    selectedYear,
    setSelectedYear,
    availableYears,
    boletaData,
    loading,
    visibilityConfigs
  } = useReportCardData(user)

  const {
    exportToExcel,
    exportChildExcel,
    exportFinalReportCard
  } = useReportCardExport(selectedChild, selectedYear, selectedBimestre, boletaData, behaviorData)

  // Load behavior and attendance data
  useEffect(() => {
    const loadData = async () => {
      if (selectedChild && selectedYear) {
        try {
          // Load behavior data
          const behaviors = await studentBehaviorsService.getAll() || []
          const studentBehaviors = behaviors.filter(
            b => b.student_id === selectedChild.id && b.academic_year === selectedYear
          )

          const meetings = await parentMeetingsService.getAll() || []
          const attendances = await meetingAttendancesService.getAll() || []
          const meetingAttendance = getAttendanceSummaryForStudent(meetings, attendances, selectedChild.id, selectedYear)

          setBehaviorData({ studentBehaviors, meetingAttendance })

          // Load attendance data - usar calculador real
          const attendanceRecords = await attendanceService.getAllRecords({ student_id: selectedChild.id }) || []
          const attendanceByBimester = generateAttendanceDataForReportCard(attendanceRecords, selectedChild.id)
          const yearSummary = getYearlyAttendanceSummary(attendanceByBimester)

          setAttendanceData({ attendanceRecords, attendanceByBimester, yearSummary })
        } catch (error) {
          console.error('Error loading data:', error)
          setBehaviorData({ studentBehaviors: [], meetingAttendance: { formato: '-' } })
          setAttendanceData({ attendanceRecords: [], attendanceByBimester: {}, yearSummary: null })
        }
      }
    }
    loadData()
  }, [selectedChild, selectedYear])

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando boleta de notas...</p>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boleta de Notas</h1>
          <p className="mt-2 text-gray-600">Consulta las calificaciones por competencias de tus hijos</p>
        </div>
        <div className="card p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay estudiantes registrados
          </h3>
          <p className="text-gray-600">
            No se encontraron estudiantes asociados a tu cuenta
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Boleta de Notas</h1>
        <p className="mt-2 text-gray-600">
          Consulta las calificaciones por competencias de tus hijos
        </p>
      </div>

      {/* Children Selector */}
      <ChildrenSelector
        children={children}
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        onExportChild={exportChildExcel}
      />

      {/* Year Selector & Actions */}
      {selectedChild && (
        <YearAndActionsBar
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
          selectedBimestre={selectedBimestre}
          setSelectedBimestre={setSelectedBimestre}
          showLetterGrades={showLetterGrades}
          setShowLetterGrades={setShowLetterGrades}
          onExportExcel={exportToExcel}
          onExportFinalReportCard={exportFinalReportCard}
        />
      )}

      {/* Visibility Restrictions Info */}
      {selectedChild && (() => {
        const restrictedBimesters = BIMESTRES.filter(
          bimestre => !checkBimesterVisibility(bimestre, selectedChild, selectedYear, visibilityConfigs)
        )

        if (restrictedBimesters.length === 0) return null

        return (
          <div className="space-y-3">
            {restrictedBimesters.map(bimestre => (
              <div
                key={bimestre}
                className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-900">
                      Bimestre {bimestre} - Notas no disponibles
                    </h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Las calificaciones del Bimestre {bimestre} aún no han sido autorizadas para su visualización.
                      Por favor, consulta más tarde o contacta con la administración del colegio.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Boleta Content - Muestra los bimestres permitidos */}
      {selectedChild && boletaData && (() => {
        // Determinar qué bimestres están permitidos
        const allowedBimesters = BIMESTRES.filter(
          bimestre => checkBimesterVisibility(bimestre, selectedChild, selectedYear, visibilityConfigs)
        )

        // Si TODOS los bimestres están restringidos, no mostrar nada
        if (allowedBimesters.length === 0) {
          return null
        }

        return (
          <div id="boleta-content" className="space-y-6 bg-white p-8">
            {/* Student Info Header */}
            <div className="border-b-2 border-green-600 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    BOLETA DE CALIFICACIONES
                  </h2>
                  <p className="text-lg text-gray-700 mt-2">
                    <strong>Estudiante:</strong> {selectedChild.paternal_last_name || ''} {selectedChild.maternal_last_name || ''}, {selectedChild.first_names}{selectedChild.last_names ? ` ${selectedChild.last_names}` : ''}
                  </p>
                  <p className="text-gray-600">
                    <strong>Grado:</strong> {selectedChild.gradeName} | <strong>Año:</strong> {selectedYear}
                  </p>
                </div>
                <Award className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Courses Tables */}
            {boletaData.map((curso, cursoIndex) => (
              <CourseGradesTable
                key={cursoIndex}
                curso={curso}
                cursoIndex={cursoIndex}
                showLetterGrades={showLetterGrades}
                selectedChild={selectedChild}
                selectedYear={selectedYear}
                visibilityConfigs={visibilityConfigs}
              />
            ))}

          {/* Grading Scale for Inicial/Primaria */}
          {selectedChild && (selectedChild.gradingSystem === 'inicial' || selectedChild.gradingSystem === 'primaria') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mt-6 border-2 border-blue-300"
            >
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Escala de Calificación para el Promedio Final
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  El promedio final del curso se calcula convirtiendo las calificaciones cualitativas a valores numéricos:
                </p>
                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                          Calificación
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                          Valor para el Promedio
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase border-b-2 border-gray-300">
                          Descripción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getAverageGradingScale().map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4">
                            <span className={`text-2xl font-bold ${getLetterGradeColor(item.letter)}`}>
                              {item.letter}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xl font-bold text-gray-900">
                              {item.value.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {item.description}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Letter Grades Legend */}
          {showLetterGrades && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mt-6"
            >
              <div className="p-4 bg-purple-50 border-b border-purple-200">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-900">
                    Leyenda de Calificación por Letras
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Las calificaciones están expresadas en escala literal según el Currículo Nacional del Perú:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">AD - Logro Destacado (18-20)</p>
                      <p className="text-xs text-green-700 mt-1">
                        El estudiante evidencia un nivel superior a lo esperado respecto a la competencia.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">A - Logro Esperado (14-17)</p>
                      <p className="text-xs text-blue-700 mt-1">
                        El estudiante evidencia el nivel esperado respecto a la competencia.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">B - En Proceso (11-13)</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        El estudiante está próximo o cerca al nivel esperado respecto a la competencia.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">C - En Inicio (0-10)</p>
                      <p className="text-xs text-red-700 mt-1">
                        El estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Behavior Section - Siempre mostrar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card mt-6"
          >
            <div className="p-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900">
                  CONDUCTA Y PARTICIPACIÓN DE PADRES
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bimestre
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disciplina
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calif. Padres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comentarios / Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {BIMESTRES.map(bim => {
                    const behavior = behaviorData.studentBehaviors.find(b => b.quarter === bim)
                    return (
                      <tr key={bim} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Bimestre {bim}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold">
                            {behavior?.discipline || behavior?.disciplina || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold">
                            {behavior?.parent_rating || behavior?.calificacionPadres || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {behavior?.comments || behavior?.comentarios || '-'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-orange-50 font-semibold">
                    <td className="px-6 py-4 text-sm text-gray-900" colSpan="3">
                      ASISTENCIA A REUNIONES DE PADRES (Año Completo)
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-orange-900">
                        {behaviorData.meetingAttendance?.formato || '-'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Attendance Section - Usa datos reales de attendanceByBimester */}
          {attendanceData.attendanceByBimester && Object.keys(attendanceData.attendanceByBimester).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card mt-6"
            >
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Reporte de Asistencias
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bimestre
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inasist. Justificada
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inasist. Injustificada
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tard. Justificada
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tard. Injustificada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {BIMESTRES.map(bim => {
                      const bimKey = `B${bim}`
                      const bimData = attendanceData.attendanceByBimester[bimKey] || {}
                      return (
                        <tr key={bim} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            Bimestre {bim}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-yellow-600">
                              {bimData.inasistenciaJustificada || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-red-600">
                              {bimData.inasistenciaInjustificada || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-orange-500">
                              {bimData.tardanzaJustificada || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-semibold text-red-700">
                              {bimData.tardanzaInjustificada || 0}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-blue-100 font-bold">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        TOTAL ANUAL
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-yellow-700">
                          {attendanceData.yearSummary?.inasistenciaJustificada || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-red-700">
                          {attendanceData.yearSummary?.inasistenciaInjustificada || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-orange-600">
                          {attendanceData.yearSummary?.tardanzaJustificada || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-red-800">
                          {attendanceData.yearSummary?.tardanzaInjustificada || 0}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
        )
      })()}
    </div>
  )
}

export default BoletaNotas
