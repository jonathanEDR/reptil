import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Bell } from 'lucide-react';
import api from '../../utils/api';

export default function Header() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfile(response.data);
    } catch (error) {
      console.error('Error al cargar perfil en header:', error);
    }
  };

  const displayName = profile?.displayName 
    || (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : profile?.firstName)
    || user?.fullName
    || user?.firstName
    || 'Usuario';

  const userEmail = profile?.email || user?.primaryEmailAddress?.emailAddress || '';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-600">Reptil</h1>
          <span className="text-sm text-gray-500">Plataforma MCP</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">
                {userEmail}
              </p>
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
