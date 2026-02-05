import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

// Paleta de colores profesional
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'];

const KioskoAnalytics = ({ debts = [], products = [], clients = [], egresos = [], inversionInicial = 0 }) => {
    // Estado para rango de fechas
    const [dateRange, setDateRange] = useState('month'); // week, month, all, custom
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // --- Helper Functions ---
    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

    // --- Filtros de Fecha ---
    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date(); // Default dummy
        let endDate = new Date();

        if (dateRange === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (dateRange === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (dateRange === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
        } else if (dateRange === 'custom') {
            startDate = customStartDate ? new Date(customStartDate) : new Date(0); // 1970 if empty
            endDate = customEndDate ? new Date(customEndDate) : now;
            // Ajustar endDate al final del día
            endDate.setHours(23, 59, 59, 999);
        } else {
            // All time
            startDate = new Date(0);
        }

        // Poner start date al inicio del día (excepto para custom que ya viene input date)
        if (dateRange !== 'custom') {
            startDate.setHours(0, 0, 0, 0);
        }

        const filterDate = (item) => {
            const itemDate = new Date(item.date || item.fecha); // debts uses .date, egresos uses .fecha
            return itemDate >= startDate && itemDate <= endDate;
        };

        return {
            debts: debts.filter(d => filterDate(d)),
            egresos: egresos.filter(e => filterDate(e)),
            startDate,
            endDate
        };
    }, [debts, egresos, dateRange, customStartDate, customEndDate]);

    const { debts: currentDebts, egresos: currentEgresos } = filteredData;

    // --- KPIs Calculate ---
    const kpiData = useMemo(() => {
        // Ingresos Reales (Pagado) vs Ventas Totales (Pagado + Pendiente)
        let totalVentas = 0;
        let ingresosReales = 0;
        let deudaPendiente = 0;

        currentDebts.forEach(debt => {
            const items = debt.items || [];
            const subtotal = items.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
            }, 0);

            totalVentas += subtotal;
            if (debt.paid) {
                ingresosReales += subtotal;
            } else {
                deudaPendiente += subtotal;
            }
        });

        const totalEgresos = currentEgresos.reduce((sum, e) => sum + (Number(e.monto) || 0), 0);
        const utilidadNeta = ingresosReales - totalEgresos; // Cash flow basic

        return {
            totalVentas,
            ingresosReales,
            deudaPendiente,
            totalEgresos,
            utilidadNeta
        };
    }, [currentDebts, currentEgresos, products]);

    // --- Chart Data: Ingresos vs Egresos Timeline ---
    const timelineData = useMemo(() => {
        const dataMap = {};

        // Procesar Ventas
        currentDebts.forEach(debt => {
            const date = debt.date; // YYYY-MM-DD
            if (!dataMap[date]) dataMap[date] = { date, ventas: 0, egresos: 0 };

            const total = (debt.items || []).reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
            }, 0);

            dataMap[date].ventas += total;
        });

        // Procesar Egresos
        currentEgresos.forEach(egreso => {
            const date = egreso.fecha; // YYYY-MM-DD
            if (!dataMap[date]) dataMap[date] = { date, ventas: 0, egresos: 0 };
            dataMap[date].egresos += Number(egreso.monto);
        });

        return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [currentDebts, currentEgresos, products]);

    // --- Chart Data: Top Clientes (Por Venta Total) ---
    const topClientsData = useMemo(() => {
        const clientSales = {};
        currentDebts.forEach(debt => {
            // Find client name if clientId exists, else fallback or use user
            let clientName = 'Desconocido';
            if (debt.clientId) {
                const c = clients.find(cl => cl.id === debt.clientId);
                if (c) clientName = c.name;
            } else if (debt.user) {
                clientName = debt.user;
            }

            if (!clientSales[clientName]) clientSales[clientName] = 0;

            const total = (debt.items || []).reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
            }, 0);

            clientSales[clientName] += total;
        });

        return Object.entries(clientSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [currentDebts, clients, products]);

    // --- Chart Data: Top Productos ---
    const topProductsData = useMemo(() => {
        const productCounts = {};
        currentDebts.forEach(debt => {
            debt.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const name = product ? product.name : 'Unknown';
                if (!productCounts[name]) productCounts[name] = 0;
                productCounts[name] += Number(item.quantity);
            });
        });

        return Object.entries(productCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [currentDebts, products]);

    // --- Chart Data: Debts Status Distribution ---
    const debtStatusData = [
        { name: 'Pagado', value: kpiData.ingresosReales, color: '#10b981' }, // green
        { name: 'Pendiente', value: kpiData.deudaPendiente, color: '#ef4444' } // red
    ].filter(d => d.value > 0);


    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header / Filters Section */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Panel Financiero</h2>
                    <p className="text-sm text-slate-500">Resumen y métricas clave del negocio</p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['week', 'month', 'all', 'custom'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range === 'week' ? '7 Días' :
                                    range === 'month' ? 'Mes' :
                                        range === 'all' ? 'Todo' : 'Rango'}
                            </button>
                        ))}
                    </div>

                    {dateRange === 'custom' && (
                        <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-4">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="text-sm border border-slate-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Ventas Totales"
                    value={formatCurrency(kpiData.totalVentas)}
                    icon="💰"
                    trend={dateRange !== 'all' ? "En periodo seleccionado" : null}
                    color="indigo"
                />
                <SummaryCard
                    title="Ingresos Reales"
                    value={formatCurrency(kpiData.ingresosReales)}
                    subValue={`Pendiente: ${formatCurrency(kpiData.deudaPendiente)}`}
                    icon="✅"
                    color="emerald"
                />
                <SummaryCard
                    title="Total Gastos"
                    value={formatCurrency(kpiData.totalEgresos)}
                    icon="💸"
                    color="rose"
                />
                <SummaryCard
                    title="Utilidad Neta"
                    value={formatCurrency(kpiData.utilidadNeta)}
                    icon="📊"
                    color={kpiData.utilidadNeta >= 0 ? "blue" : "orange"}
                    trend="Ingresos - Gastos"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Ingresos vs Gastos (Timeline) - Takes up 2 columns */}
                <Card className="lg:col-span-2 shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle>Flujo de Caja: Ventas vs Gastos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            {timelineData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Area type="monotone" name="Ventas" dataKey="ventas" stroke="#6366f1" fillOpacity={1} fill="url(#colorVentas)" strokeWidth={2} />
                                        <Area type="monotone" name="Gastos" dataKey="egresos" stroke="#ef4444" fillOpacity={1} fill="url(#colorEgresos)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No hay movimientos en este periodo" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Debt Status (Donut) */}
                <Card className="shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle>Estado de Cobranza</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full flex flex-col items-center justify-center">
                            {debtStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={debtStatusData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {debtStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No hay datos de deudas" />
                            )}
                            <div className="text-center mt-[-10px]">
                                <p className="text-xs text-slate-500">Total: {formatCurrency(kpiData.totalVentas)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Top Products (Pie/Bar) */}
                <Card className="shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle>Top 5 Productos (Unidades)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {topProductsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={topProductsData} margin={{ left: 0, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} interval={0} />
                                        <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                            {/* Label list could be added here */}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No hay ventas de productos" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Top Clients (Bar List) */}
                <Card className="lg:col-span-2 shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle>Mejores Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {topClientsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topClientsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                                        <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Compras Totales" barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="No hay datos de clientes" />
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

// --- Sub-components for cleaner code ---

const SummaryCard = ({ title, value, subValue, icon, color, trend }) => {
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100"
    };

    const activeColor = colorClasses[color] || colorClasses.indigo;

    return (
        <div className={`p-5 rounded-2xl border ${activeColor.split(' ')[2]} bg-white shadow-sm flex items-start justify-between transition hover:shadow-md`}>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
                {subValue && <p className="text-xs text-slate-500 mt-1 font-medium">{subValue}</p>}
                {trend && <p className="text-xs text-slate-400 mt-2">{trend}</p>}
            </div>
            <div className={`p-3 rounded-xl ${activeColor}`}>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50/50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
    </div>
);

export default KioskoAnalytics;
