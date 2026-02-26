import React from 'react'
import { Download } from 'lucide-react'

/**
 * Selector de hijos con botones de exportación individual
 */
const ChildrenSelector = ({ children, selectedChild, setSelectedChild, onExportChild }) => {
  if (children.length === 0) return null

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3">
        {children.map(child => (
          <div key={child.id} className="flex items-center gap-2">
            <button
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedChild?.id === child.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-sm font-medium">{child.first_names} {child.last_names}</div>
              <div className="text-xs opacity-80">{child.gradeName}</div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onExportChild(child)
              }}
              className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
              title={`Exportar boleta de ${child.first_names} a Excel`}
            >
              <Download size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChildrenSelector
