import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { authService } from '@/pages/services/authService';
import { quizService } from '@/pages/services/quizService';

// Layouts
const MainLayout = lazy(() => import('@/components/MainLayout'));
const AdminLayout = lazy(() => import('@/components/AdminLayout'));

// Pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const ResultsPage = lazy(() => import('@/pages/services/ResultsPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdminQuizzesPage = lazy(() => import('@/pages/AdminQuizzesPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));

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
            <Suspense fallback={<div>Loading...</div>}>
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
            </Suspense>
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