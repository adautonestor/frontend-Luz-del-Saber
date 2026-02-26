import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Target,
  X,
  Layers,
  Hash,
  FileText
} from 'lucide-react'
import { useGradesStore } from '../../../stores/gradesStore'

/**
 * Modal para ver competencias de un CURSO específico
 * Organiza las competencias por grado con diseño limpio y moderno
 */
const CourseCompetenciesModal = ({
  show,
  selectedCourse,
  grades = [],
  onClose
}) => {
  const { evaluationStructures, initialize: initializeGrades } = useGradesStore()
  const [activeGradeId, setActiveGradeId] = useState(null)
  const [expandedCompetencies, setExpandedCompetencies] = useState({})

  // Cargar estructuras de evaluación al abrir el modal
  useEffect(() => {
    if (show) {
      initializeGrades()
    }
  }, [show])

  // Obtener competencias del curso agrupadas por grado
  const competenciesByGrade = useMemo(() => {
    if (!evaluationStructures || !selectedCourse) return {}

    const grouped = {}

    evaluationStructures.forEach(structure => {
      // Filtrar solo las estructuras de este curso
      if (Number(structure.course_id) !== Number(selectedCourse.id)) return

      const gradeId = structure.grade_id
      const grade = grades.find(g => Number(g.id) === Number(gradeId))

      if (!grade) return

      if (!grouped[gradeId]) {
        grouped[gradeId] = {
          grade: grade,
          quarters: {}
        }
      }

      // Agrupar por bimestre
      const quarter = structure.quarter || 1
      if (!grouped[gradeId].quarters[quarter]) {
        grouped[gradeId].quarters[quarter] = []
      }

      // Agregar competencias de esta estructura
      const competencias = structure.competencias || []
      competencias.forEach((comp, idx) => {
        grouped[gradeId].quarters[quarter].push({
          ...comp,
          structureId: structure.id,
          uniqueKey: `${structure.id}-${comp.numero || idx}`
        })
      })
    })

    return grouped
  }, [evaluationStructures, selectedCourse, grades])

  // Ordenar grados por orden
  const sortedGradeIds = useMemo(() => {
    return Object.keys(competenciesByGrade).sort((a, b) => {
      const gradeA = competenciesByGrade[a]?.grade
      const gradeB = competenciesByGrade[b]?.grade
      return (gradeA?.order || 0) - (gradeB?.order || 0)
    })
  }, [competenciesByGrade])

  // Establecer el primer grado como activo por defecto
  useEffect(() => {
    if (sortedGradeIds.length > 0 && !activeGradeId) {
      setActiveGradeId(sortedGradeIds[0])
    }
  }, [sortedGradeIds, activeGradeId])

  // Toggle de competencia expandida
  const toggleCompetency = (key) => {
    setExpandedCompetencies(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Contar total de competencias del curso
  const totalCompetencies = useMemo(() => {
    let count = 0
    Object.values(competenciesByGrade).forEach(gradeData => {
      Object.values(gradeData.quarters).forEach(comps => {
        count += comps.length
      })
    })
    return count
  }, [competenciesByGrade])

  if (!show) return null

  const activeGradeData = activeGradeId ? competenciesByGrade[activeGradeId] : null

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente sutil */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 tracking-tight">
                      Competencias del Curso
                    </h3>
                    <p className="text-lg text-indigo-600 font-medium mt-0.5">
                      {selectedCourse?.name || 'Curso'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-200">
                        <Target size={12} className="text-indigo-500" />
                        {totalCompetencies} competencia{totalCompetencies !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm border border-slate-200">
                        <GraduationCap size={12} className="text-emerald-500" />
                        {sortedGradeIds.length} grado{sortedGradeIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex h-[calc(85vh-180px)]">
              {/* Sidebar de grados */}
              {sortedGradeIds.length > 0 && (
                <div className="w-48 bg-slate-50/80 border-r border-slate-200 py-3 overflow-y-auto">
                  <div className="px-3 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Grados
                    </span>
                  </div>
                  <nav className="space-y-0.5 px-2">
                    {sortedGradeIds.map((gradeId, index) => {
                      const gradeData = competenciesByGrade[gradeId]
                      const isActive = activeGradeId === gradeId
                      const compCount = Object.values(gradeData.quarters).flat().length

                      return (
                        <motion.button
                          key={gradeId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setActiveGradeId(gradeId)
                            setExpandedCompetencies({})
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <span className="truncate">{gradeData.grade.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-indigo-500 text-indigo-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {compCount}
                          </span>
                        </motion.button>
                      )
                    })}
                  </nav>
                </div>
              )}

              {/* Área principal de competencias */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeGradeData ? (
                    <motion.div
                      key={activeGradeId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Header del grado */}
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {activeGradeData.grade.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {Object.keys(activeGradeData.quarters).length} bimestre(s) con competencias
                          </p>
                        </div>
                      </div>

                      {/* Competencias por bimestre */}
                      {Object.entries(activeGradeData.quarters)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([quarter, competencies]) => (
                          <div key={quarter} className="space-y-3">
                            {/* Encabezado del bimestre */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-6 h-6 bg-amber-100 rounded-md">
                                <span className="text-xs font-bold text-amber-700">{quarter}</span>
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                Bimestre {quarter}
                              </span>
                              <div className="flex-1 h-px bg-slate-200 ml-2" />
                            </div>

                            {/* Lista de competencias */}
                            <div className="space-y-2 pl-2">
                              {competencies.map((comp, index) => {
                                const isExpanded = expandedCompetencies[comp.uniqueKey]

                                return (
                                  <motion.div
                                    key={comp.uniqueKey}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group"
                                  >
                                    <button
                                      onClick={() => toggleCompetency(comp.uniqueKey)}
                                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        isExpanded
                                          ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        {/* Número de competencia */}
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                          isExpanded
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                        }`}>
                                          {comp.numero || index + 1}
                                        </div>

                                        {/* Contenido */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2">
                                            <h5 className={`font-medium leading-snug ${
                                              isExpanded ? 'text-indigo-900' : 'text-slate-800'
                                            }`}>
                                              {comp.nombreCompetencia || comp.name || `Competencia ${comp.numero || index + 1}`}
                                            </h5>
                                            <motion.div
                                              animate={{ rotate: isExpanded ? 180 : 0 }}
                                              transition={{ duration: 0.2 }}
                                              className={`flex-shrink-0 ${
                                                isExpanded ? 'text-indigo-600' : 'text-slate-400'
                                              }`}
                                            >
                                              <ChevronDown size={18} />
                                            </motion.div>
                                          </div>

                                          {/* Código si existe */}
                                          {comp.codigo && (
                                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-slate-500">
                                              <Hash size={10} />
                                              {comp.codigo}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Descripción expandida */}
                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="mt-4 pt-4 border-t border-indigo-200/50">
                                              {comp.description || comp.descripcion ? (
                                                <div className="flex items-start gap-2">
                                                  <FileText size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                  <p className="text-sm text-slate-600 leading-relaxed">
                                                    {comp.description || comp.descripcion}
                                                  </p>
                                                </div>
                                              ) : (
                                                <p className="text-sm text-slate-400 italic">
                                                  Sin descripción adicional
                                                </p>
                                              )}

                                              {/* Desempeños/Capacidades si existen */}
                                              {comp.desempenios && comp.desempenios.length > 0 && (
                                                <div className="mt-3">
                                                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Desempeños
                                                  </span>
                                                  <ul className="mt-2 space-y-1.5">
                                                    {comp.desempenios.map((desemp, dIdx) => (
                                                      <li key={dIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <ChevronRight size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                        <span>{desemp.descripcion || desemp}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </button>
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center py-12"
                    >
                      <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                        <Layers className="h-10 w-10 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-medium text-slate-700 mb-2">
                        Sin competencias registradas
                      </h4>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Este curso no tiene competencias definidas. Las competencias se crean desde
                        la sección de <span className="text-indigo-600 font-medium">Rúbricas de Evaluación</span>.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Las competencias se definen en las rúbricas de evaluación de cada bimestre
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default CourseCompetenciesModal
