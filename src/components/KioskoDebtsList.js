import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoDebtsList = ({ debts, onMarkAsPaid, onDeleteDebt, clients, products }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'paid', 'pending'

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente desconocido';
  };

  const getProductDetails = (productId) => {
    const product = products.find(p => p.id === productId);
    return product || { name: 'Producto desconocido', price: 0 };
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const product = getProductDetails(item.productId);
      return sum + (product.price * item.quantity);
    }, 0);
  };

  const handleEditDebt = (debt) => {
    setEditingDebt(debt);
    setSelectedClient(debt.clientId);
    setSelectedProducts(debt.items.map(item => ({
      ...item,
      ...getProductDetails(item.productId)
    })));
  };

  const handleCancelEdit = () => {
    setEditingDebt(null);
    setSelectedClient('');
    setSelectedProducts([]);
  };

  const handleSaveEdit = () => {
    if (!selectedClient || selectedProducts.length === 0) {
      setToastMessage('Selecciona al menos un producto y un cliente');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const updatedDebt = {
      ...editingDebt,
      clientId: selectedClient,
      items: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity }))
    };

    onMarkAsPaid(updatedDebt.id, updatedDebt);
    setEditingDebt(null);
    setShowToast(true);
    setToastMessage('Deuda actualizada correctamente');
    setToastType('success');
  };

  const handleDelete = (debtId) => {
    if (window.confirm('¿Estás seguro de eliminar esta deuda?')) {
      onDeleteDebt(debtId);
      setShowToast(true);
      setToastMessage('Deuda eliminada correctamente');
      setToastType('success');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-5xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">Listado de Ventas</h2>

      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Filtros por estado */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          className={`px-4 py-1 rounded-lg font-medium text-sm transition ${filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'}`}
          onClick={() => setFilterStatus('all')}
        >
          Todas
        </button>
        <button
          className={`px-4 py-1 rounded-lg font-medium text-sm transition ${filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pendientes
        </button>
        <button
          className={`px-4 py-1 rounded-lg font-medium text-sm transition ${filterStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
          onClick={() => setFilterStatus('paid')}
        >
          Pagadas
        </button>
      </div>

      {debts.length === 0 ? (
        <p className="text-gray-500">No hay ventas registradas</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {debts
                .filter(debt => {
                  if (filterStatus === 'all') return true;
                  if (filterStatus === 'pending') return !debt.paid;
                  if (filterStatus === 'paid') return debt.paid;
                  return true;
                })
                .sort((a, b) => {
                  // Ordenar de más reciente a más antigua
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  return dateB - dateA;
                })
                .map(debt => {
                  const total = calculateTotal(debt.items);
                  return (
                    <tr key={debt.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 whitespace-nowrap text-gray-700">{getClientName(debt.clientId)}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">{debt.date}</td>
                      <td className="p-3 whitespace-nowrap text-gray-700">
                        <ul className="list-disc pl-5">
                          {debt.items.map((item, index) => {
                            const product = getProductDetails(item.productId);
                            const price = parseFloat(product.price);
                            return (
                              <li key={index} className="text-xs text-gray-600">
                                {product.name} x {item.quantity} ({isNaN(price) ? 'Precio inválido' : `${price.toFixed(2)}`} c/u)
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td className="p-3 whitespace-nowrap text-gray-700">${isNaN(total) ? 'Total inválido' : total.toFixed(2)}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={debt.paid ? "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs" : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs"}>
                          {debt.paid ? 'Pagada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap space-x-2">
                        {!debt.paid && (
                          <button
                            onClick={() => onMarkAsPaid(debt.id)}
                            className="text-green-600 hover:text-green-900 text-xs font-semibold"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="text-blue-600 hover:text-blue-900 text-xs font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="text-red-600 hover:text-red-900 text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KioskoDebtsList;
