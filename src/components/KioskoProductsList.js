import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

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

    const price = parseFloat(productData.price);
    if (isNaN(price) || price <= 0) {
      setToastMessage('Precio debe ser un número válido mayor a 0');
      setToastType('error');
      setShowToast(true);
      return;
    }

    onAddProduct(productData);

    setToastMessage(editingProduct ? 'Producto actualizado correctamente' : 'Producto agregado correctamente');
    setToastType('success');
    setShowToast(true);
    setNewProduct({ name: '', price: '', type: '' });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', price: '', type: '' });
  };

  const handleDeleteProduct = (productId) => {
    // Verificar si el producto está en alguna deuda no pagada
    const isProductInDebts = debts.some(debt =>
      !debt.paid && debt.items.some(item => item.productId === productId)
    );

    if (isProductInDebts) {
      setToastMessage('No puedes eliminar un producto con deudas pendientes');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      onDeleteProduct(productId);
      setToastMessage('Producto eliminado correctamente');
      setToastType('success');
      setShowToast(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <div className="text-sm text-gray-500">{products.length} productos registrados</div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={editingProduct ? editingProduct.name : newProduct.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={editingProduct ? editingProduct.price : newProduct.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="type"
              value={editingProduct ? editingProduct.type : newProduct.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            >

              <option value="">Selecione..</option>
              <option value="Mecato">Mecato</option>
              <option value="Bebida">Bebida</option>
              <option value="Fritos">Fritos</option>
              <option value="Dulces">Dulces</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              {editingProduct ? 'Actualizar' : 'Agregar'} Producto
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {products.length === 0 ? (
        <p className="text-gray-500">No hay productos registrados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => {
                const price = parseFloat(product.price);
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{isNaN(price) ? 'Precio inválido' : `$${price.toFixed(2)}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{product.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

export default KioskoProductsList;
