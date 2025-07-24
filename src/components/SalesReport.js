import React, { useState } from 'react';

const SalesReport = ({ sales, users, clients, products = [] }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">Reporte de Ventas</h2>
      {/* Filtros arriba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filtrar por fecha</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Filtrar por usuario</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)} 
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="">Todos</option>
            {validUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Cuadros de totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total Potencial" value={formatCOP(totalSales)} color="blue" icon={<span className="text-blue-400 mr-2">💰</span>} />
        <MetricCard title="Dinero Recibido" value={formatCOP(totalReceived)} color="green" icon={<span className="text-green-400 mr-2">✔️</span>} />
        <MetricCard title="Dinero Pendiente" value={formatCOP(totalPending)} color="yellow" icon={<span className="text-yellow-400 mr-2">⏳</span>} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard title="Total de Ventas" value={filteredSales.length} color="gray" icon={<span className="text-gray-400 mr-2">🧾</span>} />
        <MetricCard title="Ventas Pendientes" value={filteredSales.filter(sale => !sale.paid).length} color="red" icon={<span className="text-red-400 mr-2">⚠️</span>} />
        <MetricCard title="Ventas Pagadas" value={filteredSales.filter(sale => sale.paid).length} color="green" icon={<span className="text-green-400 mr-2">✔️</span>} />
      </div>
      <SaleProductsModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sale={selectedSale}
        products={products}
      />
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="p-3 whitespace-nowrap text-gray-700">{sale.date || ''}</td>
                <td className="p-3 whitespace-nowrap text-gray-700">{sale.user || ''}</td>
                <td className="p-3 whitespace-nowrap text-gray-700">
                  {clients.find(c => c.id === sale.clientId)?.name || sale.clientId || ''}
                </td>
                <td className="p-3 whitespace-nowrap text-gray-700">
                  {formatCOP(
                    sale.items?.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0) || 0
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className={sale.paid ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs" : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"}>
                    {sale.paid ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-center">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs shadow"
                    onClick={() => { setSelectedSale(sale); setModalOpen(true); }}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`flex flex-col items-start justify-between ${colorClasses[color]} p-5 rounded-xl border shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center mb-2">{icon}<h3 className="text-sm font-semibold">{title}</h3></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

// Modal para mostrar productos vendidos en una venta
const SaleProductsModal = ({ open, onClose, sale, products = [] }) => {
  if (!open || !sale) return null;
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : productId;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[320px] max-w-[90vw] relative border border-gray-100">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h3 className="text-lg font-bold mb-4 text-gray-800">Productos vendidos</h3>
        <ul className="divide-y">
          {sale.items && sale.items.length > 0 ? (
            sale.items.map((item, idx) => (
              <li key={idx} className="py-2 flex justify-between text-gray-700">
                <span>{getProductName(item.productId)}</span>
                <span>x{item.quantity}</span>
                <span>{Number(item.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
              </li>
            ))
          ) : (
            <li className="py-2 text-gray-500">No hay productos</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SalesReport;
