import React from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Componente de encabezado de la página de Estructura Académica
 */
const PageHeader = ({ isSecretary }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estructura Académica</h1>
        <p className="mt-2 text-gray-600">
          {isSecretary()
            ? 'Consulta la estructura educativa integrada'
            : 'Gestiona toda la estructura educativa de forma integrada'
          }
        </p>
        {isSecretary() && (
          <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <AlertCircle size={16} />
            <span className="text-sm">
              Tienes permisos de solo lectura. No puedes crear, editar o eliminar elementos de la estructura académica.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
