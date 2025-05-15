import React, { useState } from 'react';

const SalesReport = ({ sales, users, clients }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  // Filtrar ventas por fecha y usuario
  const filteredSales = sales.filter(sale => {
    const matchesDate = selectedDate ? sale.date === selectedDate : true;
    const matchesUser = selectedUser ? sale.user === selectedUser : true;
    return matchesDate && matchesUser;
  });

  // Formato moneda COP
  const formatCOP = value =>
    value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 });

  // Calcular totales con validación de datos
  const totalSales = filteredSales.reduce((sum, sale) => {
    return sum + (sale.items?.reduce((itemSum, item) => itemSum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0);
  }, 0);

  const totalReceived = filteredSales.reduce((sum, sale) => {
    return sale.paid
      ? sum + (sale.items?.reduce((itemSum, item) => itemSum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0)
      : sum;
  }, 0);

  const totalPending = totalSales - totalReceived;

  // Filtrar usuarios válidos para el select
  const validUsers = users.filter(Boolean);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Reporte de Ventas</h2>
      {/* Filtros arriba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filtrar por fecha:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filtrar por usuario:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)} 
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Todos</option>
            {validUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Cuadros de totales en dos filas de tres columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg shadow bg-blue-50 border-l-4 border-blue-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-blue-700 font-semibold text-sm">Total Potencial</span>
          <span className="text-2xl font-bold text-blue-900">{formatCOP(totalSales)}</span>
        </div>
        <div className="rounded-lg shadow bg-green-50 border-l-4 border-green-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-green-700 font-semibold text-sm">Dinero Recibido</span>
          <span className="text-2xl font-bold text-green-900">{formatCOP(totalReceived)}</span>
        </div>
        <div className="rounded-lg shadow bg-yellow-50 border-l-4 border-yellow-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-yellow-700 font-semibold text-sm">Dinero Pendiente</span>
          <span className="text-2xl font-bold text-yellow-900">{formatCOP(totalPending)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg shadow bg-gray-50 border-l-4 border-gray-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-gray-700 font-semibold text-sm">Total de Ventas</span>
          <span className="text-2xl font-bold text-gray-900">{filteredSales.length}</span>
        </div>
        <div className="rounded-lg shadow bg-red-50 border-l-4 border-red-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-red-700 font-semibold text-sm">Ventas Pendientes</span>
          <span className="text-2xl font-bold text-red-900">{filteredSales.filter(sale => !sale.paid).length}</span>
        </div>
        <div className="rounded-lg shadow bg-green-50 border-l-4 border-green-400 p-3 flex flex-col items-center min-h-[70px]">
          <span className="text-green-700 font-semibold text-sm">Ventas Pagadas</span>
          <span className="text-2xl font-bold text-green-900">{filteredSales.filter(sale => sale.paid).length}</span>
        </div>
      </div>
      <table className="w-full border-collapse border border-gray-300 mt-6">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">Fecha</th>
            <th className="border p-2 bg-gray-100">Usuario</th>
            <th className="border p-2 bg-gray-100">Cliente</th>
            <th className="border p-2 bg-gray-100">Total</th>
            <th className="border p-2 bg-gray-100">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.map((sale, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border p-2">{sale.date || ''}</td>
              <td className="border p-2">{sale.user || ''}</td>
              <td className="border p-2">
                {clients.find(c => c.id === sale.clientId)?.name || sale.clientId || ''}
              </td>
              <td className="border p-2">
                {formatCOP(
                  sale.items?.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0
                )}
              </td>
              <td className="border p-2">
                <span className={sale.paid ? "bg-green-100 text-green-800 px-2 py-1 rounded" : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded"}>
                  {sale.paid ? 'Pagado' : 'Pendiente'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;