import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import {
  LayoutDashboard, Plug, Bot, History, User, Settings,
  X, ChevronLeft, ChevronRight, Bell,
} from 'lucide-react';
import api from '../../utils/api';

const navigation = [
  { name: 'Dashboard',     href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conectores',    href: '/connectors', icon: Plug },
  { name: 'Agente IA',     href: '/agent',      icon: Bot },
  { name: 'Historial',     href: '/history',    icon: History },
  { name: 'Mi Perfil',     href: '/profile',    icon: User },
  { name: 'Configuración', href: '/settings',   icon: Settings },
];

export default function Sidebar({ mobileOpen, collapsed, onClose, onToggleCollapse }) {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/users/me').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const displayName =
    profile?.displayName ||
    (profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName) ||
    user?.fullName ||
    user?.firstName ||
    'Usuario';

  const userEmail = profile?.email || user?.primaryEmailAddress?.emailAddress || '';

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <aside className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${collapsed ? 'md:w-16' : 'md:w-64'}`}>

        <div className={`flex-shrink-0 border-b border-gray-100 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="flex items-start justify-between p-4">
            <div>
              <h1 className="text-lg font-bold text-primary-600 leading-tight">Reptil</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Plataforma MCP</p>
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Notificaciones">
                <Bell size={17} className="text-gray-500" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors md:hidden" aria-label="Cerrar menu">
                <X size={17} className="text-gray-500" />
              </button>
              <button onClick={onToggleCollapse} className="hidden md:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Colapsar menu">
                <ChevronLeft size={17} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className={`hidden flex-shrink-0 border-b border-gray-100 py-3 justify-center ${collapsed ? 'md:flex' : ''}`}>
          <button onClick={onToggleCollapse} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Expandir menu">
            <ChevronRight size={17} className="text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) => `relative flex items-center rounded-lg transition-colors text-sm group ${collapsed ? 'md:justify-center md:px-0 md:py-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'} ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
            >
              <item.icon size={19} className="flex-shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>{item.name}</span>
              {collapsed && (
                <span className="hidden md:block absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`border-t border-gray-100 flex-shrink-0 p-3 ${collapsed ? 'md:flex md:justify-center' : ''}`}>
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'md:justify-center' : ''}`}>
            <div className="flex-shrink-0">
              <UserButton />
            </div>
            <div className={`min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{displayName}</p>
              <p className="text-xs text-gray-400 truncate leading-tight">{userEmail}</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
