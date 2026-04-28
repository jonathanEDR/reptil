import { useState } from 'react';

/**
 * Avatar component — muestra imagen de perfil con fallback de iniciales.
 * Evita el error 404 cuando la URL de Clerk expira o no existe.
 */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');

  // Colores deterministas según el nombre (siempre el mismo color para el mismo usuario)
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-red-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex] || 'bg-gray-500';

  const sizeClass = sizes[size] || sizes.md;
  const baseClass = `${sizeClass} rounded-full flex-shrink-0 ${className}`;

  // Mostrar imagen si hay src y no hubo error
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={`${baseClass} object-cover border-2 border-white shadow`}
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback: iniciales con color
  return (
    <div className={`${baseClass} ${bgColor} flex items-center justify-center border-2 border-white shadow`}>
      <span className="font-semibold text-white leading-none">
        {initials || '?'}
      </span>
    </div>
  );
}
