import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, query, collection, where, getDoc, setDoc } from 'firebase/firestore';
import { db, getCollectionRef } from './firebaseConfig';
import { AuthProvider, useAuth } from './AuthContext';

// Componentes principales
import KioskoHeader from './components/KioskoHeader';
import KioskoSidebar from './components/KioskoSidebar';
import KioskoSalesForm from './components/KioskoSalesForm';
import KioskoDebtsList from './components/KioskoDebtsList';
import KioskoClientsList from './components/KioskoClientsList';
import KioskoProductsList from './components/KioskoProductsList';
import KioskoDashboard from './components/KioskoDashboard';
import KioskoToast from './components/KioskoToast';
import SalesReport from './components/SalesReport';
import KioskoEgresos from './components/KioskoEgresos';
import KioskoAnalytics from './components/KioskoAnalytics';

// Componentes de autenticación
import KioskoLogin from './components/KioscoLogin';
import KioskoAdminPanel from './components/KioskoAdminPanel';
import KioskoProtectedRoute from './components/KioskoProtectedRoute';

const MainApp = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  console.log('MainApp Render. ActiveTab:', activeTab); // DEBUG LOG

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [currentClients, setCurrentClients] = useState([]);
  const [currentDebts, setCurrentDebts] = useState([]);
  const [currentEgresos, setCurrentEgresos] = useState([]);
  const [inversionInicial, setInversionInicial] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Cargar datos iniciales desde Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const productsSnapshot = await getDocs(getCollectionRef('products'));
        const clientsSnapshot = await getDocs(getCollectionRef('clients'));
        const debtsSnapshot = await getDocs(getCollectionRef('debts'));
        const egresosSnapshot = await getDocs(getCollectionRef('egresos'));

        const savedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const savedClients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const savedDebts = debtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const savedEgresos = egresosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setCurrentProducts(savedProducts);
        setCurrentClients(savedClients);
        setCurrentDebts(savedDebts);
        setCurrentEgresos(savedEgresos);

        // Cargar inversión inicial
        const inversionDocRef = doc(db, 'config', 'inversionInicial');
        const inversionDoc = await getDoc(inversionDocRef);
        if (inversionDoc.exists()) {
          setInversionInicial(Number(inversionDoc.data().valor) || 0);
        } else {
          setInversionInicial(0);
        }
      } catch (error) {
        console.error("Error loading data: ", error);
        showNotification('Error al cargar datos', 'error');
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleAddDebt = async (newDebt) => {
    try {
      const debtRef = await addDoc(getCollectionRef('debts'), newDebt);
      setCurrentDebts([...currentDebts, { ...newDebt, id: debtRef.id }]);
      showNotification('Deuda registrada exitosamente');
    } catch (error) {
      console.error("Error adding debt: ", error);
      showNotification('Error al registrar deuda', 'error');
    }
  };

  const handleMarkAsPaid = async (debtId) => {
    try {
      const debtRef = doc(db, 'debts', debtId);
      await updateDoc(debtRef, { paid: true });
      setCurrentDebts(currentDebts.map(debt =>
        debt.id === debtId ? { ...debt, paid: true } : debt
      ));
      showNotification('Deuda marcada como pagada');
    } catch (error) {
      console.error("Error marking debt as paid: ", error);
      showNotification('Error al marcar deuda como pagada', 'error');
    }
  };

  const handleDeleteDebt = async (debtId) => {
    try {
      const debtRef = doc(db, 'debts', debtId);
      await deleteDoc(debtRef);
      setCurrentDebts(currentDebts.filter(debt => debt.id !== debtId));
      showNotification('Deuda eliminada correctamente');
    } catch (error) {
      console.error("Error deleting debt: ", error);
      showNotification('Error al eliminar deuda', 'error');
    }
  };

  // Egresos
  const handleAddEgreso = async (egreso) => {
    try {
      const egresoRef = await addDoc(getCollectionRef('egresos'), egreso);
      setCurrentEgresos([...currentEgresos, { ...egreso, id: egresoRef.id }]);
      showNotification('Egreso registrado exitosamente');
    } catch (error) {
      console.error("Error adding egreso: ", error);
      showNotification('Error al registrar egreso', 'error');
    }
  };

  const handleDeleteEgreso = async (egresoId) => {
    try {
      const egresoRef = doc(db, 'egresos', String(egresoId));
      await deleteDoc(egresoRef);
      setCurrentEgresos(currentEgresos.filter(e => String(e.id) !== String(egresoId)));
      showNotification('Egreso eliminado correctamente');
    } catch (error) {
      console.error("Error deleting egreso: ", error);
      showNotification('Error al eliminar egreso', 'error');
    }
  };

  // Editar egreso
  const handleEditEgreso = async (egresoEditado) => {
    try {
      const egresoRef = doc(db, 'egresos', String(egresoEditado.id));
      await updateDoc(egresoRef, {
        monto: egresoEditado.monto,
        descripcion: egresoEditado.descripcion,
        fecha: egresoEditado.fecha
      });
      setCurrentEgresos(currentEgresos.map(e => String(e.id) === String(egresoEditado.id) ? egresoEditado : e));
      showNotification('Egreso editado correctamente');
    } catch (error) {
      console.error("Error editando egreso: ", error);
      showNotification('Error al editar egreso', 'error');
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      if (clientData.id) {
        const clientRef = doc(db, 'clients', clientData.id);
        await updateDoc(clientRef, clientData);
        setCurrentClients(currentClients.map(client =>
          client.id === clientData.id ? clientData : client
        ));
        showNotification('Cliente actualizado correctamente');
      } else {
        const clientRef = await addDoc(getCollectionRef('clients'), clientData);
        setCurrentClients([...currentClients, { ...clientData, id: clientRef.id }]);
        showNotification('Cliente agregado correctamente');
      }
    } catch (error) {
      console.error("Error adding or updating client: ", error);
      showNotification('Error al guardar cliente', 'error');
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const debtsQuery = query(
        collection(db, 'debts'),
        where('clientId', '==', clientId),
        where('paid', '==', false)
      );

      const pendingDebtsSnapshot = await getDocs(debtsQuery);

      if (!pendingDebtsSnapshot.empty) {
        showNotification('No puedes eliminar un cliente con deudas pendientes', 'error');
        return;
      }

      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);

      if (!clientDoc.exists()) {
        showNotification('El cliente no existe o ya ha sido eliminado', 'warning');
        return;
      }

      await deleteDoc(clientRef);
      setCurrentClients(currentClients.filter(client => client.id !== clientId));
      showNotification('Cliente eliminado correctamente');
    } catch (error) {
      console.error("Error deleting client: ", error);
      showNotification('Error al eliminar cliente: ' + error.message, 'error');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      if (productData.id) {
        const productRef = doc(db, 'products', productData.id);
        await updateDoc(productRef, productData);
        setCurrentProducts(currentProducts.map(product =>
          product.id === productData.id ? productData : product
        ));
        showNotification('Producto actualizado correctamente');
      } else {
        const productRef = await addDoc(getCollectionRef('products'), productData);
        setCurrentProducts([...currentProducts, { ...productData, id: productRef.id }]);
        showNotification('Producto agregado correctamente');
      }
    } catch (error) {
      console.error("Error adding or updating product: ", error);
      showNotification('Error al guardar producto', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        showNotification('El producto no existe o ya ha sido eliminado', 'warning');
        return;
      }

      const productInUse = currentDebts.some(debt =>
        debt.items.some(item => item.productId === productId)
      );

      if (productInUse) {
        showNotification('No puedes eliminar un producto que está en uso en deudas registradas', 'error');
        return;
      }

      await deleteDoc(productRef);
      setCurrentProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      );
      showNotification('Producto eliminado correctamente', 'success');
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showNotification('Error al eliminar producto: ' + error.message, 'error');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar responsivo */}
      <KioskoSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <KioskoHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {showToast && (
          <KioskoToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <>
              <KioskoDashboard
                debts={currentDebts}
                products={currentProducts}
                clients={currentClients}
                egresos={currentEgresos}
                inversionInicial={inversionInicial}
                onAddDebt={handleAddDebt}
                loggedUser={currentUser?.email}
              />
              <div className="mt-6">
                <KioskoSalesForm
                  onAddDebt={handleAddDebt}
                  clients={currentClients}
                  products={currentProducts}
                  loggedUser={currentUser?.email}
                />
              </div>
            </>
          )}
          {activeTab === 'sales-report' && (
            <SalesReport
              sales={currentDebts} // Pasar las deudas como ventas
              users={[...new Set(currentDebts.map(debt => debt.user))]} // Extraer usuarios únicos
              clients={currentClients}
              products={currentProducts}
            />
          )}

          {activeTab === 'analytics' && (
            <KioskoAnalytics
              debts={currentDebts}
              products={currentProducts}
              clients={currentClients}
              egresos={currentEgresos}
              inversionInicial={inversionInicial}
            />
          )}

          {activeTab === 'debts' && (
            <KioskoDebtsList
              debts={currentDebts}
              onMarkAsPaid={handleMarkAsPaid}
              onDeleteDebt={handleDeleteDebt}
              clients={currentClients}
              products={currentProducts}
            />
          )}

          {activeTab === 'clients' && (
            <KioskoClientsList
              clients={currentClients}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              debts={currentDebts}
              products={currentProducts}
            />
          )}

          {activeTab === 'products' && (
            <KioskoProductsList
              products={currentProducts}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              debts={currentDebts}
            />
          )}

          {activeTab === 'egresos' && (
            <KioskoEgresos
              egresos={currentEgresos}
              onAddEgreso={handleAddEgreso}
              onDeleteEgreso={handleDeleteEgreso}
              onEditEgreso={handleEditEgreso}
              inversionInicial={inversionInicial}
              setInversionInicial={async (nuevoValor) => {
                try {
                  const inversionDocRef = doc(db, 'config', 'inversionInicial');
                  await updateDoc(inversionDocRef, { valor: Number(nuevoValor) });
                  setInversionInicial(Number(nuevoValor));
                  showNotification('Inversión inicial actualizada');
                } catch (error) {
                  // Si el doc no existe, lo creamos
                  if (error.code === 'not-found' || error.message.includes('No document to update')) {
                    const inversionDocRef = doc(db, 'config', 'inversionInicial');
                    await setDoc(inversionDocRef, { valor: Number(nuevoValor) });
                    setInversionInicial(Number(nuevoValor));
                    showNotification('Inversión inicial guardada');
                  } else {
                    showNotification('Error al guardar inversión inicial', 'error');
                  }
                }
              }}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <KioskoAdminPanel
              currentUser={currentUser}
              onLogout={() => { }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <KioskoLogin />
            </PublicRoute>
          } />
          <Route path="/dashboard/*" element={
            <KioskoProtectedRoute>
              <MainApp />
            </KioskoProtectedRoute>
          } />
          <Route path="/admin" element={
            <KioskoProtectedRoute requireAdmin={true}>
              <MainApp />
            </KioskoProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default App;
