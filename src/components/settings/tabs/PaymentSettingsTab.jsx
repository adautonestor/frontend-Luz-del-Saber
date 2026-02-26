import React from 'react'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'

/**
 * Tab de configuración de pagos
 * Gestiona: Conceptos de pago, montos y fechas límite por nivel
 */
const PaymentSettingsTab = ({ settings, setSettings, levels, handleSave, isSaving }) => {
  return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Configuración de Pagos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Pago Parcial Mínimo (S/.)</label>
                <input
                  type="number"
                  className="input"
                  value={settings.payment.minPartialPayment}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, minPartialPayment: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>

            {/* Configuración de Mora */}
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-4 flex items-center">
                <AlertCircle className="mr-2" size={20} />
                Configuración de Mora
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="moraEnabled"
                      className="mr-2"
                      checked={settings.payment.moraEnabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: { ...settings.payment, moraEnabled: e.target.checked }
                      })}
                    />
                    <label htmlFor="moraEnabled" className="text-sm font-medium">
                      Activar sistema de mora automática
                    </label>
                  </div>

                  {settings.payment.moraEnabled && (
                    <>
                      <div className="mb-4">
                        <label className="label">Mora por día (S/.)</label>
                        <input
                          type="number"
                          step="0.10"
                          className="input"
                          value={settings.payment.moraDiaria}
                          onChange={(e) => setSettings({
                            ...settings,
                            payment: { ...settings.payment, moraDiaria: parseFloat(e.target.value) }
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Monto fijo que se cobra por cada día de retraso
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="label">Mora máxima (S/.)</label>
                        <input
                          type="number"
                          step="0.50"
                          className="input"
                          value={settings.payment.moraMaxima}
                          onChange={(e) => setSettings({
                            ...settings,
                            payment: { ...settings.payment, moraMaxima: parseFloat(e.target.value) }
                          })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Monto máximo de mora acumulable (equivalente a 1 mes)
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-700 mb-3">Ejemplo de cálculo</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pago vencido:</span>
                      <span className="font-medium">S/. 250.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Días de retraso:</span>
                      <span className="font-medium">10 días</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Mora acumulada:</span>
                      <span className="font-semibold">
                        S/. {(settings.payment.moraDiaria * 10).toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-700">Total a pagar:</span>
                      <span className="font-bold text-gray-900">
                        S/. {(250 + (settings.payment.moraDiaria * 10)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                    <strong>Nota:</strong> La mora máxima es de S/. {settings.payment.moraMaxima.toFixed(2)}
                    ({settings.payment.diasMaximosMora} días)
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="paymentReminders"
                  className="mr-2"
                  checked={settings.payment.paymentReminders}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, paymentReminders: e.target.checked }
                  })}
                />
                <label htmlFor="paymentReminders" className="text-sm font-medium">
                  Activar recordatorios de pago
                </label>
              </div>
              
              {settings.payment.paymentReminders && (
                <div>
                  <label className="label">Días de anticipación para recordatorios</label>
                  <div className="flex gap-2">
                    {settings.payment.reminderDays.map((day, index) => (
                      <input
                        key={index}
                        type="number"
                        className="input w-20"
                        value={day}
                        onChange={(e) => {
                          const newDays = [...settings.payment.reminderDays]
                          newDays[index] = parseInt(e.target.value)
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, reminderDays: newDays }
                          })
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleSave('payment')}
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

export default PaymentSettingsTab
