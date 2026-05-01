import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, Loader2,
  Zap, Timer, Bot, ChevronDown, ChevronUp, X
} from 'lucide-react';
import api from '../utils/api';

/* ─── helpers ─────────────────────────────────────────── */
function formatDate(iso) {
  return new Date(iso).toLocaleString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const STATUS_META = {
  completed: { label: 'Exitoso',   icon: CheckCircle2, cls: 'text-green-600 bg-green-50' },
  failed:    { label: 'Fallido',   icon: XCircle,      cls: 'text-red-600   bg-red-50'   },
  pending:   { label: 'Pendiente', icon: Clock,        cls: 'text-yellow-600 bg-yellow-50' },
  running:   { label: 'Ejecutando',icon: Loader2,      cls: 'text-blue-600  bg-blue-50'  },
};

/* ─── Badge de estado ──────────────────────────────────── */
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>
      <Icon size={12} />
      {m.label}
    </span>
  );
}

/* ─── Fila expandible ──────────────────────────────────── */
function ExecutionRow({ exec }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
          {formatDate(exec.createdAt)}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-900 line-clamp-2 max-w-sm">
            {exec.query}
          </p>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <StatusBadge status={exec.status} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
            {exec.metadata?.modelUsed || '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
          <span className="inline-flex items-center gap-1">
            <Timer size={12} />
            {formatDuration(exec.totalDuration)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
          <span className="inline-flex items-center gap-1">
            <Zap size={12} />
            {exec.tokensUsed?.total ?? '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 text-right whitespace-nowrap">
          {exec.toolsCalled?.length ?? 0} herr.
        </td>
        <td className="px-4 py-3 text-gray-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>

      {open && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Respuesta */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Respuesta del agente</p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {exec.response || '(sin respuesta)'}
                </div>
              </div>

              {/* Herramientas */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Herramientas llamadas ({exec.toolsCalled?.length ?? 0})
                </p>
                {exec.toolsCalled?.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {exec.toolsCalled.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-gray-800 truncate">
                          {t.connectorName ? `${t.connectorName} › ` : ''}{t.toolName}
                        </span>
                        <span className="flex items-center gap-2 shrink-0 ml-2">
                          {t.success
                            ? <CheckCircle2 size={12} className="text-green-500" />
                            : <XCircle size={12} className="text-red-500" />}
                          <span className="text-gray-400">{formatDuration(t.duration)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sin herramientas</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Tarjeta móvil ───────────────────────────────────── */
function ExecutionCard({ exec }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 p-4">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-sm text-gray-900 flex-1 ${open ? '' : 'line-clamp-2'}`}>
          {exec.query}
        </p>
        <div className="shrink-0"><StatusBadge status={exec.status} /></div>
      </div>

      {/* Metadatos */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        <span>{formatDate(exec.createdAt)}</span>
        {exec.metadata?.modelUsed && (
          <span className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {exec.metadata.modelUsed}
          </span>
        )}
        <span className="flex items-center gap-1"><Timer size={10} />{formatDuration(exec.totalDuration)}</span>
        <span className="flex items-center gap-1"><Zap size={10} />{exec.tokensUsed?.total ?? '—'} tok.</span>
        {exec.toolsCalled?.length > 0 && <span>{exec.toolsCalled.length} herr.</span>}
      </div>

      {/* Botón expandir */}
      <button
        onClick={() => setOpen(!open)}
        className="mt-2 text-xs text-primary-600 flex items-center gap-1"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? 'Ocultar detalle' : 'Ver detalle'}
      </button>

      {/* Detalle expandido */}
      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Respuesta</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {exec.response || '(sin respuesta)'}
            </div>
          </div>
          {exec.toolsCalled?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Herramientas ({exec.toolsCalled.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {exec.toolsCalled.map((t, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-xs">
                    <span className="font-medium text-gray-800 truncate">
                      {t.connectorName ? `${t.connectorName} › ` : ''}{t.toolName}
                    </span>
                    <span className="flex items-center gap-2 shrink-0 ml-2">
                      {t.success
                        ? <CheckCircle2 size={12} className="text-green-500" />
                        : <XCircle size={12} className="text-red-500" />}
                      <span className="text-gray-400">{formatDuration(t.duration)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Modal de filtros ─────────────────────────────────── */
function FilterModal({ filters, onChange, onClose }) {
  const [local, setLocal] = useState(filters);

  const apply = () => {
    onChange(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filtros</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              className="input-field w-full"
              value={local.status}
              onChange={e => setLocal(p => ({ ...p, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="completed">Exitoso</option>
              <option value="failed">Fallido</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              placeholder="gpt-4o, claude-3..."
              className="input-field w-full"
              value={local.model}
              onChange={e => setLocal(p => ({ ...p, model: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resultados por página</label>
            <select
              className="input-field w-full"
              value={local.limit}
              onChange={e => setLocal(p => ({ ...p, limit: parseInt(e.target.value) }))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onChange({ status: '', model: '', limit: 20 }); onClose(); }}
            className="btn-secondary flex-1"
          >
            Limpiar
          </button>
          <button onClick={apply} className="btn-primary flex-1">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal ─────────────────────────────────── */
export default function History() {
  const [executions, setExecutions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', model: '', limit: 20 });
  const [page, setPage]       = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce búsqueda 400 ms
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: filters.limit };
      if (debouncedSearch)  params.search = debouncedSearch;
      if (filters.status)   params.status = filters.status;
      if (filters.model)    params.model  = filters.model;

      const res = await api.get('/executions', { params });
      setExecutions(res.data.executions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const activeFilterCount = [filters.status, filters.model].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} ejecuciones registradas
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
          <Bot size={16} />
          <span>Agente IA</span>
        </div>
      </div>

      {/* Barra de búsqueda + filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por consulta..."
            className="input-field w-full pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className={`btn-secondary flex items-center gap-2 ${activeFilterCount > 0 ? 'border-primary-500 text-primary-700' : ''}`}
        >
          <Filter size={16} />
          Filtros
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" />
            Cargando historial...
          </div>
        ) : executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Clock size={40} className="mb-3 opacity-40" />
            <p className="text-lg font-medium">Sin ejecuciones</p>
            <p className="text-sm mt-1">
              {debouncedSearch || activeFilterCount > 0
                ? 'No hay resultados para los filtros actuales'
                : 'Aún no has usado el agente IA'}
            </p>
          </div>
        ) : (
          <>
            {/* Tarjetas — móvil */}
            <div className="block md:hidden">
              {executions.map(exec => (
                <ExecutionCard key={exec._id} exec={exec} />
              ))}
            </div>
            {/* Tabla — escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Consulta</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Modelo</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Duración</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Tokens</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Herr.</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {executions.map(exec => (
                    <ExecutionRow key={exec._id} exec={exec} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Paginación */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            <span className="hidden sm:inline">Página {pagination.page} de {pagination.pages} · mostrando {executions.length} de {pagination.total}</span>
            <span className="sm:hidden">{pagination.page}/{pagination.pages}</span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrev}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal de filtros */}
      {showFilters && (
        <FilterModal
          filters={filters}
          onChange={f => { setFilters(f); setPage(1); }}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
