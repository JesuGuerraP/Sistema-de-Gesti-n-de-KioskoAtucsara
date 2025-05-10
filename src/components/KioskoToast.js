import React, { useEffect } from 'react';

const KioskoToast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700'
  };

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded border ${bgColor[type]} flex items-center shadow-lg z-50`}>
      <span className="flex-grow">{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-xl font-bold"
      >
        &times;
      </button>
    </div>
  );
};

export default KioskoToast;