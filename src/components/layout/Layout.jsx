import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed(prev => !prev)}
      />

      {/* Botón flotante hamburguesa — solo visible en móvil cuando sidebar está cerrado */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className={`
          fixed top-4 left-4 z-50 p-2
          bg-white rounded-xl shadow-lg border border-gray-200
          transition-all duration-300 md:hidden
          ${mobileOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}
        `}
      >
        <Menu size={20} className="text-gray-700" />
      </button>

      <main className={`
        min-h-screen p-4 md:p-6 min-w-0
        pt-16 md:pt-6
        transition-all duration-300
        ${collapsed ? 'md:ml-16' : 'md:ml-64'}
      `}>
        <Outlet />
      </main>
    </div>
  );
}

