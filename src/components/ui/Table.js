import React from 'react';

export const Table = ({ children, className = '', ...props }) => (
    <div className="w-full overflow-auto">
        <table className={`w-full caption-bottom text-sm text-left ${className}`} {...props}>
            {children}
        </table>
    </div>
);

export const TableHeader = ({ children, className = '', ...props }) => (
    <thead className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props}>
        {children}
    </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
    <tbody className={`divide-y divide-slate-100 ${className}`} {...props}>
        {children}
    </tbody>
);

export const TableRow = ({ children, className = '', ...props }) => (
    <tr className={`hover:bg-slate-50 transition-colors ${className}`} {...props}>
        {children}
    </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
    <th className={`h-12 px-4 align-middle font-semibold text-slate-600 whitespace-nowrap ${className}`} {...props}>
        {children}
    </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
    <td className={`p-4 align-middle text-slate-600 ${className}`} {...props}>
        {children}
    </td>
);
