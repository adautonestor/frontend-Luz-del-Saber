import React from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Users, Filter, Search, Download,
  Edit, Save, X, Plus, TrendingUp, AlertCircle,
  FileText, Calendar, CheckCircle, Award, MessageCircle,
  FileSpreadsheet, Percent
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useTeacherGradesState } from '../../hooks/useTeacherGradesState'
import { useGradeCalculations } from '../../hooks/useGradeCalculations'
import { getGradingScalesStore } from '../../stores/gradingScalesStore'
import GradeEntryModal from './GradeEntryModal'
import GradeCard from '../grades/GradeCard'
import WeeklyExamUploadModal from './WeeklyExamUploadModal'
import CompetenceGradesModal from './CompetenceGradesModal'
import GradeWeightDistributionModal from './GradeWeightDistributionModal'

/**
 * Helper para obtener color de calificación usando store SSOT
 * Compatible con el formato anterior (grade, gradingSystem)
 */
const getGradeColor = (grade, gradingSystem, levelId = null) => {
  if (grade === null || grade === undefined) return 'text-gray-500 bg-gray-50'

  const store = getGradingScalesStore()
  const hexColor = store.getGradeColor(grade, levelId)

  // Mapear color hex a clases Tailwind con fondo
  const colorMap = {
    '#22c55e': 'text-green-600 bg-green-50',
    '#3b82f6': 'text-blue-600 bg-blue-50',
    '#eab308': 'text-yellow-600 bg-yellow-50',
    '#ef4444': 'text-red-600 bg-red-50',
    '#9ca3af': 'text-gray-500 bg-gray-50'
  }

  return colorMap[hexColor] || 'text-gray-500 bg-gray-50'
}

/**
 * Componente principal de gestión de calificaciones para profesores
 * Refactorizado para separar responsabilidades en hooks y utilidades
 *
 * @component
 * @see useTeacherGradesState - Maneja el estado y handlers de modales
 * @see useGradeCalculations - Maneja cálculos y filtrado
 * @see gradeFormatters - Utilidades de formato y visualización
 */
