import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, ChevronDown, ChevronRight, Wrench, Loader2, AlertCircle, Zap, Clock, Plus } from 'lucide-react';
import api from '../utils/api';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms) {
  if (!ms) return '';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

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
  const [sessionId]                               = useState(() => crypto.randomUUID());
  const bottomRef                                 = useRef(null);
  const inputRef                                  = useRef(null);

  // Cargar modelos disponibles
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

  const examples = [
    '¿Cuántos productos tenemos en inventario?',
    'Muéstrame las categorías disponibles',
    'Lista los últimos productos del catálogo',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agente IA</h1>
          <p className="text-gray-600 mt-1">Interactúa con tus aplicaciones en lenguaje natural</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón nueva conversación — solo visible cuando hay mensajes */}
          {messages.length > 0 && (
            <button
              onClick={resetConversation}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Iniciar una nueva conversación"
            >
              <Plus size={16} />
              Nueva conversación
            </button>
          )}

          {/* Model selector */}
          {models.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Modelo:</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
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
            <div className="space-y-2 w-full max-w-sm">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(ex); inputRef.current?.focus(); }}
                  className="w-full text-left text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 transition-colors text-gray-600"
                >
                  {ex}
                </button>
              ))}
            </div>
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
            placeholder="Escribe tu consulta... (Enter para enviar)"
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

