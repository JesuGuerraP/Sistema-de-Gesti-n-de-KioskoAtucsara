import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoSalesForm = ({ onAddDebt, clients, products, loggedUser }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isCredit, setIsCredit] = useState(false);

  const handleAddProduct = () => {
    if (!currentProduct || quantity < 1) {
      showNotification('Selecciona un producto y cantidad válida', 'error');
      return;
    }
    const product = products.find(p => p.id === currentProduct);
    if (!product) {
      showNotification('Producto no encontrado', 'error');
      return;
    }
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += Number(quantity);
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, { 
        ...product, 
        quantity: Number(quantity),
        price: Number(product.price)
      }]);
    }
    setCurrentProduct('');
    setQuantity(1);
    showNotification('Producto agregado al carrito');
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    showNotification('Producto eliminado del carrito');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClient || selectedProducts.length === 0) {
      showNotification('Selecciona un cliente y al menos un producto', 'error');
      return;
    }
    const newDebt = {
      clientId: selectedClient,
      items: selectedProducts.map(p => ({
        productId: p.id,
        quantity: Number(p.quantity),
        price: Number(p.price)
      })),
      date: new Date().toISOString().split('T')[0],
      paid: !isCredit,
      user: loggedUser || ''
    };
    onAddDebt(newDebt);
    setSelectedClient('');
    setSelectedProducts([]);
    setIsCredit(false);
    showNotification('Venta registrada exitosamente');
  };

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
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
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Registrar Venta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Seleccionar Cliente:</label>
          <select 
            value={selectedClient} 
            onChange={(e) => setSelectedClient(e.target.value)} 
            className="border p-2 rounded w-full"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Seleccionar Producto:</label>
          <select 
            value={currentProduct} 
            onChange={(e) => setCurrentProduct(e.target.value)} 
            className="border p-2 rounded w-full"
          >
            <option value="">Selecciona un producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Cantidad:</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            className="border p-2 rounded w-full"
            min="1"
          />
        </div>
        <button 
          type="button" 
          onClick={handleAddProduct} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Agregar Producto
        </button>
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Productos Seleccionados:</h3>
          <ul>
            {selectedProducts.map(product => (
              <li key={product.id} className="flex justify-between items-center mb-2">
                <span>{product.name} - {product.quantity} x ${product.price}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveProduct(product.id)} 
                  className="text-red-500"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex items-center">
          <input
            id="isCredit"
            type="checkbox"
            checked={isCredit}
            onChange={() => setIsCredit(!isCredit)}
            className="mr-2"
          />
          <label htmlFor="isCredit" className="select-none">Venta a crédito</label>
        </div>
        <button 
          type="submit" 
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Registrar Venta
        </button>
      </form>
    </div>
  );
};

export default KioskoSalesForm;
