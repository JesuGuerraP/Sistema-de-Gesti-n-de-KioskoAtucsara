import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoDashboard = ({ debts, products, clients, onAddDebt }) => {
  // Estados para el formulario mejorado
  const [selectedClient, setSelectedClient] = useState('');
  const [currentProduct, setCurrentProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCredit, setIsCredit] = useState(false);

  // Calcular métricas financieras
  const totalSales = debts.length;
  const pendingDebts = debts.filter(d => !d.paid);
  const paidDebts = debts.filter(d => d.paid);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const totalRevenue = paidDebts.reduce((sum, debt) => sum + calculateTotal(debt.items), 0);
  const totalPending = pendingDebts.reduce((sum, debt) => sum + calculateTotal(debt.items), 0);
  const totalPotential = totalRevenue + totalPending;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Resumen Financiero</h2>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <MetricCard 
            title="Dinero Recibido" 
            value={totalRevenue} 
            color="blue" 
          />
          <MetricCard 
            title="Dinero Pendiente" 
            value={totalPending} 
            color="yellow" 
          />
          <MetricCard 
            title="Total Potencial" 
            value={totalPotential} 
            color="green" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <MetricCard 
            title="Ventas Totales" 
            value={totalSales} 
            color="gray" 
            noCurrency
          />
          <MetricCard 
            title="Deudas Pendientes" 
            value={pendingDebts.length} 
            color="red" 
            noCurrency
          />
          <MetricCard 
            title="Clientes Registrados" 
            value={clients.length} 
            color="green" 
            noCurrency
          />
        </div>
        {/* Formulario de registrar venta eliminado */}
      </div>
    </main>
  );
};

// Componente auxiliar para tarjetas de métricas
const MetricCard = ({ title, value, color, noCurrency = false }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', textDark: 'text-blue-800' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', textDark: 'text-yellow-800' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', textDark: 'text-green-800' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', textDark: 'text-red-800' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', textDark: 'text-gray-800' },
  };

  const displayValue = noCurrency 
    ? value 
    : value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

  return (
    <div className={`${colorClasses[color].bg} p-3 md:p-4 rounded-lg border ${colorClasses[color].border}`}>
      <h3 className={`text-xs md:text-sm font-medium ${colorClasses[color].text}`}>{title}</h3>
      <p className={`text-xl md:text-2xl font-semibold ${colorClasses[color].textDark}`}>
        {displayValue}
      </p>
    </div>
  );
};

export default KioskoDashboard;
