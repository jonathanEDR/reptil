import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../utils/api';
import Avatar from '../components/ui/Avatar';

export default function Profile() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    settings: {
      timezone: 'UTC',
      language: 'es',
      notifications: true
    }
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
      setFormData({
        displayName: response.data.displayName || '',
        settings: response.data.settings
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', formData);
      await fetchProfile();
      setEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary"
          >
            Editar Perfil
          </button>
        )}
      </div>

      {/* Información del Usuario */}
      <div className="card p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <Avatar
              src={user?.imageUrl || profile?.avatarUrl}
              name={profile?.displayName || user?.fullName || ''}
              size="xl"
            />
          </div>
          
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nombre para mostrar</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.displayName}
                    onChange={(e) => setFormData({
                      ...formData,
                      displayName: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="label">Zona horaria</label>
                  <select
                    className="input"
                    value={formData.settings.timezone}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, timezone: e.target.value }
                    })}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/New_York">Nueva York</option>
                    <option value="Europe/Madrid">Madrid</option>
                  </select>
                </div>

                <div>
                  <label className="label">Idioma</label>
                  <select
                    className="input"
                    value={formData.settings.language}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, language: e.target.value }
                    })}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={formData.settings.notifications}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, notifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 text-sm text-gray-700">
                    Recibir notificaciones
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn-primary">
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.displayName || 
                   (profile?.firstName && profile?.lastName 
                     ? `${profile.firstName} ${profile.lastName}` 
                     : profile?.firstName 
                     || user?.firstName 
                     || user?.fullName
                     || 'Usuario')}
                </h2>
                <p className="text-gray-600">{profile?.email}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-32">Plan:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      profile?.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                      profile?.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profile?.plan.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-32">Zona horaria:</span>
                    <span className="text-gray-900">{profile?.settings.timezone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-32">Idioma:</span>
                    <span className="text-gray-900">{profile?.settings.language === 'es' ? 'Español' : 'English'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-32">Último acceso:</span>
                    <span className="text-gray-900">
                      {new Date(profile?.lastLogin).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas de Uso */}
      {stats && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Uso</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Conectores</div>
              <div className="text-3xl font-bold text-primary-600">
                {stats.connectors.total}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.connectors.active} activos
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Ejecuciones Totales</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.executions.total}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.executions.thisMonth} este mes
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Tasa de Éxito</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.executions.total > 0 
                  ? Math.round((stats.executions.successful / stats.executions.total) * 100)
                  : 0
                }%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.executions.successful} exitosas
              </div>
            </div>
          </div>

          {/* Límites del Plan */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Límites del Plan {profile?.plan.toUpperCase()}
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Conectores</span>
                  <span className="font-medium">
                    {stats.usage.totalConnectors} / {profile?.plan === 'free' ? 3 : profile?.plan === 'pro' ? 20 : '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (stats.usage.totalConnectors / (profile?.plan === 'free' ? 3 : 20)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Llamadas mensuales</span>
                  <span className="font-medium">
                    {stats.usage.monthlyAgentCalls} / {profile?.plan === 'free' ? 100 : profile?.plan === 'pro' ? 1000 : '∞'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (stats.usage.monthlyAgentCalls / (profile?.plan === 'free' ? 100 : 1000)) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
