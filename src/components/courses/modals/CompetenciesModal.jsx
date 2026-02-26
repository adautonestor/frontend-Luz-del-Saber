import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Brain, CheckCircle, Edit, Trash2, Plus, BookOpen, Eye } from 'lucide-react'
import { useGradesStore } from '../../../stores/gradesStore'

/**
 * Modal para ver competencias de un área
 * Muestra competencias de la tabla competencies (editables)
 * y de evaluation_structures/rúbricas (solo lectura)
 */
const CompetenciesModal = ({
  show,
  selectedArea,
  competencies,
  capacities,
  courses,
  grades,
  onClose,
  onCreateCompetency,
  onEditCompetency,
  onDeleteCompetency
}) => {
  const { evaluationStructures, initialize: initializeGrades } = useGradesStore()
  const [rubricCompetencies, setRubricCompetencies] = useState([])

  // Cargar estructuras de evaluación al abrir el modal
  useEffect(() => {
    if (show) {
      initializeGrades()
    }
  }, [show])

  // Extraer competencias de las rúbricas para el área seleccionada
  useEffect(() => {
    if (evaluationStructures && evaluationStructures.length > 0 && selectedArea && courses) {
      // Mapeo de área a nombres de cursos relacionados
      const areaToCourseNames = {
        'comunicación': ['comunicacion', 'comunicación', 'lenguaje'],
        'matemáticas': ['matematica', 'matemáticas', 'matemática'],
        'ciencias': ['ciencia', 'ciencias', 'ciencia y ambiente', 'ciencia y tecnología'],
        'sociales': ['personal social', 'sociales', 'historia'],
        'educación física': ['educación física', 'educacion fisica', 'psicomotricidad'],
        'arte': ['arte', 'arte y creatividad', 'arte y cultura'],
        'inglés': ['inglés', 'ingles', 'english'],
        'religión': ['religión', 'religion']
      }

      const relatedCourseNames = areaToCourseNames[selectedArea?.toLowerCase()] || []

      // Filtrar estructuras que tienen competencias y pertenecen al área
      const rubricComps = []
      evaluationStructures.forEach(structure => {
        // Obtener el nombre del curso desde la lista de cursos
        const course = courses?.find(c => Number(c.id) === Number(structure.course_id))
        const courseName = course?.name?.toLowerCase() || ''

        // Obtener el nombre del grado
        const grade = grades?.find(g => Number(g.id) === Number(structure.grade_id))
        const gradeName = grade?.name || `Grado ${structure.grade_id}`

        // Verificar si el curso pertenece al área
        const isRelatedCourse = relatedCourseNames.some(name =>
          courseName.includes(name) || name.includes(courseName)
        )

        if (isRelatedCourse && structure.competencias && structure.competencias.length > 0) {
          structure.competencias.forEach(comp => {
            rubricComps.push({
              ...comp,
              fromRubric: true,
              courseName: course?.name || 'Curso desconocido',
              gradeName: gradeName,
              quarter: structure.quarter,
              structureId: structure.id
            })
          })
        }
      })

      setRubricCompetencies(rubricComps)
    }
  }, [evaluationStructures, selectedArea, courses, grades])

  if (!show) return null

  const getCapacitiesByCompetency = (competencyId) => {
    // Soportar múltiples nombres de campo: competency_id (backend) o competenciaId (legacy)
    return capacities.filter(cap =>
      Number(cap.competency_id) === Number(competencyId) ||
      Number(cap.competenciaId) === Number(competencyId)
    )
  }

  // Mapeo de área del curso a academic_area_id
  const areaToIdMapping = {
    'comunicación': 1,
    'matemáticas': 2,
    'ciencias': 3,
    'sociales': 4,
    'educación física': 5,
    'arte': 6,
    'inglés': 7,
    'religión': 8
  }

  const selectedAreaId = areaToIdMapping[selectedArea]

  // Filtrar competencias por área (comparando academic_area_id o area string)
  const areaCompetencies = competencies.filter(comp => {
    // Si tiene academic_area_id, comparar con el ID mapeado
    if (comp.academic_area_id) {
      return comp.academic_area_id === selectedAreaId
    }
    // Fallback: comparar por string de área
    return comp.area === selectedArea
  })

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-[60]"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Competencias del Área: {selectedArea}
                    </h3>
                    <p className="text-gray-600">Competencias y capacidades específicas</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Competencias de Rúbricas (Solo Lectura) */}
              {rubricCompetencies.length > 0 ? (
                <div className="space-y-3">
                  {rubricCompetencies.map((comp, index) => (
                    <div
                      key={`rubric-${comp.structureId}-${comp.numero}-${index}`}
                      className="border border-gray-200 bg-white rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                              {comp.numero || index + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {comp.nombreCompetencia || comp.name || `Competencia ${comp.numero}`}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {comp.courseName} • {comp.gradeName} • {comp.quarter}° Bimestre
                              </p>
                            </div>
                          </div>

                          {comp.description && (
                            <p className="text-gray-600 text-sm ml-11">
                              {comp.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            <Eye size={12} />
                            Solo lectura
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    No hay competencias definidas para el área de {selectedArea}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Las competencias se crean desde la sección de Rúbricas de Evaluación
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {rubricCompetencies.length} competencia(s) encontrada(s)
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-primary px-4 py-2"
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

export default CompetenciesModal
