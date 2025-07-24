import React, { useState, useRef } from 'react';
import KioskoToast from './KioskoToast';

const KioskoSalesForm = ({ onAddDebt, clients, products, loggedUser }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [productInput, setProductInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isCredit, setIsCredit] = useState(false);
  const clientBoxRef = useRef(null);
  const productBoxRef = useRef(null);

  // Filtrado en vivo
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientInput.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productInput.toLowerCase()));

  // Cerrar lista al hacer click fuera
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (clientBoxRef.current && !clientBoxRef.current.contains(event.target)) {
        setShowClientList(false);
      }
      if (productBoxRef.current && !productBoxRef.current.contains(event.target)) {
        setShowProductList(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setProductInput('');
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
    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA');
    const newDebt = {
      clientId: selectedClient,
      items: selectedProducts.map(p => ({
        productId: p.id,
        quantity: Number(p.quantity),
        price: Number(p.price)
      })),
      date: localDate,
      paid: !isCredit,
      user: loggedUser || ''
    };
    onAddDebt(newDebt);
    setSelectedClient('');
    setClientInput('');
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
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-2xl mx-auto mt-8">
      {showToast && (
        <KioskoToast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
      <h2 className="text-xl font-bold mb-6 text-gray-800 tracking-tight">Registrar Venta</h2>
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div className="relative" ref={clientBoxRef}>
          <label className="block mb-1 text-sm font-medium text-gray-700">Cliente</label>
          <input
            type="text"
            value={clientInput}
            onFocus={() => setShowClientList(true)}
            onChange={e => {
              setClientInput(e.target.value);
              setShowClientList(true);
              const found = clients.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
              if (found) setSelectedClient(found.id);
              else setSelectedClient('');
            }}
            placeholder="Buscar o seleccionar cliente"
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            autoComplete="off"
          />
          {showClientList && (
            <ul className="absolute left-0 right-0 w-full border rounded-lg bg-white max-h-48 overflow-y-auto mt-1 z-30 shadow-lg">
              {filteredClients.length === 0 && (
                <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
              )}
              {filteredClients.map(client => (
                <li
                  key={client.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${selectedClient === client.id ? 'bg-blue-100' : ''}`}
                  onMouseDown={() => {
                    setSelectedClient(client.id);
                    setClientInput(client.name);
                    setShowClientList(false);
                  }}
                >
                  {client.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative" ref={productBoxRef}>
          <label className="block mb-1 text-sm font-medium text-gray-700">Producto</label>
          <input
            type="text"
            value={productInput}
            onFocus={() => setShowProductList(true)}
            onChange={e => {
              setProductInput(e.target.value);
              setShowProductList(true);
              const found = products.find(p => p.name.toLowerCase() === e.target.value.toLowerCase());
              if (found) setCurrentProduct(found.id);
              else setCurrentProduct('');
            }}
            placeholder="Buscar o seleccionar producto"
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            autoComplete="off"
          />
          {showProductList && (
            <ul className="absolute left-0 right-0 w-full border rounded-lg bg-white max-h-48 overflow-y-auto mt-1 z-30 shadow-lg">
              {filteredProducts.length === 0 && (
                <li className="px-3 py-2 text-gray-400">Sin coincidencias</li>
              )}
              {filteredProducts.map(product => (
                <li
                  key={product.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${currentProduct === product.id ? 'bg-blue-100' : ''}`}
                  onMouseDown={() => {
                    setCurrentProduct(product.id);
                    setProductInput(product.name);
                    setShowProductList(false);
                  }}
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Cantidad</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)} 
            className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
            min="1"
          />
        </div>
        <button 
          type="button" 
          onClick={handleAddProduct} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          Agregar Producto
        </button>
        <div>
          <h3 className="text-base font-semibold mb-2 text-gray-700">Productos Seleccionados</h3>
          <ul>
            {selectedProducts.map(product => (
              <li key={product.id} className="flex justify-between items-center mb-2 border-b pb-1 last:border-b-0">
                <span className="text-gray-800">{product.name} <span className="text-gray-500">- {product.quantity} x ${product.price}</span></span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveProduct(product.id)} 
                  className="text-red-500 text-xs px-2 py-1 rounded hover:bg-red-50"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            id="isCredit"
            type="checkbox"
            checked={isCredit}
            onChange={() => setIsCredit(!isCredit)}
            className="mr-2 accent-blue-500"
          />
          <label htmlFor="isCredit" className="select-none text-gray-700">Venta a crédito</label>
        </div>
        <button 
          type="submit" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition w-full mt-4 font-semibold"
        >
          Registrar Venta
        </button>
      </form>
    </div>
  );
};

export default KioskoSalesForm;
