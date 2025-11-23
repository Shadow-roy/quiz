import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'admin-primary' | 'admin-secondary';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary focus:ring-offset-background',
        secondary: 'bg-card border border-border text-text-primary hover:bg-slate-50 focus:ring-primary focus:ring-offset-background',
        danger: 'bg-danger text-white hover:opacity-90 focus:ring-danger focus:ring-offset-background',
        success: 'bg-success text-white hover:opacity-90 focus:ring-success focus:ring-offset-background',
        'admin-primary': 'bg-admin-primary text-white hover:opacity-90 focus:ring-admin-primary focus:ring-offset-admin-background',
        'admin-secondary': 'bg-white border border-border text-text-primary hover:bg-gray-50 focus:ring-admin-primary focus:ring-offset-admin-background',
    };
    
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;