import React from 'react'
import { XCircle } from 'lucide-react'

/**
 * Modal para rechazar solicitud de matrícula
 * Permite al administrador rechazar una solicitud proporcionando un motivo
 */
const RejectRequestModal = ({
  isOpen,
  selectedRequest,
  rejectReason,
  setRejectReason,
  onReject,
  onClose,
  isLoading
}) => {
  if (!isOpen || !selectedRequest) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Rechazar Solicitud de Matrícula
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-4">
                  ¿Estás seguro de que deseas rechazar la solicitud de matrícula para{' '}
                  <span className="font-semibold">
                    {selectedRequest.estudianteData.first_names} {selectedRequest.estudianteData.last_names}
                  </span>?
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del rechazo *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Explica el motivo del rechazo..."
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                if (!rejectReason.trim()) {
                  alert('Debes proporcionar un motivo para el rechazo')
                  return
                }
                onReject(selectedRequest.id, rejectReason)
              }}
              disabled={isLoading || !rejectReason.trim()}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {isLoading ? 'Rechazando...' : 'Rechazar Solicitud'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RejectRequestModal
