import React from 'react';

const KioskoSummary = ({ debts, products, clients }) => {
  const totalDebts = debts.filter(d => !d.paid).length;
  const totalClients = clients.length;
  const totalProducts = products.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Deudas Pendientes</h3>
        <p className="text-2xl font-semibold">{totalDebts}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Clientes Registrados</h3>
        <p className="text-2xl font-semibold">{totalClients}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">Productos Disponibles</h3>
        <p className="text-2xl font-semibold">{totalProducts}</p>
      </div>
    </div>
  );
};

export default KioskoSummary;