import React from 'react'
import { Plus, Upload } from 'lucide-react'
import { useCoursesPageState } from '../../hooks/useCoursesPageState'
import CoursesStats from '../../components/teacher/CoursesStats'
import CourseCard from '../../components/teacher/CourseCard'
import CourseDetailModal from '../../components/teacher/CourseDetailModal'

const CoursesPage = () => {
  const state = useCoursesPageState()

  if (state.loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando cursos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus asignaturas y revisa el progreso académico
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-outline flex items-center gap-2">
            <Upload size={20} />
            Materiales
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nueva Actividad
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <CoursesStats courses={state.courses} />

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            onViewDetails={state.loadCourseDetails}
            onViewCompetencies={state.handleViewCompetencies}
            getProgressColor={state.getProgressColor}
            getGradeColor={state.getGradeColor}
          />
        ))}
      </div>

      {/* Course Detail Modal */}
      {state.selectedCourse && (
        <CourseDetailModal
          selectedCourse={state.selectedCourse}
          courseStudents={state.courseStudents}
          courseActivities={state.courseActivities}
          courseGrades={state.courseGrades}
          activeTab={state.activeTab}
          setActiveTab={state.setActiveTab}
          onClose={() => state.setSelectedCourse(null)}
        />
      )}
    </div>
  )
}

export default CoursesPage
