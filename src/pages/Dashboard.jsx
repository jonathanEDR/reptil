import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Activity, Plug, Zap, TrendingUp, CheckCircle2, XCircle,
  Clock, Bot, Wrench, ChevronRight, BarChart3
} from 'lucide-react';
import api from '../utils/api';

// ─── Mini bar chart (CSS puro, sin librerías) ────────────────────────────────
function ActivityChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {d.label}: {d.count} consultas
          </div>
          <div className="w-full rounded-t-sm transition-all bg-primary-500 opacity-80 group-hover:opacity-100"
               style={{ height: `${Math.max((d.count / max) * 88, d.count > 0 ? 6 : 2)}px` }} />
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ name, value, description, icon: Icon, color, trend }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500 truncate">{name}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1 truncate">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} flex-shrink-0 ml-3`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs. mes anterior
        </div>
      )}
    </div>
  );
}

// ─── Execution row ────────────────────────────────────────────────────────────
function ExecutionRow({ exec }) {
  const ok = exec.status === 'completed';
  const time = new Date(exec.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const date = new Date(exec.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`mt-0.5 flex-shrink-0 ${ok ? 'text-green-500' : 'text-red-400'}`}>
        {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{exec.query}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Bot size={10} /> {exec.metadata?.modelUsed || exec.agentType}
          </span>
          {exec.totalDuration && (
            <span className="flex items-center gap-1">
              <Clock size={10} /> {exec.totalDuration >= 1000 ? `${(exec.totalDuration / 1000).toFixed(1)}s` : `${exec.totalDuration}ms`}
            </span>
          )}
          {exec.tokensUsed?.total > 0 && (
            <span>{exec.tokensUsed.total.toLocaleString()} tokens</span>
          )}
        </div>
      </div>
      <span className="text-[11px] text-gray-400 flex-shrink-0">{date} {time}</span>
    </div>
  );
}

// ─── Plan limits bar ─────────────────────────────────────────────────────────
function LimitBar({ label, value, max, color = 'bg-primary-600' }) {
  const pct = max === Infinity ? 0 : Math.min((value / max) * 100, 100);
  const maxLabel = max === Infinity ? '∞' : max;
  const warn = pct >= 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${warn ? 'text-amber-600' : 'text-gray-700'}`}>
          {value} / {maxLabel}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${warn ? 'bg-amber-500' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/users/stats')
      .then(r => setStats(r.data))
      .catch(() => setError('No se pudieron cargar las estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Activity size={32} className="animate-pulse" />
          <span className="text-sm">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
    );
  }

  const planLimits = { free: { connectors: 3, calls: 100 }, pro: { connectors: 20, calls: 1000 }, enterprise: { connectors: Infinity, calls: Infinity } };
  const limits     = planLimits[stats?.plan] || planLimits.free;

  const statCards = [
    {
      name:        'Conectores Activos',
      value:       stats?.connectors.active ?? 0,
      description: `${stats?.connectors.total ?? 0} configurados en total`,
      icon:        Plug,
      color:       'bg-blue-500'
    },
    {
      name:        'Herramientas Disponibles',
      value:       stats?.connectors.totalTools ?? 0,
      description: 'Total de tools MCP descubiertas',
      icon:        Zap,
      color:       'bg-violet-500'
    },
    {
      name:        'Consultas este mes',
      value:       stats?.executions.thisMonth ?? 0,
      description: `${stats?.executions.total ?? 0} consultas en total`,
      icon:        Activity,
      color:       'bg-green-500'
    },
    {
      name:        'Tasa de Éxito',
      value:       `${stats?.executions.successRate ?? 0}%`,
      description: `${stats?.executions.successful ?? 0} exitosas / ${stats?.executions.failed ?? 0} fallidas`,
      icon:        TrendingUp,
      color:       stats?.executions.successRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hola, {user?.firstName || 'Usuario'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Panel de control de tu plataforma MCP</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(c => <StatCard key={c.name} {...c} />)}
      </div>

      {/* Fila: Chart + Top tools */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Actividad últimos 7 días */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Actividad reciente</h2>
              <p className="text-xs text-gray-400 mt-0.5">Consultas de los últimos 7 días</p>
            </div>
            <BarChart3 size={18} className="text-gray-300" />
          </div>
          {stats?.chartData?.some(d => d.count > 0)
            ? <ActivityChart data={stats.chartData} />
            : (
              <div className="h-24 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                Sin actividad aún. ¡Prueba el <Link to="/agent" className="text-primary-600 mx-1 hover:underline">Agente IA</Link>!
              </div>
            )
          }
        </div>

        {/* Top tools */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Top herramientas</h2>
            <Wrench size={16} className="text-gray-300" />
          </div>
          {stats?.topTools?.length > 0 ? (
            <div className="space-y-3">
              {stats.topTools.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t._id}</p>
                    <p className="text-[11px] text-gray-400">{t.connectorName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-primary-600">{t.count}×</span>
                    <p className="text-[10px] text-gray-400">{Math.round(t.successRate * 100)}% ok</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-gray-400 text-sm text-center">
              <Wrench size={24} className="mb-2 opacity-30" />
              Las herramientas más usadas aparecerán aquí
            </div>
          )}
        </div>
      </div>

      {/* Fila: Ejecuciones recientes + Plan */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Ejecuciones recientes */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimas consultas</h2>
            <Link to="/agent" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Ir al agente <ChevronRight size={12} />
            </Link>
          </div>
          {stats?.recentExecutions?.length > 0 ? (
            <div>
              {stats.recentExecutions.map((exec, i) => (
                <ExecutionRow key={i} exec={exec} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-gray-400 text-sm text-center">
              <Bot size={24} className="mb-2 opacity-30" />
              Tus consultas al agente aparecerán aquí
            </div>
          )}
        </div>

        {/* Plan y límites */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">
              Plan <span className="uppercase text-primary-600">{stats?.plan}</span>
            </h2>
          </div>
          <div className="space-y-4">
            <LimitBar
              label="Conectores"
              value={stats?.usage?.totalConnectors || 0}
              max={limits.connectors}
            />
            <LimitBar
              label="Llamadas este mes"
              value={stats?.usage?.monthlyAgentCalls || 0}
              max={limits.calls}
              color="bg-green-600"
            />
          </div>

          {/* Conectores por categoría */}
          {stats?.connectors.byCategory?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-3">Por categoría</p>
              <div className="space-y-1.5">
                {stats.connectors.byCategory.map(c => (
                  <div key={c._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{c._id || 'general'}</span>
                    <span className="font-semibold text-gray-800">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats?.plan === 'free' && (
            <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-700">
                🚀 <strong>Actualiza a Pro</strong> para más conectores y consultas mensuales
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inicio rápido (solo si no tienen conectores) */}
      {stats?.connectors.total === 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Primeros pasos</h2>
          <div className="space-y-3">
            <Link
              to="/connectors/new"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-gray-900">Crea tu primer conector MCP</p>
                <p className="text-sm text-gray-500 mt-0.5">Conecta tus aplicaciones mediante el protocolo MCP</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 ml-auto" />
            </Link>
            <Link
              to="/agent"
              className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-gray-900">Prueba el Agente IA</p>
                <p className="text-sm text-gray-500 mt-0.5">Haz preguntas en lenguaje natural sobre tus aplicaciones</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

