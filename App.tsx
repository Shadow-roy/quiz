import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authService } from '@/pages/services/authService';
import { quizService } from '@/pages/services/quizService';

// Layouts
import MainLayout from '@/components/MainLayout';
import AdminLayout from '@/components/AdminLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import DashboardPage from '@/pages/DashboardPage';
import QuizPage from '@/pages/QuizPage';
import ResultsPage from '@/pages/services/ResultsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminQuizzesPage from '@/pages/AdminQuizzesPage';
import AdminUsersPage from '@/pages/AdminUsersPage';

const PrivateRoute: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return null; // Or a loading spinner
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC = () => {
    const { user, loading } = useAuth();
    if (loading) return null; // Or a loading spinner
    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
    useEffect(() => {
        authService.initialize();
        quizService.initialize();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                
                {/* User Routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/quiz/:quizId" element={<QuizPage />} />
                        <Route path="/results/:quizId" element={<ResultsPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="quizzes" replace />} />
                        <Route path="quizzes" element={<AdminQuizzesPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                    </Route>
                </Route>
                
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;