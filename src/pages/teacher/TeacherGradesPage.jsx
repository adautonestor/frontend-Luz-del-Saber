import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle, BookOpen, Users, Plus, X, CheckCircle, FileText
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import ExcelGradeCell from '../../components/teacher/ExcelGradeCell'

// Hooks personalizados
import { useTeacherGradesData } from '../../hooks/useTeacherGradesData'
import { useTeacherGradesHelpers } from '../../hooks/useTeacherGradesHelpers'

// Componentes
import GradesFilters from '../../components/teacher/grades/GradesFilters'
import GradesStatsCards from '../../components/teacher/grades/GradesStatsCards'
import AddColumnModal from '../../components/teacher/grades/AddColumnModal'
import GradesLegend from '../../components/teacher/grades/GradesLegend'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ReportCardDownloadModal from '../../components/teacher/grades/ReportCardDownloadModal'

/**
 * Página de registro de notas del profesor
 * Versión refactorizada con hooks y componentes separados
 */
const TeacherGradesPage = () => {
  // Estado para el modal de descarga de boletas
  const [showReportCardModal, setShowReportCardModal] = useState(false)

  // Hook principal con datos y lógica
  const gradeData = useTeacherGradesData()

  // Hook con funciones auxiliares
  const helpers = useTeacherGradesHelpers({
    customColumns: gradeData.customColumns,
    setCustomColumns: gradeData.setCustomColumns,
    grades: gradeData.grades,
    setGrades: gradeData.setGrades,
    evaluationTypes: gradeData.evaluationTypes,
    filteredStudents: gradeData.filteredStudents,
    mockStudents: gradeData.mockStudents,
    getSubcategoriasWithCustom: gradeData.getSubcategoriasWithCustom,
    calculateCompetenceAverage: gradeData.calculateCompetenceAverage,
    calculateAverage: gradeData.calculateAverage,
    stats: gradeData.stats,
    selectedCourse: gradeData.selectedCourse,
    selectedBimester: gradeData.selectedBimester,
    selectedGrade: gradeData.selectedGrade,
    selectedSection: gradeData.selectedSection,
    currentEvaluationStructure: gradeData.currentEvaluationStructure,
    user: gradeData.user,
    refreshStructures: gradeData.refreshStructures
  })

  // Navegación entre celdas para compatibilidad con ExcelGradeCell
  const handleCellNavigation = (studentIndex, evalTypeIndex, direction) => {
    // Esta función se mantiene por compatibilidad pero no se usa actualmente
    console.log('Cell navigation:', { studentIndex, evalTypeIndex, direction })
  }

  // Wrapper para handleGradeChange con notificaciones toast
  const handleGradeChangeWithToast = async (studentId, evalTypeId, value) => {
    console.log('🟡 handleGradeChangeWithToast LLAMADO:', { studentId, evalTypeId, value })

    // Mostrar toast de carga
    const loadingToast = toast.loading('Guardando nota...')
    console.log('🟡 Toast de carga mostrado')

    try {
      // Llamar a la función original que ahora guarda inmediatamente
      console.log('🟡 Llamando a gradeData.handleGradeChange...')
      await gradeData.handleGradeChange(studentId, evalTypeId, value)

      // Esperar un momento para que se complete el guardado
      await new Promise(resolve => setTimeout(resolve, 300))

      // Cerrar toast de carga y mostrar éxito
      toast.dismiss(loadingToast)
      console.log('🟡 Mostrando toast de éxito')
      toast.success('Nota registrada correctamente', {
        duration: 2000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '600'
        }
      })
    } catch (error) {
      // Cerrar toast de carga y mostrar error
      console.error('🟡 ERROR capturado:', error)
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Error al guardar la nota', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600'
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Toaster para notificaciones */}
      <Toaster />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Notas</h1>
          <p className="mt-2 text-gray-600">
            Ingresa y gestiona las calificaciones de tus estudiantes
          </p>
        </div>

        {/* Boton de descarga de boletas */}
        {gradeData.canShowGradesTable && (
          <button
            onClick={() => setShowReportCardModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            title="Descargar boleta de notas del bimestre"
          >
            <FileText size={18} />
            <span className="hidden sm:inline">Descargar Boleta</span>
          </button>
        )}
      </div>

      {/* Filtros */}
      <GradesFilters
        selectedCourse={gradeData.selectedCourse}
        setSelectedCourse={gradeData.setSelectedCourse}
        selectedBimester={gradeData.selectedBimester}
        setSelectedBimester={gradeData.setSelectedBimester}
        selectedLevel={gradeData.selectedLevel}
        setSelectedLevel={gradeData.setSelectedLevel}
        selectedGrade={gradeData.selectedGrade}
        setSelectedGrade={gradeData.setSelectedGrade}
        selectedSection={gradeData.selectedSection}
        setSelectedSection={gradeData.setSelectedSection}
        searchTerm={gradeData.searchTerm}
        setSearchTerm={gradeData.setSearchTerm}
        courses={gradeData.courses}
        mockCourses={gradeData.mockCourses}
        mockLevels={gradeData.mockLevels}
        mockGrades={gradeData.mockGrades}
        mockSections={gradeData.mockSections}
        canShowGradesTable={gradeData.canShowGradesTable}
      />

      {/* Alert for evaluation structure */}
      {!gradeData.currentEvaluationStructure && gradeData.selectedCourse && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Cargando Estructura de Evaluación
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Cargando estructura de evaluación para el <strong>{gradeData.selectedBimester}° Bimestre</strong>.
                Los botones para agregar columnas personalizadas estarán disponibles una vez que se cargue la estructura. Si no existe, se creará automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Structure Info */}
      {gradeData.currentEvaluationStructure && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Estructura Configurada: {gradeData.currentEvaluationStructure.name}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {gradeData.currentEvaluationStructure.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no se han completado las selecciones */}
      {!gradeData.canShowGradesTable && (
        <div className="card p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona los filtros necesarios
            </h3>
            <p className="text-gray-600 mb-4">
              Para ver la tabla de notas, debes seleccionar:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-6">
              <div className={`p-2 rounded-lg ${gradeData.selectedCourse ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                <span className="font-medium">✓ Curso</span>
              </div>
              <div className={`p-2 rounded-lg ${gradeData.selectedBimester ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                <span className="font-medium">✓ Periodo</span>
              </div>
              <div className={`p-2 rounded-lg ${gradeData.selectedGrade ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                <span className="font-medium">✓ Grado</span>
              </div>
              <div className={`p-2 rounded-lg ${gradeData.selectedSection ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                <span className="font-medium">✓ Sección</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Los campos marcados con (*) son obligatorios
            </p>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {gradeData.stats && gradeData.canShowGradesTable && (
        <GradesStatsCards
          stats={gradeData.stats}
          getGradeColor={gradeData.getGradeColor}
        />
      )}

      {/* Tabla de notas estilo Excel */}
      {gradeData.canShowGradesTable && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                {/* Primera fila: Encabezados de competencias */}
                <tr>
                  <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-r border-gray-300">
                    N°
                  </th>
                  <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-20 border-r border-gray-300">
                    Estudiante
                  </th>
                  {gradeData.evaluationTypes.map(comp => {
                    const subsWithCustom = gradeData.getSubcategoriasWithCustom(comp.id, comp.subcategorias)
                    // Calcular suma total de pesos para determinar si mostrar columna "Nueva"
                    const totalWeight = subsWithCustom.reduce((sum, sub) => sum + (sub.weight || 0), 0)
                    const isWeightFull = totalWeight >= 0.999 // >= 99.9%
                    // colSpan: subcategorías + promedio + (columna "Nueva" solo si pesos < 100%)
                    const colSpan = subsWithCustom.length + 1 + (isWeightFull ? 0 : 1)
                    return (
                      <th
                        key={comp.id}
                        colSpan={colSpan}
                        className={`px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide ${comp.color} border-x border-gray-300`}
                      >
                        <div className="font-bold text-sm leading-tight">{comp.name}</div>
                      </th>
                    )
                  })}
                </tr>

                {/* Segunda fila: Subcategorías */}
                <tr>
                  {gradeData.evaluationTypes.map(comp => {
                    const subsWithCustom = gradeData.getSubcategoriasWithCustom(comp.id, comp.subcategorias)
                    // Calcular suma total de pesos (weights están en decimal, 1 = 100%)
                    const totalWeight = subsWithCustom.reduce((sum, sub) => sum + (sub.weight || 0), 0)
                    const isWeightFull = totalWeight >= 0.999 // >= 99.9% (tolerancia para decimales)
                    return (
                      <React.Fragment key={`subs-${comp.id}`}>
                        {subsWithCustom.map(sub => (
                          <th
                            key={sub.id}
                            className={`px-2 py-2 text-center text-xs font-medium text-gray-700 ${comp.color} border-l border-gray-200 relative group min-w-[80px]`}
                          >
                            <div className="truncate max-w-[120px] mx-auto" title={sub.name}>{sub.name}</div>
                            {sub.weight !== undefined && (
                              <div className="text-xs font-semibold text-gray-600 mt-1">
                                {Math.round(sub.weight * 100)}%
                              </div>
                            )}
                            {sub.isCustom && (
                              <button
                                onClick={() => helpers.handleDeleteColumn(sub.id)}
                                className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30"
                                title="Eliminar columna"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </th>
                        ))}
                        {/* Solo mostrar botón "+ Nueva" si la suma de pesos es menor a 100% */}
                        {!isWeightFull && (
                          <th className={`px-2 py-2 text-center ${comp.color} border-l border-gray-200 min-w-[70px]`}>
                            <button
                              onClick={() => helpers.openAddColumnModal(comp.id)}
                              disabled={!gradeData.currentEvaluationStructure}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors text-xs mx-auto whitespace-nowrap ${
                                gradeData.currentEvaluationStructure
                                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              title={
                                gradeData.currentEvaluationStructure
                                  ? `Agregar columna a ${comp.name} (${Math.round((1 - totalWeight) * 100)}% disponible)`
                                  : 'Cargando estructura de evaluación...'
                              }
                            >
                              <Plus size={12} />
                              <span className="hidden xl:inline">Nueva</span>
                            </button>
                          </th>
                        )}
                        <th className={`px-3 py-2 text-center text-xs font-bold uppercase bg-gradient-to-b from-yellow-100 to-yellow-200 border-l-2 border-gray-500 border-r-2 min-w-[70px]`}>
                          <div className="text-gray-800">PROM</div>
                        </th>
                      </React.Fragment>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gradeData.filteredStudents.map((student, index) => {
                  // ✅ CORREGIDO: calculateAverage ahora retorna objeto {numeric, formatted, display}
                  const averageObj = gradeData.calculateAverage(student.id)
                  // const isApproved = averageObj && averageObj.numeric >= 11 // No se usa actualmente

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-center text-gray-900 font-medium sticky left-0 bg-white z-10">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 sticky left-12 bg-white z-10 border-r border-gray-300">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.last_names}, {student.first_names}
                          </div>
                          <div className="text-xs text-gray-500">
                            DNI: {student.dni}
                          </div>
                        </div>
                      </td>
                      {gradeData.evaluationTypes.map((comp) => {
                        const subsWithCustom = gradeData.getSubcategoriasWithCustom(comp.id, comp.subcategorias)
                        // Calcular si el peso está lleno (igual que en el header)
                        const totalWeight = subsWithCustom.reduce((sum, sub) => sum + (sub.weight || 0), 0)
                        const isWeightFull = totalWeight >= 0.999
                        return (
                          <React.Fragment key={`comp-${comp.id}-${student.id}`}>
                            {subsWithCustom.map((sub) => {
                              const globalColIndex = gradeData.allSubcategorias.findIndex(s => s.id === sub.id)
                              return (
                                <td key={sub.id} className={`px-2 py-1 ${comp.color} border-l border-gray-200`} id={`cell-${student.id}-${sub.id}`}>
                                  <ExcelGradeCell
                                    studentId={student.id}
                                    evalTypeId={sub.id}
                                    value={gradeData.grades[student.id]?.[sub.id]}
                                    onChange={handleGradeChangeWithToast}
                                    onNavigate={(direction) => handleCellNavigation(index, globalColIndex, direction)}
                                    autoFocus={gradeData.focusedCell.row === index && gradeData.focusedCell.col === globalColIndex}
                                    disabled={false}
                                    gradingMode={gradeData.currentGradingSystem === 'vigesimal' ? 'numeric' : 'literal'}
                                    literalGradeOptions={gradeData.literalGradeOptions}
                                  />
                                </td>
                              )
                            })}
                            {/* Solo mostrar celda vacía si el peso NO está lleno (igual que el header) */}
                            {!isWeightFull && (
                              <td className={`px-1 py-1 ${comp.color} border-l border-gray-200`}></td>
                            )}
                            <td className="px-3 py-3 text-center bg-yellow-50 border-l-2 border-gray-500 border-r-2">
                              {(() => {
                                // ✅ CORREGIDO: calculateCompetenceAverage ahora retorna objeto {numeric, formatted, display}
                                const compAvgObj = gradeData.calculateCompetenceAverage(student.id, comp.id)
                                const displayValue = compAvgObj?.display || '--'
                                const numericForColor = compAvgObj?.numeric || null

                                return (
                                  <span className={`text-base font-bold ${gradeData.getGradeColor(numericForColor)}`}>
                                    {displayValue}
                                  </span>
                                )
                              })()}
                            </td>
                          </React.Fragment>
                        )
                      })}
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {gradeData.filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No se encontraron estudiantes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leyenda y Ayuda de Navegación */}
      {gradeData.canShowGradesTable && <GradesLegend />}

      {/* Modal Agregar Columna */}
      <AddColumnModal
        showModal={helpers.showAddColumnModal}
        setShowModal={helpers.setShowAddColumnModal}
        columnForm={helpers.columnForm}
        setColumnForm={helpers.setColumnForm}
        handleAddColumn={helpers.handleAddColumn}
        evaluationTypes={gradeData.evaluationTypes}
      />

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={helpers.dialog.isOpen}
        onClose={helpers.closeDialog}
        onConfirm={helpers.dialog.onConfirm}
        title={helpers.dialog.title}
        message={helpers.dialog.message}
        type={helpers.dialog.type}
      />

      {/* Modal de Descarga de Boleta */}
      <ReportCardDownloadModal
        isOpen={showReportCardModal}
        onClose={() => setShowReportCardModal(false)}
        students={gradeData.filteredStudents}
        selectedBimester={gradeData.selectedBimester}
        courseName={gradeData.courses?.find(c => c.id === parseInt(gradeData.selectedCourse))?.name || ''}
      />
    </div>
  )
}

export default TeacherGradesPage
