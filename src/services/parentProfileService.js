import { get, put } from './api';

/**
 * Obtener perfil del padre autenticado
 * @returns {Promise<Object>} Perfil del padre
 */
export const getMyProfile = async () => {
  const response = await get('/parent-profile/me');
  return response.data;
};

/**
 * Actualizar perfil del padre autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateMyProfile = async (profileData) => {
  const response = await put('/parent-profile/me', profileData);
  return response.data;
};

/**
 * Obtener hijos del padre autenticado
 * @returns {Promise<Array>} Lista de hijos
 */
export const getMyChildren = async () => {
  const response = await get('/parent-profile/children');
  return response.data;
};

export default {
  getMyProfile,
  updateMyProfile,
  getMyChildren
};
