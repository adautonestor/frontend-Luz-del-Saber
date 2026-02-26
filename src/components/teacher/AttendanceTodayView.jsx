import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import studentsService from '../../services/studentsService'
import { getTodayLima } from '../../utils/dateUtils'

const AttendanceTodayView = ({ classData, selectedDate, getStatusColor, getStatusText }) => {
  const [students, setStudents] = useState([])

  // Cargar estudiantes una sola vez
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const allStudents = await studentsService.getAll()
        setStudents(allStudents || [])
      } catch (error) {
        console.error('Error loading students:', error)
        setStudents([])
      }
    }
    loadStudents()
  }, [])

  // Función para obtener datos del estudiante
  const getStudent = (studentId) => {
    return students.find(s => s.id === studentId)
  }

  return (
    <>
      {/* Date Selector */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            readOnly
            max={getTodayLima()}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Estudiantes</p>
              <p className="text-2xl font-semibold text-gray-900">{classData.totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Presentes</p>
              <p className="text-2xl font-semibold text-green-600">{classData.present}</p>
              <p className="text-xs text-gray-500">
                {classData.totalStudents > 0 ? Math.round((classData.present / classData.totalStudents) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ausentes</p>
              <p className="text-2xl font-semibold text-red-600">{classData.absent}</p>
              <p className="text-xs text-gray-500">
                {classData.totalStudents > 0 ? Math.round((classData.absent / classData.totalStudents) * 100) : 0}%
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tardanzas</p>
              <p className="text-2xl font-semibold text-yellow-600">{classData.stats?.tardanzas || 0}</p>
              <p className="text-xs text-gray-500">
                {classData.present > 0 ? Math.round(((classData.stats?.tardanzas || 0) / classData.present) * 100) : 0}%
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Students Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Present Students */}
        <div className="card">
          <div className="p-4 bg-green-50 border-b border-green-200">
            <h3 className="font-semibold text-green-900">Estudiantes Presentes ({classData.present})</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {classData.records.map((record, index) => {
                const student = getStudent(record.student_id)

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student?.first_names} {student?.last_names}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {record.horaEntrada
                              ? new Date(record.horaEntrada).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Sin hora'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.estadoEntrada)}`}>
                        {getStatusText(record.estadoEntrada)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
              {classData.records.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay estudiantes presentes aún</p>
              )}
            </div>
          </div>
        </div>

        {/* Absent Students */}
        <div className="card">
          <div className="p-4 bg-red-50 border-b border-red-200">
            <h3 className="font-semibold text-red-900">Estudiantes Ausentes ({classData.absent})</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(classData.absentStudents || []).map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <p className="font-medium text-gray-900">
                    {student.first_names} {student.last_names}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Sin registro de asistencia</p>
                </motion.div>
              ))}
              {(!classData.absentStudents || classData.absentStudents.length === 0) && (
                <p className="text-center text-gray-500 py-4">Todos los estudiantes presentes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AttendanceTodayView
