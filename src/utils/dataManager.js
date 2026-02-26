/**
 * DATA MANAGER
 * Sistema centralizado de gestión de datos con validación de integridad
 *
 * Características:
 * - Persistencia en localStorage
 * - Validación de relaciones antes de crear/actualizar
 * - Helpers para consultas comunes
 * - Detección automática de inconsistencias
 * - Migración fácil a backend (solo cambia la implementación)
 */

import { DB_SCHEMA, ENTITY_RELATIONSHIPS } from '../data/schema';

const STORAGE_KEY = 'luz_del_saber_db';
const VERSION_KEY = 'luz_del_saber_db_version';
const CURRENT_VERSION = '1.0.0';

class DataManager {
  constructor() {
    this.data = null;
    this.listeners = new Map(); // Para observadores de cambios
  }

  // ========== INICIALIZACIÓN Y PERSISTENCIA ==========

  /**
   * Inicializa el data manager
   * Si hay datos en localStorage, los carga
   * Si no, ejecuta el seeder
   */
  initialize(seedFunction) {
    console.log('🔄 Inicializando Data Manager...');

    const stored = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(VERSION_KEY);

    if (stored && version === CURRENT_VERSION) {
      console.log('✅ Datos encontrados en localStorage');
      this.data = JSON.parse(stored);
    } else {
      console.log('🌱 Generando datos iniciales desde seeder...');
      if (version && version !== CURRENT_VERSION) {
        console.warn(`⚠️ Versión antigua detectada (${version}). Reseteando datos...`);
      }
      this.data = seedFunction();
      this.save();
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }

    console.log('📊 Datos cargados:', this.getStats());
    return this.data;
  }

  /**
   * Guarda los datos en localStorage
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      console.log('💾 Datos guardados en localStorage');
      this.notifyListeners('save');
    } catch (error) {
      console.error('❌ Error al guardar en localStorage:', error);
      throw new Error('No se pudieron guardar los datos. Espacio insuficiente en localStorage.');
    }
  }

  /**
   * Resetea todos los datos y ejecuta el seeder nuevamente
   */
  reset(seedFunction) {
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará TODOS los datos.')) {
      return false;
    }

