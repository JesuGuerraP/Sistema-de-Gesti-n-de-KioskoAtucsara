import { getCollectionRef } from '../firebaseConfig';
import { addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseService = {
  // Clientes
  getClients: async () => {
    const snapshot = await getDocs(getCollectionRef('clients'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  addClient: async (client) => {
    await addDoc(getCollectionRef('clients'), client);
  },

  // Productos
  getProducts: async () => {
    const snapshot = await getDocs(getCollectionRef('products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  addProduct: async (product) => {
    await addDoc(getCollectionRef('products'), product);
  },

  // Deudas
  getDebts: async () => {
    const snapshot = await getDocs(getCollectionRef('debts'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  addDebt: async (debt) => {
    await addDoc(getCollectionRef('debts'), debt);
  },
  markDebtAsPaid: async (debtId) => {
    const debtRef = doc(getCollectionRef('debts'), debtId);
    await updateDoc(debtRef, { paid: true });
  }
};

export default firebaseService;