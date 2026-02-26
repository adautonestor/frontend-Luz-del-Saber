import React from 'react'
import { Save, RefreshCw } from 'lucide-react'

/**
 * Componente reutilizable para botón de guardar
 */
const SaveButtonSection = ({ handleSave, isSaving, section = 'academic' }) => {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={() => handleSave(section)}
        disabled={isSaving}
        className="btn btn-primary px-6 py-2 flex items-center gap-2"
      >
        {isSaving ? (
          <RefreshCw className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        Guardar Cambios
      </button>
    </div>
  )
}

export default SaveButtonSection