    console.log('🗑️ Reseteando datos...');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);

    this.data = seedFunction();
    this.save();
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);

    console.log('✅ Datos reseteados exitosamente');
    this.notifyListeners('reset');
    return true;
  }

  /**
   * Exporta los datos como JSON
   */
  export() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luz_del_saber_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('📥 Datos exportados exitosamente');
  }

  /**
   * Importa datos desde un JSON
   */
  import(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.data = parsed;
      this.save();
      console.log('📤 Datos importados exitosamente');
      this.notifyListeners('import');
      return true;
    } catch (error) {
      console.error('❌ Error al importar datos:', error);
      throw new Error('Datos inválidos. Verifica el formato JSON.');
    }
  }

  // ========== GETTERS BÁSICOS ==========

  /**
   * Obtiene todos los registros de una entidad
   */
  get(entity) {
    if (!this.data[entity]) {
      console.warn(`⚠️ Entidad "${entity}" no existe en el schema`);
      return [];
    }
    return this.data[entity];
  }

  /**
   * Obtiene un registro por ID
   */
  getById(entity, id) {
    return this.get(entity).find(item => item.id === id);
  }

  /**
   * Obtiene registros que coincidan con un filtro
   */
  getWhere(entity, filterFn) {
    return this.get(entity).filter(filterFn);
  }

  /**
   * Obtiene un registro que coincida con un filtro
   */
  getOneWhere(entity, filterFn) {
    return this.get(entity).find(filterFn);
  }

  // ========== VALIDACIONES ==========

  /**
   * Valida que una entidad relacionada exista
   * @throws Error si no existe
   */
  validateRelation(entity, id, context = '') {
    const item = this.getById(entity, id);
    if (!item) {
      const errorMsg = `❌ INCONSISTENCIA${context ? ` [${context}]` : ''}: No existe ${entity} con id="${id}"`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    return item;
  }

  /**
   * Valida múltiples relaciones a la vez
   */
  validateRelations(relations, context = '') {
    const results = {};
    for (const [entity, id] of Object.entries(relations)) {
      results[entity] = this.validateRelation(entity, id, context);
    }
    return results;
  }

  /**
   * Valida que un ID sea único en una entidad
   */
  validateUniqueId(entity, id) {
    const existing = this.getById(entity, id);
    if (existing) {
      throw new Error(`❌ Ya existe un registro en ${entity} con id="${id}"`);
    }
    return true;
  }

  // ========== CRUD CON VALIDACIÓN ==========

  /**
   * Crea un nuevo registro con validación de relaciones
   */
  create(entity, data, options = {}) {
    const { skipValidation = false, autoGenerateId = true } = options;

    // Generar ID si es necesario
    if (autoGenerateId && !data.id) {
      data.id = this.generateId(entity);
    }

    // Validar ID único
    if (data.id) {
      this.validateUniqueId(entity, data.id);
    }

    // Validar relaciones si no se salta la validación
    if (!skipValidation) {
      const dependencies = ENTITY_RELATIONSHIPS[entity] || [];
      for (const depEntity of dependencies) {
        const idField = `${depEntity.slice(0, -1)}Id`; // ejemplo: 'padres' -> 'parent_id'
        if (data[idField]) {
          this.validateRelation(depEntity, data[idField], `Crear ${entity}`);
        }
      }
    }

    // Agregar timestamp
    data.createdAt = new Date().toISOString();

    // Insertar
    this.data[entity].push(data);
    this.save();

    console.log(`✅ Creado en ${entity}:`, data.id);
    this.notifyListeners('create', { entity, data });
    return data;
  }

  /**
   * Actualiza un registro existente
   */
  update(entity, id, updates) {
    const index = this.data[entity].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`❌ No existe registro en ${entity} con id="${id}"`);
    }

    // Actualizar
    this.data[entity][index] = {
      ...this.data[entity][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    console.log(`✅ Actualizado en ${entity}:`, id);
    this.notifyListeners('update', { entity, id, updates });
    return this.data[entity][index];
  }

  /**
   * Elimina un registro (con validación de dependencias)
   */
  delete(entity, id, options = {}) {
    const { force = false } = options;

    // Verificar que existe
    const item = this.getById(entity, id);
    if (!item) {
      throw new Error(`❌ No existe registro en ${entity} con id="${id}"`);
    }

    // Verificar dependencias si no es forzado
    if (!force) {
      const dependencies = this.findDependencies(entity, id);
      if (dependencies.length > 0) {
        throw new Error(
          `❌ No se puede eliminar. Existen ${dependencies.length} dependencias:\n` +
          dependencies.map(d => `- ${d.entity}: ${d.count} registros`).join('\n')
        );
      }
    }

    // Eliminar
    this.data[entity] = this.data[entity].filter(item => item.id !== id);
    this.save();

    console.log(`✅ Eliminado de ${entity}:`, id);
    this.notifyListeners('delete', { entity, id });
    return true;
  }

  /**
   * Encuentra registros que dependen de un ID
   */
  findDependencies(entity, id) {
    const dependencies = [];
    const idField = `${entity.slice(0, -1)}Id`; // 'padres' -> 'parent_id'

    for (const [depEntity, relationships] of Object.entries(ENTITY_RELATIONSHIPS)) {
      if (relationships.includes(entity)) {
        const count = this.getWhere(depEntity, item => item[idField] === id).length;
        if (count > 0) {
          dependencies.push({ entity: depEntity, count });
        }
      }
    }

    return dependencies;
  }

  // ========== HELPERS ESPECÍFICOS ==========

  /**
   * Crea un estudiante CON validaciones y relaciones automáticas
   */
  createEstudiante(data) {
    // Validar padre existe
    if (data.parent_id) {
      this.validateRelation('padres', data.parent_id, 'Crear Estudiante');
    }

    // Validar aula existe (si se especifica)
    if (data.aulaId) {
      this.validateRelation('aulas', data.aulaId, 'Crear Estudiante');
    }

    // Crear estudiante
    const estudiante = this.create('estudiantes', data);

    // Crear relación padre-hijo automáticamente
    if (data.parent_id) {
      this.create('padre_hijo', {
        parent_id: data.parent_id,
        student_id: estudiante.id,
        tipoPadre: data.tipoPadre || 'padre'
      });
      console.log(`🔗 Relación padre-hijo creada: ${data.parent_id} -> ${estudiante.id}`);
    }

    // Crear matrícula si se especifica aula
    if (data.aulaId && data.year) {
      this.create('matriculas', {
        student_id: estudiante.id,
        aulaId: data.aulaId,
        year: data.year,
        fechaMatricula: new Date().toISOString().split('T')[0],
        state: 'activo'
      });
      console.log(`🎓 Matrícula creada: ${estudiante.id} -> ${data.aulaId}`);
    }

    return estudiante;
  }

  /**
   * Crea una nota CON validaciones completas
   */
  createNota(data) {
    // Validar estudiante existe
    const estudiante = this.validateRelation('estudiantes', data.student_id, 'Crear Nota');

    // Validar curso existe
    this.validateRelation('cursos', data.course_id, 'Crear Nota');

    // Validar periodo existe
    this.validateRelation('periodos', data.periodoId, 'Crear Nota');

    // Validar profesor existe (si se especifica)
    if (data.teacher_id) {
      this.validateRelation('profesores', data.teacher_id, 'Crear Nota');
    }

    // Validar que el estudiante esté matriculado
    const matricula = this.getOneWhere('matriculas', m =>
      m.student_id === data.student_id &&
      (data.year ? m.year === data.year : true)
    );

    if (!matricula) {
      throw new Error(`❌ El estudiante ${estudiante.name} no está matriculado`);
    }

    // Agregar aulaId automáticamente desde la matrícula
    data.aulaId = matricula.aulaId;

    // Crear nota
    return this.create('notas', data);
  }

  /**
   * Crea un horario CON validaciones
   */
  createHorario(data) {
    // Validar aula existe
    this.validateRelation('aulas', data.aulaId, 'Crear Horario');

    // Validar profesor existe
    this.validateRelation('profesores', data.teacher_id, 'Crear Horario');

    // Validar curso existe
    this.validateRelation('cursos', data.course_id, 'Crear Horario');

    // Verificar que no exista conflicto de horario
    const conflicto = this.getOneWhere('horarios', h =>
      h.aulaId === data.aulaId &&
      h.dia === data.dia &&
      h.horaInicio === data.horaInicio &&
      h.year === data.year
    );

    if (conflicto) {
      throw new Error(`❌ Ya existe un horario para ${data.dia} a las ${data.horaInicio} en esta aula`);
    }

    return this.create('horarios', data);
  }

  // ========== QUERIES COMPLEJAS ==========

  /**
   * Obtiene los hijos de un padre
   */
  getHijosByPadre(padreId) {
    const relaciones = this.getWhere('padre_hijo', r => r.parent_id === padreId);
    return relaciones.map(r => this.getById('estudiantes', r.student_id)).filter(Boolean);
  }

  /**
   * Obtiene las notas de un estudiante CON información relacionada
   */
  getNotasEstudiante(estudianteId, periodoId = null, options = {}) {
    const { enrich = true } = options;

    let notas = this.getWhere('notas', n => n.student_id === estudianteId);

    if (periodoId) {
      notas = notas.filter(n => n.periodoId === periodoId);
    }

    // Enriquecer con información relacionada
    if (enrich) {
      return notas.map(nota => ({
        ...nota,
        curso: this.getById('cursos', nota.course_id),
        periodo: this.getById('periodos', nota.periodoId),
        profesor: this.getById('profesores', nota.teacher_id),
        aula: this.getById('aulas', nota.aulaId)
      }));
    }

    return notas;
  }

  /**
   * Obtiene estudiantes de un aula
   */
  getEstudiantesByAula(aulaId, year = null) {
    let matriculas = this.getWhere('matriculas', m => m.aulaId === aulaId);

    if (year) {
      matriculas = matriculas.filter(m => m.year === year);
    }

    return matriculas
      .map(m => this.getById('estudiantes', m.student_id))
      .filter(Boolean);
  }

  /**
   * Obtiene el horario de un aula CON información relacionada
   */
  getHorarioByAula(aulaId, year = null) {
    let horarios = this.getWhere('horarios', h => h.aulaId === aulaId);

    if (year) {
      horarios = horarios.filter(h => h.year === year);
    }

    return horarios.map(h => ({
      ...h,
      curso: this.getById('cursos', h.course_id),
      profesor: this.getById('profesores', h.teacher_id),
      aula: this.getById('aulas', h.aulaId)
    }));
  }

  /**
   * Obtiene los cursos asignados a un profesor
   */
  getCursosByProfesor(profesorId, year = null) {
    let asignaciones = this.getWhere('profesor_curso', pc => pc.teacher_id === profesorId);

    if (year) {
      asignaciones = asignaciones.filter(pc => pc.year === year);
    }

    return asignaciones.map(pc => ({
      ...pc,
      curso: this.getById('cursos', pc.course_id),
      aula: this.getById('aulas', pc.aulaId)
    }));
  }

  /**
   * Obtiene el padre de un estudiante
   */
  getPadreByEstudiante(estudianteId) {
    const relacion = this.getOneWhere('padre_hijo', r => r.student_id === estudianteId);
    return relacion ? this.getById('padres', relacion.parent_id) : null;
  }

  // ========== VALIDACIÓN DE INTEGRIDAD ==========

  /**
   * Valida la integridad de TODOS los datos
   * Retorna un array de errores encontrados
   */
  validateIntegrity() {
    const errors = [];

    console.log('🔍 Validando integridad de datos...');

    // Validar padre_hijo
    this.get('padre_hijo').forEach(rel => {
      if (!this.getById('padres', rel.parent_id)) {
        errors.push(`Relación padre-hijo ${rel.id}: padre "${rel.parent_id}" no existe`);
      }
      if (!this.getById('estudiantes', rel.student_id)) {
        errors.push(`Relación padre-hijo ${rel.id}: estudiante "${rel.student_id}" no existe`);
      }
    });

    // Validar notas
    this.get('notas').forEach(nota => {
      if (!this.getById('estudiantes', nota.student_id)) {
        errors.push(`Nota ${nota.id}: estudiante "${nota.student_id}" no existe`);
      }
      if (!this.getById('cursos', nota.course_id)) {
        errors.push(`Nota ${nota.id}: curso "${nota.course_id}" no existe`);
      }
      if (!this.getById('periodos', nota.periodoId)) {
        errors.push(`Nota ${nota.id}: periodo "${nota.periodoId}" no existe`);
      }
    });

    // Validar horarios
    this.get('horarios').forEach(horario => {
      if (!this.getById('aulas', horario.aulaId)) {
        errors.push(`Horario ${horario.id}: aula "${horario.aulaId}" no existe`);
      }
      if (!this.getById('profesores', horario.teacher_id)) {
        errors.push(`Horario ${horario.id}: profesor "${horario.teacher_id}" no existe`);
      }
      if (!this.getById('cursos', horario.course_id)) {
        errors.push(`Horario ${horario.id}: curso "${horario.course_id}" no existe`);
      }
    });

    // Validar matriculas
    this.get('matriculas').forEach(mat => {
      if (!this.getById('estudiantes', mat.student_id)) {
        errors.push(`Matrícula ${mat.id}: estudiante "${mat.student_id}" no existe`);
      }
      if (!this.getById('aulas', mat.aulaId)) {
        errors.push(`Matrícula ${mat.id}: aula "${mat.aulaId}" no existe`);
      }
    });

    // Validar profesor_curso
    this.get('profesor_curso').forEach(pc => {
      if (!this.getById('profesores', pc.teacher_id)) {
        errors.push(`Asignación ${pc.id}: profesor "${pc.teacher_id}" no existe`);
      }
      if (!this.getById('cursos', pc.course_id)) {
        errors.push(`Asignación ${pc.id}: curso "${pc.course_id}" no existe`);
      }
      if (!this.getById('aulas', pc.aulaId)) {
        errors.push(`Asignación ${pc.id}: aula "${pc.aulaId}" no existe`);
      }
    });

    if (errors.length === 0) {
      console.log('✅ Integridad OK: No se encontraron inconsistencias');
    } else {
      console.error(`❌ Se encontraron ${errors.length} inconsistencias:`, errors);
    }

    return errors;
  }

  // ========== UTILIDADES ==========

  /**
   * Genera un ID único para una entidad
   */
  generateId(entity) {
    const items = this.get(entity);
    if (items.length === 0) return '1';

    // Extraer números de los IDs existentes
    const numericIds = items
      .map(item => {
        const match = item.id?.toString().match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(n => !isNaN(n));

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  }

  /**
   * Obtiene estadísticas de los datos
   */
  getStats() {
    const stats = {};
    for (const entity in this.data) {
      stats[entity] = Array.isArray(this.data[entity]) ? this.data[entity].length : 0;
    }
    return stats;
  }

  /**
   * Busca en múltiples entidades
   */
  search(query, entities = null) {
    const results = {};
    const searchEntities = entities || Object.keys(this.data);
    const lowerQuery = query.toLowerCase();

    for (const entity of searchEntities) {
      const matches = this.get(entity).filter(item => {
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(lowerQuery);
      });

      if (matches.length > 0) {
        results[entity] = matches;
      }
    }

    return results;
  }

  // ========== OBSERVADORES ==========

  /**
   * Suscribe un listener a cambios en los datos
   */
  subscribe(callback) {
    const id = Date.now() + Math.random();
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  /**
   * Notifica a todos los listeners
   */
  notifyListeners(action, payload = {}) {
    this.listeners.forEach(callback => {
      try {
        callback({ action, payload, data: this.data });
      } catch (error) {
        console.error('Error en listener:', error);
      }
    });
  }
}

// Exportar instancia única (Singleton)
export const db = new DataManager();

// Exportar clase para testing
export { DataManager };
