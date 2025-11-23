import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20 bg-background">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-4xl font-semibold text-text-primary mt-4">Page Not Found</h2>
            <p className="text-text-secondary mt-2">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/dashboard">
                <Button className="mt-8">Go to Dashboard</Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;