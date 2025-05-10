import React, { useState } from 'react';
import KioskoToast from './KioskoToast';

const KioskoSalesForm = ({ onAddDebt, clients, products }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
      paid: false
    };
    
    onAddDebt(newDebt);
    setSelectedClient('');
    setSelectedProducts([]);
    showNotification('Venta a crédito registrada exitosamente');
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


     
    </div>
  );
};

export default KioskoSalesForm;