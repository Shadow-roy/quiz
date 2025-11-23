import React from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onCancel}
        >
            <div
                className="bg-card rounded-xl border border-border shadow-lg p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 rounded-full mr-4">
                        <AlertTriangle className="w-6 h-6 text-danger" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                </div>
                <p className="text-text-secondary mb-8 ml-14">{message}</p>
                <div className="flex justify-end space-x-4">
                    <Button onClick={onCancel} variant="secondary">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} variant="primary">
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;