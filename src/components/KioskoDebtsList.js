import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoDebtsList = ({ debts, onMarkAsPaid, onDeleteDebt, clients, products }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Listado de Deudas</h2>

      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {debts.length === 0 ? (
        <p className="text-gray-500">No hay deudas registradas</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debts.map(debt => {
                const total = calculateTotal(debt.items);
                return (
                  <tr key={debt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{getClientName(debt.clientId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{debt.date}</td>
                    <td className="px-6 py-4">
                      <ul className="list-disc pl-5">
                        {debt.items.map((item, index) => {
                          const product = getProductDetails(item.productId);
                          const price = parseFloat(product.price);
                          return (
                            <li key={index}>
                              {product.name} x {item.quantity} ({isNaN(price) ? 'Precio inválido' : `$${price.toFixed(2)}`} c/u)
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${isNaN(total) ? 'Total inválido' : total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${debt.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {debt.paid ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {!debt.paid && (
                        <button
                          onClick={() => onMarkAsPaid(debt.id)}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          Pagar
                        </button>
                      )}
                      <button
                        onClick={() => handleEditDebt(debt)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(debt.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
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
