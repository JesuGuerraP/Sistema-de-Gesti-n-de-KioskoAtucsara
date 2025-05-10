// src/components/KioskoProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const KioskoProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  // Si aún está cargando la autenticación, mostrar un estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Si se requiere ser admin y el usuario no lo es, redirigir al dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // Si todo está bien, renderizar los hijos (contenido protegido)
  return children;
};

export default KioskoProtectedRoute;