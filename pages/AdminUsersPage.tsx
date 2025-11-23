import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/types';
import { authService } from './services/authService';
import { leaderboardService } from './services/leaderboardService';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import Input from '@/components/Input';
import ConfirmModal from '@/components/ConfirmModal';
import { PlusCircle, Trash2, Search, ShieldCheck, User as UserIcon, FileText } from 'lucide-react';
import UserHistoryModal from '@/components/UserHistoryModal';
import AddAdminModal from '@/components/AddAdminModal';
import AddUserModal from '@/components/AddUserModal';

const AdminUsersPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [userStats, setUserStats] = useState<{ [userId: string]: { quizzesTaken: number; lastActive: string | null } }>({});
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToView, setUserToView] = useState<User | null>(null);
    const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, scoresData] = await Promise.all([
                authService.getAllUsers(),
                leaderboardService.getAllScores(),
            ]);

            setUsers(usersData);

            const newUserStats: { [key: string]: { quizzesTaken: number; lastActive: string | null } } = {};
            usersData.forEach(user => {
                if (user.role === 'user') {
                    const userScores = scoresData.filter(s => s.userId === user.id);
                    const lastScore = userScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    newUserStats[user.id] = {
                        quizzesTaken: new Set(userScores.map(s => s.quizId)).size,
                        lastActive: lastScore ? new Date(lastScore.date).toLocaleDateString() : 'Never'
                    };
                }
            });
            setUserStats(newUserStats);

        } catch (error) {
            console.error("Failed to load user data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredUsers = useMemo(() => {
        const usersByTab = activeTab === 'admins'
            ? users.filter(u => u.role === 'admin')
            : users.filter(u => u.role === 'user');
        return usersByTab.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase()));
    }, [users, userSearch, activeTab]);

    const handleConfirmUserDelete = async () => {
        if (userToDelete) {
            await authService.deleteUser(userToDelete.id);
            setUserToDelete(null);
            fetchData();
        }
    };

    const handleDeleteFromModal = (user: User) => {
        setUserToView(null);
        setUserToDelete(user);
    };


    if (loading) return <div className="flex justify-center items-center h-full"><Loader text="Loading Users..." /></div>;

    const TabButton: React.FC<{tab: 'users' | 'admins', label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === tab ? 'bg-admin-primary text-white' : 'text-text-secondary hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    const renderRoleBadge = (user: User) => {
        if (user.role === 'admin') {
            if (user.email === 'admin@quiz.com') {
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <ShieldCheck className="w-4 h-4 mr-1.5" />
                        Owner
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Admin
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <UserIcon className="w-4 h-4 mr-1.5" />
                User
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={!!userToDelete}
                onConfirm={handleConfirmUserDelete}
                onCancel={() => setUserToDelete(null)}
                title="Delete User"
                message={`Are you sure you want to delete user ${userToDelete?.email}? All their score history will be erased. This action cannot be undone.`}
            />
            <UserHistoryModal
                isOpen={!!userToView}
                onClose={() => setUserToView(null)}
                user={userToView}
                stats={userToView ? userStats[userToView.id] : undefined}
                onDelete={handleDeleteFromModal}
            />
            <AddAdminModal
                isOpen={isAddAdminModalOpen}
                onClose={() => setIsAddAdminModalOpen(false)}
                onAdminAdded={fetchData}
            />
            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onUserAdded={fetchData}
            />
            
            <h1 className="text-3xl font-bold text-text-primary">Manage Users</h1>

            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    <TabButton tab="users" label="Regular Users" />
                    <TabButton tab="admins" label="Administrators" />
                </div>
                {activeTab === 'users' ? (
                    <Button onClick={() => setIsAddUserModalOpen(true)} variant="admin-primary">
                        <PlusCircle className="mr-2 h-5 w-5" /> Add User
                    </Button>
                ) : (
                    <Button onClick={() => setIsAddAdminModalOpen(true)} variant="admin-primary">
                        <PlusCircle className="mr-2 h-5 w-5" /> Add Admin
                    </Button>
                )}
            </div>
            
            <div className="space-y-4">
                <div className="relative w-full sm:max-w-xs">
                    <Input id="search-user" variant="admin" placeholder="Search by email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-10" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <div className="bg-white rounded-lg shadow-md border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b border-border bg-gray-50">
                             <tr>
                                <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Email</th>
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Quizzes Taken</th>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Last Active</th>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Role</th>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Actions</th>
                                    </>
                                ) : ( // Admins
                                    <>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Role</th>
                                        <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Last Active</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-text-primary font-medium break-all">{user.email}</td>
                                    
                                    {activeTab === 'users' ? (
                                        <>
                                            <td className="p-4 text-text-secondary">{userStats[user.id]?.quizzesTaken || 0}</td>
                                            <td className="p-4 text-text-secondary">{userStats[user.id]?.lastActive}</td>
                                            <td className="p-4">{renderRoleBadge(user)}</td>
                                            <td className="p-4">
                                                <Button onClick={() => setUserToView(user)} variant="admin-secondary" size="sm" title="View Details">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Details
                                                </Button>
                                            </td>
                                        </>
                                    ) : ( // Admins
                                        <>
                                            <td className="p-4">{renderRoleBadge(user)}</td>
                                            <td className="p-4 text-text-secondary">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={activeTab === 'users' ? 5 : 3} className="text-center p-8 text-text-secondary">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;