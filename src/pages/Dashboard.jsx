import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Activity, Plug, Zap, TrendingUp } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Conectores Activos',
      value: stats?.connectors.active || '0',
      icon: Plug,
      color: 'bg-blue-500',
      description: `${stats?.connectors.total || 0} total`,
    },
    {
      name: 'Consultas este mes',
      value: stats?.executions.thisMonth || '0',
      icon: Activity,
      color: 'bg-green-500',
      description: `${stats?.executions.total || 0} total`,
    },
    {
      name: 'Herramientas Disponibles',
      value: stats?.connectors.total || '0',
      icon: Zap,
      color: 'bg-purple-500',
      description: 'Conectores configurados',
    },
    {
      name: 'Tasa de Éxito',
      value: stats?.executions.total > 0 
        ? `${Math.round((stats.executions.successful / stats.executions.total) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      description: `${stats?.executions.successful || 0} exitosas`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.firstName || 'Usuario'}
        </h1>
        <p className="text-gray-600 mt-1">
          Panel de control de tu plataforma MCP
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conectores por Categoría */}
      {stats?.connectors.byCategory && stats.connectors.byCategory.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Conectores por Categoría
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.connectors.byCategory.map((cat) => (
              <div key={cat._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {cat.count}
                </div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {cat._id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Límites del Plan */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Uso del Plan {stats?.plan.toUpperCase()}
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Conectores</span>
              <span className="font-medium">
                {stats?.usage.totalConnectors || 0} / {stats?.plan === 'free' ? 3 : stats?.plan === 'pro' ? 20 : '∞'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((stats?.usage.totalConnectors || 0) / (stats?.plan === 'free' ? 3 : 20)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Llamadas este mes</span>
              <span className="font-medium">
                {stats?.usage.monthlyAgentCalls || 0} / {stats?.plan === 'free' ? 100 : stats?.plan === 'pro' ? 1000 : '∞'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    ((stats?.usage.monthlyAgentCalls || 0) / (stats?.plan === 'free' ? 100 : 1000)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {stats?.plan === 'free' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🚀 <strong>Mejora a Pro</strong> para obtener más conectores y llamadas mensuales
            </p>
          </div>
        )}
      </div>

      {/* Sección de inicio rápido */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Inicio Rápido
        </h2>
        <div className="space-y-4">
          <Link 
            to="/connectors/new"
            className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Crea tu primer conector MCP
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Conecta tus aplicaciones existentes mediante el protocolo MCP
              </p>
            </div>
          </Link>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Configura tus credenciales
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Agrega las credenciales necesarias para que los agentes puedan
                acceder a tus datos
              </p>
            </div>
          </div>

          <Link
            to="/agent"
            className="flex items-start gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Interactúa con el agente IA
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Haz preguntas y deja que el agente coordine tus aplicaciones
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
