import { Bell, Menu } from 'lucide-react';

export default function Header({ onMobileToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Izquierda: hamburger (móvil) + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600">Reptil</h1>
            <span className="hidden sm:block text-sm text-gray-500">Plataforma MCP</span>
          </div>
        </div>

        {/* Derecha: notificaciones */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notificaciones"
          >
            <Bell size={20} className="text-gray-600" />
          </button>
        </div>

      </div>
    </header>
  );
}
