import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, ListChecks, Users, Shield, Bell, ArrowLeft } from 'lucide-react';
import { notificationService, Notification } from '@/pages/services/notificationService';

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateNotifications = () => {
            setNotifications(notificationService.getNotifications());
        };

        updateNotifications();
        window.addEventListener('notifications_updated', updateNotifications);
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'quiz_app_notifications') updateNotifications();
        };
        window.addEventListener('storage', handleStorageChange);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('notifications_updated', updateNotifications);
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        const updatedNotifications = notificationService.markAllAsRead();
        setNotifications(updatedNotifications);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
            ? 'bg-blue-100 text-admin-primary'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;
    
    return (
        <div className="min-h-screen bg-admin-background text-text-primary font-sans flex overflow-x-hidden">
            <aside className="w-64 bg-white flex flex-col border-r border-border flex-shrink-0">
                <div className="h-16 flex items-center justify-start px-6 border-b border-border">
                    <h1 className="text-xl font-bold text-admin-primary flex items-center"><Shield className="mr-2"/>Admin Panel</h1>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <nav className="px-4 py-4 space-y-2">
                        <NavLink to="/admin/quizzes" className={navLinkClass}>
                            <ListChecks className="w-5 h-5 mr-3" />
                            Manage Quizzes
                        </NavLink>
                         <NavLink to="/admin/users" className={navLinkClass}>
                            <Users className="w-5 h-5 mr-3" />
                            Manage Users
                        </NavLink>
                    </nav>
                    
                    <div className="p-4 border-t border-border">
                        <Link to="/dashboard" className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mb-4">
                            <ArrowLeft className="w-5 h-5 mr-3" />
                            Back to App
                        </Link>
                        <div className="p-3 rounded-lg mb-4">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-gray-100">
                                    <Shield className="w-5 h-5 text-text-secondary" />
                                </div>
                                <div className="ml-3 overflow-hidden">
                                    <p className="text-sm font-semibold text-text-primary truncate">{user?.email}</p>
                                    <p className="text-xs text-text-secondary">Administrator</p>
                                </div>
                            </div>
                        </div>
                         <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                         >
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="h-16 flex items-center justify-end px-4 sm:px-6 border-b border-border bg-white sticky top-0 z-10">
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative text-gray-500 hover:text-admin-primary">
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-xs">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-border z-10">
                                <div className="p-3 border-b border-border">
                                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <p className="text-text-secondary text-sm p-3">No new notifications.</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b border-border last:border-b-0 ${!n.read ? 'bg-blue-50' : ''}`}>
                                                <p className="text-sm text-text-primary break-words">{n.message}</p>
                                                <p className="text-xs text-text-secondary mt-1 text-right">{new Date(n.timestamp).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <div className="p-2 border-t border-border">
                                        <button onClick={handleMarkAllRead} className="w-full text-center text-sm text-admin-primary font-medium hover:underline">Mark all as read</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;