/**
 * Utilidades para manejo de fechas
 * Soluciona problemas de zona horaria con fechas DATE de PostgreSQL
 * Zona horaria: America/Lima (UTC-5)
 */

/**
 * Parsea una fecha DATE de PostgreSQL (YYYY-MM-DD) sin problema de zona horaria
 *
 * Problema: new Date('2025-11-06') → interpreta como UTC medianoche → en Lima (UTC-5) retrocede al día anterior
 * Solución: Parsear como fecha local usando el constructor de Date con componentes separados
 *
 * @param {string|Date} dateString - Fecha en formato 'YYYY-MM-DD' o objeto Date
 * @returns {Date|null} - Objeto Date en hora local sin problema de zona horaria
 *
 * @example
 * // En navegador con zona horaria Lima (UTC-5):
 * new Date('2025-11-06') → 2025-11-05 19:00:00 (INCORRECTO)
 * parseDateOnly('2025-11-06') → 2025-11-06 00:00:00 (CORRECTO)
 */
export const parseDateOnly = (dateString) => {
  if (!dateString) return null;

  // Si ya es un objeto Date, retornarlo
  if (dateString instanceof Date) return dateString;

  // Si no es string, retornar null
  if (typeof dateString !== 'string') return null;

  // Extraer año, mes, día del formato YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));

  // Crear Date en zona horaria local (mes es 0-indexed)
  return new Date(year, month - 1, day);
};

/**
 * Formatea una fecha DATE de PostgreSQL a formato dd/MM/yyyy
 * Maneja correctamente la zona horaria
 *
 * @param {string|Date} dateString - Fecha en formato 'YYYY-MM-DD' o objeto Date
 * @param {object} options - Opciones de formato (locale, etc)
 * @returns {string} - Fecha formateada
 */
export const formatDateOnly = (dateString, options = {}) => {
  const date = parseDateOnly(dateString);
  if (!date) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Obtiene la fecha actual en zona horaria de Lima (Perú)
 * Usa Intl.DateTimeFormat para consistencia entre navegadores
 * @returns {string} - Fecha en formato 'YYYY-MM-DD'
 */
export const getTodayLima = () => {
  // Usar 'en-CA' locale que retorna formato YYYY-MM-DD (ISO)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

/**
 * Obtiene la fecha y hora actual en zona horaria de Lima (Perú)
 * NOTA: El objeto Date retornado tiene valores de Lima pero el timestamp
 *       interno puede no corresponder al instante real.
 *       Para persistir, usar new Date() directamente.
 * @returns {Date} - Objeto Date con valores de Lima para mostrar
 * @deprecated Preferir usar getTodayLima() para fechas y formatDateTime() para mostrar
 */
export const getNowLima = () => {
  // Usar Intl para obtener la representación string en Lima
  const limaString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());

  // Parsear el string para crear un Date con esos valores
  // Formato: MM/DD/YYYY, HH:MM:SS
  const [datePart, timePart] = limaString.split(', ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
};

/**
 * Obtiene la hora actual en Lima en formato HH:MM:SS
 * @returns {string} - Hora en formato 'HH:MM:SS'
 */
export const getTimeLima = () => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
};

/**
 * Formatea hora desde timestamp a formato HH:mm:ss
 * @param {string|Date} timestamp - Timestamp con hora
 * @returns {string} - Hora formateada
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-PE', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Formatea fecha y hora desde timestamp
 * @param {string|Date} timestamp - Timestamp completo
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Verifica si una fecha es pasada (antes de hoy)
 * @param {string|Date} dateString - Fecha a verificar
 * @returns {boolean} - true si es antes de hoy
 */
export const isPastDate = (dateString) => {
  const date = parseDateOnly(dateString);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Formatea cualquier tipo de fecha (DATE, TIMESTAMP, ISO) a formato dd/MM/yyyy
 * Maneja correctamente:
 * - Fechas ISO con Z: '2016-10-04T05:00:00.000Z'
 * - Fechas DATE: '2016-10-04'
 * - Objetos Date
 * - Timestamps con zona horaria
 *
 * @param {string|Date} dateInput - Fecha en cualquier formato
 * @returns {string} - Fecha formateada como dd/MM/yyyy o '-' si es inválida
 */
export const formatDateSafe = (dateInput) => {
  if (!dateInput) return '-';

  try {
    let date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Si es formato DATE puro (YYYY-MM-DD), usar parseDateOnly para evitar desfase
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return formatDateOnly(dateInput);
      }

      // Para timestamps ISO o con zona horaria, usar toLocaleString con timeZone
      date = new Date(dateInput);
    } else {
      return '-';
    }

    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) return '-';

    // Formatear usando la zona horaria de Lima
    return date.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '-';
  }
};

/**
 * Formatea fecha y hora de manera segura para cualquier tipo de entrada
 * @param {string|Date} dateInput - Fecha/hora en cualquier formato
 * @returns {string} - Fecha y hora formateada o '-' si es inválida
 */
export const formatDateTimeSafe = (dateInput) => {
  if (!dateInput) return '-';

  try {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formateando fecha/hora:', error);
    return '-';
  }
};

/**
 * Traduce el código de sexo a texto completo
 * @param {string} genderCode - 'M' o 'F'
 * @returns {string} - 'Masculino', 'Femenino' o el valor original
 */
export const formatGender = (genderCode) => {
  if (!genderCode) return '-';

  const genderMap = {
    'M': 'Masculino',
    'F': 'Femenino',
    'm': 'Masculino',
    'f': 'Femenino'
  };

  return genderMap[genderCode] || genderCode;
};

/**
 * Traduce el estado del estudiante a español
 * @param {string} status - Estado en inglés o español
 * @returns {string} - Estado traducido
 */
export const formatStudentStatus = (status) => {
  if (!status) return '-';

  const statusMap = {
    // Estados de estudiante
    'enrolled': 'Matriculado',
    'active': 'Activo',
    'inactive': 'Retirado',
    'transferred': 'Trasladado',
    'graduated': 'Egresado',
    'pending': 'Pendiente',
    // Ya en español
    'activo': 'Activo',
    'matriculado': 'Matriculado',
    'retirado': 'Retirado',
    'trasladado': 'Trasladado',
    'egresado': 'Egresado',
    'pendiente': 'Pendiente'
  };

  const lowerStatus = status.toLowerCase();
  return statusMap[lowerStatus] || status;
};
