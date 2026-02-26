import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Printer, Search, Filter, User, GraduationCap, Users
} from 'lucide-react'
import Barcode from 'react-barcode'
import studentsService from '../../services/studentsService'
import structureService from '../../services/academic/structureService'
const StudentCardsGenerator = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [levels, setLevels] = useState([])
  const [grades, setGrades] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [selectedLevel, selectedGrade, searchTerm, students])

  const loadData = async () => {
    const allStudents = await studentsService.getAll() || []
    const allLevels = await structureService.getAllLevels() || []
    const allGrades = await structureService.getAllGrades() || []

    setStudents(allStudents)
    setLevels(allLevels)
    setGrades(allGrades)
    setFilteredStudents(allStudents)
  }

  const filterStudents = () => {
    let filtered = students

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(s => s.nivel?.toLowerCase() === selectedLevel.toLowerCase())
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.grado === selectedGrade)
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.first_names?.toLowerCase().includes(search) ||
        s.last_names?.toLowerCase().includes(search) ||
        s.code?.toLowerCase().includes(search) ||
        s.codigoBarras?.toLowerCase().includes(search)
      )
    }

    setFilteredStudents(filtered)
  }

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handlePrint = () => {
    if (selectedStudents.length === 0) {
      alert('Selecciona al menos un estudiante')
      return
    }
    setShowPrintPreview(true)
  }

  const executePrint = () => {
    window.print()
  }

  const getStudentsByIds = () => {
    return students.filter(s => selectedStudents.includes(s.id))
  }

  return (
    <>
      {/* Main View */}
      <div className={`space-y-6 ${showPrintPreview ? 'hidden' : ''}`}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generador de Carnets</h1>
          <p className="mt-2 text-gray-600">
            Genera carnets con códigos de barras para control de asistencia
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Nombre, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="input"
              >
                <option value="all">Todos los niveles</option>
                {levels.map(level => (
                  <option key={level.id} value={level.name}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grado
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="input"
              >
                <option value="all">Todos los grados</option>
                {grades
                  .filter(g => selectedLevel === 'all' || levels.find(l => l.id === g.level_id)?.name === selectedLevel)
                  .map(grade => (
                    <option key={grade.id} value={grade.name}>
                      {grade.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePrint}
                disabled={selectedStudents.length === 0}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Generar ({selectedStudents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Estudiantes</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Seleccionados</p>
                <p className="text-2xl font-semibold text-gray-900">{selectedStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Niveles</p>
                <p className="text-2xl font-semibold text-gray-900">{levels.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="card">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Estudiantes ({filteredStudents.length})
            </h3>
            <button
              onClick={toggleAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedStudents.length === filteredStudents.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado/Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código Barras
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => toggleStudent(student.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_names} {student.last_names}
                        </div>
                        <div className="text-sm text-gray-500">{student.dni}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.nivel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.grado} - {student.seccion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {student.codigoBarras}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Preview */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Vista previa - {selectedStudents.length} carnets
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={executePrint}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Printer size={18} />
                  Imprimir
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="btn btn-outline"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <PrintableCards students={getStudentsByIds()} />
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  )
}

// Component for printable cards
const PrintableCards = ({ students }) => {
  return (
    <div className="print-area">
      <div className="grid grid-cols-2 gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="border-2 border-gray-300 rounded-lg p-4 bg-white"
            style={{
              width: '8.5cm',
              height: '5.4cm',
              pageBreakInside: 'avoid'
            }}
          >
            {/* Header */}
            <div className="text-center border-b border-gray-300 pb-2 mb-2">
              <h4 className="text-xs font-bold text-gray-900">COLEGIO LUZ DEL SABER</h4>
              <p className="text-xs text-gray-600">Carnet de Estudiante</p>
            </div>

            {/* Content */}
            <div className="flex gap-3">
              {/* Photo placeholder */}
              <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-gray-400" />
              </div>

              {/* Info */}
              <div className="flex-1 text-xs">
                <p className="font-bold text-gray-900 mb-1">
                  {student.first_names}
                </p>
                <p className="font-bold text-gray-900 mb-2">
                  {student.last_names}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Nivel:</span> {student.nivel}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Grado:</span> {student.grado} - {student.seccion}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Código:</span> {student.code}
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="mt-2 flex justify-center">
              <Barcode
                value={student.codigoBarras || `LDS${new Date().getFullYear()}${student.code}`}
                height={30}
                width={1.2}
                fontSize={10}
                margin={0}
                displayValue={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentCardsGenerator
