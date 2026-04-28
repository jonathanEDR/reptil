import { Bot, Construction } from 'lucide-react';

export default function Agent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agente IA</h1>
        <p className="text-gray-600 mt-1">
          Interactúa con tus aplicaciones mediante lenguaje natural
        </p>
      </div>

      {/* Placeholder para Fase 3 */}
      <div className="card p-12 text-center">
        <Construction size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          En Desarrollo
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          El sistema de agentes inteligentes estará disponible en la Fase 3 del proyecto.
          Podrás hacer preguntas en lenguaje natural y el agente coordinará tus aplicaciones automáticamente.
        </p>
        
        <div className="max-w-2xl mx-auto mt-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">
            Características próximas:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Bot size={16} className="text-primary-600 mt-1 flex-shrink-0" />
              <span>
                <strong>Agente Supervisor:</strong> Coordina y distribuye tareas entre agentes especializados
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bot size={16} className="text-primary-600 mt-1 flex-shrink-0" />
              <span>
                <strong>Agentes Especializados:</strong> Expertos en inventario, pagos, finanzas, etc.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bot size={16} className="text-primary-600 mt-1 flex-shrink-0" />
              <span>
                <strong>Memoria de Sesión:</strong> Mantiene contexto de la conversación
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bot size={16} className="text-primary-600 mt-1 flex-shrink-0" />
              <span>
                <strong>Chain of Thought:</strong> Visualiza el razonamiento del agente
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Bot size={16} className="text-primary-600 mt-1 flex-shrink-0" />
              <span>
                <strong>Cruce de Datos:</strong> Combina información de múltiples aplicaciones
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
