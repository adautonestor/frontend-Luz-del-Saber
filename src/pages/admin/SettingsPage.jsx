import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building, Calendar, Clock, CreditCard,
  FileText, AlertCircle
} from 'lucide-react'

// Hooks
import { useSettingsData } from '../../hooks/useSettingsData'
import { usePaymentMethodsManager } from '../../hooks/usePaymentMethodsManager'

// Tabs components
import GeneralSettingsTab from '../../components/settings/tabs/GeneralSettingsTab'
import AcademicSettingsTab from '../../components/settings/tabs/AcademicSettingsTab'
import AttendanceSettingsTab from '../../components/settings/tabs/AttendanceSettingsTab'
import PaymentSettingsTab from '../../components/settings/tabs/PaymentSettingsTab'
import PaymentMethodsTab from '../../components/settings/tabs/PaymentMethodsTab'

/**
 * Página de configuración del sistema
 * Orquestador de todas las configuraciones del sistema
 */
const SettingsPage = () => {
  const [searchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'general')

  // Actualizar tab si cambia la URL
  useEffect(() => {
    if (tabFromUrl && ['general', 'academic', 'attendance', 'payment', 'paymentMethods'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  // Hooks de gestión
  const settingsHook = useSettingsData()
  const paymentMethodsHook = usePaymentMethodsManager()

  // Mostrar alerta combinada de todos los hooks
  const showAlert = settingsHook.showAlert || paymentMethodsHook.showAlert

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'academic', label: 'Académico', icon: Calendar },
    { id: 'attendance', label: 'Horarios de Asistencia', icon: Clock },
    { id: 'payment', label: 'Pagos', icon: CreditCard },
    { id: 'paymentMethods', label: 'Métodos de Pago', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
        <p className="mt-2 text-gray-600">Administra la configuración general del sistema</p>
      </div>

      {/* Alert */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
        >
          <AlertCircle className="mr-2" size={20} />
          Configuración guardada exitosamente
        </motion.div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'general' && (
          <GeneralSettingsTab
            settings={settingsHook.settings}
            setSettings={settingsHook.setSettings}
            handleSave={settingsHook.handleSave}
            handleUploadLogo={settingsHook.handleUploadLogo}
            isSaving={settingsHook.isSaving}
          />
        )}

        {activeTab === 'academic' && (
          <AcademicSettingsTab
            settings={settingsHook.settings}
            setSettings={settingsHook.setSettings}
            handleSave={settingsHook.handleSave}
            isSaving={settingsHook.isSaving}
            levels={settingsHook.levels}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceSettingsTab
            levels={settingsHook.levels}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentSettingsTab
            settings={settingsHook.settings}
            setSettings={settingsHook.setSettings}
            levels={settingsHook.levels}
            handleSave={settingsHook.handleSave}
            isSaving={settingsHook.isSaving}
          />
        )}

        {activeTab === 'paymentMethods' && (
          <PaymentMethodsTab
            paymentMethods={paymentMethodsHook.paymentMethods}
            setEditingMethod={paymentMethodsHook.setEditingMethod}
            setMethodForm={paymentMethodsHook.setMethodForm}
            setShowAddMethodModal={paymentMethodsHook.setShowAddMethodModal}
            showAddMethodModal={paymentMethodsHook.showAddMethodModal}
            editingMethod={paymentMethodsHook.editingMethod}
            methodForm={paymentMethodsHook.methodForm}
            handleAddMethod={paymentMethodsHook.handleAddMethod}
            handleEditMethod={paymentMethodsHook.handleEditMethod}
            handleUpdateMethod={paymentMethodsHook.handleUpdateMethod}
            handleDeleteMethod={paymentMethodsHook.handleDeleteMethod}
            handleToggleMethod={paymentMethodsHook.handleToggleMethod}
          />
        )}
      </div>
    </div>
  )
}

export default SettingsPage
