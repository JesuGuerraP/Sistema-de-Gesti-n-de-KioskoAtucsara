import React, { useState } from 'react';
import KioskoToast from './KioskoToast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import Button from './ui/Button';
import Input from './ui/Input';

const KioskoProductsList = ({ products, onAddProduct, onDeleteProduct, debts }) => {
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = editingProduct || newProduct;
    if (!productData.name || !productData.price) {
      setToastMessage('Nombre y precio son requeridos');
      setToastType('error');
      setShowToast(true);
      return;
    }

    onAddProduct(productData);
    setToastMessage(editingProduct ? 'Producto actualizado' : 'Producto agregado');
    setToastType('success');
    setShowToast(true);
    setNewProduct({ name: '', price: '', type: '' });
    setEditingProduct(null);
  };

  const handleDelete = (productId) => {
    // Verificar si el producto está en alguna deuda no pagada
    const isProductInDebts = debts.some(debt =>
      !debt.paid && debt.items.some(item => item.productId === productId)
    );

    if (isProductInDebts) {
      setToastMessage('No se puede eliminar: Producto en uso en deudas activas');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (window.confirm('¿Eliminar producto?')) {
      onDeleteProduct(productId);
      setToastMessage('Producto eliminado');
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

      {/* Formulario Productos */}
      <Card>
        <CardHeader>
          <CardTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <Input
                label="Nombre"
                name="name"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={handleInputChange}
                placeholder="Ej. Gaseosa"
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Precio"
                name="price"
                type="number"
                min="0"
                step="50"
                value={editingProduct ? editingProduct.price : newProduct.price}
                onChange={handleInputChange}
                placeholder="Ej. 2500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
              <select
                name="type"
                value={editingProduct ? editingProduct.type : newProduct.type}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Seleccione...</option>
                <option value="Mecato">Mecato</option>
                <option value="Bebida">Bebida</option>
                <option value="Fritos">Fritos</option>
                <option value="Dulces">Dulces</option>
                <option value="Varios">Varios</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingProduct ? 'Guardar' : 'Agregar'}
              </Button>
              {editingProduct && (
                <Button type="button" variant="secondary" onClick={() => setEditingProduct(null)}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla Productos */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Inventario</CardTitle>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{products.length} Items</span>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No hay productos registrados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.type && (
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full capitalize">
                          {product.type}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>${parseFloat(product.price).toLocaleString('es-CO')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditingProduct(product)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KioskoProductsList;
