import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectorsAPI } from '../utils/api';
import { Plus, Trash2, Edit, Activity, RefreshCw, Wrench, Plug } from 'lucide-react';

const categoryColors = {
  inventory: 'bg-blue-100 text-blue-800',
  payments: 'bg-green-100 text-green-800',
  finance: 'bg-purple-100 text-purple-800',
  crm: 'bg-yellow-100 text-yellow-800',
  analytics: 'bg-pink-100 text-pink-800',
  communication: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  testing: 'bg-yellow-100 text-yellow-800',
};

export default function Connectors() {
  const navigate = useNavigate();
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await connectorsAPI.getAll();
      setConnectors(response.data.connectors);
    } catch (err) {
      setError('Error al cargar los conectores');
      console.error('Error loading connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Estás seguro de eliminar el conector "${name}"?`)) return;

    try {
      await connectorsAPI.delete(id);
      setConnectors(connectors.filter((c) => c._id !== id));
    } catch (err) {
      alert('Error al eliminar el conector');
      console.error('Error deleting connector:', err);
    }
  };

  const handleTest = async (id) => {
    try {
      setTestingId(id);
      setTestResults(prev => ({ ...prev, [id]: null }));
      const res = await connectorsAPI.test(id);
      const data = res.data;
      setTestResults(prev => ({ ...prev, [id]: data }));
      // Recargar lista para reflejar nuevo status y tools
      await loadConnectors();
    } catch (err) {
      setTestResults(prev => ({ ...prev, [id]: { success: false, message: 'Error al probar la conexión' } }));
    } finally {
      setTestingId(null);
    }
  };

  const handleRefreshTools = async (id) => {
    try {
      setRefreshingId(id);
      await connectorsAPI.refreshTools(id);
      await loadConnectors();
    } catch (err) {
      console.error('Error refreshing tools:', err);
    } finally {
      setRefreshingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Conectores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus conexiones a servidores MCP
          </p>
        </div>
        <button
          onClick={() => navigate('/connectors/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Conector
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {connectors.length === 0 ? (
        <div className="text-center py-12 card p-8">
          <Plug size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes conectores configurados
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer conector para empezar a integrar tus aplicaciones
          </p>
          <button
            onClick={() => navigate('/connectors/new')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear primer conector
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {connectors.map((connector) => (
            <div key={connector._id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {connector.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      categoryColors[connector.category]
                    }`}
                  >
                    {connector.category}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    statusColors[connector.status]
                  }`}
                >
                  {connector.status}
                </span>
              </div>

              {connector.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {connector.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Activity size={16} />
                <span>
                  {connector.toolsCache?.length || 0} herramientas
                </span>
                {connector.toolsCache?.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {connector.toolsCache.length}
                  </span>
                )}
              </div>

              {/* Herramientas descubiertas — lista compacta */}
              {connector.toolsCache?.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
                  {connector.toolsCache.slice(0, 5).map(tool => (
                    <div key={tool.name} className="flex items-center gap-1 py-0.5">
                      <Wrench size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate" title={tool.description}>{tool.name}</span>
                    </div>
                  ))}
                  {connector.toolsCache.length > 5 && (
                    <span className="text-xs text-gray-400">+{connector.toolsCache.length - 5} más...</span>
                  )}
                </div>
              )}

              {/* Resultado del test */}
              {testResults[connector._id] && (
                <div className={`mb-3 text-xs px-3 py-2 rounded-lg ${
                  testResults[connector._id].success
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {testResults[connector._id].message}
                  {testResults[connector._id].latencyMs && (
                    <span className="ml-2 opacity-70">{testResults[connector._id].latencyMs}ms</span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleTest(connector._id)}
                  disabled={testingId === connector._id}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Probar conexión y descubrir herramientas"
                >
                  <RefreshCw size={16} className={testingId === connector._id ? 'animate-spin' : ''} />
                  {testingId === connector._id ? 'Probando...' : 'Probar'}
                </button>
                <button
                  onClick={() => handleRefreshTools(connector._id)}
                  disabled={refreshingId === connector._id || connector.status !== 'active'}
                  className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Actualizar herramientas"
                >
                  <Wrench size={16} className={refreshingId === connector._id ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => navigate(`/connectors/${connector._id}/edit`)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(connector._id, connector.name)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
