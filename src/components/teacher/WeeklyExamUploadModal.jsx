import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X, Upload, FileSpreadsheet, AlertCircle, CheckCircle,
  Download, Eye, Users, BookOpen, Calendar
} from 'lucide-react'
import { useGradesStore } from '../../stores/gradesStore.jsx'
import { useEnrollmentStore } from '../../stores/enrollmentStore'
import { useAcademicStore } from '../../stores/academicStore'

const WeeklyExamUploadModal = ({
  isOpen,
  onClose,
  weekNumber = 1,
  selectedCourse = null
}) => {
  const { recordGrade, isLoading } = useGradesStore()
  const { students } = useEnrollmentStore()
  const { courses } = useAcademicStore()

  const [uploadData, setUploadData] = useState({
    examWeek: weekNumber,
    course: selectedCourse?.id || '',
    grades: []
  })
  const [previewData, setPreviewData] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [uploadStatus, setUploadStatus] = useState('pending') // pending, uploading, success, error

  // Estructura fija de materias según el análisis del Excel
  const weeklyExamSubjects = [
    { code: 'ARITM', name: 'Aritmética', weight: 6.67 },
    { code: 'ALGEB', name: 'Álgebra', weight: 6.67 },
    { code: 'GEOM', name: 'Geometría', weight: 6.67 },
    { code: 'TRIG', name: 'Trigonometría', weight: 6.67 },
    { code: 'RM', name: 'Razonamiento Matemático', weight: 6.67 },
    { code: 'COM', name: 'Comunicación', weight: 6.67 },
    { code: 'COMP_LECT', name: 'Comprensión Lectora', weight: 6.67 },
    { code: 'RV', name: 'Razonamiento Verbal', weight: 6.67 },
    { code: 'FIS', name: 'Física', weight: 6.67 },
    { code: 'QUIM', name: 'Química', weight: 6.67 },
    { code: 'BIO', name: 'Biología', weight: 6.67 },
    { code: 'ECO', name: 'Ecología', weight: 6.67 },
    { code: 'CCSS', name: 'Ciencias Sociales', weight: 6.67 },
    { code: 'DPCC', name: 'DPCC', weight: 6.67 },
    { code: 'ING', name: 'Inglés', weight: 6.67 }
  ]

  useEffect(() => {
    if (isOpen) {
      initializeUploadData()
    }
  }, [isOpen, selectedCourse])

  const initializeUploadData = () => {
    const filteredStudents = students?.filter(student =>
      !selectedCourse || student.cursos?.includes(selectedCourse.id)
    ) || []

    const gradesStructure = filteredStudents.map(student => ({
      studentId: student.id,
      studentName: `${student.first_names} ${student.last_names}`,
      studentCode: student.codigoEstudiante,
      grades: weeklyExamSubjects.map(subject => ({
        subjectCode: subject.code,
        subjectName: subject.name,
        value: null,
        status: 'pending' // pending, valid, invalid
      }))
    }))

    setUploadData(prev => ({
      ...prev,
      course: selectedCourse?.id || '',
      grades: gradesStructure
    }))
  }

  const handleGradeChange = (studentIndex, subjectIndex, value) => {
    const numericValue = parseFloat(value)
    const isValid = !isNaN(numericValue) && numericValue >= 0 && numericValue <= 20

    setUploadData(prev => {
      const newGrades = [...prev.grades]
      newGrades[studentIndex].grades[subjectIndex] = {
        ...newGrades[studentIndex].grades[subjectIndex],
        value: value === '' ? null : numericValue,
        status: value === '' ? 'pending' : (isValid ? 'valid' : 'invalid')
      }
      return { ...prev, grades: newGrades }
    })
  }

  const validateUpload = () => {
    const errors = []

    if (!uploadData.course) {
      errors.push('Debe seleccionar un curso')
    }

    if (!uploadData.examWeek || uploadData.examWeek < 1 || uploadData.examWeek > 10) {
      errors.push('Semana del examen debe estar entre 1 y 10')
    }

    const totalGrades = uploadData.grades.reduce((total, student) =>
      total + student.grades.filter(grade => grade.value !== null).length, 0
    )

    if (totalGrades === 0) {
      errors.push('Debe ingresar al menos una calificación')
    }

    const invalidGrades = uploadData.grades.reduce((count, student) =>
      count + student.grades.filter(grade => grade.status === 'invalid').length, 0
    )

    if (invalidGrades > 0) {
      errors.push(`${invalidGrades} calificaciones tienen valores inválidos (0-20)`)
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const generatePreview = () => {
    if (!validateUpload()) return

    const summary = {
      course: courses?.find(c => c.id === uploadData.course)?.name || 'Curso no encontrado',
      examWeek: uploadData.examWeek,
      totalStudents: uploadData.grades.length,
      totalGradesEntered: uploadData.grades.reduce((total, student) =>
        total + student.grades.filter(grade => grade.value !== null).length, 0
      ),
      subjectsSummary: weeklyExamSubjects.map(subject => {
        const subjectGrades = uploadData.grades.map(student =>
          student.grades.find(grade => grade.subjectCode === subject.code)
        ).filter(grade => grade?.value !== null)

        const average = subjectGrades.length > 0
          ? subjectGrades.reduce((sum, grade) => sum + grade.value, 0) / subjectGrades.length
          : 0

        const passed = subjectGrades.filter(grade => grade.value >= 11).length

        return {
          ...subject,
          gradeCount: subjectGrades.length,
          average: average.toFixed(2),
          passRate: subjectGrades.length > 0 ? ((passed / subjectGrades.length) * 100).toFixed(1) : '0'
        }
      })
    }

    setPreviewData(summary)
  }

  const uploadGrades = async () => {
    if (!validateUpload()) return

    setUploadStatus('uploading')

    try {
      const uploadPromises = []

      // Crear categoría para exámenes semanales si no existe
      const categoryId = `weekly-exam-${uploadData.course}`

      for (const student of uploadData.grades) {
        for (const grade of student.grades) {
          if (grade.value !== null) {
            const subcategoryId = `${categoryId}-${grade.subjectCode}`

            const gradeData = {
              student_id: student.studentId,
              course_id: uploadData.course,
              teacher_id: 'current-teacher-id', // Obtener del auth store
              quarter: Math.ceil((uploadData.examWeek / 10) * 4), // Mapear semana a bimestre
              categoriaId: categoryId,
              subcategoriaId: subcategoryId,
              valor: grade.value,
              gradingSystem: 'secundaria',
              observacion: `Examen Semanal ${uploadData.examWeek} - ${grade.subjectName}`
            }

            uploadPromises.push(recordGrade(gradeData))
          }
        }
      }

      await Promise.all(uploadPromises)
      setUploadStatus('success')

      setTimeout(() => {
        onClose()
        setUploadStatus('pending')
        setPreviewData(null)
      }, 2000)

    } catch (error) {
      console.error('Error uploading grades:', error)
      setUploadStatus('error')
    }
  }

  const downloadTemplate = () => {
    const csvContent = [
      ['Código Estudiante', 'Nombre Completo', ...weeklyExamSubjects.map(s => s.name)],
      ...uploadData.grades.map(student => [
        student.studentCode,
        student.studentName,
        ...weeklyExamSubjects.map(() => '') // Campos vacíos para llenar
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `plantilla_examen_semana_${uploadData.examWeek}.csv`
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileSpreadsheet className="mr-3 h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Subir Notas - Examen Semanal {uploadData.examWeek}
              </h3>
              <p className="text-sm text-gray-600">
                Sistema basado en estructura del registro de notas institucional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Configuration */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curso
                </label>
                <select
                  value={uploadData.course}
                  onChange={(e) => setUploadData(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seleccionar curso</option>
                  {courses?.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semana del Examen
                </label>
                <select
                  value={uploadData.examWeek}
                  onChange={(e) => setUploadData(prev => ({ ...prev, examWeek: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(week => (
                    <option key={week} value={week}>
                      Semana {week}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full justify-center"
                >
                  <Download className="mr-2" size={16} />
                  Descargar Plantilla
                </button>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Errores de validación
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    ¡Notas subidas exitosamente!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {previewData && (
            <div className="p-6 bg-blue-50 border-b border-gray-200">
              <h4 className="text-md font-semibold text-blue-900 mb-3">Vista Previa</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded">
                  <div className="text-sm text-gray-600">Curso</div>
                  <div className="font-medium">{previewData.course}</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-sm text-gray-600">Estudiantes</div>
                  <div className="font-medium">{previewData.totalStudents}</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-sm text-gray-600">Notas Ingresadas</div>
                  <div className="font-medium">{previewData.totalGradesEntered}</div>
                </div>
                <div className="bg-white p-3 rounded">
                  <div className="text-sm text-gray-600">Semana</div>
                  <div className="font-medium">{previewData.examWeek}</div>
                </div>
              </div>

              <div className="bg-white rounded p-4">
                <h5 className="font-medium mb-2">Resumen por Materia</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {previewData.subjectsSummary.map(subject => (
                    <div key={subject.code} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{subject.name}</span>
                      <span>{subject.gradeCount} notas - Prom: {subject.average}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grades Input Grid */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                      Estudiante
                    </th>
                    {weeklyExamSubjects.map(subject => (
                      <th key={subject.code} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        <div className="flex flex-col items-center">
                          <span>{subject.name}</span>
                          <span className="text-xs text-gray-400">({subject.weight.toFixed(1)}%)</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadData.grades.map((student, studentIndex) => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.studentCode}
                          </div>
                        </div>
                      </td>
                      {student.grades.map((grade, subjectIndex) => (
                        <td key={grade.subjectCode} className="px-2 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.1"
                            value={grade.value || ''}
                            onChange={(e) => handleGradeChange(studentIndex, subjectIndex, e.target.value)}
                            className={`w-16 px-2 py-1 text-center text-sm border rounded focus:outline-none focus:ring-1 ${
                              grade.status === 'invalid'
                                ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                : grade.status === 'valid'
                                ? 'border-green-300 focus:ring-green-500 bg-green-50'
                                : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="0-20"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <AlertCircle className="mr-2 h-4 w-4" />
            Basado en la estructura de "1ro SEC Reg_Notas.xlsx"
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={generatePreview}
              disabled={uploadStatus === 'uploading'}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Eye className="mr-2" size={16} />
              Vista Previa
            </button>

            <button
              onClick={uploadGrades}
              disabled={!previewData || uploadStatus === 'uploading'}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={16} />
                  Subir Notas
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WeeklyExamUploadModal