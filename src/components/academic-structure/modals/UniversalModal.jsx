import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usersService } from '../../../services/usersService'
import { academicYearTypesService } from '../../../services/academic/academicYearTypesService'
/**
 * Modal universal para crear/editar elementos de la estructura académica
 * Maneja: Años Lectivos, Niveles, Grados, Secciones y Cursos
 */
const UniversalModal = ({
  showModal,
  modalType,
  editingItem,
  closeModal,
  handleSave,
  // Forms
  academicYearForm,
  setAcademicYearForm,
  levelForm,
  setLevelForm,
  gradeForm,
  setGradeForm,
  sectionForm,
  setSectionForm,
  courseForm,
  setCourseForm,
  competencyForm,
  setCompetencyForm,
  // Data
  levels,
  grades,
  courses,
  competencies = [],
  academicYears = [], // Lista de años académicos para validaciones
  // States
  showNewCourseInput,
  setShowNewCourseInput
}) => {
  // Verificar si ya existe un año activo (excluyendo el que se está editando)
  const existingActiveYear = academicYears.find(year =>
    (year.state === 'activo' || year.status === 'active') &&
    (!editingItem || year.id !== editingItem.id)
  )

  // Verificar si el usuario está intentando crear/editar con estado "activo"
  const isSelectingActiveState = academicYearForm?.state === 'activo'
  const showActiveWarning = modalType === 'academic-year' && isSelectingActiveState && existingActiveYear
  // Función para generar código de competencia automáticamente
  const generateCompetencyCode = (area, levelId) => {
    if (!area || !levelId) return ''

    // Mapeo de área a prefijo
    const areaPrefixes = {
      'comunicación': 'COM',
      'matemáticas': 'MAT',
      'ciencias': 'CYT',
      'sociales': 'SOC',
      'arte': 'ART',
      'educación física': 'EFI',
      'inglés': 'ING',
      'religión': 'REL'
    }

    // Mapeo de nivel a sufijo
    const levelSuffixes = {
      1: 'INI',  // Inicial
      2: 'PRI',  // Primaria
      3: 'SEC'   // Secundaria
    }

    const prefix = areaPrefixes[area] || 'GEN'
    const suffix = levelSuffixes[levelId] || 'GEN'

    // Buscar el siguiente número disponible
    const existingCodes = competencies
      .filter(c => c.code?.startsWith(`${prefix}-${suffix}-`))
      .map(c => {
        const match = c.code.match(/-(\d+)$/)
        return match ? parseInt(match[1]) : 0
      })

    const nextNumber = existingCodes.length > 0
      ? Math.max(...existingCodes) + 1
      : 1

    return `${prefix}-${suffix}-${String(nextNumber).padStart(2, '0')}`
  }
  const [teachers, setTeachers] = useState([])
  const [academicYearTypes, setAcademicYearTypes] = useState([])

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const users = await usersService.getAll()
        // Filtrar profesores (case-insensitive) y mapear nombre completo
        const profesores = users?.filter(user =>
          user.rol?.toLowerCase() === 'profesor'
        ).map(user => ({
          ...user,
          name: `${user.first_name || ''} ${user.last_names || ''}`.trim()
        })) || []
        setTeachers(profesores)
      } catch (error) {
        console.error('Error fetching teachers:', error)
        setTeachers([])
      }
    }

    if (showModal && (modalType === 'section' || modalType === 'course')) {
      fetchTeachers()
    }
  }, [showModal, modalType])

  // Cargar tipos de año lectivo cuando se abre el modal de academic-year
  useEffect(() => {
    const fetchAcademicYearTypes = async () => {
      try {
        const types = await academicYearTypesService.getAll()
        setAcademicYearTypes(types || [])
      } catch (error) {
        console.error('Error fetching academic year types:', error)
        setAcademicYearTypes([])
      }
    }

    if (showModal && modalType === 'academic-year') {
      fetchAcademicYearTypes()
    }
  }, [showModal, modalType])

  if (!showModal) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 z-[60]"
        onClick={closeModal}
      ></div>

      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Editar' : 'Crear'} {
                modalType === 'academic-year' ? 'Año Lectivo' :
                modalType === 'level' ? 'Nivel' :
                modalType === 'grade' ? 'Grado' :
                modalType === 'section' ? 'Sección' :
                modalType === 'competency' ? 'Competencia' : 'Curso'
              }
            </h3>

            <div className="space-y-4">
              {modalType === 'academic-year' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nombre del Año Lectivo *</label>
                      <input
                        type="text"
                        className="input"
                        value={academicYearForm.name}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Año Lectivo 2024"
                      />
                    </div>

                    <div>
                      <label className="label">Año *</label>
                      <input
                        type="number"
                        className="input"
                        value={academicYearForm.año}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, año: parseInt(e.target.value) || new Date().getFullYear() }))}
                        min="2020"
                        max="2050"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Tipo de Año Lectivo *</label>
                    <select
                      className="input"
                      value={academicYearForm.type}
                      onChange={(e) => setAcademicYearForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Seleccionar tipo</option>
                      {academicYearTypes.length > 0 ? (
                        academicYearTypes.map(type => (
                          <option key={type.id} value={type.code}>
                            {type.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="regular">Regular</option>
                          <option value="recuperacion">Recuperación</option>
                          <option value="vacacional">Vacacional</option>
                        </>
                      )}
                    </select>
                    {academicYearTypes.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        No hay tipos de año configurados. Se muestran valores por defecto.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Fecha de Inicio *</label>
                      <input
                        type="date"
                        className="input"
                        value={academicYearForm.fechaInicio}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="label">Fecha de Fin *</label>
                      <input
                        type="date"
                        className="input"
                        value={academicYearForm.fechaFin}
                        onChange={(e) => setAcademicYearForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                        min={academicYearForm.fechaInicio || undefined}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Estado</label>
                    <select
                      className="input"
                      value={academicYearForm.state}
                      onChange={(e) => setAcademicYearForm(prev => ({ ...prev, state: e.target.value }))}
                    >
                      <option value="planificado">Planificado</option>
                      <option value="activo">Activo</option>
                    </select>
                  </div>

                  {/* Alerta cuando se selecciona "Activo" y ya existe otro año activo */}
                  {showActiveWarning && (
                    <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-amber-800 block mb-1">
                            ¡Atención! Solo puede haber un año lectivo activo
                          </span>
                          <p className="text-sm text-amber-700">
                            Actualmente el año <strong>"{existingActiveYear?.name}"</strong> está activo.
                            Si continúa, este año será desactivado automáticamente y el nuevo año tomará su lugar como activo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows="2"
                      value={academicYearForm.description}
                      onChange={(e) => setAcademicYearForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del año lectivo (opcional)..."
                    />
                  </div>

                  {/* Nota informativa sobre los niveles predeterminados */}
                  {!editingItem && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-blue-900">
                            Niveles predeterminados
                          </span>
                          <p className="text-xs text-blue-700 mt-1">
                            Al crear el año lectivo, se generarán automáticamente los 3 niveles educativos:
                            <strong> Inicial, Primaria y Secundaria</strong>.
                            Puedes eliminarlos o modificarlos después si lo necesitas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalType === 'level' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nombre del Nivel *</label>
                      <input
                        type="text"
                        className="input"
                        value={levelForm.name}
                        onChange={(e) => setLevelForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Primaria"
                      />
                    </div>

                    <div>
                      <label className="label">Código</label>
                      <input
                        type="text"
                        className="input"
                        value={levelForm.code}
                        onChange={(e) => setLevelForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Automático"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows="2"
                      value={levelForm.description}
                      onChange={(e) => setLevelForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del nivel (opcional)..."
                    />
                  </div>
                </div>
              )}

              {modalType === 'grade' && (
                <div className="space-y-4">
                  <div>
                    <label className="label">Nombre del Grado *</label>
                    <input
                      type="text"
                      className="input"
                      value={gradeForm.name}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: 1° Grado"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nivel *</label>
                      <select
                        className="input"
                        value={gradeForm.level_id}
                        onChange={(e) => setGradeForm(prev => ({ ...prev, level_id: e.target.value }))}
                      >
                        <option value="">Seleccionar nivel</option>
                        {levels.map(level => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Código</label>
                      <input
                        type="text"
                        className="input"
                        value={gradeForm.code}
                        onChange={(e) => setGradeForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Automático"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows="2"
                      value={gradeForm.description}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Opcional..."
                    />
                  </div>
                </div>
              )}

              {modalType === 'section' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre de la Sección *</label>
                    <input
                      type="text"
                      className="input"
                      value={sectionForm.name}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: A"
                    />
                  </div>

                  <div>
                    <label className="label">Grado *</label>
                    <select
                      className="input"
                      value={sectionForm.grade_id}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, grade_id: e.target.value }))}
                    >
                      <option value="">Seleccionar grado</option>
                      {grades.map(grade => (
                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Capacidad Máxima</label>
                    <input
                      type="number"
                      min="1"
                      className="input"
                      value={sectionForm.capacidadMaxima}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, capacidadMaxima: parseInt(e.target.value) || 30 }))}
                      placeholder="Ej: 30"
                    />
                  </div>

                  <div>
                    <label className="label">Turno</label>
                    <input
                      type="text"
                      className="input bg-gray-100"
                      value="Mañana"
                      disabled
                      title="El colegio opera en turno único (mañana)"
                    />
                    {/* Mantener el valor en el formulario */}
                    <input type="hidden" value="mañana" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Tutor</label>
                    <select
                      className="input"
                      value={sectionForm.tutorId}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, tutorId: e.target.value }))}
                    >
                      <option value="">Sin asignar</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {modalType === 'course' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Área Académica *</label>
                    <select
                      className="input"
                      value={courseForm.area}
                      onChange={(e) => {
                        setCourseForm(prev => ({
                          ...prev,
                          area: e.target.value,
                          name: '' // Reset course name when area changes
                        }))
                        setShowNewCourseInput(false) // Reset new course input
                      }}
                    >
                      <option value="">Seleccionar área</option>
                      <option value="comunicación">Comunicación</option>
                      <option value="matemática">Matemática</option>
                      <option value="ciencia y tecnología">Ciencia y Tecnología</option>
                      <option value="personal social">Personal Social</option>
                      <option value="educación física">Educación Física</option>
                      <option value="arte y cultura">Arte y Cultura</option>
                      <option value="inglés">Inglés</option>
                      <option value="educación religiosa">Educación Religiosa</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Nivel Educativo *</label>
                    <select
                      className="input"
                      value={courseForm.level_id || ''}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, level_id: e.target.value ? parseInt(e.target.value) : '' }))}
                    >
                      <option value="">Seleccionar nivel</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Nombre del Curso *</label>
                    {!courseForm.area ? (
                      <div className="relative">
                        <select
                          className="input text-gray-400 bg-gray-50"
                          disabled
                        >
                          <option value="">Primero selecciona un área académica</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const coursesInArea = courses.filter(c => c.area?.toLowerCase() === courseForm.area?.toLowerCase())
                          const hasExistingCourses = coursesInArea.length > 0

                          return !showNewCourseInput && hasExistingCourses ? (
                            <>
                              <select
                                className="input"
                                value={courseForm.name}
                                onChange={(e) => {
                                  if (e.target.value === 'new-course') {
                                    setShowNewCourseInput(true)
                                    setCourseForm(prev => ({ ...prev, name: '' }))
                                  } else {
                                    const selectedCourse = coursesInArea.find(c => c.name === e.target.value)
                                    setCourseForm(prev => ({
                                      ...prev,
                                      name: e.target.value,
                                      description: selectedCourse?.description || prev.description
                                    }))
                                  }
                                }}
                              >
                                <option value="">Seleccionar curso de {courseForm.area}</option>
                                {coursesInArea.map(course => (
                                  <option key={course.id} value={course.name}>
                                    {course.name}
                                  </option>
                                ))}
                                <option value="new-course">+ Crear nuevo curso en {courseForm.area}</option>
                              </select>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="input flex-1"
                                  value={courseForm.name}
                                  onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder={`Ej: Literatura, Gramática, etc.`}
                                  autoFocus
                                />
                                {hasExistingCourses && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowNewCourseInput(false)
                                      setCourseForm(prev => ({ ...prev, name: '' }))
                                    }}
                                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-blue-600">
                                {hasExistingCourses
                                  ? `Estás creando un nuevo curso para el área de ${courseForm.area}`
                                  : `No hay cursos existentes en ${courseForm.area}. Escribe el nombre del nuevo curso.`
                                }
                              </p>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="label">Horas por Semana</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input"
                      value={courseForm.horasSemanales}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, horasSemanales: parseInt(e.target.value) || 4 }))}
                    />
                  </div>

                  <div>
                    <label className="label">Docente Asignado</label>
                    <select
                      className="input"
                      value={courseForm.teacher_id}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, teacher_id: e.target.value }))}
                    >
                      <option value="">Sin asignar</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows="2"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del curso (opcional)..."
                    />
                  </div>
                </div>
              )}

              {modalType === 'competency' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Área Académica *</label>
                    <select
                      className="input"
                      value={competencyForm?.area || ''}
                      onChange={(e) => {
                        const newArea = e.target.value
                        const newCode = generateCompetencyCode(newArea, competencyForm?.level_id)
                        setCompetencyForm(prev => ({ ...prev, area: newArea, code: newCode }))
                      }}
                    >
                      <option value="">Seleccionar área</option>
                      <option value="comunicación">Comunicación</option>
                      <option value="matemáticas">Matemáticas</option>
                      <option value="ciencias">Ciencias</option>
                      <option value="sociales">Ciencias Sociales</option>
                      <option value="arte">Arte y Cultura</option>
                      <option value="educación física">Educación Física</option>
                      <option value="inglés">Inglés</option>
                      <option value="religión">Educación Religiosa</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Nivel Educativo *</label>
                    <select
                      className="input"
                      value={competencyForm?.level_id || ''}
                      onChange={(e) => {
                        const newLevelId = e.target.value ? parseInt(e.target.value) : ''
                        const newCode = generateCompetencyCode(competencyForm?.area, newLevelId)
                        setCompetencyForm(prev => ({ ...prev, level_id: newLevelId, code: newCode }))
                      }}
                    >
                      <option value="">Seleccionar nivel</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Código (Automático)</label>
                    <input
                      type="text"
                      className="input bg-gray-50 cursor-not-allowed"
                      value={competencyForm?.code || ''}
                      readOnly
                      placeholder="Se genera automáticamente"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                    </p>
                  </div>

                  <div>
                    <label className="label">Orden</label>
                    <input
                      type="number"
                      min="1"
                      className="input"
                      value={competencyForm?.order || 1}
                      onChange={(e) => setCompetencyForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Nombre de la Competencia *</label>
                    <input
                      type="text"
                      className="input"
                      value={competencyForm?.name || ''}
                      onChange={(e) => setCompetencyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Lee diversos tipos de textos escritos"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows="2"
                      value={competencyForm?.description || ''}
                      onChange={(e) => setCompetencyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción de la competencia (opcional)..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                onClick={closeModal}
                className="btn btn-outline px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary px-4 py-2"
              >
                {editingItem ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default UniversalModal
