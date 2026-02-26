import React from 'react'
import { motion } from 'framer-motion'
import { Search, Download, Users, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useCourseDetailState } from '../../hooks/useCourseDetailState'
import CourseDetailHeader from './CourseDetailHeader'
import StudentsListTable from './StudentsListTable'
import StudentDetailView from './StudentDetailView'

const CourseDetailModal = ({ course, onClose }) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedStudents,
    filteredStudents,
    selectedStudent,
    showStudentDetail,
    setShowStudentDetail,
    handleSelectStudent,
    handleSelectAll,
    handleViewStudentDetail,
    getGradeColor,
    // Nuevos estados y funciones para competencias
    selectedBimester,
    setSelectedBimester,
    courseCompetencies,
    getCompetencyAverage,
    formatGradeValue,
    getGradeColorFromAvg,
    isLoadingCompetencies,
    isLoadingAverages
  } = useCourseDetailState(course)

  // Estadísticas del curso
  const courseStats = {
    totalStudents: filteredStudents.length,
    averageGrade: filteredStudents.reduce((sum, s) => sum + (s.notaPromedio || 0), 0) / (filteredStudents.length || 1)
  }

  // Función para exportar lista de estudiantes a Excel (con competencias)
  const handleExportarLista = () => {
    // Construir datos con competencias dinámicas
    const data = filteredStudents.map(student => {
      const row = {
        'Código': student.code || '-',
        'Apellidos': student.last_names || '-',
        'Nombres': student.first_names || '-',
        'DNI': student.dni || '-',
        'Grado': student.grade_name || '-',
        'Sección': student.section_name || '-'
      }

      // Agregar columnas por competencia para el bimestre seleccionado
      courseCompetencies.forEach(comp => {
        const avgData = getCompetencyAverage(student.id, comp.id, selectedBimester)
        row[comp.name] = formatGradeValue(avgData)
      })

      return row
    })

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estudiantes')

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 }, // Código
      { wch: 20 }, // Apellidos
      { wch: 20 }, // Nombres
      { wch: 12 }, // DNI
      { wch: 15 }, // Grado
      { wch: 10 }  // Sección
    ]
    // Agregar ancho para cada competencia
    courseCompetencies.forEach(() => {
      colWidths.push({ wch: 12 })
    })
    ws['!cols'] = colWidths

    const fileName = `Lista_${course.name}_Bim${selectedBimester}_${course.grado || course.grade_name || ''}_${course.seccion || course.section_name || ''}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Función para generar reporte completo del curso (con todas las competencias y bimestres)
  const handleGenerarReporte = () => {
    const reportData = []

    // Encabezado del reporte
    reportData.push(['REPORTE DEL CURSO'])
    reportData.push([])
    reportData.push(['Curso:', course.name])
    reportData.push(['Grado:', `${course.grado || course.grade_name || '-'} - Sección ${course.seccion || course.section_name || '-'}`])
    reportData.push(['Área:', course.area || '-'])
    reportData.push(['Total Estudiantes:', filteredStudents.length])
    reportData.push([])
    reportData.push(['Competencias del curso:'])
    courseCompetencies.forEach((comp, idx) => {
      reportData.push([`  ${idx + 1}. ${comp.name}`, comp.code || ''])
    })
    reportData.push([])
    reportData.push([])

    // Para cada bimestre, crear una sección
    for (let bim = 1; bim <= 4; bim++) {
      reportData.push([`BIMESTRE ${bim}`])
      reportData.push([])

      // Encabezados de tabla
      const headers = ['Código', 'Apellidos', 'Nombres', 'DNI']
      courseCompetencies.forEach(comp => {
        headers.push(comp.name)
      })
      reportData.push(headers)

      // Datos de estudiantes
      filteredStudents.forEach(student => {
        const row = [
          student.code || '-',
          student.last_names || '-',
          student.first_names || '-',
          student.dni || '-'
        ]
        courseCompetencies.forEach(comp => {
          const avgData = getCompetencyAverage(student.id, comp.id, bim)
          row.push(formatGradeValue(avgData))
        })
        reportData.push(row)
      })

      reportData.push([])
      reportData.push([])
    }

    const ws = XLSX.utils.aoa_to_sheet(reportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 }, // Código
      { wch: 20 }, // Apellidos
      { wch: 20 }, // Nombres
      { wch: 12 }  // DNI
    ]
    courseCompetencies.forEach(() => {
      colWidths.push({ wch: 15 })
    })
    ws['!cols'] = colWidths

    const fileName = `Reporte_${course.name}_${course.grado || course.grade_name || ''}_${course.seccion || course.section_name || ''}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <CourseDetailHeader
          course={course}
          studentCount={courseStats.totalStudents}
          avgGrade={courseStats.averageGrade.toFixed(1)}
          onClose={onClose}
        />

        {/* Header de sección */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-medium text-gray-900">Estudiantes del Curso</h3>
            {courseCompetencies.length > 0 && (
              <span className="text-sm text-gray-500">
                ({courseCompetencies.length} competencia{courseCompetencies.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Controles */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleExportarLista}
                className="btn btn-outline flex items-center gap-2"
              >
                <Download size={16} />
                Exportar Lista (Bim {selectedBimester})
              </button>
            </div>

            {/* Acciones masivas */}
            {selectedStudents.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedStudents.length} estudiante(s) seleccionado(s)
                </span>
              </div>
            )}

            {/* Lista de estudiantes con selector de bimestre */}
            <StudentsListTable
              students={filteredStudents}
              selectedStudents={selectedStudents}
              onSelectAll={handleSelectAll}
              onSelectStudent={handleSelectStudent}
              onViewDetail={handleViewStudentDetail}
              // Nuevas props para competencias
              courseCompetencies={courseCompetencies}
              selectedBimester={selectedBimester}
              setSelectedBimester={setSelectedBimester}
              getCompetencyAverage={getCompetencyAverage}
              formatGradeValue={formatGradeValue}
              getGradeColorFromAvg={getGradeColorFromAvg}
              isLoadingCompetencies={isLoadingCompetencies}
              isLoadingAverages={isLoadingAverages}
            />
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerarReporte}
              className="btn btn-outline"
            >
              <FileText size={16} className="mr-1" />
              Generar Reporte Completo
            </button>
            <button onClick={onClose} className="btn btn-primary">
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <StudentDetailView
          student={selectedStudent}
          course={course}
          courseCompetencies={courseCompetencies}
          getCompetencyAverage={getCompetencyAverage}
          formatGradeValue={formatGradeValue}
          getGradeColor={getGradeColor}
          getGradeColorFromAvg={getGradeColorFromAvg}
          onClose={() => setShowStudentDetail(false)}
        />
      )}
    </div>
  )
}

export default CourseDetailModal
