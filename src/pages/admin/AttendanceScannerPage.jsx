import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Barcode, Camera, CheckCircle, XCircle, Users,
  Clock, Calendar, AlertTriangle, RefreshCw, X, Download, Settings,
  ScanLine, ClipboardList, Search, Filter, Check
} from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import * as XLSX from 'xlsx'
import { useAuthStore } from '../../stores/authStore'
import { useAttendanceStore } from '../../stores/attendanceStore'
import { attendanceService } from '../../services/attendanceService'
import { useAcademicStore } from '../../stores/academicStore'
import { getTodayLima } from '../../utils/dateUtils'

const AttendanceScannerPage = () => {
  const { user } = useAuthStore()
  const {
    scanQRCode,
    loadTodaySummary,
    getTodayAttendance,
    isLoading
  } = useAttendanceStore()

  // Estado para pestañas principales
  const [activeMainTab, setActiveMainTab] = useState('scanner') // 'scanner' | 'records'

  // Estados para la pestaña de registros por día
  const [recordsDate, setRecordsDate] = useState(getTodayLima())
  const [dayRecords, setDayRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterGrade, setFilterGrade] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [savingJustification, setSavingJustification] = useState(false)

  // Store académico para filtros
  const academicStore = useAcademicStore()

  const [scanMode, setScanMode] = useState('auto') // 'auto' (por defecto) | 'entrada' | 'salida'
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [todayStats, setTodayStats] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [cameraActive, setCameraActive] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState(null)
  const qrScannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const manualInputRef = useRef(null)

  useEffect(() => {
    loadInitialData()
    const interval = setInterval(loadInitialData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Cargar estructura académica para filtros
  useEffect(() => {
    if (academicStore.levels.length === 0) {
      academicStore.initialize()
    }
  }, [])

  // Cargar registros cuando cambie la fecha o la pestaña
  useEffect(() => {
    if (activeMainTab === 'records') {
      loadDayRecords()
    }
  }, [recordsDate, activeMainTab])

  // Función para cargar registros del día
  const loadDayRecords = async () => {
    try {
      setLoadingRecords(true)
      const records = await attendanceService.getAllRecords({ date: recordsDate })
      setDayRecords(Array.isArray(records) ? records : [])
    } catch (error) {
      console.error('Error cargando registros del día:', error)
      setDayRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }

  // Filtrar registros según búsqueda y filtros
  const filteredRecords = dayRecords.filter(record => {
    // Filtro por búsqueda (nombre o DNI)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const studentName = `${record.student_first_names || ''} ${record.student_last_names || ''}`.toLowerCase()
      const dni = record.dni || ''
      if (!studentName.includes(term) && !dni.includes(term)) {
        return false
      }
    }

    // Filtro por nivel
    if (filterLevel && record.level_id !== parseInt(filterLevel)) {
      return false
    }

    // Filtro por grado
    if (filterGrade && record.grade_id !== parseInt(filterGrade)) {
      return false
    }

    // Filtro por sección
    if (filterSection && record.section_id !== parseInt(filterSection)) {
      return false
    }

    return true
  })

  // Toggle justificación de tardanza
  const handleToggleLateJustified = async (record) => {
    try {
      await attendanceService.updateRecord(record.id, {
        late_justified: !record.late_justified
      })
      loadDayRecords()
    } catch (error) {
      console.error('Error al cambiar justificación de tardanza:', error)
      alert('Error al cambiar justificación')
    }
  }

  // Toggle justificación de inasistencia
  const handleToggleAbsenceJustified = async (record) => {
    try {
      await attendanceService.updateRecord(record.id, {
        absence_justified: !record.absence_justified
      })
      loadDayRecords()
    } catch (error) {
      console.error('Error al cambiar justificación de inasistencia:', error)
      alert('Error al cambiar justificación')
    }
  }

  // Exportar registros del día a Excel
  const handleExportDayRecords = () => {
    if (filteredRecords.length === 0) {
      alert('No hay registros para exportar')
      return
    }

    const excelData = filteredRecords.map(record => ({
      'Estudiante': `${record.student_last_names || ''}, ${record.student_first_names || ''}`,
      'DNI': record.dni || '-',
      'Nivel': record.level_name || '-',
      'Grado': record.grade_name || '-',
      'Sección': record.section_name || '-',
      'Entrada 1': record.entry_time1 ? new Date(record.entry_time1).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-',
      'Estado Ent.1': getStatusLabel(record.entry_status1),
      'Salida 1': record.exit_time1 ? new Date(record.exit_time1).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-',
      'Tard. Just.': record.late_justified ? 'Sí' : 'No',
      'Falta Just.': record.absence_justified ? 'Sí' : 'No'
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Registros')

    const fileName = `Asistencia_${recordsDate}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Focus en input manual
  useEffect(() => {
    if (!cameraActive && manualInputRef.current) {
      manualInputRef.current.focus()
    }
  }, [cameraActive, showResult])

  // Handle QR Scanner initialization and cleanup
  useEffect(() => {
    if (cameraActive && qrScannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8
        ]
      }

      html5QrCodeRef.current = new Html5Qrcode("qr-reader")

      html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (decodedText && decodedText !== lastScannedCode) {
            setLastScannedCode(decodedText)
            handleScan(decodedText)

            if (html5QrCodeRef.current?.isScanning) {
              html5QrCodeRef.current.stop().then(() => {
                setCameraActive(false)
              }).catch(err => console.error("Error stopping scanner:", err))
            }

            setTimeout(() => {
              setLastScannedCode(null)
            }, 5000)
          }
        },
        (error) => {
          // Ignore scan errors
        }
      ).catch(err => {
        console.error("Error starting scanner:", err)
        alert("Error al acceder a la cámara. Por favor, verifica los permisos.")
        setCameraActive(false)
      })
    }

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner:", err))
      }
    }
  }, [cameraActive])

  const loadInitialData = async () => {
    try {
      const summary = await loadTodaySummary()
      const stats = getTodayAttendance()
      setTodayStats(stats)

      // Cargar registros del día desde la base de datos
      if (summary && summary.records && summary.records.length > 0) {
        const todayRecords = summary.records.map(record => ({
          student: {
            id: record.student_id,
            first_names: record.student_first_names || record.first_names,
            last_names: record.student_last_names || record.last_names,
            dni: record.dni,
            level_name: record.level_name,
            grade_name: record.grade_name,
            section_name: record.section_name
          },
          record: record,
          type: record.exit_time1 ? 'salida' : 'entrada',
          eventName: record.exit_time1 ? 'Salida 1' : 'Entrada 1',
          timestamp: record.exit_time1 || record.entry_time1
        }))
        setRecentScans(todayRecords)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleManualScan = async (e) => {
    e.preventDefault()

    if (!manualCode.trim()) {
      return
    }

    await handleScan(manualCode.trim())
    setManualCode('')
  }

  const handleScan = async (code) => {
    try {
      const result = await scanQRCode(code, user?.id, scanMode)

      // Determinar el mensaje según el estado
      let message
      let isComplete = result.isComplete || false

      if (isComplete) {
        message = 'Jornada completa - Ya registró todas las entradas y salidas del día'
      } else if (result.alreadyRegistered) {
        message = `${result.eventName} ya fue registrada`
      } else {
        message = `${result.eventName} registrada correctamente`
      }

      setScanResult({
        success: true,
        student: result.student,
        record: result.record,
        type: result.type,
        eventNumber: result.eventNumber,
        eventName: result.eventName,
        alreadyRegistered: result.alreadyRegistered,
        isComplete,
        nextAllowed: result.nextAllowed,
        message
      })

      // Add to recent scans solo si es un nuevo registro
      if (!result.alreadyRegistered && !isComplete) {
        setRecentScans(prev => [{
          ...result,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 9)])
      }

      setShowResult(true)
      loadInitialData()

      // Auto-hide result after 3 seconds
      setTimeout(() => {
        setShowResult(false)
        // Re-focus input
        if (manualInputRef.current) {
          manualInputRef.current.focus()
        }
      }, 3000)
    } catch (error) {
      // Manejar error de secuencia incorrecta con información adicional
      let errorMessage = error.message || 'Error al escanear código'
      let errorDetails = null

      if (error.expectedName) {
        errorDetails = {
          expected: error.expectedName,
          attempted: error.attemptedType === 'entrada' ? 'Entrada' : 'Salida'
        }
      }

      setScanResult({
        success: false,
        message: errorMessage,
        errorDetails,
        student: error.student || null
      })
      setShowResult(true)

      setTimeout(() => {
        setShowResult(false)
        if (manualInputRef.current) {
          manualInputRef.current.focus()
        }
      }, 3000)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'a_tiempo':
      case 'presente':
        return 'bg-green-100 text-green-800'
      case 'tardanza':
        return 'bg-yellow-100 text-yellow-800'
      case 'falta':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'a_tiempo':
        return 'A tiempo'
      case 'presente':
        return 'Presente'
      case 'tardanza':
        return 'Tardanza'
      case 'falta':
        return 'Falta'
      default:
        return status || 'Registrado'
    }
  }

  const handleExportToExcel = async () => {
    if (recentScans.length === 0) {
      alert('No hay registros para exportar')
      return
    }

    const today = new Date().toLocaleDateString('es-PE')

    const excelData = recentScans.map(scan => ({
      'Código': scan.student?.code || scan.student?.dni || '-',
      'Estudiante': scan.student ? `${scan.student.last_names}, ${scan.student.first_names}` : '-',
      'DNI': scan.student?.dni || '-',
      'Nivel': scan.student?.level_name || '-',
      'Grado/Sección': `${scan.student?.grade_name || ''} ${scan.student?.section_name || ''}`,
      'Tipo': scan.type === 'entrada' ? 'Entrada' : 'Salida',
      'Evento': scan.eventName || '-',
      'Hora': new Date(scan.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      'Estado': getStatusLabel(scan.record?.entry_status1 || scan.record?.exit_status1)
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia')

    ws['!cols'] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 }
    ]

    const fileName = `Asistencia_${today.replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
          <p className="mt-2 text-gray-600">
            {activeMainTab === 'scanner'
              ? 'Escanea el código QR o ingresa el DNI del estudiante'
              : 'Visualiza y gestiona los registros de asistencia'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {activeMainTab === 'scanner' && (
            <>
              <Link
                to="/admin/configuracion?tab=attendance"
                className="btn btn-outline flex items-center gap-2"
              >
                <Settings size={18} />
                Horarios
              </Link>
              <button
                onClick={handleExportToExcel}
                className="btn btn-outline flex items-center gap-2"
                disabled={recentScans.length === 0}
              >
                <Download size={18} />
                Exportar
              </button>
              <button
                onClick={loadInitialData}
                className="btn btn-outline flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Actualizar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pestañas Principales */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveMainTab('scanner')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeMainTab === 'scanner'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ScanLine size={18} />
            Escáner QR / DNI
          </button>
          <button
            onClick={() => setActiveMainTab('records')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeMainTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ClipboardList size={18} />
            Registros y Justificaciones
          </button>
        </nav>
      </div>

      {/* ==================== PESTAÑA: ESCÁNER ==================== */}
      {activeMainTab === 'scanner' && (
        <>
          {/* Turno indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Turno: ☀️ Día
            </span>
          </div>

      {/* Today's Statistics */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registros Hoy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {todayStats.totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Presentes</p>
                <p className="text-2xl font-semibold text-green-600">
                  {todayStats.present}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tardanzas</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {todayStats.late}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('es-PE', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short'
                  })}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Asistencia
            </h3>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setScanMode('auto')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  scanMode === 'auto'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔄 Automático
              </button>
              <button
                onClick={() => setScanMode('entrada')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  scanMode === 'entrada'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📥 Entrada
              </button>
              <button
                onClick={() => setScanMode('salida')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  scanMode === 'salida'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📤 Salida
              </button>
            </div>
            {scanMode === 'auto' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Modo Automático:</strong> El sistema determinará automáticamente si registrar entrada o salida según la secuencia (Entrada 1 → Salida 1 → Entrada 2 → Salida 2).
                </p>
              </div>
            )}
            {scanMode !== 'auto' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Modo Manual:</strong> Solo se permitirá registrar {scanMode === 'entrada' ? 'entrada' : 'salida'} si corresponde a la secuencia correcta.
                </p>
              </div>
            )}

            {/* Manual Input */}
            <form onSubmit={handleManualScan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escanea con pistola lectora o ingresa el DNI
                </label>
                <div className="flex gap-2">
                  <input
                    ref={manualInputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ingresa DNI o código QR..."
                    className="flex-1 input text-lg"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !manualCode.trim()}
                    className={`btn ${
                      scanMode === 'auto'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : scanMode === 'entrada'
                          ? 'btn-primary'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                    } px-6`}
                  >
                    {isLoading ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      'Registrar'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Camera Scanner */}
            <div className="mt-6">
              {!cameraActive ? (
                <div className="p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Camera className="mx-auto h-16 w-16 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Escanear código QR con cámara
                    </p>
                    <button
                      onClick={() => setCameraActive(true)}
                      className="btn btn-primary flex items-center gap-2 mx-auto"
                    >
                      <Camera size={18} />
                      Activar Cámara
                    </button>
                  </div>
                </div>
              ) : (
                <div ref={qrScannerRef} className="relative bg-black rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      if (html5QrCodeRef.current?.isScanning) {
                        html5QrCodeRef.current.stop().then(() => {
                          setCameraActive(false)
                          setLastScannedCode(null)
                        }).catch(err => console.error("Error stopping scanner:", err))
                      } else {
                        setCameraActive(false)
                        setLastScannedCode(null)
                      }
                    }}
                    className="absolute top-2 right-2 z-10 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <X size={20} />
                  </button>
                  <div id="qr-reader" className="w-full"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pointer-events-none">
                    <p className="text-white text-center text-sm">
                      Apunta la cámara al código QR del estudiante
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Display */}
          {showResult && scanResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${
                scanResult.success
                  ? scanResult.isComplete
                    ? 'bg-purple-50 border-purple-200'
                    : scanResult.alreadyRegistered
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  scanResult.isComplete ? (
                    <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  ) : scanResult.alreadyRegistered ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    scanResult.success
                      ? scanResult.isComplete
                        ? 'text-purple-900'
                        : scanResult.alreadyRegistered
                          ? 'text-yellow-900'
                          : 'text-green-900'
                      : 'text-red-900'
                  }`}>
                    {scanResult.message}
                  </p>
                  {scanResult.student && (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {scanResult.student.first_names} {scanResult.student.last_names}
                      </p>
                      <p className="text-sm text-gray-600">
                        {scanResult.student.level_name} - {scanResult.student.grade_name} {scanResult.student.section_name}
                      </p>
                      {scanResult.record && !scanResult.alreadyRegistered && !scanResult.isComplete && (
                        <div className="mt-2 flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {scanResult.record.entry_status1 && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              getStatusColor(scanResult.record.entry_status1)
                            }`}>
                              {getStatusLabel(scanResult.record.entry_status1)}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Mostrar próximo registro esperado */}
                      {scanResult.nextAllowed && !scanResult.nextAllowed.isComplete && (
                        <div className="mt-2 text-sm text-gray-600">
                          Próximo registro: <strong>{scanResult.nextAllowed.nextName}</strong>
                        </div>
                      )}
                    </>
                  )}
                  {/* Mostrar detalles del error de secuencia */}
                  {!scanResult.success && scanResult.errorDetails && (
                    <div className="mt-2 text-sm text-red-700">
                      Debe registrar: <strong>{scanResult.errorDetails.expected}</strong>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Scans */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Registros Recientes
          </h3>

          {recentScans.length === 0 ? (
            <div className="text-center py-8">
              <Barcode className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">
                No hay registros recientes aún
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {recentScans.map((scan, index) => (
                <motion.div
                  key={`${scan.student?.id}-${scan.timestamp}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {scan.student?.first_names} {scan.student?.last_names}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {scan.eventName} • {' '}
                        {new Date(scan.timestamp).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        scan.type === 'entrada' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {scan.type === 'entrada' ? '📥 Entrada' : '📤 Salida'}
                      </span>
                      {scan.record?.entry_status1 && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          getStatusColor(scan.record.entry_status1)
                        }`}>
                          {getStatusLabel(scan.record.entry_status1)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Instrucciones de uso:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• <strong>Modo Automático (recomendado):</strong> El sistema determina automáticamente si es entrada o salida según la secuencia</li>
              <li>• <strong>Secuencia válida:</strong> Entrada 1 → Salida 1 → Entrada 2 → Salida 2</li>
              <li>• Puedes ingresar el <strong>DNI</strong> del estudiante directamente o escanear con pistola lectora</li>
              <li>• O escanear el <strong>código QR</strong> del carnet con la cámara</li>
              <li>• El sistema detecta automáticamente si es tardanza según el horario configurado</li>
              <li>• Los registros se guardan inmediatamente en la base de datos</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}

      {/* ==================== PESTAÑA: REGISTROS Y JUSTIFICACIONES ==================== */}
      {activeMainTab === 'records' && (
        <div className="space-y-6">
          {/* Selector de Fecha y Filtros */}
          <div className="card p-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Selector de Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={recordsDate}
                  onChange={(e) => setRecordsDate(e.target.value)}
                  max={getTodayLima()}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtro por Nivel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value)
                    setFilterGrade('')
                    setFilterSection('')
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {(academicStore.levels || []).map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Grado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value)
                    setFilterSection('')
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {(academicStore.grades || [])
                    .filter(g => !filterLevel || g.level_id === parseInt(filterLevel))
                    .map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                </select>
              </div>

              {/* Filtro por Sección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sección</label>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {(academicStore.sections || [])
                    .filter(s => !filterGrade || s.grade_id === parseInt(filterGrade))
                    .map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                </select>
              </div>

              {/* Búsqueda */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o DNI..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={loadDayRecords}
                  className="btn btn-outline flex items-center gap-2"
                  disabled={loadingRecords}
                >
                  <RefreshCw size={18} className={loadingRecords ? 'animate-spin' : ''} />
                  Actualizar
                </button>
                <button
                  onClick={handleExportDayRecords}
                  className="btn btn-outline flex items-center gap-2"
                  disabled={filteredRecords.length === 0}
                >
                  <Download size={18} />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Registros</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredRecords.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">A Tiempo</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {filteredRecords.filter(r => r.entry_status1 === 'a_tiempo').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tardanzas</p>
                  <p className="text-2xl font-semibold text-yellow-600">
                    {filteredRecords.filter(r => r.entry_status1 === 'tardanza').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Justificadas</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {filteredRecords.filter(r => r.late_justified || r.absence_justified).length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Tabla de Registros */}
          <div className="card overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-900">
                Registros del {new Date(recordsDate + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>

            {loadingRecords ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando registros...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-500">No hay registros de asistencia para esta fecha</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel / Grado / Sección</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Entrada 1</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Salida 1</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.student_last_names}, {record.student_first_names}
                          </div>
                          <div className="text-xs text-gray-500">DNI: {record.dni}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">
                            {record.level_name} - {record.grade_name} "{record.section_name}"
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-900">
                            {record.entry_time1
                              ? new Date(record.entry_time1).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.entry_status1)}`}>
                            {getStatusLabel(record.entry_status1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-900">
                            {record.exit_time1
                              ? new Date(record.exit_time1).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* Botón Justificar Tardanza */}
                            {record.entry_status1 === 'tardanza' && (
                              <button
                                onClick={() => handleToggleLateJustified(record)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  record.late_justified
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                                title={record.late_justified ? 'Tardanza justificada' : 'Justificar tardanza'}
                              >
                                {record.late_justified ? '✓ T.Just.' : 'Just. Tard.'}
                              </button>
                            )}

                            {/* Botón Justificar Falta (cuando no tiene entrada) */}
                            {!record.entry_time1 && (
                              <button
                                onClick={() => handleToggleAbsenceJustified(record)}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  record.absence_justified
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                                title={record.absence_justified ? 'Falta justificada' : 'Justificar falta'}
                              >
                                {record.absence_justified ? '✓ F.Just.' : 'Just. Falta'}
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceScannerPage
