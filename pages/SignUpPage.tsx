import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const user = await signup(email, password);
            if (user) {
                navigate('/dashboard');
            } else {
                setError('An account with this email already exists.');
            }
        } catch (err) {
            setError('Failed to create an account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-card rounded-xl border border-border shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-text-primary">Sign Up</h1>
                    <p className="mt-2 text-text-secondary">Create an account to start quizzing</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input id="email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                    <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                    <Input id="confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                    {error && <p className="text-danger text-sm">{error}</p>}
                    <div>
                        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </div>
                </form>
                <p className="text-center text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;