import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, BarChart3, Shield, User } from 'lucide-react';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
            ? 'bg-indigo-50 text-primary'
            : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
        }`;

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex overflow-x-hidden">
            <aside className="w-64 bg-sidebar flex flex-col border-r border-border flex-shrink-0">
                 <div className="h-16 flex items-center px-6 border-b border-border">
                    <h1 className="text-xl font-bold text-primary">Quiz</h1>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <nav className="px-4 py-4 space-y-2">
                        <NavLink to="/dashboard" className={navLinkClass}>
                            <LayoutDashboard className="w-5 h-5 mr-3" />
                            Dashboard
                        </NavLink>
                        <NavLink to="/leaderboard" className={navLinkClass}>
                            <BarChart3 className="w-5 h-5 mr-3" />
                            Leaderboard
                        </NavLink>
                         <NavLink to="/profile" className={navLinkClass}>
                            <User className="w-5 h-5 mr-3" />
                            Profile
                        </NavLink>
                        {user?.role === 'admin' && (
                            <NavLink to="/admin" className={navLinkClass}>
                                <Shield className="w-5 h-5 mr-3" />
                                Admin Panel
                            </NavLink>
                        )}
                    </nav>

                    <div className="p-4 border-t border-border">
                         <div className="p-3 rounded-lg bg-slate-100 mb-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-primary/20 text-primary">
                                    <User className="w-5 h-5" />
                                </div>
                                <p className="ml-3 text-sm font-semibold text-text-primary truncate">{user?.email}</p>
                            </div>
                         </div>
                         <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                         >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;