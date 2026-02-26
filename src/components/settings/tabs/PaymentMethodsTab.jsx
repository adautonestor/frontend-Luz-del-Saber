import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Phone, DollarSign, Building, Trash2, Edit, Settings, X, CreditCard, Eye } from 'lucide-react'

/**
 * Tab de gestión de métodos de pago
 * Gestiona: Métodos de pago disponibles (Yape, efectivo, transferencia, etc)
 */
const PaymentMethodsTab = ({
  paymentMethods,
  setEditingMethod,
  setMethodForm,
  setShowAddMethodModal,
  showAddMethodModal,
  editingMethod,
  methodForm,
  handleAddMethod,
  handleEditMethod,
  handleUpdateMethod,
  handleDeleteMethod,
  handleToggleMethod
}) => {
  const [viewingImage, setViewingImage] = useState(null)

  return (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Métodos de Pago</h3>
                <p className="text-sm text-gray-600 mt-1">Gestiona los métodos de pago disponibles para los padres</p>
              </div>
              <button
                onClick={() => {
                  setEditingMethod(null)
                  setMethodForm({ type: '', name: '', phone_number: '', bank: '', account_number: '', cci: '', holder: '', instructions: '', qr_code: '' })
                  setShowAddMethodModal(true)
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Método
              </button>
            </div>

            {/* Lista de métodos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map(method => {
                const isActive = method.status === 'active'
                // Determinar icono segun tipo
                const getIcon = () => {
                  if (method.type === 'digital') return <Phone className={isActive ? 'text-green-600' : 'text-gray-400'} size={20} />
                  if (method.type === 'bank') return <Building className={isActive ? 'text-green-600' : 'text-gray-400'} size={20} />
                  if (method.type === 'cash') return <DollarSign className={isActive ? 'text-green-600' : 'text-gray-400'} size={20} />
                  return <CreditCard className={isActive ? 'text-green-600' : 'text-gray-400'} size={20} />
                }
                // Obtener descripcion segun tipo
                const getDescription = () => {
                  if (method.type === 'digital') return method.phone_number ? `Tel: ${method.phone_number}` : ''
                  if (method.type === 'bank') return method.bank ? `${method.bank} - ${method.account_number || ''}` : ''
                  if (method.type === 'cash') return method.instructions || ''
                  return ''
                }
                return (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {getIcon()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleMethod(method.id)}
                      className={`flex-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                        isActive
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    {/* Boton ver imagen para metodos digitales (Yape/Plin) */}
                    {method.type === 'digital' && (
                      <button
                        onClick={() => {
                          if (method.qr_code) {
                            setViewingImage(method)
                          } else {
                            alert('Este método no tiene imagen. Edítalo para agregar una.')
                          }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          method.qr_code
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                        title={method.qr_code ? 'Ver imagen' : 'Sin imagen - Editar para agregar'}
                      >
                        <Eye size={14} className="inline" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditMethod(method)}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Settings size={14} className="inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} className="inline" />
                    </button>
                  </div>
                </div>
              )})}
            </div>

            {/* Modal para ver imagen */}
            {viewingImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg max-w-lg w-full p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Imagen de {viewingImage.name}
                    </h3>
                    <button
                      onClick={() => setViewingImage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={viewingImage.qr_code}
                      alt={`Imagen de ${viewingImage.name}`}
                      className="max-w-full max-h-96 object-contain rounded-lg border"
                    />
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    {viewingImage.holder && <p><strong>Titular:</strong> {viewingImage.holder}</p>}
                    {viewingImage.phone_number && <p><strong>Teléfono:</strong> {viewingImage.phone_number}</p>}
                  </div>
                </motion.div>
              </div>
            )}

            {paymentMethods.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No hay métodos de pago configurados</p>
                <button
                  onClick={() => setShowAddMethodModal(true)}
                  className="btn btn-primary"
                >
                  Agregar primer método
                </button>
              </div>
            )}

            {/* Modal Agregar/Editar */}
            {showAddMethodModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg max-w-md w-full p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddMethodModal(false)
                        setEditingMethod(null)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Tipo de método */}
                    <div>
                      <label className="label">Tipo de Método</label>
                      <select
                        className="input"
                        value={methodForm.type || ''}
                        onChange={(e) => {
                          const type = e.target.value
                          let name = ''
                          if (type === 'digital') name = 'Yape'
                          else if (type === 'bank') name = 'Transferencia Bancaria'
                          else if (type === 'cash') name = 'Efectivo'
                          setMethodForm({ ...methodForm, type, name })
                        }}
                      >
                        <option value="" disabled>Seleccionar tipo de método</option>
                        <option value="digital">Billetera Digital (Yape, Plin)</option>
                        <option value="bank">Transferencia Bancaria</option>
                        <option value="cash">Efectivo</option>
                      </select>
                    </div>

                    {/* Campos para Billetera Digital (Yape, Plin) */}
                    {methodForm.type === 'digital' && (
                      <>
                        <div>
                          <label className="label">Aplicación</label>
                          <select
                            className="input"
                            value={methodForm.name || 'Yape'}
                            onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                          >
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Número de Teléfono</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.phone_number || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              setMethodForm({ ...methodForm, phone_number: value })
                            }}
                            placeholder="Ej: 987654321"
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label className="label">Nombre del Titular</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.holder || ''}
                            onChange={(e) => setMethodForm({ ...methodForm, holder: e.target.value })}
                            placeholder="Ej: Juan Pérez"
                          />
                        </div>
                        <div>
                          <label className="label">Imagen (QR o referencia)</label>
                          <div className="flex items-center gap-4">
                            {methodForm.qr_code && (
                              <img
                                src={methodForm.qr_code}
                                alt="QR"
                                className="w-20 h-20 object-cover rounded border"
                              />
                            )}
                            <label className="btn btn-secondary cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const blobUrl = URL.createObjectURL(file)
                                    setMethodForm({ ...methodForm, qr_file: file, qr_code: blobUrl })
                                  }
                                }}
                              />
                              {methodForm.qr_code ? 'Cambiar imagen' : 'Subir imagen'}
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Campos para Transferencia Bancaria */}
                    {methodForm.type === 'bank' && (
                      <>
                        <div>
                          <label className="label">Banco</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.bank || ''}
                            onChange={(e) => setMethodForm({ ...methodForm, bank: e.target.value, name: `Transferencia ${e.target.value}` })}
                            placeholder="Ej: BCP, BBVA, Interbank, Scotiabank"
                          />
                        </div>
                        <div>
                          <label className="label">Número de Cuenta</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.account_number || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              setMethodForm({ ...methodForm, account_number: value })
                            }}
                            placeholder="Ej: 1234567890"
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label className="label">CCI (Código Interbancario)</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.cci || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '')
                              setMethodForm({ ...methodForm, cci: value })
                            }}
                            placeholder="Ej: 00212345678901234567"
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <label className="label">Titular de la Cuenta</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.holder || ''}
                            onChange={(e) => setMethodForm({ ...methodForm, holder: e.target.value })}
                            placeholder="Ej: I.E. Luz del Saber"
                          />
                        </div>
                      </>
                    )}

                    {/* Campos para Efectivo */}
                    {methodForm.type === 'cash' && (
                      <>
                        <div>
                          <label className="label">Nombre</label>
                          <input
                            type="text"
                            className="input"
                            value={methodForm.name || 'Efectivo'}
                            onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                            placeholder="Ej: Pago en Efectivo"
                          />
                        </div>
                        <div>
                          <label className="label">Instrucciones</label>
                          <textarea
                            className="input"
                            rows="2"
                            value={methodForm.instructions || ''}
                            onChange={(e) => setMethodForm({ ...methodForm, instructions: e.target.value })}
                            placeholder="Ej: Pagar en oficina de 8am a 4pm"
                          />
                        </div>
                      </>
                    )}

                  </div>

                  <div className="mt-6 flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowAddMethodModal(false)
                        setEditingMethod(null)
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingMethod ? handleUpdateMethod : handleAddMethod}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      disabled={!methodForm.name.trim()}
                    >
                      {editingMethod ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
  )
}

export default PaymentMethodsTab
