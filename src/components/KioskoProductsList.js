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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-4xl mx-auto mt-8">
      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-2">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Productos</h2>
        <div className="text-sm text-gray-500">{products.length} productos registrados</div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              value={editingProduct ? editingProduct.name : newProduct.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="type"
              value={editingProduct ? editingProduct.type : newProduct.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              {editingProduct ? 'Actualizar' : 'Agregar'} Producto
            </button>
            {editingProduct && (
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

      {products.length === 0 ? (
        <p className="text-gray-500">No hay productos registrados</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="border-b p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const price = parseFloat(product.price);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 whitespace-nowrap text-gray-700">{product.name}</td>
                    <td className="p-3 whitespace-nowrap text-gray-700">{isNaN(price) ? 'Precio inválido' : `$${price.toFixed(2)}`}</td>
                    <td className="p-3 whitespace-nowrap capitalize text-gray-700">{product.type}</td>
                    <td className="p-3 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 text-xs font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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

export default KioskoProductsList;
