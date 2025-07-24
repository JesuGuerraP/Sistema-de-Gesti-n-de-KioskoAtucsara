import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoDashboard = ({ debts, products, clients, egresos = [], onAddDebt }) => {
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
  const totalGastos = egresos.reduce((sum, egreso) => sum + (Number(egreso.monto) || 0), 0);
  const totalPotential = totalRevenue + totalPending - totalGastos;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">Resumen Financiero</h2>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Dinero Recibido" 
            value={totalRevenue} 
            color="blue" 
            icon={<span className="inline-block align-middle text-blue-400 mr-2">💰</span>}
          />
          <MetricCard 
            title="Dinero Pendiente" 
            value={totalPending} 
            color="yellow" 
            icon={<span className="inline-block align-middle text-yellow-400 mr-2">⏳</span>}
          />
          <MetricCard 
            title="Total Potencial" 
            value={totalPotential} 
            color="green" 
            icon={<span className="inline-block align-middle text-green-400 mr-2">📈</span>}
          />
          <MetricCard 
            title="Gastos" 
            value={totalGastos} 
            color="red" 
            icon={<span className="inline-block align-middle text-red-400 mr-2">💸</span>}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <MetricCard 
            title="Ventas Totales" 
            value={totalSales} 
            color="gray" 
            noCurrency
            icon={<span className="inline-block align-middle text-gray-400 mr-2">🧾</span>}
          />
          <MetricCard 
            title="Deudas Pendientes" 
            value={pendingDebts.length} 
            color="red" 
            noCurrency
            icon={<span className="inline-block align-middle text-red-400 mr-2">⚠️</span>}
          />
          <MetricCard 
            title="Clientes" 
            value={clients.length} 
            color="green" 
            noCurrency
            icon={<span className="inline-block align-middle text-green-400 mr-2">👥</span>}
          />
        </div>
      </div>
    </main>
  );
};

// Componente auxiliar para tarjetas de métricas
const MetricCard = ({ title, value, color, noCurrency = false, icon }) => {
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
    <div className={`flex flex-col items-start justify-between ${colorClasses[color].bg} p-5 rounded-xl border ${colorClasses[color].border} shadow-sm transition hover:shadow-md`}>      
      <div className="flex items-center mb-2">{icon}<h3 className={`text-sm font-semibold ${colorClasses[color].text}`}>{title}</h3></div>
      <p className={`text-2xl font-bold ${colorClasses[color].textDark}`}>{displayValue}</p>
    </div>
  );
};

export default KioskoDashboard;
