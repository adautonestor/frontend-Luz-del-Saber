import React from 'react'
import { Shield, Users } from 'lucide-react'

const UsersStatsCards = ({ users }) => {
  const secretariasCount = users.filter(u => u.rol === 'Secretaria').length
  const docentesCount = users.filter(u => u.rol === 'Profesor').length
  const padresCount = users.filter(u => u.rol === 'Padre').length
  const totalCount = users.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Secretarias</p>
            <p className="text-2xl font-semibold">{secretariasCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Docentes</p>
            <p className="text-2xl font-semibold">{docentesCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Padres</p>
            <p className="text-2xl font-semibold">{padresCount}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Usuarios</p>
            <p className="text-2xl font-semibold">{totalCount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersStatsCards
