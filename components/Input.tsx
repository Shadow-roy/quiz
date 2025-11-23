import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    id: string;
    variant?: 'default' | 'admin';
}

const Input: React.FC<InputProps> = ({ label, id, className, variant = 'default', ...props }) => {
    const baseClasses = 'w-full rounded-lg py-2 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 transition duration-300 bg-white border border-border text-text-primary';
    const variantClasses = {
        default: 'focus:ring-primary focus:border-primary',
        admin: 'focus:ring-admin-primary focus:border-admin-primary',
    };

    return (
        <div>
            {label && <label htmlFor={id} className={`block text-sm font-medium mb-2 text-text-primary`}>{label}</label>}
            <input
                id={id}
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;