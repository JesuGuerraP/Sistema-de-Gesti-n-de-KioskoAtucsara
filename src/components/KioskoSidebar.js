import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const KioskoSidebar = ({ activeTab, setActiveTab, isAdmin, isMobileOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30
        transform transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-white shadow-md h-screen
      `}>
        {/* Encabezado del sidebar */}
        <div className="p-4 border-b">
        
          <h2 className="text-xl font-bold text-gray-800" > ATUCSARA  </h2>
          
        </div>

        {/* Menú de navegación */}
        <nav className="px-4 py-2 overflow-y-auto h-[calc(100%-128px)]">
          <ul>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Dashboard
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('debts');
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'debts' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Ventas
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('clients');
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'clients' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Clientes
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('products');
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'products' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Productos
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('sales-report'); // Nueva pestaña para el reporte de ventas
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'sales-report' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Reporte de Ventas
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => {
                  setActiveTab('egresos');
                  onClose();
                }}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeTab === 'egresos' 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-blue-100'
                }`}
              >
                Egresos
              </button>
            </li>
            {isAdmin && (
              <li className="mb-2">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-2 rounded ${
                    activeTab === 'admin' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-blue-100'
                  }`}
                >
                  Panel de Administración
                </button>
              </li>
            )}
          </ul>
        </nav>
        
        {/* Botón de cerrar sesión */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-100 rounded text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm5 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default KioskoSidebar;
