import React from 'react'
import {
  Building,
  School,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

/**
 * Componente recursivo para renderizar árbol jerárquico de estructura académica
 * Soporta niveles, grados, secciones y cursos
 */
const TreeNode = ({
  item,
  type,
  level = 0,
  expandedItems,
  selectedItem,
  handleSelectItem,
  toggleExpanded,
  openEditModal,
  openCreateModal,
  handleDelete,
  getGradesByLevel,
  getSectionsByGrade,
  getCoursesByLevel,
  hasPermission
}) => {
  // Determine if this item has children or can have children based on type
  let hasChildren = false
  if (type === 'level') {
    hasChildren = true // Levels can always have grades
  } else if (type === 'grade') {
    hasChildren = true // Grades can always have sections and courses
  }

  const isExpanded = expandedItems[item.id]
  const isSelected = selectedItem?.id === item.id

  const getIcon = () => {
    switch (type) {
      case 'level': return Building
      case 'grade': return School
      case 'section': return Users
      case 'course': return BookOpen
      default: return Building
    }
  }

  const getColor = () => {
    switch (type) {
      case 'level': return 'text-purple-600'
      case 'grade': return 'text-blue-600'
      case 'section': return 'text-green-600'
      case 'course': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const Icon = getIcon()

  return (
    <div className="select-none">
      <div
        className={`group flex items-center py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
          isSelected ? 'bg-primary-50 border border-primary-200' : ''
        }`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => handleSelectItem(item, type)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpanded(item.id)
            }}
            className="mr-2"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {!hasChildren && <div className="w-4 mr-2" />}

        <Icon size={16} className={`mr-2 ${getColor()}`} />

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </span>
          {item.code && (
            <span className="text-xs text-gray-500 ml-2">({item.code})</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasPermission('manage_academic_structure') && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(item, type)
                }}
                className="p-1 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(item, type)
                }}
                className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {type === 'level' && (
            <>
              <div className="flex items-center justify-between py-1 px-3" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                <span className="text-xs text-gray-500 font-medium">GRADOS</span>
                {hasPermission('manage_academic_structure') && (
                  <button
                    onClick={() => openCreateModal('grade', item.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Agregar
                  </button>
                )}
              </div>
              {(getGradesByLevel(item.id) || []).map((grade) => (
                <div key={grade.id} className="relative group">
                  <TreeNode
                    item={grade}
                    type="grade"
                    level={level + 1}
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
                    hasPermission={hasPermission}
                  />
                </div>
              ))}

              <div className="flex items-center justify-between py-1 px-3" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                <span className="text-xs text-gray-500 font-medium">CURSOS DEL NIVEL</span>
                {hasPermission('manage_academic_structure') && (
                  <button
                    onClick={() => openCreateModal('course', item.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Agregar
                  </button>
                )}
              </div>
              {(getCoursesByLevel(item.id) || []).map((course) => (
                <TreeNode
                  key={course.id}
                  item={course}
                  type="course"
                  level={level + 1}
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
                  hasPermission={hasPermission}
                />
              ))}
            </>
          )}

          {type === 'grade' && (
            <>
              <div className="flex items-center justify-between py-1 px-3" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                <span className="text-xs text-gray-500 font-medium">SECCIONES</span>
                {hasPermission('manage_academic_structure') && (
                  <button
                    onClick={() => openCreateModal('section', item.id)}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Agregar
                  </button>
                )}
              </div>
              {(getSectionsByGrade(item.id) || []).map((section) => (
                <TreeNode
                  key={section.id}
                  item={section}
                  type="section"
                  level={level + 2}
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
                  hasPermission={hasPermission}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TreeNode
