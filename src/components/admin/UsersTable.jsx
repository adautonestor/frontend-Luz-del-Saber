import React from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2 } from 'lucide-react'

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  getRoleBadgeColor,
  getStatusBadgeColor,
  currentUser
}) => {
  // Verificar si el usuario actual es secretaria
  const isSecretary = currentUser?.rol === 'Secretaria'

  // Función para verificar si se pueden mostrar acciones para un usuario
  const canShowActions = (user) => {
    // Si es secretaria, no puede hacer acciones sobre administradores (Director)
    if (isSecretary && user.rol === 'Director') {
      return false
    }
    return true
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DNI
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-3 py-3">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_names}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email || 'Sin email'}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.dni || '-'}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm text-gray-900 whitespace-nowrap">
                    {user.phone || '-'}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {user.address || '-'}
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.rol)}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString('es-PE')
                    : 'Nunca'
                  }
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {canShowActions(user) ? (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Sin acciones</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersTable
