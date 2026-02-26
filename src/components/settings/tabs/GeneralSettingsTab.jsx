import React, { useState } from 'react'
import { Save, RefreshCw, Upload, Image, X } from 'lucide-react'

/**
 * Tab de configuracion general del colegio
 * Maneja informacion institucional basica
 */
const GeneralSettingsTab = ({ settings, setSettings, handleSave, handleUploadLogo, isSaving }) => {
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Manejar seleccion de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Subir logo
  const handleLogoUpload = async () => {
    if (!logoFile || !handleUploadLogo) return

    setIsUploadingLogo(true)
    try {
      await handleUploadLogo(logoFile)
      setLogoFile(null)
      setLogoPreview(null)
    } catch (error) {
      console.error('Error subiendo logo:', error)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Cancelar seleccion de logo
  const handleCancelLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  // URL del logo actual
  const currentLogoUrl = settings.general.logoUrl

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-6">Informacion General</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Nombre del Colegio</label>
          <input
            type="text"
            className="input"
            value={settings.general.schoolName || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, schoolName: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">RUC</label>
          <input
            type="text"
            className="input"
            value={settings.general.ruc || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, ruc: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">Direccion</label>
          <input
            type="text"
            className="input"
            value={settings.general.address || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, address: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">UGEL</label>
          <input
            type="text"
            className="input"
            value={settings.general.ugel || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, ugel: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">Telefono</label>
          <input
            type="tel"
            className="input"
            value={settings.general.phone || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, phone: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={settings.general.email || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, email: e.target.value }
            })}
          />
        </div>

        <div>
          <label className="label">Sitio Web</label>
          <input
            type="url"
            className="input"
            value={settings.general.website || ''}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, website: e.target.value }
            })}
          />
        </div>

        {/* Logo del Colegio */}
        <div className="md:col-span-2">
          <label className="label">Logo del Colegio</label>
          <div className="flex items-start gap-6">
            {/* Preview del logo actual o nuevo */}
            <div className="flex-shrink-0">
              {(logoPreview || currentLogoUrl) ? (
                <div className="relative">
                  <img
                    src={logoPreview || currentLogoUrl}
                    alt="Logo del colegio"
                    className="w-32 h-32 object-contain border rounded-lg bg-gray-50"
                  />
                  {logoPreview && (
                    <button
                      onClick={handleCancelLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <Image className="text-gray-400" size={32} />
                </div>
              )}
            </div>

            {/* Input y boton de upload */}
            <div className="flex-1 space-y-3">
              <input
                type="file"
                id="logo-input"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <label
                htmlFor="logo-input"
                className="btn btn-secondary px-4 py-2 cursor-pointer inline-flex items-center gap-2"
              >
                <Upload size={18} />
                Seleccionar imagen
              </label>

              {logoFile && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{logoFile.name}</span>
                  <button
                    onClick={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="btn btn-primary px-4 py-1 text-sm flex items-center gap-2"
                  >
                    {isUploadingLogo ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <Upload size={14} />
                    )}
                    Subir
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Formatos: JPG, PNG, WebP. Tamanio maximo: 10MB
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => handleSave('general')}
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
    </div>
  )
}

export default GeneralSettingsTab
