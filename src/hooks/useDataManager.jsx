/**
 * Custom Hook para inicializar y usar el DataManager
 *
 * Uso:
 * import { useDataManager } from './hooks/useDataManager.jsx';
 *
 * function App() {
 *   const { isReady, stats, error } = useDataManager();
 *
 *   if (!isReady) return <div>Cargando datos...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return <div>App lista!</div>;
 * }
 */

import { useState, useEffect } from 'react';
import { db } from '../utils/dataManager';
import { generateSeedData } from '../data/seeder';

export function useDataManager(options = {}) {
  const {
    autoInitialize = true,
    onReady = null,
    onError = null
  } = options;

  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!autoInitialize) return;

    const initialize = async () => {
      try {
        console.log('🚀 Inicializando DataManager...');

        // Inicializar DataManager
        db.initialize(generateSeedData);

        // Obtener estadísticas
        const dataStats = db.getStats();
        setStats(dataStats);

        // Validar integridad (opcional, solo en desarrollo)
        if (import.meta.env.DEV) {
          const errors = db.validateIntegrity();
          if (errors.length > 0) {
            console.warn('⚠️ Inconsistencias encontradas:', errors);
          } else {
            console.log('✅ Integridad de datos verificada');
          }
        }

        setIsReady(true);
        console.log('✅ DataManager listo');

        // Callback de éxito
        if (onReady) {
          onReady(dataStats);
        }
      } catch (err) {
        console.error('❌ Error al inicializar DataManager:', err);
        setError(err.message);

        // Callback de error
        if (onError) {
          onError(err);
        }
      }
    };

    initialize();
  }, [autoInitialize, onReady, onError]);

  return {
    isReady,
    stats,
    error,
    db // Exponer db para uso directo si es necesario
  };
}

/**
 * Hook para suscribirse a cambios en el DataManager
 */
export function useDataManagerSubscription(callback) {
  useEffect(() => {
    const unsubscribe = db.subscribe(callback);
    return unsubscribe;
  }, [callback]);
}

/**
 * Hook para obtener datos con auto-refresh
 */
export function useDataManagerQuery(entity, filterFn = null, options = {}) {
  const { autoRefresh = false, refreshInterval = 5000 } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    try {
      setLoading(true);
      const result = filterFn ? db.getWhere(entity, filterFn) : db.get(entity);
      setData(result);
    } catch (err) {
      console.error(`Error fetching ${entity}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [entity, filterFn, autoRefresh, refreshInterval]);

  // Suscribirse a cambios en esta entidad
  useDataManagerSubscription(({ action, payload }) => {
    if (payload.entity === entity) {
      fetchData();
    }
  });

  return { data, loading, refetch: fetchData };
}
