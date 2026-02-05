import React from 'react';
import { useAuth } from '../AuthContext';

const KioskoHeader = ({ onMenuClick }) => {
  const { currentUser, userRole } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Mobile menu button and Title */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 -ml-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="ml-2 md:ml-0 text-lg font-semibold text-slate-800 tracking-tight truncate">
              Panel de Control
            </h1>
          </div>

          {/* User Info */}
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {currentUser.email}
                </span>
                <span className="text-xs text-slate-500 capitalize">
                  {userRole === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm ring-2 ring-white">
                {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default KioskoHeader;