import React, { useState } from 'react'
import { Info, DollarSign, Repeat, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react'

const PaymentConceptsGuide = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg mb-6">
      {/* Header colapsable */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-100 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-blue-900">
              Guía de Conceptos de Pago
            </h3>
            <p className="text-sm text-blue-600">
              {isExpanded ? 'Información detallada sobre tipos de pagos' : 'Haz clic para ver la guía de tipos de pagos'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-blue-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-blue-500" />
          )}
        </div>
      </div>

      {/* Contenido colapsable */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6 pt-2">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pagos Únicos */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-3">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-800">Pagos Únicos</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Conceptos que se cobran una sola vez durante el año escolar.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Matrícula anual</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Uniformes escolares</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Libros y materiales</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Seguro escolar</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-800">
            <Calendar className="inline w-3 h-3 mr-1" />
            Se cobran en fecha específica del año
          </div>
        </div>

        {/* Pagos Recurrentes */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-3">
            <Repeat className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-800">Pagos Recurrentes</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Conceptos que se cobran mensualmente durante el año escolar.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Pensión mensual</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Fondo de ahorro para viajes</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Cuota de alimentación</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-700">Actividades extracurriculares</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
            <Clock className="inline w-3 h-3 mr-1" />
            Se cobran mensualmente según cronograma
          </div>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Los conceptos configurados se aplicarán automáticamente
              al registrar nuevos estudiantes. Puede seleccionar qué niveles educativos aplican
              para cada concepto (Inicial, Primaria, Secundaria).
            </p>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentConceptsGuide