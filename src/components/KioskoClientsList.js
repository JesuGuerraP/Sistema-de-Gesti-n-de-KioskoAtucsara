import React, { useState } from 'react';
import KioskoToast from './KioskoToast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import Button from './ui/Button';
import Input from './ui/Input';

const KioskoClientsList = ({ clients, onAddClient, onDeleteClient, debts, products }) => {
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
    if (!clientData.name) {
      setToastMessage('Nombre es requerido');
      setToastType('error');
      setShowToast(true);
      return;
    }

    onAddClient(clientData);
    setToastMessage(editingClient ? 'Cliente actualizado' : 'Cliente agregado');
    setToastType('success');
    setShowToast(true);
    setNewClient({ name: '', phone: '' });
    setEditingClient(null);
  };

  const handleDelete = (clientId) => {
    if (countPendingDebts(clientId) > 0) {
      setToastMessage('No puedes eliminar un cliente con deudas pendientes');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (window.confirm('¿Eliminar cliente?')) {
      onDeleteClient(clientId);
      setToastMessage('Cliente eliminado');
      setToastType('success');
      setShowToast(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 space-y-6">
      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Formulario de Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="Nombre Completo"
                name="name"
                value={editingClient ? editingClient.name : newClient.name}
                onChange={handleInputChange}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="flex-1 w-full">
              <Input
                label="Teléfono"
                name="phone"
                value={editingClient ? editingClient.phone : newClient.phone}
                onChange={handleInputChange}
                placeholder="Ej. 300 123 4567"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="w-full md:w-auto">
                {editingClient ? 'Actualizar' : 'Guardar'}
              </Button>
              {editingClient && (
                <Button type="button" variant="secondary" onClick={() => setEditingClient(null)}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Directorio de Clientes</CardTitle>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{clients.length} Total</span>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No hay clientes registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Deudas</TableHead>
                  <TableHead>Saldo Pendiente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => {
                  const pendingCount = countPendingDebts(client.id);
                  const pendingAmount = calculatePendingDebts(client.id);
                  return (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        {pendingCount > 0 ? (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
                            {pendingCount} Pendientes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Al día</span>
                        )}
                      </TableCell>
                      <TableCell className={`font-semibold ${pendingAmount > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        ${pendingAmount.toLocaleString('es-CO')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => setEditingClient(client)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(client.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KioskoClientsList;
