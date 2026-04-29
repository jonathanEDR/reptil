import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plug, Bot, History, User, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard',    href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conectores',  href: '/connectors', icon: Plug },
  { name: 'Agente IA',   href: '/agent',      icon: Bot },
  { name: 'Historial',   href: '/history',    icon: History },
  { name: 'Mi Perfil',   href: '/profile',    icon: User },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
