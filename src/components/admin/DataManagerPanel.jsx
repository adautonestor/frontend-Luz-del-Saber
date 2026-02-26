/**
 * DATA MANAGER PANEL
 * Panel de administración para gestión y debugging de datos
 *
 * Características:
 * - Visualización de estadísticas
 * - Validación de integridad
 * - Reset de datos
 * - Exportar/Importar
 * - Búsqueda global
 * - Creación manual de registros
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../utils/dataManager';
import { generateSeedData } from '../../data/seeder';

const DataManagerPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setStats(db.getStats());
  };

  const handleValidateIntegrity = () => {
    setIsValidating(true);
    setTimeout(() => {
      const errors = db.validateIntegrity();
      setValidationErrors(errors);
      setIsValidating(false);
    }, 100);
  };

  const handleReset = () => {
    const success = db.reset(generateSeedData);
    if (success) {
      loadStats();
      setValidationErrors([]);
      alert('✅ Datos reseteados exitosamente');
    }
  };

  const handleExport = () => {
    db.export();
    alert('✅ Datos exportados exitosamente');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target.result;
        db.import(jsonData);
        loadStats();
        alert('✅ Datos importados exitosamente');
      } catch (error) {
        alert(`❌ Error al importar: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults({});
      return;
    }
    const results = db.search(searchQuery);
    setSearchResults(results);
  };

  const handleClearStorage = () => {
    if (confirm('⚠️ ¿Estás seguro? Esto eliminará TODOS los datos sin recuperación.')) {
      localStorage.clear();
      alert('✅ LocalStorage limpiado. Recarga la página para generar datos nuevos.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔧 Data Manager Panel</h1>
      <p style={styles.subtitle}>Panel de administración y debugging de datos</p>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'stats' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('stats')}
        >
          📊 Estadísticas
        </button>
        <button
          style={activeTab === 'validation' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('validation')}
        >
          🔍 Validación
        </button>
        <button
          style={activeTab === 'search' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('search')}
        >
          🔎 Búsqueda
        </button>
        <button
          style={activeTab === 'actions' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('actions')}
        >
          ⚙️ Acciones
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* ESTADÍSTICAS */}
        {activeTab === 'stats' && (
          <div>
            <h2 style={styles.sectionTitle}>📊 Estadísticas del Sistema</h2>
            <div style={styles.statsGrid}>
              {Object.entries(stats).map(([entity, count]) => (
                <div key={entity} style={styles.statCard}>
                  <div style={styles.statCount}>{count}</div>
                  <div style={styles.statLabel}>{entity}</div>
                </div>
              ))}
            </div>
            <button onClick={loadStats} style={styles.button}>
              🔄 Actualizar Estadísticas
            </button>
          </div>
        )}

        {/* VALIDACIÓN */}
        {activeTab === 'validation' && (
          <div>
            <h2 style={styles.sectionTitle}>🔍 Validación de Integridad</h2>
            <p style={styles.description}>
              Verifica que todas las relaciones entre entidades sean válidas y no existan datos huérfanos.
            </p>

            <button
              onClick={handleValidateIntegrity}
              style={styles.buttonPrimary}
              disabled={isValidating}
            >
              {isValidating ? '⏳ Validando...' : '🔍 Validar Integridad'}
            </button>

            {validationErrors.length === 0 && !isValidating && (
              <div style={styles.successBox}>
                <h3 style={styles.successTitle}>✅ ¡Todo en orden!</h3>
                <p>No se encontraron inconsistencias en los datos.</p>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div style={styles.errorBox}>
                <h3 style={styles.errorTitle}>❌ Se encontraron {validationErrors.length} inconsistencias:</h3>
                <ul style={styles.errorList}>
                  {validationErrors.map((error, index) => (
                    <li key={index} style={styles.errorItem}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* BÚSQUEDA */}
        {activeTab === 'search' && (
          <div>
            <h2 style={styles.sectionTitle}>🔎 Búsqueda Global</h2>
            <p style={styles.description}>
              Busca en todas las entidades del sistema por cualquier texto.
            </p>

            <div style={styles.searchBox}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar en todas las entidades..."
                style={styles.searchInput}
              />
              <button onClick={handleSearch} style={styles.buttonPrimary}>
                🔎 Buscar
              </button>
            </div>

            {Object.keys(searchResults).length > 0 && (
              <div style={styles.resultsContainer}>
                <h3 style={styles.resultsTitle}>
                  Resultados ({Object.values(searchResults).reduce((sum, items) => sum + items.length, 0)} encontrados)
                </h3>
                {Object.entries(searchResults).map(([entity, items]) => (
                  <div key={entity} style={styles.resultSection}>
                    <h4 style={styles.resultEntity}>{entity} ({items.length})</h4>
                    <div style={styles.resultItems}>
                      {items.map((item, index) => (
                        <pre key={index} style={styles.resultItem}>
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCIONES */}
        {activeTab === 'actions' && (
          <div>
            <h2 style={styles.sectionTitle}>⚙️ Acciones del Sistema</h2>

            <div style={styles.actionSection}>
              <h3 style={styles.actionTitle}>🔄 Reset Completo</h3>
              <p style={styles.actionDescription}>
                Elimina todos los datos y ejecuta el seeder nuevamente. Útil para empezar de cero.
              </p>
              <button onClick={handleReset} style={styles.buttonDanger}>
                🔄 Resetear Datos
              </button>
            </div>

            <div style={styles.actionSection}>
              <h3 style={styles.actionTitle}>📥 Exportar Datos</h3>
              <p style={styles.actionDescription}>
                Descarga todos los datos en formato JSON como backup.
              </p>
              <button onClick={handleExport} style={styles.buttonPrimary}>
                📥 Exportar JSON
              </button>
            </div>

            <div style={styles.actionSection}>
              <h3 style={styles.actionTitle}>📤 Importar Datos</h3>
              <p style={styles.actionDescription}>
                Carga datos desde un archivo JSON previamente exportado.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={styles.fileInput}
              />
            </div>

            <div style={styles.actionSection}>
              <h3 style={styles.actionTitle}>🗑️ Limpiar LocalStorage</h3>
              <p style={styles.actionDescription}>
                Elimina TODOS los datos sin generar nuevos. Requiere recarga manual.
              </p>
              <button onClick={handleClearStorage} style={styles.buttonDanger}>
                🗑️ Limpiar Todo
              </button>
            </div>

            <div style={styles.actionSection}>
              <h3 style={styles.actionTitle}>📊 Ver Datos Completos</h3>
              <p style={styles.actionDescription}>
                Abre la consola del navegador y ejecuta: <code>db.data</code>
              </p>
              <button
                onClick={() => {
                  console.log('📊 Datos completos:', db.data);
                  alert('✅ Datos mostrados en la consola (F12)');
                }}
                style={styles.button}
              >
                📊 Mostrar en Consola
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 <strong>Tip:</strong> Usa el panel de validación antes de hacer testing para asegurar que todos los datos sean consistentes.
        </p>
        <p style={styles.footerText}>
          🔧 Para usar el DataManager en tus componentes: <code>import {'{ db }'} from '@/utils/dataManager'</code>
        </p>
      </div>
    </div>
  );
};

// Estilos inline para mayor portabilidad
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#1a202c'
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '24px'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '24px'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#718096',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s'
  },
  tabActive: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#3182ce',
    borderBottom: '2px solid #3182ce',
    marginBottom: '-2px'
  },
  content: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minHeight: '400px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#2d3748'
  },
  description: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    background: '#f7fafc',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },
  statCount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3182ce'
  },
  statLabel: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '4px',
    textTransform: 'capitalize'
  },
  button: {
    padding: '10px 20px',
    background: '#edf2f7',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
    transition: 'all 0.2s'
  },
  buttonPrimary: {
    padding: '10px 20px',
    background: '#3182ce',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    transition: 'all 0.2s'
  },
  buttonDanger: {
    padding: '10px 20px',
    background: '#e53e3e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    transition: 'all 0.2s'
  },
  successBox: {
    background: '#f0fff4',
    border: '1px solid #9ae6b4',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px'
  },
  successTitle: {
    color: '#22543d',
    fontSize: '18px',
    marginBottom: '8px'
  },
  errorBox: {
    background: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px'
  },
  errorTitle: {
    color: '#742a2a',
    fontSize: '18px',
    marginBottom: '12px'
  },
  errorList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  errorItem: {
    padding: '8px',
    background: '#feb2b2',
    color: '#742a2a',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  searchBox: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontSize: '14px'
  },
  resultsContainer: {
    marginTop: '24px'
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#2d3748'
  },
  resultSection: {
    marginBottom: '24px'
  },
  resultEntity: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#3182ce',
    marginBottom: '12px',
    textTransform: 'capitalize'
  },
  resultItems: {
    maxHeight: '300px',
    overflowY: 'auto'
  },
  resultItem: {
    background: '#f7fafc',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize: '12px',
    overflow: 'auto'
  },
  actionSection: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#2d3748'
  },
  actionDescription: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '12px'
  },
  fileInput: {
    padding: '8px',
    fontSize: '14px'
  },
  footer: {
    marginTop: '32px',
    padding: '16px',
    background: '#edf2f7',
    borderRadius: '8px',
    fontSize: '14px'
  },
  footerText: {
    color: '#4a5568',
    marginBottom: '8px'
  }
};

export default DataManagerPanel;
