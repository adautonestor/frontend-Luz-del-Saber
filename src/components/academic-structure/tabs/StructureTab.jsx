import React from 'react'
import {
  Building,
  School,
  Users,
  BookOpen,
  Target,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'
import TreeNode from '../TreeNode'

/**
 * Tab de gestión de estructura educativa (niveles, grados, secciones)
 * Muestra árbol jerárquico con detalles del elemento seleccionado
 */
const StructureTab = ({
  levels,
  grades,
  sections,
  courses,
  expandedItems,
  selectedItem,
  toggleExpanded,
  handleSelectItem,
  getGradesByLevel,
  getSectionsByGrade,
  getCoursesByLevel,
  openCreateModal,
  openEditModal,
  handleDelete,
  academicYears,
  selectedAcademicYear,
  handleAcademicYearChange,
  hasPermission
}) => {
  return (
    <div className="space-y-6">
      {/* Academic Year Selector */}
      <div className="card">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Año Lectivo</h3>
              <p className="text-sm text-gray-600">Selecciona el año para gestionar su estructura educativa</p>
            </div>
            <select
              value={selectedAcademicYear?.id || ''}
              onChange={(e) => {
                const yearId = parseInt(e.target.value)
                const year = academicYears.find(y => y.id === yearId)
                if (year) handleAcademicYearChange(year)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white min-w-48"
            >
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.añoCodigo || year.año} - {year.name} ({year.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree Structure */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estructura Educativa</h3>
                <div className="flex items-center gap-3">
                  {selectedAcademicYear && (
                    <span className="text-sm text-gray-500">
                      {selectedAcademicYear.name}
                    </span>
                  )}
                  {hasPermission && hasPermission('manage_academic_structure') && selectedAcademicYear && (
                    <button
                      onClick={() => openCreateModal('level')}
                      className="btn btn-primary px-3 py-1.5 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Nuevo Nivel
                    </button>
                  )}
                </div>
              </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {(!levels || levels.length === 0) ? (
                <div className="p-4 text-center text-gray-500">No hay niveles académicos configurados</div>
              ) : (
                levels.map((level) => (
                  <TreeNode
                      key={level.id}
                      item={level}
                      type="level"
                      level={0}
                      expandedItems={expandedItems}
                      selectedItem={selectedItem}
                      handleSelectItem={handleSelectItem}
                      toggleExpanded={toggleExpanded}
                      openEditModal={openEditModal}
                      openCreateModal={openCreateModal}
                      handleDelete={handleDelete}
                      getGradesByLevel={getGradesByLevel}
                      getSectionsByGrade={getSectionsByGrade}
                      getCoursesByLevel={getCoursesByLevel}
                      hasPermission={() => true}
                    />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Item Details */}
      <div className="lg:col-span-1">
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalles</h3>

            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedItem.type === 'level' && <Building className="text-purple-600" size={20} />}
                  {selectedItem.type === 'grade' && <School className="text-blue-600" size={20} />}
                  {selectedItem.type === 'section' && <Users className="text-green-600" size={20} />}
                  {selectedItem.type === 'course' && <BookOpen className="text-yellow-600" size={20} />}
                  <div>
                    <h4 className="font-medium">{selectedItem.name}</h4>
                    <span className="text-sm text-gray-500 capitalize">{selectedItem.type}</span>
                  </div>
                </div>

                {selectedItem.description && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Descripción</label>
                    <p className="text-sm mt-1">{selectedItem.description}</p>
                  </div>
                )}

                {selectedItem.code && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Código</label>
                    <p className="text-sm mt-1">{selectedItem.code}</p>
                  </div>
                )}

                {selectedItem.type === 'section' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Capacidad Máxima</label>
                      <p className="text-sm mt-1">{selectedItem.capacity || selectedItem.capacidadMaxima || 30} estudiantes</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Turno</label>
                      <p className="text-sm mt-1 capitalize">{selectedItem.shift || selectedItem.turno || 'mañana'}</p>
                    </div>
                  </>
                )}

                {selectedItem.type === 'course' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Área</label>
                      <p className="text-sm mt-1 capitalize">{selectedItem.area}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Horas Semanales</label>
                      <p className="text-sm mt-1">{selectedItem.horasSemanales} horas</p>
                    </div>
                  </>
                )}

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => openEditModal(selectedItem, selectedItem.type)}
                    className="w-full btn btn-outline px-4 py-2 flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem, selectedItem.type)}
                    className="w-full btn btn-outline text-red-600 border-red-200 hover:bg-red-50 px-4 py-2 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Selecciona un elemento del árbol para ver sus detalles
                </p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default StructureTab
