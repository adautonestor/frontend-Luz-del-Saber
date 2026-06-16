import React from 'react'
import {
  Search, Filter, Eye, Edit, Trash2,
  Download, FileText, Calendar,
  CheckCircle, Clock, XCircle, UserCheck
} from 'lucide-react'
import jsPDF from 'jspdf'
import { formatDateSafe, formatGender, formatStudentStatus } from '../../utils/dateUtils'

/**
 * Tab de lista de estudiantes matriculados
 * Muestra tabla completa con filtros y acciones
 */
const StudentsTab = ({
  students,
  filters,
  onSearch,
  onFilterChange,
  academicTree,
  isLoading,
  getStatusIcon,
  getStatusColor,
  onEditStudent,
  onEditSchedule,
  setSelectedStudentForContract,
  setShowContractModal,
  setViewingStudent,
  setShowViewModal
}) => {
  // Función para descargar ficha del estudiante en PDF
  const handleDownloadFicha = (student) => {
    const doc = new jsPDF()

    // Cargar y agregar logo
    const logo = new Image()
    logo.src = '/logoColegio.png'

    logo.onload = () => {
      // Agregar logo (centrado en la parte superior)
      const logoWidth = 30
      const logoHeight = 30
      const logoX = (210 - logoWidth) / 2 // Centrar en página A4 (210mm de ancho)
      doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight)

      // Título principal
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('FICHA DE MATRÍCULA', 105, 48, { align: 'center' })

      // Subtítulo
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('I.E.P. Luz del Saber - Huancán', 105, 55, { align: 'center' })

      // Línea divisoria
      doc.setLineWidth(0.5)
      doc.line(20, 60, 190, 60)

      let y = 70

      // Sección: DATOS PERSONALES
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS PERSONALES', 20, y)
      y += 8

      const apellidos = `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || '-'
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Código: ${student.code || '-'}`, 20, y)
      y += 6
      doc.text(`Apellidos: ${apellidos}`, 20, y)
      y += 6
      doc.text(`Nombres: ${student.first_names || '-'}${student.last_names ? ' ' + student.last_names : ''}`, 20, y)
      y += 6
      doc.text(`DNI: ${student.dni || '-'}`, 20, y)
      y += 6
      doc.text(`Fecha de Nacimiento: ${formatDateSafe(student.fechaNacimiento || student.birth_date)}`, 20, y)
      y += 6
      doc.text(`Sexo: ${formatGender(student.sexo || student.gender)}`, 20, y)
      y += 12

      // Sección: DATOS ACADÉMICOS
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS ACADÉMICOS', 20, y)
      y += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Nivel: ${student.nivelNombre || '-'}`, 20, y)
      y += 6
      doc.text(`Grado: ${student.gradoNombre || '-'}`, 20, y)
      y += 6
      doc.text(`Sección: ${student.seccionNombre || '-'}`, 20, y)
      y += 6
      doc.text(`Año Escolar: ${student.academic_year || '-'}`, 20, y)
      y += 6
      doc.text(`Estado: ${formatStudentStatus(student.state || student.status)}`, 20, y)
      y += 12

      // Sección: DATOS DEL APODERADO
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DATOS DEL APODERADO', 20, y)
      y += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const parentRelationship = student.parentescoPadre ? ` (${student.parentescoPadre})` : ''
      doc.text(`Apoderado: ${student.nombrePadre || '-'}${parentRelationship}`, 20, y)
      y += 6
      doc.text(`Teléfono: ${student.telefonoPadre || '-'}`, 20, y)
      y += 6
      doc.text(`Email: ${student.emailPadre || '-'}`, 20, y)
      y += 12

      // Sección: INFORMACIÓN ADICIONAL
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN ADICIONAL', 20, y)
      y += 8

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Tiene Contrato: ${student.contratoAdjunto ? 'Sí' : 'No'}`, 20, y)
      y += 6
      doc.text(`Fecha de Matrícula: ${formatDateSafe(student.fechaMatricula || student.enrollment_date)}`, 20, y)

      // Pie de página
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text('I.E.P. Luz del Saber - Sistema de Gestión Educativa', 105, 285, { align: 'center' })

      // Descargar archivo
      const fileName = `Ficha_${apellidos}_${student.first_names}_${student.code}.pdf`
      doc.save(fileName)
    }

    // Si el logo no carga, generar PDF sin logo
    logo.onerror = () => {
      generatePDFWithoutLogo(doc, student)
    }
  }

  // Función auxiliar para generar PDF sin logo (fallback)
  const generatePDFWithoutLogo = (doc, student) => {
    // Título principal
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('FICHA DE MATRÍCULA', 105, 20, { align: 'center' })

    // Subtítulo
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('I.E.P. Luz del Saber - Huancán', 105, 28, { align: 'center' })

    // Línea divisoria
    doc.setLineWidth(0.5)
    doc.line(20, 33, 190, 33)

    let y = 43

    // Sección: DATOS PERSONALES
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS PERSONALES', 20, y)
    y += 8

    const apellidos = `${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || student.last_names || '-'
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Código: ${student.code || '-'}`, 20, y)
    y += 6
    doc.text(`Apellidos: ${apellidos}`, 20, y)
    y += 6
    doc.text(`Nombres: ${student.first_names || '-'}`, 20, y)
    y += 6
    doc.text(`DNI: ${student.dni || '-'}`, 20, y)
    y += 6
    doc.text(`Fecha de Nacimiento: ${formatDateSafe(student.fechaNacimiento || student.birth_date)}`, 20, y)
    y += 6
    doc.text(`Sexo: ${formatGender(student.sexo || student.gender)}`, 20, y)
    y += 12

    // Sección: DATOS ACADÉMICOS
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS ACADÉMICOS', 20, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nivel: ${student.nivelNombre || '-'}`, 20, y)
    y += 6
    doc.text(`Grado: ${student.gradoNombre || '-'}`, 20, y)
    y += 6
    doc.text(`Sección: ${student.seccionNombre || '-'}`, 20, y)
    y += 6
    doc.text(`Año Escolar: ${student.academic_year || '-'}`, 20, y)
    y += 6
    doc.text(`Estado: ${formatStudentStatus(student.state || student.status)}`, 20, y)
    y += 12

    // Sección: DATOS DEL APODERADO
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL APODERADO', 20, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const parentRelationship = student.parentescoPadre ? ` (${student.parentescoPadre})` : ''
    doc.text(`Apoderado: ${student.nombrePadre || '-'}${parentRelationship}`, 20, y)
    y += 6
    doc.text(`Teléfono: ${student.telefonoPadre || '-'}`, 20, y)
    y += 6
    doc.text(`Email: ${student.emailPadre || '-'}`, 20, y)
    y += 12

    // Sección: INFORMACIÓN ADICIONAL
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMACIÓN ADICIONAL', 20, y)
    y += 8

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Tiene Contrato: ${student.contratoAdjunto ? 'Sí' : 'No'}`, 20, y)
    y += 6
    doc.text(`Fecha de Matrícula: ${formatDateSafe(student.fechaMatricula || student.enrollment_date)}`, 20, y)

    // Pie de página
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('I.E.P. Luz del Saber - Sistema de Gestión Educativa', 105, 285, { align: 'center' })

    // Descargar archivo
    const fileName = `Ficha_${apellidos}_${student.first_names}_${student.code}.pdf`
    doc.save(fileName)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={filters.search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Nivel Filter */}
          <select
            value={filters.level || ''}
            onChange={(e) => onFilterChange('level', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los niveles</option>
            {academicTree.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>

          {/* Limpiar Button */}
          <button
            onClick={() => {
              onSearch('')
              onFilterChange('level', '')
            }}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
          >
            <Filter size={18} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESTUDIANTE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CÓDIGO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIVEL/GRADO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SECCIÓN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESTADO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CONTRATO
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-3 text-gray-600">Cargando estudiantes...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron estudiantes con los filtros aplicados
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const StatusIcon = getStatusIcon(student.state)
                  const statusColor = getStatusColor(student.state)

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {`${student.paternal_last_name || ''} ${student.maternal_last_name || ''}`.trim() || '-'}, {student.first_names}{student.last_names ? ` ${student.last_names}` : ''}
                          </p>
                          <p className="text-xs text-gray-500">{student.dni}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-gray-900">{student.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{student.nivelNombre}</p>
                          <p className="text-xs text-gray-600">{student.gradoNombre}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{student.seccionNombre}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          <StatusIcon size={14} className="mr-1" />
                          {(student.state === 'enrolled' || student.status === 'enrolled') && 'Matriculado'}
                          {(student.state === 'active' || student.status === 'active') && 'Activo'}
                          {(student.state === 'inactive' || student.status === 'inactive') && 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.contratoAdjunto ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Firmado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock size={12} className="mr-1" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setViewingStudent(student)
                              setShowViewModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => onEditStudent(student)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onEditSchedule && onEditSchedule(student)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar cronograma de pagos"
                          >
                            <Calendar size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudentForContract(student)
                              setShowContractModal(true)
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Ver contrato"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadFicha(student)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Descargar ficha"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        {students.length > 0 && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{students.length}</span> estudiantes
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsTab
