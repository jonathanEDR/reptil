import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, ChevronDown, ChevronRight, Wrench, Loader2, AlertCircle, Zap, Clock, Plus, Plug } from 'lucide-react';
import api from '../utils/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms) {
  if (!ms) return '';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

// Genera una pregunta en lenguaje natural a partir del nombre/descripción de una herramienta
function toolToSuggestion(toolName, description, connectorName) {
  const raw  = toolName.replace(/_/g, ' ').toLowerCase();
  const desc = (description || '').trim();

  // Patrones de prefijo comunes → plantillas de pregunta
  const patterns = [
    [/^(listar?|list|obtener lista|get list)\s*/i,   (r) => `Lista ${r || 'los registros'} de ${connectorName}`],
    [/^(buscar|busqueda|search|find)\s*/i,            (r) => `Busca ${r || 'un registro'} en ${connectorName}`],
    [/^(obtener|get|consultar|fetch)\s*/i,            (r) => `Muéstrame ${r || 'los datos'} de ${connectorName}`],
    [/^(crear|create|agregar|add|nuevo)\s*/i,         (r) => `¿Cómo creo ${r || 'un registro'} en ${connectorName}?`],
    [/^(actualizar|update|editar|edit)\s*/i,          (r) => `Actualiza ${r || 'un registro'} en ${connectorName}`],
    [/^(eliminar|delete|borrar|remove)\s*/i,          (r) => `¿Cuántos registros puedo eliminar en ${connectorName}?`],
    [/^(resumen|summary|estadisticas|stats|total)\s*/i, () => `Dame un resumen de ${connectorName}`],
    [/^(verificar|check|validar|validate)\s*/i,       (r) => `Verifica ${r || 'el estado'} en ${connectorName}`],
  ];

  for (const [regex, template] of patterns) {
    const match = raw.match(regex);
    if (match) {
      const rest = raw.replace(regex, '').trim();
      return template(rest);
    }
  }

  // Si hay descripción corta, usarla directamente
  if (desc && desc.length < 80) return desc;

  // Fallback genérico
  return `${raw.charAt(0).toUpperCase() + raw.slice(1)} en ${connectorName}`;
}

// Convierte conectores activos en sugerencias agrupadas
function buildSuggestions(connectors) {
  const result = [];

  for (const connector of connectors) {
    if (!connector.toolsCache?.length) continue;

    // Tomar hasta 2 herramientas por conector (las más representativas)
    const tools = connector.toolsCache.slice(0, 2);
    for (const tool of tools) {
      result.push({
        text:          toolToSuggestion(tool.name, tool.description, connector.name),
        connectorName: connector.name,
        category:      connector.category || 'general',
      });
      if (result.length >= 6) break;  // máximo 6 sugerencias total
    }
    if (result.length >= 6) break;
  }

  return result;
}

// Color de badge por categoría del conector
const CATEGORY_COLOR = {
  inventory:     'bg-blue-100   text-blue-700',
  payments:      'bg-green-100  text-green-700',
  finance:       'bg-emerald-100 text-emerald-700',
  crm:           'bg-purple-100 text-purple-700',
  analytics:     'bg-orange-100 text-orange-700',
  communication: 'bg-pink-100   text-pink-700',
  other:         'bg-gray-100   text-gray-600',
  general:       'bg-gray-100   text-gray-600',
};

// Sugerencias estáticas de respaldo
const STATIC_EXAMPLES = [
  '¿Cuántos productos tenemos en inventario?',
  'Muéstrame las categorías disponibles',
  'Lista los últimos productos del catálogo',
];

// ─── ToolCallCard ─────────────────────────────────────────────────────────────

function ToolCallCard({ tool }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50 text-xs mt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-blue-700 font-medium hover:bg-blue-100 rounded-lg transition-colors"
      >
        <Wrench size={12} />
        <span className="flex-1 text-left">
          {tool.connectorName} › {tool.toolName}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tool.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {tool.success ? 'OK' : 'ERROR'}
        </span>
        {tool.duration && <span className="text-blue-500">{formatMs(tool.duration)}</span>}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-blue-200 pt-2">
          {tool.input && Object.keys(tool.input).length > 0 && (
            <div>
              <p className="text-blue-600 font-semibold mb-1">Entrada</p>
              <pre className="bg-white rounded p-2 overflow-auto text-gray-700 whitespace-pre-wrap break-all">
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-blue-600 font-semibold mb-1">{tool.success ? 'Resultado' : 'Error'}</p>
            <pre className="bg-white rounded p-2 overflow-auto text-gray-700 whitespace-pre-wrap break-all max-h-48">
              {tool.success
                ? JSON.stringify(tool.output, null, 2)
                : tool.error}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

function ChatMessage({ msg }) {
  const isUser  = msg.role === 'user';
  const isError = msg.role === 'error';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={16} className="text-red-500" />
        </div>
        <div className="max-w-[80%] bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-red-700">
          {msg.content}
        </div>
      </div>
    );
  }

  // Respuesta del agente
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot size={16} className="text-primary-600" />
      </div>
      <div className="flex-1 max-w-[85%] space-y-2">
        {/* Herramientas usadas */}
        {msg.toolsCalled?.length > 0 && (
          <div className="space-y-1">
            {msg.toolsCalled.map((t, i) => (
              <ToolCallCard key={i} tool={t} />
            ))}
          </div>
        )}

        {/* Respuesta en texto */}
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {msg.content}
        </div>

        {/* Metadata */}
        {(msg.model || msg.totalDuration || msg.tokensUsed?.total) && (
          <div className="flex items-center gap-3 text-[11px] text-gray-400 px-1">
            {msg.model && (
              <span className="flex items-center gap-1">
                <Zap size={10} /> {msg.model}
              </span>
            )}
            {msg.totalDuration && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> {formatMs(msg.totalDuration)}
              </span>
            )}
            {msg.tokensUsed?.total > 0 && (
              <span>{msg.tokensUsed.total.toLocaleString()} tokens</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ThinkingBubble ───────────────────────────────────────────────────────────

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-primary-600" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Agent page ───────────────────────────────────────────────────────────────

export default function Agent() {
  const [messages, setMessages]                   = useState([]);
  const [conversationHistory, setConvHistory]     = useState([]);  // historial para el LLM
  const [input, setInput]                         = useState('');
  const [loading, setLoading]                     = useState(false);
  const [models, setModels]                       = useState([]);
  const [selectedModel, setSelectedModel]         = useState('');
  const [suggestions, setSuggestions]             = useState([]);   // sugerencias dinámicas
  const [loadingSugg, setLoadingSugg]             = useState(true); // cargando sugerencias
  const [sessionId]                               = useState(() => crypto.randomUUID());
  const bottomRef                                 = useRef(null);
  const inputRef                                  = useRef(null);

  // Cargar modelos disponibles + sugerencias dinámicas en paralelo
  useEffect(() => {
    api.get('/agents/models')
      .then(r => {
        setModels(r.data.models || []);
        if (r.data.models?.length) setSelectedModel(r.data.models[0].id);
      })
      .catch(() => {
        // Fallback si el endpoint falla
        setModels([{ id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' }]);
        setSelectedModel('gpt-4o');
      });

    // Cargar conectores activos para generar sugerencias
    api.get('/connectors', { params: { isActive: 'true', status: 'active' } })
      .then(r => {
        const dynamic = buildSuggestions(r.data.connectors || []);
        setSuggestions(dynamic);
      })
      .catch(() => { /* silencioso — se usará el fallback */ })
      .finally(() => setLoadingSugg(false));
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const { data } = await api.post('/agents/query', {
        query:     text,
        sessionId,
        model:     selectedModel,
        history:   conversationHistory.slice(-20)  // últimos 10 turnos
      });

      setMessages(prev => [...prev, {
        role:          'assistant',
        content:       data.response,
        toolsCalled:   data.toolsCalled   || [],
        tokensUsed:    data.tokensUsed,
        model:         data.model,
        totalDuration: data.totalDuration
      }]);

      // Acumular historial para el próximo turno
      setConvHistory(prev => [
        ...prev,
        { role: 'user',      content: text },
        { role: 'assistant', content: data.response }
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Error desconocido';
      setMessages(prev => [...prev, { role: 'error', content: errMsg }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, loading, sessionId, selectedModel]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const resetConversation = () => {
    setMessages([]);
    setConvHistory([]);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] md:h-[calc(100dvh-3rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Agente IA</h1>
          <p className="text-gray-500 text-sm mt-0.5 hidden sm:block">Interactúa con tus aplicaciones en lenguaje natural</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botón nueva conversación — solo visible cuando hay mensajes */}
          {messages.length > 0 && (
            <button
              onClick={resetConversation}
              className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
              title="Iniciar una nueva conversación"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Nueva conversación</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          )}

          {/* Model selector */}
          {models.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 hidden sm:block">Modelo:</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="text-xs sm:text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-[140px] sm:max-w-none"
              >
                {models.map((m, i) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{i === 0 ? ' ★' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-4 min-h-0">
        {/* Estado vacío */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Bot size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿En qué puedo ayudarte?</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Pregúntame sobre tus aplicaciones conectadas. Consultaré los datos en tiempo real.
            </p>

            {loadingSugg ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Cargando sugerencias...
              </div>
            ) : suggestions.length > 0 ? (
              /* ── Sugerencias dinámicas agrupadas ── */
              <div className="space-y-2 w-full max-w-full sm:max-w-md">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s.text); inputRef.current?.focus(); }}
                    className="w-full flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 transition-colors group"
                  >
                    <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLOR[s.category] || CATEGORY_COLOR.general}`}>
                      <Plug size={9} />
                      <span className="max-w-[80px] truncate">{s.connectorName}</span>
                    </span>
                    <span className="text-gray-600 group-hover:text-gray-900 flex-1 min-w-0 truncate">{s.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* ── Fallback estático ── */
              <div className="space-y-2 w-full max-w-sm">
                {STATIC_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(ex); inputRef.current?.focus(); }}
                    className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-600"
                  >
                    {ex}
                  </button>
                ))}
                <p className="text-xs text-gray-400 pt-1">
                  Conecta una aplicación MCP para ver sugerencias reales.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mensajes */}
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}

        {/* Indicador pensando */}
        {loading && <ThinkingBubble />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2 flex-shrink-0">
        <div className="flex-1 flex items-end bg-white border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe tu consulta..."
            disabled={loading || !selectedModel}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none max-h-32 leading-relaxed disabled:opacity-50"
            style={{ minHeight: '24px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading || !selectedModel}
          className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 self-end"
        >
          {loading
            ? <Loader2 size={18} className="animate-spin" />
            : <Send size={18} />
          }
        </button>
      </div>

      {/* No hay modelos disponibles */}
      {models.length === 0 && (
        <p className="text-xs text-center text-amber-600 mt-2">
          ⚠️ Ninguna API key configurada. Agrega <code>OPENAI_API_KEY</code> o <code>ANTHROPIC_API_KEY</code> en el backend.
        </p>
      )}
    </div>
  );
}

