import React from 'react';

const Input = React.forwardRef(({ className = '', label, error, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
          flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400
          focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
