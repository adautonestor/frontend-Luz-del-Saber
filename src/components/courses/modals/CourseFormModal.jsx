import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  CourseBasicInfoFields,
  TeacherAssignmentSection,
  CourseDetailsFields
} from './course-form'

/**
 * Modal para crear/editar cursos
 */
const CourseFormModal = ({
  show,
  selectedCourse,
  courseForm,
  setCourseForm,
  isSaving,
  levels,
  courses,
  teachers,
  getGradesByLevel,
  onClose,
  onSave,
  academicYears,
  selectedAcademicYear
}) => {
  if (!show) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fijo */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCourse ? 'Editar Curso' : 'Crear Curso'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Fields - Con scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <CourseBasicInfoFields
              courseForm={courseForm}
              setCourseForm={setCourseForm}
              selectedCourse={selectedCourse}
              levels={levels}
              courses={courses}
              academicYears={academicYears}
              selectedAcademicYear={selectedAcademicYear}
            />

            <TeacherAssignmentSection
              courseForm={courseForm}
              setCourseForm={setCourseForm}
              levels={levels}
              teachers={teachers}
              getGradesByLevel={getGradesByLevel}
            />

            <CourseDetailsFields
              courseForm={courseForm}
              setCourseForm={setCourseForm}
            />
          </div>

          {/* Footer Buttons - Fijo */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSaving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isSaving ? 'Guardando...' : (selectedCourse ? 'Guardar' : 'Crear')}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default CourseFormModal
