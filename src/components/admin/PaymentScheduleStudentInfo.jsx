import React from 'react'
import { User, Download, FileSpreadsheet } from 'lucide-react'
import { PaymentScheduleDownloadButton } from './PaymentSchedulePDF'
import { INFO_MESSAGES } from '../../config/paymentScheduleConstants'
import { formatParentFullName } from '../../utils/paymentScheduleHelpers.jsx'

/**
 * Componente de información del estudiante seleccionado
 */
const PaymentScheduleStudentInfo = ({
  selectedStudent,
  studentParent,
  parentStudents,
  validPayments,
  onExportExcel
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 rounded-full p-3">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {selectedStudent.paternal_last_name || ''} {selectedStudent.maternal_last_name || ''}, {selectedStudent.first_names}{selectedStudent.last_names ? ` ${selectedStudent.last_names}` : ''}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
              <div>
                <span className="text-gray-600">DNI:</span>
                <span className="ml-2 font-medium text-gray-900">{selectedStudent.dni}</span>
              </div>
              <div>
                <span className="text-gray-600">Código:</span>
                <span className="ml-2 font-medium text-gray-900">{selectedStudent.code || selectedStudent.codigoBarras}</span>
              </div>
              <div>
                <span className="text-gray-600">Nivel:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{selectedStudent.nivel}</span>
              </div>
              <div>
                <span className="text-gray-600">Grado:</span>
                <span className="ml-2 font-medium text-gray-900">{selectedStudent.grado}° - Sección {selectedStudent.seccion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        {validPayments.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={onExportExcel}
              className="btn btn-success flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSpreadsheet size={18} />
              Exportar Excel
            </button>
            <PaymentScheduleDownloadButton
              studentData={{
                first_names: selectedStudent.first_names,
                last_names: selectedStudent.last_names,
                paternal_last_name: selectedStudent.paternal_last_name,
                maternal_last_name: selectedStudent.maternal_last_name,
                dni: selectedStudent.dni,
                code: selectedStudent.code || selectedStudent.codigoBarras,
                nivel: selectedStudent.nivel,
                grado: selectedStudent.grado,
                seccion: selectedStudent.seccion
              }}
              paymentSchedule={validPayments.map(p => ({
                concepto: p.concepto,
                due_date: p.due_date,
                amount: p.total_amount || p.amount,
                state: p.state,
                payment_date: p.payment_date
              }))}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download size={18} />
              Exportar PDF
            </PaymentScheduleDownloadButton>
          </div>
        )}
      </div>

      {/* Parent Info */}
      {studentParent && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Padre/Tutor:</p>
          <p className="font-medium text-gray-900">
            {formatParentFullName(studentParent)}
          </p>

          {/* Información sobre deudas consolidadas */}
          {parentStudents.length > 1 && (
            <div className="mt-3 bg-blue-100 border border-blue-300 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> {INFO_MESSAGES.multipleStudents(parentStudents.length)}
              </p>
            </div>
          )}

          {parentStudents.length === 1 && validPayments.length > 0 && (
            <div className="mt-3 bg-blue-100 border border-blue-300 rounded-md p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> {INFO_MESSAGES.singleStudent}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PaymentScheduleStudentInfo
