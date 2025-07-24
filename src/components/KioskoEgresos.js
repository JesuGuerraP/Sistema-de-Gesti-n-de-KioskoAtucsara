import React, { useState } from 'react';

const KioskoEgresos = ({ egresos, onAddEgreso, onDeleteEgreso, onEditEgreso }) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editMonto, setEditMonto] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');

  const handleAddEgreso = (e) => {
    e.preventDefault();
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setError('Ingrese un monto válido');
      return;
    }
    if (!descripcion.trim()) {
      setError('Ingrese una descripción');
      return;
    }
    onAddEgreso({
      monto: Number(monto),
      descripcion: descripcion.trim(),
      fecha: new Date().toISOString(),
    });
    setMonto('');
    setDescripcion('');
    setError('');
  };

  const startEdit = (egreso) => {
    setEditId(egreso.id);
    setEditMonto(egreso.monto);
    setEditDescripcion(egreso.descripcion);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditMonto('');
    setEditDescripcion('');
  };

  const handleEditEgreso = (e) => {
    e.preventDefault();
    if (!editMonto || isNaN(Number(editMonto)) || Number(editMonto) <= 0) {
      setError('Ingrese un monto válido');
      return;
    }
    if (!editDescripcion.trim()) {
      setError('Ingrese una descripción');
      return;
    }
    onEditEgreso({
      id: editId,
      monto: Number(editMonto),
      descripcion: editDescripcion.trim(),
      fecha: new Date().toISOString(),
    });
    cancelEdit();
    setError('');
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-8 text-gray-800 tracking-tight">Egresos</h2>
      <form onSubmit={handleAddEgreso} className="mb-8 flex flex-col gap-3">
        <div>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Monto"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition font-semibold">Agregar Egreso</button>
      </form>
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Lista de Egresos</h3>
      <ul className="divide-y">
        {egresos.length === 0 && <li className="py-2 text-gray-500">No hay egresos registrados.</li>}
        {egresos.map(egreso => (
          <li key={egreso.id} className="py-3 flex justify-between items-center">
            {editId === egreso.id ? (
              <form onSubmit={handleEditEgreso} className="flex-1 flex gap-2 items-center">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editMonto}
                  onChange={e => setEditMonto(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-24 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
                <input
                  type="text"
                  value={editDescripcion}
                  onChange={e => setEditDescripcion(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 flex-1 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
                <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg font-semibold">Guardar</button>
                <button type="button" onClick={cancelEdit} className="bg-gray-200 px-3 py-1 rounded-lg font-semibold">Cancelar</button>
              </form>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-800">{egreso.descripcion}</span> <br />
                  <span className="text-xs text-gray-500">{new Date(egreso.fecha).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">- {egreso.monto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                  <button onClick={() => startEdit(egreso)} className="text-blue-500 hover:underline text-xs font-semibold">Editar</button>
                  <button onClick={() => onDeleteEgreso(egreso.id)} className="text-red-500 hover:underline text-xs font-semibold">Eliminar</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KioskoEgresos;