const TeacherGrades = () => {
  // ==================== AUTH ====================
  const { canManageGrades, isReadOnlyMode } = useAuthStore()

  // ==================== STATE MANAGEMENT ====================
  const stateHook = useTeacherGradesState()
  const {
    // Store data
    grades,
    categories,
    subcategories,
    evaluationStructures,
    students,
    courses,
    academicGrades,
    sections,
    gradesLoading,

    // Store functions
    getGradesByStudentAndCourse,
    getGradingSystemForCourse,

    // Selection states
    selectedCourse,
    setSelectedCourse,
    selectedQuarter,
    setSelectedQuarter,
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,

    // Modal states
    showGradeModal,
    selectedGradeData,
    showWeeklyExamModal,
    selectedWeek,
    showCompetenceModal,
    selectedCompetenceData,
    showWeightDistributionModal,
    setShowWeightDistributionModal,
    selectedWeightDistributionData,
    setSelectedWeightDistributionData,

    // Handlers
    handleAddGrade,
    handleGradeSuccess,
    handleOpenCompetenceModal,
    handleCompetenceGradesSave,
    handleWeeklyExamUpload,
    handleWeeklyExamSuccess,
    handleOpenWeightDistribution,
    handleWeightDistributionSave
  } = stateHook

  // ==================== CALCULATIONS ====================
  const calculationsHook = useGradeCalculations({
    selectedCourse,
    selectedQuarter,
    selectedGrade,
    selectedSection,
    searchTerm,
    students,
    courses,
    evaluationStructures,
    getGradesByStudentAndCourse,
    getGradingSystemForCourse
  })

  const {
    selectedCourseData,
    gradingSystem,
    currentEvaluationStructure,
    uniqueCategories,
    calculateStudentAverage,
    getCompetenceAverage,
    filteredStudents,
    getStudentGradesForCategory,
    hasObservation
  } = calculationsHook

  // ==================== AUTO-SELECT SECTION ====================
  // Auto-seleccionar la primera sección disponible cuando cambia el grado
  React.useEffect(() => {
    if (selectedGrade && sections) {
      const availableSections = sections.filter(section => section.grade_id == selectedGrade)

      // Si hay secciones disponibles y ninguna está seleccionada, o la seleccionada no pertenece al grado
      if (availableSections.length > 0) {
        const currentSectionValid = availableSections.some(s => s.id == selectedSection)

        if (!currentSectionValid) {
          // Auto-seleccionar la primera sección disponible
          console.log(`🔄 Auto-seleccionando sección ${availableSections[0].id} para grado ${selectedGrade}`)
          setSelectedSection(String(availableSections[0].id))
        }
      }
    }
  }, [selectedGrade, sections, selectedSection, setSelectedSection])

  // ==================== RENDER ====================
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isReadOnlyMode() ? 'Consulta de Notas' : 'Gestión de Notas'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isReadOnlyMode()
              ? 'Visualiza las calificaciones de los estudiantes para consulta'
              : 'Registra y gestiona las calificaciones de tus estudiantes'
            }
          </p>
          {isReadOnlyMode() && (
            <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertCircle size={16} />
              <span className="text-sm">
                Tienes permisos de solo lectura. No puedes crear, editar o eliminar calificaciones.
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Curso Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    console.log('📚 TeacherGrades - Course changed to:', e.target.value)
                    setSelectedCourse(e.target.value)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {courses?.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grado Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    console.log('📚 TeacherGrades - Grade filter changed to:', e.target.value)
                    setSelectedGrade(e.target.value)
                    setSelectedSection('') // Reset section when grade changes
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos los grados</option>
                  {academicGrades?.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sección Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    console.log('📚 TeacherGrades - Section filter changed to:', e.target.value)
                    setSelectedSection(e.target.value)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todas las secciones</option>
                  {sections?.filter(section => !selectedGrade || section.grade_id == selectedGrade).map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bimestre Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bimestre
                </label>
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1° Bimestre</option>
                  <option value="2">2° Bimestre</option>
                  <option value="3">3° Bimestre</option>
                  <option value="4">4° Bimestre</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('📚 TeacherGrades - Search term changed to:', e.target.value)
                    setSearchTerm(e.target.value)
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {canManageGrades() && (
                  <button
                    onClick={() => handleWeeklyExamUpload(selectedQuarter)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileSpreadsheet className="mr-2" size={16} />
                    Examen Semanal
                  </button>
                )}

                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <Download className="mr-2" size={16} />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredStudents.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-green-500 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-semibold text-gray-900">16.8</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-lg p-3">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Notas Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-lg p-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Curso</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedCourseData?.name || '-'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mensaje cuando no hay estructura de evaluación configurada */}
        {selectedCourse && selectedGrade && selectedQuarter && !currentEvaluationStructure && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  No hay estructura de evaluación configurada
                </h3>
                <p className="text-yellow-800 mb-4">
                  El director aún no ha configurado las competencias para este curso, grado y bimestre.
                </p>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    Para poder registrar calificaciones, el director debe:
                  </p>
                  <ol className="text-sm text-yellow-800 space-y-1 ml-4 list-decimal">
                    <li>Ir a "Gestión de Estructuras de Evaluación"</li>
                    <li>Seleccionar el curso: <span className="font-semibold">{selectedCourseData?.name}</span></li>
                    <li>Seleccionar el grado y bimestre: <span className="font-semibold">{selectedQuarter}° Bimestre</span></li>
                    <li>Crear las competencias correspondientes al currículo nacional</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grades Table */}
        {currentEvaluationStructure && uniqueCategories.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      N°
                    </th>
                    <th className="sticky left-0 z-20 bg-gray-50 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Estudiante
                    </th>
                    {uniqueCategories.map((category, index) => {
                    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500']
                    const color = colors[index % colors.length]
                    return (
                      <React.Fragment key={category.id}>
                        <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className={`w-2 h-2 ${color} rounded-full`} />
                            <span>{category.nombreCompetencia || category.name}</span>
                          </div>
                          <div className="text-xs font-normal text-gray-400">Notas</div>
                        </th>
                        <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                          <div className="text-xs font-normal text-gray-400 mt-6">Promedio</div>
                        </th>
                      </React.Fragment>
                    )
                  })}
                    <th className="px-3 py-4 text-center text-xs font-medium text-white uppercase tracking-wider bg-yellow-500 border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Calculator className="h-4 w-4" />
                        <span>PROM</span>
                      </div>
                      <div className="text-xs font-normal">General</div>
                    </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(() => {
                  console.log('📊 TeacherGrades - Rendering table with:', {
                    filteredStudents: filteredStudents.length,
                    uniqueCategories: uniqueCategories.length,
                    selectedCourse,
                    selectedQuarter
                  })

                  return filteredStudents.map((student, studentIndex) => {
                    // Calcular promedio ponderado general del estudiante
                    const studentWeightedAverage = calculateStudentAverage(student.id, selectedCourse, selectedQuarter)

                    return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: studentIndex * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      {/* Student Number Column */}
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center border-r border-gray-200">
                        {studentIndex + 1}
                      </td>

                      {/* Student Name Column */}
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                            {student.first_names?.charAt(0)}{student.last_names?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span>{student.first_names} {student.last_names}</span>
                            <span className="text-xs text-gray-500">DNI: {student.codigoEstudiante}</span>
                          </div>
                        </div>
                      </td>

                      {/* Competence Columns */}
                      {uniqueCategories.map((category) => {
                        const competenceGrades = getStudentGradesForCategory(student.id, category.id)
                        const competenceAverage = getCompetenceAverage(student.id, selectedCourse, category.id, selectedQuarter)
                        const hasMultipleGrades = competenceGrades.length > 1

                        return (
                          <React.Fragment key={`${student.id}-${category.id}`}>
                            {/* Columna de Notas */}
                            <td className="px-3 py-4 text-center border-r border-gray-200">
                              <div className="flex justify-center">
                                {canManageGrades() ? (
                                  <button
                                    onClick={() => handleOpenCompetenceModal(student, selectedCourseData, category)}
                                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                                  >
                                    {hasMultipleGrades ? `${competenceGrades.length} notas` : 'Agregar'}
                                  </button>
                                ) : (
                                  <div className="text-xs text-gray-500">
                                    {hasMultipleGrades ? `${competenceGrades.length} nota${competenceGrades.length > 1 ? 's' : ''}` : '-'}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Columna de Promedio */}
                            <td className="px-3 py-4 text-center border-r border-gray-200">
                              <div className="flex justify-center">
                                {competenceAverage ? (
                                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(competenceAverage, gradingSystem)}`}>
                                    {competenceAverage}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400">--</div>
                                )}
                              </div>
                            </td>
                          </React.Fragment>
                        )
                      })}

                      {/* Columna PROM General */}
                      <td className="px-3 py-4 text-center bg-yellow-50 border-r border-gray-200">
                        <div className="flex justify-center">
                          {studentWeightedAverage > 0 ? (
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold ${getGradeColor(studentWeightedAverage.toFixed(2), gradingSystem)}`}>
                              {studentWeightedAverage.toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">--</div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )})
                })()}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Legend */}
        {currentEvaluationStructure && uniqueCategories.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Competencias de Evaluación</h3>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            {uniqueCategories.map((category, index) => {
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500']
              const color = colors[index % colors.length]
              return (
                <div key={category.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${color} rounded-full`} />
                  <span className="text-sm text-gray-600">
                    {category.nombreCompetencia || category.name} ({category.peso}%)
                  </span>
                  {canManageGrades() && (
                    <button
                      onClick={() => handleOpenWeightDistribution(category, selectedCourseData)}
                      className="ml-1 px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded border border-purple-200 hover:border-purple-300 transition-colors"
                      title="Configurar distribución de porcentajes de evaluación"
                    >
                      <Percent className="h-3 w-3 inline mr-1" />
                      Config. %
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )}
      </div>

      {/* Modals */}
      {showGradeModal && selectedGradeData && (
        <GradeEntryModal
          isOpen={showGradeModal}
          onClose={() => setShowGradeModal(false)}
          student={selectedGradeData.student}
          course={selectedGradeData.course}
          category={selectedGradeData.category}
          subcategory={selectedGradeData.subcategory}
          bimestre={selectedGradeData.quarter}
          existingGrade={selectedGradeData.existingGrade}
          onSuccess={handleGradeSuccess}
        />
      )}

      {showWeeklyExamModal && (
        <WeeklyExamUploadModal
          isOpen={showWeeklyExamModal}
          onClose={() => setShowWeeklyExamModal(false)}
          course={selectedCourseData}
          week={selectedWeek}
          onSuccess={handleWeeklyExamSuccess}
        />
      )}

      {showCompetenceModal && selectedCompetenceData && (
        <CompetenceGradesModal
          isOpen={showCompetenceModal}
          onClose={() => setShowCompetenceModal(false)}
          student={selectedCompetenceData.student}
          course={selectedCompetenceData.course}
          category={selectedCompetenceData.category}
          bimestre={selectedCompetenceData.quarter}
          initialGrades={selectedCompetenceData.existingGrades}
          onSave={(gradeData) => handleCompetenceGradesSave(gradeData, gradingSystem)}
          gradingSystem={gradingSystem}
        />
      )}

      {showWeightDistributionModal && selectedWeightDistributionData && (
        <GradeWeightDistributionModal
          isOpen={showWeightDistributionModal}
          onClose={() => {
            setShowWeightDistributionModal(false)
            setSelectedWeightDistributionData(null)
          }}
          course={selectedWeightDistributionData.course}
          category={selectedWeightDistributionData.category}
          bimestre={selectedWeightDistributionData.quarter}
          initialDistribution={selectedWeightDistributionData.initialDistribution}
          onSave={handleWeightDistributionSave}
        />
      )}
    </>
  )
}

export default TeacherGrades
