import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar,
  Edit, Save, X, Camera,
  Users, Heart, Briefcase, FileText,
  Check, AlertCircle, Loader
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import parentProfileService from '../../services/parentProfileService'

const ParentProfile = () => {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const [profileData, setProfileData] = useState({
    personal: {
      first_names: '',
      last_names: '',
      dni: '',
      email: '',
      fechaNacimiento: '',
      genero: '',
      estadoCivil: '',
      nacionalidad: '',
      ocupacion: '',
      empresa: ''
    },
    contact: {
      telefono: '',
      telefonoTrabajo: '',
      emailSecundario: '',
      direccion: '',
      distrito: '',
      provincia: '',
      departamento: '',
      codigoPostal: ''
    },
    emergency: {
      nombreContacto: '',
      relacionContacto: '',
      telefonoContacto: '',
      direccionContacto: ''
    }
  })

  const [tempData, setTempData] = useState({ ...profileData })
  const [children, setChildren] = useState([])

  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadProfileData()
    loadChildren()
  }, [])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const profile = await parentProfileService.getMyProfile()

      const mappedProfile = {
        personal: {
          first_names: profile.first_name || '',
          last_names: profile.last_names || '',
          dni: profile.dni || '',
          email: profile.email || '',
          fechaNacimiento: formatDateForInput(profile.birth_date) || '',
          genero: profile.gender || '',
          estadoCivil: profile.marital_status || '',
          nacionalidad: profile.nationality || '',
          ocupacion: profile.occupation || '',
          empresa: profile.company || ''
        },
        contact: {
          telefono: profile.phone || '',
          telefonoTrabajo: profile.work_phone || '',
          emailSecundario: profile.secondary_email || '',
          direccion: profile.address || '',
          distrito: profile.district || '',
          provincia: profile.province || '',
          departamento: profile.department || '',
          codigoPostal: profile.postal_code || ''
        },
        emergency: {
          nombreContacto: profile.emergency_contact_name || '',
          relacionContacto: profile.emergency_contact_relationship || '',
          telefonoContacto: profile.emergency_contact_phone || '',
          direccionContacto: profile.emergency_contact_address || ''
        }
      }

      setProfileData(mappedProfile)
      setTempData(mappedProfile)

    } catch (err) {
      console.error('Error al cargar perfil:', err)
      setError('No se pudo cargar el perfil. Por favor, intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChildren = async () => {
    try {
      const childrenData = await parentProfileService.getMyChildren()
      setChildren(childrenData || [])
    } catch (err) {
      console.error('Error al cargar hijos:', err)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setTempData({ ...profileData })
    setSuccessMessage(null)
    setError(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setTempData({ ...profileData })
    setError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Preparar datos para enviar al backend
      const updateData = {
        first_name: tempData.personal.first_names,
        last_names: tempData.personal.last_names,
        birth_date: tempData.personal.fechaNacimiento || null,
        gender: tempData.personal.genero || null,
        marital_status: tempData.personal.estadoCivil || null,
        nationality: tempData.personal.nacionalidad || null,
        occupation: tempData.personal.ocupacion || null,
        company: tempData.personal.empresa || null,
        phone: tempData.contact.telefono || null,
        work_phone: tempData.contact.telefonoTrabajo || null,
        secondary_email: tempData.contact.emailSecundario || null,
        address: tempData.contact.direccion || null,
        district: tempData.contact.distrito || null,
        province: tempData.contact.provincia || null,
        department: tempData.contact.departamento || null,
        postal_code: tempData.contact.codigoPostal || null,
        emergency_contact_name: tempData.emergency.nombreContacto || null,
        emergency_contact_relationship: tempData.emergency.relacionContacto || null,
        emergency_contact_phone: tempData.emergency.telefonoContacto || null,
        emergency_contact_address: tempData.emergency.direccionContacto || null
      }

      await parentProfileService.updateMyProfile(updateData)

      // Actualizar el estado local
      setProfileData({ ...tempData })
      setIsEditing(false)
      setSuccessMessage('Perfil actualizado exitosamente')

      // Limpiar mensaje de exito despues de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)

    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      setError('No se pudo actualizar el perfil. Por favor, intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    setTempData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }


  const tabs = [
    { id: 'personal', name: 'Datos Personales', icon: User },
    { id: 'contact', name: 'Contacto', icon: Mail },
    { id: 'children', name: 'Mis Hijos', icon: Users }
  ]

  // Estado de carga inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu informacion personal y configuraciones de cuenta
        </p>
      </div>

      {/* Mensajes de exito y error */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center">
          <Check className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData.personal.first_names} {profileData.personal.last_names}
              </h2>
              <p className="text-gray-600">{profileData.personal.ocupacion || 'Sin ocupacion registrada'}</p>
              <p className="text-sm text-gray-500">DNI: {profileData.personal.dni}</p>
              <p className="text-sm text-gray-500">
                Padre de {children.length} estudiante{children.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="mr-2" size={16} />
                Editar Perfil
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="mr-2" size={16} />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader className="mr-2 animate-spin" size={16} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={16} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent size={18} />
                    <span>{tab.name}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informacion Personal</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.personal.first_names : profileData.personal.first_names}
                    onChange={(e) => handleInputChange('personal', 'first_names', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.personal.last_names : profileData.personal.last_names}
                    onChange={(e) => handleInputChange('personal', 'last_names', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI
                  </label>
                  <input
                    type="text"
                    value={profileData.personal.dni}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={isEditing ? tempData.personal.fechaNacimiento : profileData.personal.fechaNacimiento}
                    onChange={(e) => handleInputChange('personal', 'fechaNacimiento', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genero
                  </label>
                  <select
                    value={isEditing ? tempData.personal.genero : profileData.personal.genero}
                    onChange={(e) => handleInputChange('personal', 'genero', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado Civil
                  </label>
                  <select
                    value={isEditing ? tempData.personal.estadoCivil : profileData.personal.estadoCivil}
                    onChange={(e) => handleInputChange('personal', 'estadoCivil', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Soltero">Soltero</option>
                    <option value="Casado">Casado</option>
                    <option value="Divorciado">Divorciado</option>
                    <option value="Viudo">Viudo</option>
                    <option value="Conviviente">Conviviente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nacionalidad
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.personal.nacionalidad : profileData.personal.nacionalidad}
                    onChange={(e) => handleInputChange('personal', 'nacionalidad', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Peruana"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocupacion
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.personal.ocupacion : profileData.personal.ocupacion}
                    onChange={(e) => handleInputChange('personal', 'ocupacion', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Ingeniero de Sistemas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.personal.empresa : profileData.personal.empresa}
                    onChange={(e) => handleInputChange('personal', 'empresa', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Tech Solutions SAC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informacion de Contacto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono Principal
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? tempData.contact.telefono : profileData.contact.telefono}
                    onChange={(e) => handleInputChange('contact', 'telefono', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: 987654321"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefono de Trabajo
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? tempData.contact.telefonoTrabajo : profileData.contact.telefonoTrabajo}
                    onChange={(e) => handleInputChange('contact', 'telefonoTrabajo', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: 014567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Principal
                  </label>
                  <input
                    type="email"
                    value={profileData.personal.email}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">El email principal no puede ser modificado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Secundario
                  </label>
                  <input
                    type="email"
                    value={isEditing ? tempData.contact.emailSecundario : profileData.contact.emailSecundario}
                    onChange={(e) => handleInputChange('contact', 'emailSecundario', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: email.secundario@correo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direccion Completa
                </label>
                <textarea
                  rows={2}
                  value={isEditing ? tempData.contact.direccion : profileData.contact.direccion}
                  onChange={(e) => handleInputChange('contact', 'direccion', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ingrese su direccion completa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distrito
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.contact.distrito : profileData.contact.distrito}
                    onChange={(e) => handleInputChange('contact', 'distrito', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Huancayo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.contact.provincia : profileData.contact.provincia}
                    onChange={(e) => handleInputChange('contact', 'provincia', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Huancayo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.contact.departamento : profileData.contact.departamento}
                    onChange={(e) => handleInputChange('contact', 'departamento', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: Junin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Codigo Postal
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.contact.codigoPostal : profileData.contact.codigoPostal}
                    onChange={(e) => handleInputChange('contact', 'codigoPostal', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Ej: 12001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Contacto de Emergencia</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={isEditing ? tempData.emergency.nombreContacto : profileData.emergency.nombreContacto}
                      onChange={(e) => handleInputChange('emergency', 'nombreContacto', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Nombre del contacto de emergencia"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relacion
                    </label>
                    <input
                      type="text"
                      value={isEditing ? tempData.emergency.relacionContacto : profileData.emergency.relacionContacto}
                      onChange={(e) => handleInputChange('emergency', 'relacionContacto', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ej: Esposa, Hermano, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={isEditing ? tempData.emergency.telefonoContacto : profileData.emergency.telefonoContacto}
                      onChange={(e) => handleInputChange('emergency', 'telefonoContacto', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Telefono del contacto"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Direccion
                    </label>
                    <input
                      type="text"
                      value={isEditing ? tempData.emergency.direccionContacto : profileData.emergency.direccionContacto}
                      onChange={(e) => handleInputChange('emergency', 'direccionContacto', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Direccion del contacto"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Children Tab */}
          {activeTab === 'children' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informacion de mis Hijos</h3>

              {children.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron hijos registrados</p>
                  <p className="text-sm text-gray-500 mt-2">Los hijos se asocian automaticamente cuando se realiza la matricula</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {children.map((child) => (
                    <div key={child.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {child.first_names} {child.last_names}
                          </h4>
                          <p className="text-sm text-gray-600">DNI: {child.dni}</p>
                          {child.grade && child.section && (
                            <p className="text-sm text-gray-500">
                              {child.grade} - Seccion {child.section}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Relacion:</span>
                          <span className="text-sm font-medium">{child.relationship}</span>
                        </div>

                        {child.level && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Nivel:</span>
                            <span className="text-sm font-medium">{child.level}</span>
                          </div>
                        )}

                        {child.academic_year && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ano Academico:</span>
                            <span className="text-sm font-medium">{child.academic_year}</span>
                          </div>
                        )}

                        {child.birth_date && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Edad:</span>
                              <span className="text-sm font-medium">{calculateAge(child.birth_date)} anos</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Fecha de Nacimiento:</span>
                              <span className="text-sm font-medium">{formatDate(child.birth_date)}</span>
                            </div>
                          </>
                        )}

                        {child.gender && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Genero:</span>
                            <span className="text-sm font-medium">
                              {child.gender === 'M' ? 'Masculino' : 'Femenino'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      </div>

    </div>
  )
}

export default ParentProfile
