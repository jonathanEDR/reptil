import { useUser } from '@clerk/clerk-react';
import { User, CreditCard, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const { user } = useUser();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Perfil */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              className="input"
              value={user?.fullName || ''}
              disabled
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
            />
          </div>
          <p className="text-sm text-gray-500">
            Para editar tu perfil, usa la configuración de tu cuenta de Clerk
          </p>
        </div>
      </div>

      {/* Plan */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Plan y Facturación</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Plan Free</h3>
              <p className="text-sm text-gray-600">Hasta 3 conectores</p>
            </div>
            <button className="btn-primary">Mejorar Plan</button>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Conectores activos: 0 / 3</p>
            <p>• Consultas de agentes este mes: 0 / 100</p>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Alertas de conectores</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Reportes semanales</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700">Nuevas funcionalidades</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </label>
        </div>
      </div>

      {/* Seguridad */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Todas las credenciales de tus conectores están cifradas con AES-256.
            Nunca se almacenan en texto plano.
          </p>
          <div className="flex gap-3">
            <button className="btn-secondary">
              Ver Logs de Actividad
            </button>
            <button className="btn-secondary">
              Generar API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
