import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

const firebaseService = {
  // Clientes
  getClients: async () => {
    const snapshot = await getDocs(collection(db, 'clients'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addClient: async (client) => {
    await addDoc(collection(db, 'clients'), client);
  },

  // Productos
  getProducts: async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addProduct: async (product) => {
    await addDoc(collection(db, 'products'), product);
  },

  // Deudas
  getDebts: async () => {
    const snapshot = await getDocs(collection(db, 'debts'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addDebt: async (debt) => {
    await addDoc(collection(db, 'debts'), debt);
  },

  markDebtAsPaid: async (debtId) => {
    await updateDoc(doc(db, 'debts', debtId), { paid: true });
  }
};

export default firebaseService;