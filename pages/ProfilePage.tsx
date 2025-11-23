import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Score, Quiz, Question } from '@/types';
import { leaderboardService } from './services/leaderboardService';
import { authService } from './services/authService';
import { quizService } from './services/quizService';
import Loader from '@/components/Loader';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Link } from 'react-router-dom';
import { Mail, UserCheck, KeyRound, Save, FileCheck2, X, CheckCircle, XCircle } from 'lucide-react';

const QuizReviewModal: React.FC<{ score: Score; onClose: () => void }> = ({ score, onClose }) => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (score) {
                setLoading(true);
                const quizData = await quizService.getQuizById(score.quizId);
                setQuiz(quizData || null);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [score]);

    const getOptionClassName = (option: string, question: Question) => {
        const userAnswer = score.answers?.[question.id];
        const isCorrect = option === question.correctAnswer;
        const isSelected = option === userAnswer;

        if (isCorrect) {
            return 'bg-success/10 border-success text-success font-semibold';
        }
        if (isSelected && !isCorrect) {
            return 'bg-danger/10 border-danger text-danger font-semibold';
        }
        return 'bg-slate-50 border-border';
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-card rounded-xl border border-border shadow-lg p-4 sm:p-6 w-full max-w-3xl m-4 flex flex-col transform transition-all duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Review: {score.quizTitle}</h2>
                        <p className="text-sm text-text-secondary">Scored {score.score}/{score.totalQuestions} on {new Date(score.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? <Loader text="Loading Quiz Details..." /> :
                        !quiz ? <p className="text-center text-text-secondary p-8">Quiz details could not be found.</p> :
                        (
                            <div className="space-y-6">
                                {quiz.questions.map((question, index) => {
                                    const userAnswer = score.answers?.[question.id];
                                    const isAnswerCorrect = userAnswer === question.correctAnswer;
                                    return (
                                        <div key={question.id}>
                                            <div className="flex items-start">
                                                <div className="mr-3 mt-1 flex-shrink-0">
                                                    {isAnswerCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-danger" />}
                                                </div>
                                                <h3 className="text-base sm:text-lg font-semibold text-text-primary">{index + 1}. {question.question}</h3>
                                            </div>
                                            <div className="space-y-2 mt-4 pl-8">
                                                {question.options.map((option, oIndex) => (
                                                    <div key={oIndex} className={`p-3 rounded-lg border-2 text-sm sm:text-base ${getOptionClassName(option, question)}`}>
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                            {!isAnswerCorrect && userAnswer && (
                                                <p className="mt-2 pl-8 text-sm text-text-secondary">Your answer was <span className="font-semibold text-danger">{userAnswer}</span>. The correct answer was <span className="font-semibold text-success">{question.correctAnswer}</span>.</p>
                                            )}
                                             {!userAnswer && (
                                                <p className="mt-2 pl-8 text-sm text-text-secondary">You did not answer this question. The correct answer was <span className="font-semibold text-success">{question.correctAnswer}</span>.</p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [scores, setScores] = useState<Score[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [reviewingScore, setReviewingScore] = useState<Score | null>(null);


    // State for editing profile
    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // State for changing password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    useEffect(() => {
        if (user) {
            setNewEmail(user.email);
            const fetchUserScores = async () => {
                setLoadingHistory(true);
                const userScores = await leaderboardService.getScoresByUserId(user.id);
                setScores(userScores);
                setLoadingHistory(false);
            };
            fetchUserScores();
        }
    }, [user]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.email === newEmail) return;
        
        setEmailLoading(true);
        setEmailMessage(null);
        const result = await authService.updateEmail(user.id, newEmail);
        if (result.error) {
            setEmailMessage({ type: 'error', text: result.error });
        } else if (result.user) {
            updateUser(result.user);
            setEmailMessage({ type: 'success', text: 'Email updated successfully!' });
        }
        setEmailLoading(false);
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage(null);
        const result = await authService.updatePassword(user.id, currentPassword, newPassword);
        if (result.error) {
            setPasswordMessage({ type: 'error', text: result.error });
        } else if (result.success) {
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setPasswordLoading(false);
    };

    if (!user) {
        return <Loader text="Loading profile..." />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {reviewingScore && <QuizReviewModal score={reviewingScore} onClose={() => setReviewingScore(null)} />}
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">My Profile</h1>
            
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Account Information</h2>
                <div className="space-y-3">
                    <div className="flex items-center text-text-primary">
                        <Mail className="w-5 h-5 mr-3 text-secondary" />
                        <span className="font-semibold mr-2">Email:</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex items-center text-text-primary">
                        <UserCheck className="w-5 h-5 mr-3 text-secondary" />
                        <span className="font-semibold mr-2">Role:</span>
                        <span className="capitalize">{user.role}</span>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h2 className="text-2xl font-bold text-text-primary mb-6">Account Settings</h2>
                
                {/* Edit Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4 border-b border-border pb-6 mb-6">
                    <Input id="email" label="Change Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                    <Button type="submit" disabled={emailLoading || user.email === newEmail}>
                        <Save className="w-4 h-4 mr-2"/> {emailLoading ? 'Saving...' : 'Save Email'}
                    </Button>
                    {emailMessage && <p className={`text-sm mt-2 ${emailMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>{emailMessage.text}</p>}
                </form>

                {/* Change Password Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-text-primary flex items-center"><KeyRound className="w-5 h-5 mr-2"/>Change Password</h3>
                    <Input id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                    <Input id="newPassword" label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <Input id="confirmPassword" label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                    {passwordMessage && <p className={`text-sm mt-2 ${passwordMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>{passwordMessage.text}</p>}
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Quiz History</h2>
                <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
                    {loadingHistory ? (
                        <Loader text="Loading history..." />
                    ) : scores.length === 0 ? (
                        <p className="text-center p-8 text-text-secondary">You haven't completed any quizzes yet.</p>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="border-b-2 border-border">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Quiz</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Score</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Date</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {scores.map((score) => (
                                    <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-text-primary font-medium">{score.quizTitle}</td>
                                        <td className="p-4 font-semibold text-text-primary">{score.score} / {score.totalQuestions}</td>
                                        <td className="p-4 text-text-secondary">{new Date(score.date).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <Button onClick={() => setReviewingScore(score)} variant="secondary" size="sm" disabled={!score.answers} title={!score.answers ? "Review not available for this attempt" : "Review Quiz"}>
                                                <FileCheck2 className="w-4 h-4 mr-2" />
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;