import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoClientsList = ({ clients, onAddClient, onDeleteClient, debts, products, }) => {
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [editingClient, setEditingClient] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const calculatePendingDebts = (clientId) => {
    return debts.filter(debt => debt.clientId === clientId && !debt.paid)
      .reduce((total, debt) => {
        return total + debt.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);
      }, 0);
  };

  const countPendingDebts = (clientId) => {
    return debts.filter(debt => debt.clientId === clientId && !debt.paid).length;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingClient) {
      setEditingClient({ ...editingClient, [name]: value });
    } else {
      setNewClient({ ...newClient, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const clientData = editingClient || newClient;
    if (!clientData.name || !clientData.phone) {
      setToastMessage('Nombre y teléfono son requeridos');
      setToastType('error');
      setShowToast(true);
      return;
    }

    onAddClient(clientData);

    setToastMessage(editingClient ? 'Cliente actualizado correctamente' : 'Cliente agregado correctamente');
    setToastType('success');
    setShowToast(true);
    setNewClient({ name: '', phone: '' });
    setEditingClient(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setNewClient({ name: '', phone: '' });
  };

  const handleDeleteClient = (clientId) => {
    if (countPendingDebts(clientId) > 0) {
      setToastMessage('No puedes eliminar un cliente con deudas pendientes');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      onDeleteClient(clientId);
      setToastMessage('Cliente eliminado correctamente');
      setToastType('success');
      setShowToast(true);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-4xl mx-auto mt-8">
      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-2">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Clientes</h2>
        <div className="text-sm text-gray-500">{clients.length} clientes registrados</div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={editingClient ? editingClient.name : newClient.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={editingClient ? editingClient.phone : newClient.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              {editingClient ? 'Actualizar' : 'Agregar'} Cliente
            </button>
            {editingClient && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {clients.length === 0 ? (
        <p className="text-gray-500">No hay clientes registrados</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deudas Pendientes</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Adeudado</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const pendingCount = countPendingDebts(client.id);
                const pendingAmount = calculatePendingDebts(client.id);

                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap text-gray-700">{client.name}</td>
                    <td className="p-3 whitespace-nowrap text-gray-700">{client.phone}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pendingCount > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {pendingCount}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-gray-700">
                      ${pendingAmount.toFixed(2)}
                    </td>
                    <td className="p-3 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-blue-600 hover:text-blue-900 text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
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

export default KioskoClientsList;
