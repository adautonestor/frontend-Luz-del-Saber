import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Download, Eye, Calendar, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { psychologicalReportsService } from '../../services/psychologicalReportsService'
import { studentsService } from '../../services/studentsService'

export default function ParentPsychologicalReports() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedYear, user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get parent's children directly using user.id
      const childrenResponse = await studentsService.getByParent(user.id);
      const childrenData = childrenResponse?.data || childrenResponse || [];

      // Ensure it's an array
      const childrenArray = Array.isArray(childrenData) ? childrenData : [];

      setChildren(childrenArray);

      // Si hay hijos, seleccionar el primero por defecto
      if (!selectedChild && childrenArray.length > 0) {
        setSelectedChild(childrenArray[0].id);
      }

      // Cargar todos los informes psicológicos
      const allReportsResponse = await psychologicalReportsService.getAll();
      const allReports = allReportsResponse || [];
      const activeReports = Array.isArray(allReports) ? allReports.filter(r => r.status === 'active') : [];

      setReports(activeReports);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setChildren([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener informes del hijo seleccionado
  const getChildReports = (childId) => {
    return reports.filter(r => r.student_id === childId);
  };

  // Obtener informe de un año específico
  const getReportForYear = (childId, year) => {
    return reports.find(
      r => r.student_id === childId && r.academic_year === year && r.status === 'active'
    );
  };

  const handleViewReport = (report) => {
    // Usar file_url del backend (proxy)
    if (report.file_url) {
      window.open(report.file_url, '_blank');
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      if (report.file_url) {
        const response = await fetch(report.file_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = report.file_name || `informe_psicologico_${report.academic_year}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al descargar:', error);
      // Fallback: abrir en nueva pestaña
      if (report.file_url) {
        window.open(report.file_url, '_blank');
      }
    }
  };

  // Helper para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper para obtener lista de años académicos
  const getAcademicYearsList = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const selectedChildData = children.find(c => c.id === selectedChild);
  const childReports = selectedChild ? getChildReports(selectedChild) : [];
  const currentYearReport = selectedChild ? getReportForYear(selectedChild, selectedYear) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Informes Psicológicos
            </h1>
          </div>
          <p className="text-gray-600">
            Consulta los informes psicológicos de tus hijos
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información...</p>
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Brain className="text-gray-300 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay hijos registrados
            </h3>
            <p className="text-gray-600">
              No se encontraron hijos asociados a tu cuenta.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selector de hijo y año */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector de hijo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Hijo
                  </label>
                  <select
                    value={selectedChild || ''}
                    onChange={(e) => setSelectedChild(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.last_names}, {child.first_names} - {child.grade_name || ''} {child.section_name || ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de año */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Año Lectivo
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {getAcademicYearsList().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información del hijo seleccionado */}
            {selectedChildData && (
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
                    {selectedChildData.first_names?.charAt(0)}{selectedChildData.last_names?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedChildData.first_names} {selectedChildData.last_names}
                    </h2>
                    <p className="text-green-100">
                      {selectedChildData.level_name || ''} - {selectedChildData.grade_name || ''} {selectedChildData.section_name || ''} | DNI: {selectedChildData.dni}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informe del año seleccionado */}
            {currentYearReport ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={24} />
                    Informe Psicológico - Año {selectedYear}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Fecha de Emisión
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(currentYearReport.issue_date).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Archivo
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentYearReport.file_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(currentYearReport.file_size)}
                      </p>
                    </div>
                  </div>

                  {currentYearReport.observations && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Observaciones
                      </label>
                      <p className="text-gray-700">{currentYearReport.observations}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewReport(currentYearReport)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Eye size={20} />
                      Ver Informe
                    </button>
                    <button
                      onClick={() => handleDownloadReport(currentYearReport)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Download size={20} />
                      Descargar PDF
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 text-center">
                    Subido el {new Date(currentYearReport.upload_date).toLocaleDateString('es-PE')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-300">
                <AlertCircle className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay informe disponible
                </h3>
                <p className="text-gray-600">
                  No se ha subido un informe psicológico para el año {selectedYear}.
                </p>
              </div>
            )}

            {/* Historial de informes */}
            {childReports.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} />
                    Historial de Informes
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {childReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          report.academic_year === selectedYear
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedYear(report.academic_year)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              report.academic_year === selectedYear
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Año Lectivo {report.academic_year}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Emitido: {new Date(report.issue_date).toLocaleDateString('es-PE')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewReport(report);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver informe"
                            >
                              <Eye size={20} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReport(report);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Descargar informe"
                            >
                              <Download size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Información importante</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Los informes psicológicos son documentos confidenciales.</li>
                <li>Se emite un informe por año lectivo.</li>
                <li>Si tiene dudas sobre el contenido, puede contactar con la dirección.</li>
                <li>Conserve estos documentos para su archivo personal.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
