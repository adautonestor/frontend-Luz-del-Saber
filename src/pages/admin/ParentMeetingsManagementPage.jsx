import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { validateParentMeeting } from '../../services/mock/schemas/parentMeetings'
import { INITIAL_MEETING_DATA, SCHOOL_YEARS } from '../../config/parentMeetingsConstants'
import {
  filterMeetingsByYear,
  createMeeting,
  loadExistingAttendance,
  saveAttendanceData,
  markMeetingAsCompleted
} from '../../utils/parentMeetingsHelpers'
import MeetingsStatsCards from '../../components/admin/MeetingsStatsCards'
import MeetingsTable from '../../components/admin/MeetingsTable'
import CreateMeetingModal from '../../components/admin/CreateMeetingModal'
import AttendanceModal from '../../components/admin/AttendanceModal'
import parentMeetingsService from '../../services/parentMeetingsService'
import { usersService } from '../../services/usersService'
import { studentsService } from '../../services/studentsService'
import structureService from '../../services/academic/structureService'

/**
 * Página de gestión de reuniones de padres
 */
const ParentMeetingsManagementPage = () => {
  const { user } = useAuthStore()
  const [meetings, setMeetings] = useState([])
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [sections, setSections] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [validationErrors, setValidationErrors] = useState([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [meetingData, setMeetingData] = useState(INITIAL_MEETING_DATA)
  const [attendanceData, setAttendanceData] = useState({})

  useEffect(() => {
    loadData()
  }, [selectedYear])

  const loadData = async () => {
    // Load meetings
    const allMeetings = await parentMeetingsService.getAll() || []
    const yearMeetings = filterMeetingsByYear(allMeetings, selectedYear)
    setMeetings(yearMeetings)

    // Load parents
    const allParents = await usersService.getByRole('padre') || []
    setParents(allParents)

    // Load students
    const allStudents = await studentsService.getAll() || []
    setStudents(allStudents)

    // Load grades
    const allGrades = await structureService.getAllGrades() || []
    setGrades(allGrades)

    // Load sections
    const allSections = await structureService.getAllSections() || []
    setSections(allSections)
  }

  const resetMeetingForm = () => {
    setMeetingData(INITIAL_MEETING_DATA)
    setValidationErrors([])
    setSaveSuccess(false)
  }

  const handleCreateMeeting = () => {
    setValidationErrors([])

    const dataToSave = {
      ...meetingData,
      academic_year: selectedYear,
      convocadaPor: user.id
    }

    const validation = validateParentMeeting(dataToSave)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    createMeeting(meetingData, user.id, selectedYear)

    setSaveSuccess(true)
    setTimeout(() => {
      setShowCreateModal(false)
      resetMeetingForm()
      loadData()
    }, 1500)
  }

  const openAttendanceModal = (meeting) => {
    setSelectedMeeting(meeting)
    const attendanceObj = loadExistingAttendance(meeting.id, parents)
    setAttendanceData(attendanceObj)
    setShowAttendanceModal(true)
  }

  const saveAttendance = () => {
    if (!selectedMeeting) return

    saveAttendanceData(selectedMeeting.id, attendanceData, user.id)
    markMeetingAsCompleted(selectedMeeting.id)

    setShowAttendanceModal(false)
    loadData()
  }

  const handleCreateFirst = () => {
    resetMeetingForm()
    setShowCreateModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reuniones de Padres</h1>
          <p className="mt-2 text-gray-600">
            Convoca reuniones y registra la asistencia de los padres de familia
          </p>
        </div>
        <button
          onClick={handleCreateFirst}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Convocar Reunión
        </button>
      </div>

      {/* Year Selector */}
      <div className="card p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Año Escolar
        </label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="input max-w-xs"
        >
          {SCHOOL_YEARS.map(year => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <MeetingsStatsCards meetings={meetings} />

      {/* Meetings List */}
      <MeetingsTable
        meetings={meetings}
        parents={parents}
        grades={grades}
        sections={sections}
        onOpenAttendance={openAttendanceModal}
        onCreateFirst={handleCreateFirst}
      />

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={showCreateModal}
        meetingData={meetingData}
        setMeetingData={setMeetingData}
        validationErrors={validationErrors}
        saveSuccess={saveSuccess}
        grades={grades}
        sections={sections}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateMeeting}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        meeting={selectedMeeting}
        parents={parents}
        students={students}
        attendanceData={attendanceData}
        setAttendanceData={setAttendanceData}
        onClose={() => setShowAttendanceModal(false)}
        onSave={saveAttendance}
      />
    </div>
  )
}

export default ParentMeetingsManagementPage
