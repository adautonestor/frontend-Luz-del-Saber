import React from 'react'
import { Users, Edit2, Calendar, BarChart3 } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAttendanceDashboardState } from '../../hooks/useAttendanceDashboardState'
import AttendanceStats from '../../components/teacher/AttendanceStats'
import AttendanceRegistrationTable from '../../components/teacher/AttendanceRegistrationTable'
import AttendanceTodayView from '../../components/teacher/AttendanceTodayView'
import AttendanceMonthlyReport from '../../components/teacher/AttendanceMonthlyReport'
import JustifyModal from '../../components/teacher/JustifyModal'

const AttendanceDashboard = () => {
  const { user } = useAuthStore()
  const state = useAttendanceDashboardState(user)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
        <p className="mt-2 text-gray-600">
          Registra y visualiza la asistencia de tus estudiantes
        </p>
      </div>

      {/* Course Selector */}
      {state.teacherCourses.length > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {state.teacherCourses.map(course => (
              <button
                key={course.id}
                onClick={() => {
                  state.setSelectedCourse(course)
                  state.setSelectedSection(null)
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  state.selectedCourse?.id === course.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{course.name}</div>
                <div className="text-xs opacity-80">
                  {course.gradeName}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Selector */}
      {state.selectedCourse && state.availableSections.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sección:</label>
            <div className="flex flex-wrap gap-2">
              {state.availableSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => state.setSelectedSection(section)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    state.selectedSection?.id === section.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium">Sección {section.name}</div>
                  <div className="text-xs opacity-80">{section.shift || section.turno || 'Mañana'}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      {state.selectedCourse && state.selectedSection && (
        <div className="flex gap-2">
          <button
            onClick={() => state.setViewMode('registro')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              state.viewMode === 'registro'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Edit2 className="inline w-4 h-4 mr-2" />
            Registrar Asistencia
          </button>
          <button
            onClick={() => state.setViewMode('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              state.viewMode === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-2" />
            Vista del Día
          </button>
          <button
            onClick={() => state.setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              state.viewMode === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="inline w-4 h-4 mr-2" />
            Reporte Mensual
          </button>
        </div>
      )}

      {/* MODO REGISTRO */}
      {state.viewMode === 'registro' && state.selectedCourse && state.selectedSection && state.classData && (
        <>
          <AttendanceStats classData={state.classData} />
          <AttendanceRegistrationTable
            selectedCourse={state.selectedCourse}
            selectedSection={state.selectedSection}
            selectedDate={state.selectedDate}
            setSelectedDate={state.setSelectedDate}
            selectedQuarter={state.selectedQuarter}
            setSelectedQuarter={state.setSelectedQuarter}
            searchTerm={state.searchTerm}
            setSearchTerm={state.setSearchTerm}
            filteredStudents={state.filteredStudents}
            getStudentRecord={state.getStudentRecord}
            getStatusColor={state.getStatusColor}
            getStatusText={state.getStatusText}
            handleRegisterAttendance={state.handleRegisterAttendance}
            openJustifyModal={state.openJustifyModal}
            saving={state.saving}
          />
        </>
      )}

      {/* MODO VISTA DEL DÍA */}
      {state.viewMode === 'today' && state.selectedCourse && state.selectedSection && state.classData && (
        <AttendanceTodayView
          classData={state.classData}
          selectedDate={state.selectedDate}
          getStatusColor={state.getStatusColor}
          getStatusText={state.getStatusText}
        />
      )}

      {/* MODO REPORTE MENSUAL */}
      {state.viewMode === 'monthly' && state.selectedCourse && state.selectedSection && (
        <AttendanceMonthlyReport
          selectedCourse={state.selectedCourse}
          selectedSection={state.selectedSection}
          selectedMonth={state.selectedMonth}
          setSelectedMonth={state.setSelectedMonth}
          selectedYear={state.selectedYear}
          setSelectedYear={state.setSelectedYear}
          exportToExcel={state.exportToExcel}
          getMonthlyStats={state.getMonthlyStats}
        />
      )}

      {/* Empty State */}
      {state.teacherCourses.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay cursos asignados
          </h3>
          <p className="text-gray-600">
            No tienes cursos asignados para visualizar la asistencia
          </p>
        </div>
      )}

      {/* Modal de Justificación */}
      <JustifyModal
        showJustifyModal={state.showJustifyModal}
        selectedRecord={state.selectedRecord}
        justifyMode={state.justifyMode}
        justification={state.justification}
        setJustification={state.setJustification}
        setShowJustifyModal={state.setShowJustifyModal}
        handleJustify={state.handleJustify}
        handleRemoveJustification={state.handleRemoveJustification}
        saving={state.saving}
      />
    </div>
  )
}

export default AttendanceDashboard
