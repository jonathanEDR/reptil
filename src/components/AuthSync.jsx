import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '../utils/api';

/**
 * Componente que configura el token de autenticación para Axios
 * Debe estar dentro del ClerkProvider
 */
export default function AuthSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configurar el token de Clerk en todas las peticiones de Axios
    setAuthToken(getToken);
  }, [getToken]);

  return null;
}
