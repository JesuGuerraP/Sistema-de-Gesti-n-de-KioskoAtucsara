import React, { useState } from 'react';
import KioskoToast from './KioskoToast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import Button from './ui/Button';

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

  const handleDelete = (debtId) => {
    if (window.confirm('¿Estás seguro de eliminar esta deuda?')) {
      onDeleteDebt(debtId);
      setShowToast(true);
      setToastMessage('Deuda eliminada correctamente');
      setToastType('success');
    }
  };

  const filteredDebts = debts
    .filter(debt => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'pending') return !debt.paid;
      if (filterStatus === 'paid') return debt.paid;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card className="max-w-6xl mx-auto mt-6">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Historial de Ventas</CardTitle>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {['all', 'pending', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === status
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
            >
              {status === 'all' && 'Todas'}
              {status === 'pending' && 'Pendientes'}
              {status === 'paid' && 'Pagadas'}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {showToast && (
          <KioskoToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}

        {debts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No hay ventas registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebts.map(debt => {
                const total = calculateTotal(debt.items);
                return (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium text-slate-900">
                      {getClientName(debt.clientId)}
                    </TableCell>
                    <TableCell>{debt.date}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {debt.items.map((item, index) => {
                          const product = getProductDetails(item.productId);
                          return (
                            <div key={index} className="text-xs text-slate-600 flex items-center gap-1">
                              <span className="font-medium text-slate-700">{item.quantity}x</span>
                              <span>{product.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      ${total.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${debt.paid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                        }`}>
                        {debt.paid ? 'Pagada' : 'Pendiente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!debt.paid && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8"
                            onClick={() => onMarkAsPaid(debt.id)}
                          >
                            Pagar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(debt.id)}
                          title="Eliminar"
                        >
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
  );
};

export default KioskoDebtsList;
