import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const KioskoAnalytics = ({ debts, products }) => {

    console.log('KioskoAnalytics received:', { debtsCount: debts?.length, productsCount: products?.length });

    // 1. Process Data for Revenue Trends (Last 7 days or grouped by date)
    const revenueData = useMemo(() => {
        if (!debts || !products) return [];
        const data = {};
        debts.forEach(debt => {
            // Solo contar deudas pagadas para ingresos reales, o todas para ventas totales? 
            // Vamos a usar 'Ventas Totales' (pagadas y pendientes) para ver movimiento
            const date = debt.date;
            const items = debt.items || [];
            const total = items.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (Number(product?.price) || 0) * (Number(item.quantity) || 0);
            }, 0);

            if (!data[date]) {
                data[date] = 0;
            }
            data[date] += total;
        });

        // Convert to array and sort by date
        const result = Object.keys(data).map(date => ({
            date,
            total: data[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Computed Revenue Data:', result);
        return result;
    }, [debts, products]);

    // 2. Process Data for Top Selling Products
    const topProductsData = useMemo(() => {
        const productCounts = {};
        debts.forEach(debt => {
            debt.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const name = product ? product.name : 'Unknown';

                if (!productCounts[name]) {
                    productCounts[name] = 0;
                }
                productCounts[name] += item.quantity;
            });
        });

        return Object.keys(productCounts)
            .map(name => ({ name, value: productCounts[name] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [debts, products]);

    // Formatter for currency
    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue Chart */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Tendencia de Ventas (Ingresos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Important: Recharts ResponsiveContainer needs a defined height in the parent */}
                        <div className="w-full h-[350px] min-h-[350px]">
                            {revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [formatCurrency(value), 'Venta Total']}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="#6366f1"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                    </svg>
                                    <span className="text-sm font-medium">No hay datos de ventas registrados</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products Chart */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Productos Más Vendidos (Top 5)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[350px] min-h-[350px]">
                            {topProductsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={topProductsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {topProductsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.25a3 3 0 00-3 3 .75.75 0 01.75.75m0 0a3 3 0 003 3m0 0a3 3 0 003-3m0 0a.75.75 0 01-.75-.75m0 0a3 3 0 00-3-3m0 3.5V4.75a2.25 2.25 0 10-4.5 0v.75m7.5-3.75h-9" />
                                    </svg>
                                    <span className="text-sm font-medium">No hay productos vendidos aún</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default KioskoAnalytics;
