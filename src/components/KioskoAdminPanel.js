import React, { useState, useEffect } from 'react';
import { 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  collection,
  query,
  where
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  updateEmail, 
  updatePassword,
  deleteUser,
  signOut
} from 'firebase/auth';
import { db, auth, getCollectionRef } from '../firebaseConfig';
import KioskoToast from './KioskoToast';

const KioskoAdminPanel = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', isAdmin: false });
  const [editingUser, setEditingUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Cargar usuarios desde Firestore
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const usersSnapshot = await getDocs(getCollectionRef('users'));
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        
        // Obtener el email del usuario actual
        if (currentUser && currentUser.email) {
          setCurrentAdminEmail(currentUser.email);
          
          // Verificar si el usuario actual es admin
          const userQuery = query(
            collection(db, 'users'),
            where('email', '==', currentUser.email)
          );
          
          const userSnapshot = await getDocs(userQuery);
          if (userSnapshot.empty) {
            showNotification('No se encontró información del usuario actual', 'error');
          }
        }
      } catch (error) {
        console.error("Error loading users:", error);
        showNotification('Error al cargar usuarios: ' + error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [currentUser]);

  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si el email ya está en uso
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', newUser.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        showNotification('Este correo electrónico ya está en uso', 'error');
        return;
      }
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUser.email, 
        newUser.password
      );
      
      // Guardar información adicional en Firestore
      const userDoc = {
        uid: userCredential.user.uid,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        createdAt: new Date(),
        createdBy: currentUser.uid
      };
      
      await addDoc(getCollectionRef('users'), userDoc);
      
      // Actualizar lista de usuarios
      setUsers([...users, { id: userCredential.user.uid, ...userDoc }]);
      
      // Limpiar formulario
      setNewUser({ email: '', password: '', name: '', isAdmin: false });
      
      showNotification('Usuario creado exitosamente', 'success');
    } catch (error) {
      console.error("Error creating user:", error);
      let errorMessage = 'Error al crear usuario';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El correo electrónico no es válido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      setIsLoading(true);
      
      // Buscar el documento del usuario en Firestore
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', editingUser.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        showNotification('No se encontró información del usuario', 'error');
        return;
      }
      
      const userDoc = userSnapshot.docs[0];
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', userDoc.id), {
        name: editingUser.name,
        isAdmin: editingUser.isAdmin,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      });
      
      // Actualizar lista de usuarios
      setUsers(
        users.map(user => 
          user.email === editingUser.email 
            ? { ...user, name: editingUser.name, isAdmin: editingUser.isAdmin } 
            : user
        )
      );
      
      // Limpiar formulario
      setEditingUser(null);
      
      showNotification('Usuario actualizado exitosamente', 'success');
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification('Error al actualizar usuario: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.email === currentAdminEmail) {
      showNotification('No puedes eliminar tu propia cuenta', 'error');
      return;
    }
    
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario ${userToDelete.name || userToDelete.email}?`
    );
    
    if (!confirmDelete) return;
    
    try {
      setIsLoading(true);
      
      // Buscar el documento del usuario en Firestore
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', userToDelete.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await deleteDoc(doc(db, 'users', userDoc.id));
      }
      
      // Actualizar lista de usuarios
      setUsers(users.filter(user => user.email !== userToDelete.email));
      
      showNotification('Usuario eliminado exitosamente', 'success');
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification('Error al eliminar usuario: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      password: '' // No mostrar la contraseña actual
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error("Error signing out:", error);
      showNotification('Error al cerrar sesión: ' + error.message, 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {showToast && (
        <KioskoToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Panel de Administración</h2>
        <button
          onClick={handleSignOut}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Cerrar Sesión
        </button>
      </div>
      
      {/* Formulario para crear nuevo usuario */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Crear Nuevo Usuario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              className="border rounded w-full py-2 px-3"
              required
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center mt-4">
              <input
                type="checkbox"
                checked={newUser.isAdmin}
                onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                className="form-checkbox"
              />
              <span className="ml-2">Es Administrador</span>
            </label>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleCreateUser}
            disabled={isLoading || !newUser.email || !newUser.password || !newUser.name}
            className={`bg-green-500 text-white py-2 px-4 rounded ${
              (isLoading || !newUser.email || !newUser.password || !newUser.name) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-green-600'
            }`}
          >
            {isLoading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
      </div>
      
      {/* Lista de usuarios */}
      <div>
        <h3 className="text-lg font-medium mb-4">Usuarios del Sistema</h3>
        {isLoading && <p>Cargando usuarios...</p>}
        
        {!isLoading && users.length === 0 && (
          <p className="text-gray-500">No hay usuarios registrados</p>
        )}
        
        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo Electrónico
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isAdmin 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.isAdmin ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className={`text-red-600 hover:text-red-900 ${
                          user.email === currentAdminEmail ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={user.email === currentAdminEmail}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal para editar usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="border rounded w-full py-2 px-3 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="border rounded w-full py-2 px-3"
                  required
                />
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span className="ml-2">Es Administrador</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={isLoading || !editingUser.name}
                className={`bg-blue-500 text-white py-2 px-4 rounded ${
                  (isLoading || !editingUser.name) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskoAdminPanel;