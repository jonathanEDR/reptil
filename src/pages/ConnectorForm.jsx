import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connectorsAPI } from '../utils/api';
import { ArrowLeft, Save } from 'lucide-react';

const categories = [
  { value: 'inventory', label: 'Inventario' },
  { value: 'payments', label: 'Pagos' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'crm', label: 'CRM' },
  { value: 'analytics', label: 'Analítica' },
  { value: 'communication', label: 'Comunicación' },
  { value: 'other', label: 'Otro' },
];

const connectionTypes = [
  { value: 'http_sse', label: 'HTTP con Server-Sent Events' },
  { value: 'websocket', label: 'WebSocket' },
  { value: 'stdio', label: 'Standard I/O (local)' },
];

const authTypes = [
  { value: 'none', label: 'Sin autenticación' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'api_key', label: 'API Key' },
];

export default function ConnectorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    connection: {
      type: 'http_sse',
      url: '',
      authType: 'none',
      credentials: {
        apiKey: '',
        token: '',
        secret: '',
      },
      timeout: 30000,
    },
  });

  useEffect(() => {
    if (isEditing) {
      loadConnector();
    }
  }, [id]);

  const loadConnector = async () => {
    try {
      setLoading(true);
      const response = await connectorsAPI.getOne(id);
      const connector = response.data.connector;
      
      setFormData({
        name: connector.name,
        description: connector.description || '',
        category: connector.category,
        connection: {
          type: connector.connection.type,
          url: connector.connection.url || '',
          authType: connector.connection.authType,
          credentials: {
            apiKey: '',
            token: '',
            secret: '',
          },
          timeout: connector.connection.timeout || 30000,
        },
      });
    } catch (err) {
      setError('Error al cargar el conector');
      console.error('Error loading connector:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('connection.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        connection: {
          ...formData.connection,
          [field]: value,
        },
      });
    } else if (name.startsWith('credentials.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        connection: {
          ...formData.connection,
          credentials: {
            ...formData.connection.credentials,
            [field]: value,
          },
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (isEditing) {
        await connectorsAPI.update(id, formData);
      } else {
        await connectorsAPI.create(formData);
      }

      navigate('/connectors');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Error al guardar el conector'
      );
      console.error('Error saving connector:', err);
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/connectors')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Editar Conector' : 'Nuevo Conector'}
        </h1>
        <p className="text-gray-600 mt-1">
          Configura la conexión a tu servidor MCP
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Información básica */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información Básica
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Nombre del Conector *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="ej: Sistema de Inventarios"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="label">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows={3}
                placeholder="Describe qué hace este conector..."
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="category" className="label">
                Categoría *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de conexión */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configuración de Conexión
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="connection.type" className="label">
                Tipo de Conexión *
              </label>
              <select
                id="connection.type"
                name="connection.type"
                value={formData.connection.type}
                onChange={handleChange}
                className="input"
                required
              >
                {connectionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                HTTP/SSE es el método recomendado para servidores remotos
              </p>
            </div>

            {formData.connection.type !== 'stdio' && (
              <div>
                <label htmlFor="connection.url" className="label">
                  URL del Servidor MCP *
                </label>
                <input
                  type="url"
                  id="connection.url"
                  name="connection.url"
                  value={formData.connection.url}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://tu-servidor.com/mcp"
                  required={formData.connection.type !== 'stdio'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Debe ser una URL HTTPS válida en producción
                </p>
              </div>
            )}

            <div>
              <label htmlFor="connection.authType" className="label">
                Tipo de Autenticación *
              </label>
              <select
                id="connection.authType"
                name="connection.authType"
                value={formData.connection.authType}
                onChange={handleChange}
                className="input"
                required
              >
                {authTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.connection.authType === 'bearer' && (
              <div>
                <label htmlFor="credentials.token" className="label">
                  Bearer Token
                </label>
                <input
                  type="password"
                  id="credentials.token"
                  name="credentials.token"
                  value={formData.connection.credentials.token}
                  onChange={handleChange}
                  className="input"
                  placeholder={isEditing ? '(sin cambios)' : 'Tu token aquí'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Cifrado de forma segura
                </p>
              </div>
            )}

            {formData.connection.authType === 'api_key' && (
              <div>
                <label htmlFor="credentials.apiKey" className="label">
                  API Key
                </label>
                <input
                  type="password"
                  id="credentials.apiKey"
                  name="credentials.apiKey"
                  value={formData.connection.credentials.apiKey}
                  onChange={handleChange}
                  className="input"
                  placeholder={isEditing ? '(sin cambios)' : 'Tu API key aquí'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Cifrado de forma segura
                </p>
              </div>
            )}

            <div>
              <label htmlFor="connection.timeout" className="label">
                Timeout (ms)
              </label>
              <input
                type="number"
                id="connection.timeout"
                name="connection.timeout"
                value={formData.connection.timeout}
                onChange={handleChange}
                className="input"
                min={1000}
                max={120000}
                step={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo máximo de espera para respuestas (1000-120000 ms)
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/connectors')}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
