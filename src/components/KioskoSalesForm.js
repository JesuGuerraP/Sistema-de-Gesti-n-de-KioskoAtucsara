import React, { useState, useRef, useEffect } from 'react';
import KioskoToast from './KioskoToast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

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
  useEffect(() => {
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

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-md">
      <CardHeader className="bg-slate-50/50">
        <CardTitle>Nueva Venta</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {showToast && (
          <KioskoToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Columna Izquierda: Selección */}
            <div className="space-y-4">
              <div className="relative" ref={clientBoxRef}>
                <label className="block mb-1.5 text-sm font-medium text-slate-700">Cliente</label>
                <div className="relative">
                  <Input
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
                    placeholder="Buscar cliente..."
                    autoComplete="off"
                  />
                  {showClientList && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400 text-sm">Sin resultados</div>
                      ) : (
                        filteredClients.map(client => (
                          <div
                            key={client.id}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 ${selectedClient === client.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700'}`}
                            onMouseDown={() => {
                              setSelectedClient(client.id);
                              setClientInput(client.name);
                              setShowClientList(false);
                            }}
                          >
                            {client.name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Agregar Producto</h4>
                <div className="relative" ref={productBoxRef}>
                  <label className="block mb-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">Producto</label>
                  <Input
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
                    placeholder="Buscar producto..."
                    autoComplete="off"
                  />
                  {showProductList && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-3 py-2 text-slate-400 text-sm">Sin resultados</div>
                      ) : (
                        filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 flex justify-between ${currentProduct === product.id ? 'bg-primary-50 text-primary-700' : 'text-slate-700'}`}
                            onMouseDown={() => {
                              setCurrentProduct(product.id);
                              setProductInput(product.name);
                              setShowProductList(false);
                            }}
                          >
                            <span>{product.name}</span>
                            <span className="font-mono text-xs opacity-70">${product.price}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block mb-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider">Cantidad</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddProduct}
                    className="flex-shrink-0"
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Resumen */}
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Carrito de Compra</span>
                  <span className="text-xs font-bold bg-white px-2 py-1 rounded text-slate-600">{selectedProducts.length} items</span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto min-h-[200px]">
                  {selectedProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      <p className="text-sm">Carrito vacío</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedProducts.map(product => (
                        <li key={product.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-slate-100">
                          <div className="text-sm">
                            <p className="font-medium text-slate-800">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.quantity} x ${product.price}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900">${product.quantity * product.price}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(product.id)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3 bg-slate-100 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Total a Pagar</span>
                    <span className="text-xl font-bold text-primary-700">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isCredit}
                    onChange={() => setIsCredit(!isCredit)}
                    className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-slate-900">Venta a Crédito</span>
                    <span className="block text-xs text-slate-500">Se agregará a la lista de deudas pendientes</span>
                  </div>
                </label>

                <Button
                  type="submit"
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                  size="lg"
                >
                  Completar Venta
                </Button>
              </div>
            </div>

          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KioskoSalesForm;
