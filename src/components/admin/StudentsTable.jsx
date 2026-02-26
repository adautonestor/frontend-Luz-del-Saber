import React from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, AlertCircle, ToggleLeft, ToggleRight, Eye } from 'lucide-react'

const StudentsTable = ({ students, userRole, onEdit, onChangeParent, onDelete, onToggleStatus, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel/Grado</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              {(userRole === 'Director' || userRole === 'Secretaria') && (
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={(userRole === 'Director' || userRole === 'Secretaria') ? 8 : 7} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">No se encontraron estudiantes</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-[120px] truncate" title={`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim()}>
                      {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim()}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold text-xs">
                          {(student.first_names || '').charAt(0)}{(student.paternal_last_name || '').charAt(0)}
                        </span>
                      </div>
                      <div className="ml-2 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]" title={`${student.first_names || ''} ${student.last_names || ''}`.trim()}>
                          {`${student.first_names || ''} ${student.last_names || ''}`.trim()}
                        </p>
                        <p className="text-xs text-gray-500">{student.sexo === 'M' || student.gender === 'M' ? 'M' : 'F'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.dni}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-900">{student.code}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      {(student.level_name || student.nivel) && (student.grade_name || student.grado) ? (
                        <span>
                          <span className="capitalize">{student.level_name || student.nivel}</span> - {student.grade_name || student.grado}° {student.section_name || student.seccion || ''}
                        </span>
                      ) : (
                        <span className="text-orange-600 font-medium">No matriculado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.academic_year || new Date().getFullYear()}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'active' || student.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                      student.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      student.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? 'Activo' :
                       student.status === 'enrolled' ? 'Matriculado' :
                       student.status === 'inactive' ? 'Inactivo' :
                       student.status === 'pending' ? 'Pendiente' :
                       student.status}
                    </span>
                  </td>
                  {(userRole === 'Director' || userRole === 'Secretaria') && (
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onView && onView(student)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Ver Detalles"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => onEdit(student)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar Estudiante"
                        >
                          <Edit size={18} />
                        </button>

                        {student.status === 'active' ? (
                          <button
                            onClick={() => onToggleStatus(student, 'inactive')}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Desactivar Estudiante"
                          >
                            <ToggleRight size={18} />
                          </button>
                        ) : student.status === 'inactive' ? (
                          <button
                            onClick={() => onToggleStatus(student, 'active')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Activar Estudiante"
                          >
                            <ToggleLeft size={18} />
                          </button>
                        ) : null}

                        <button
                          onClick={() => onDelete(student)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar Estudiante"
                          disabled={student.status === 'deleted'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentsTable
