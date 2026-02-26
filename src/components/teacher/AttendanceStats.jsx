import React from 'react'
import { Users, CheckCircle, AlertTriangle, XCircle, CircleDot } from 'lucide-react'

const AttendanceStats = ({ classData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900">
              {classData.totalStudents}
            </p>
          </div>
          <Users className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Asistió</p>
            <p className="text-2xl font-semibold text-green-600">
              {classData.stats.asistio || 0}
            </p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tardanzas</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {classData.stats.tardanzas}
            </p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Faltas</p>
            <p className="text-2xl font-semibold text-red-600">
              {classData.stats.faltas}
            </p>
          </div>
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Sin Registro</p>
            <p className="text-2xl font-semibold text-gray-600">
              {classData.totalStudents - classData.present}
            </p>
          </div>
          <CircleDot className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

export default AttendanceStats
