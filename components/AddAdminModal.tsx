import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { authService } from '@/pages/services/authService';
import { X, UserPlus } from 'lucide-react';

interface AddAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdminAdded: () => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAdminAdded }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 8) {
             setError('Password must be at least 8 characters long.');
            return;
        }
        setError('');
        setLoading(true);

        const result = await authService.createAdminUser(email, password);

        if (result.error) {
            setError(result.error);
        } else {
            onAdminAdded();
            onClose();
            // Reset state for next time
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl border border-border shadow-lg p-6 w-full max-w-md m-4 transform transition-all duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-text-primary flex items-center">
                        <UserPlus className="mr-3 text-admin-primary"/>
                        Add New Admin
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input id="admin-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required variant="admin" />
                    <Input id="admin-password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required variant="admin" />
                    <Input id="admin-confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required variant="admin" />
                    
                    {error && <p className="text-danger text-sm">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <Button onClick={onClose} variant="admin-secondary" type="button">Cancel</Button>
                        <Button type="submit" variant="admin-primary" disabled={loading}>
                            {loading ? 'Adding Admin...' : 'Add Admin'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdminModal;