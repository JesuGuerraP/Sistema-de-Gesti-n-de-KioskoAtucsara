import React from 'react';
import { useAuth } from '../AuthContext';

const KioskoHeader = ({ onMenuClick }) => {
  const { currentUser, userRole } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Título y botón de menú para móvil */}
          <div className="flex items-center">
            <button 
              onClick={onMenuClick}
              className="mr-3 md:hidden text-white focus:outline-none"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              Sistema de Gestión de Kiosko
            </h1>
          </div>

          {/* Información del usuario */}
          {currentUser && (
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline text-sm sm:text-base truncate max-w-[120px] md:max-w-none">
                {currentUser.email}
              </span>
              <span className="bg-blue-700 px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm">
                {userRole === 'admin' ? 'Admin' : 'Usuario'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default KioskoHeader;