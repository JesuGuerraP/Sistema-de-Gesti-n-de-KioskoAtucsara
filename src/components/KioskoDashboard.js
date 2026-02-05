import React from 'react';
import { Card, CardContent } from './ui/Card';

const KioskoDashboard = ({ debts, products, clients, egresos = [], inversionInicial = 0 }) => {
  // Calcular métricas financieras
  const totalSales = debts.length;
  const pendingDebts = debts.filter(d => !d.paid);
  const paidDebts = debts.filter(d => d.paid);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const totalRevenue = paidDebts.reduce((sum, debt) => sum + calculateTotal(debt.items), 0) + Number(inversionInicial || 0);
  const totalPending = pendingDebts.reduce((sum, debt) => sum + calculateTotal(debt.items), 0);
  const totalGastos = egresos.reduce((sum, egreso) => sum + (Number(egreso.monto) || 0), 0);
  // El total potencial solo suma lo recibido (deudas pagadas + inversion) menos los gastos
  const totalPotential = totalRevenue - totalGastos;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resumen Financiero</h2>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Dinero Recibido"
          value={totalRevenue}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="Total ingresos netos"
          trendColor="text-emerald-600"
        />
        <StatsCard
          title="Dinero Pendiente"
          value={totalPending}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="Por cobrar"
          trendColor="text-amber-500"
        />
        <StatsCard
          title="Saldo Actual"
          value={totalPotential}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 2.025v1.5a1.5 1.5 0 001.5 1.5h-13a1.5 1.5 0 001.5-1.5v-1.5a7.5 7.5 0 00-7.5 7.5h12a7.5 7.5 0 00-7.5-7.5z" />
            </svg>
          }
          trend="Disponible en caja (aprox)"
          trendColor="text-primary-600"
        />
        <StatsCard
          title="Gastos Totales"
          value={totalGastos}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-rose-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend="Egresos registrados"
          trendColor="text-rose-500"
        />
      </div>

      {/* Tarjetas secundarias */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Ventas Totales"
          value={totalSales}
          noCurrency
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          trend="Transacciones"
          trendColor="text-slate-500"
        />
        <StatsCard
          title="Deudas Activas"
          value={pendingDebts.length}
          noCurrency
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          trend="Clientes con deuda"
          trendColor="text-amber-500"
        />
        <StatsCard
          title="Base de Clientes"
          value={clients.length}
          noCurrency
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          trend="Total registrados"
          trendColor="text-blue-500"
        />
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, noCurrency, trend, trendColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-slate-50 rounded-full">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {noCurrency
                ? value
                : value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
          </div>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`${trendColor} font-medium`}>{trend}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default KioskoDashboard;
