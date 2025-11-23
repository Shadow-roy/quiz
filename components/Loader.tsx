import React from 'react';

interface LoaderProps {
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="w-16 h-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-primary text-lg">{text}</p>
        </div>
    );
};

export default Loader;