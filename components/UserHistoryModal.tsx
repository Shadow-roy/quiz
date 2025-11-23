import React, { useState, useEffect } from 'react';
import { User, Score } from '@/types';
import { leaderboardService } from '@/pages/services/leaderboardService';
import Loader from './Loader';
import Button from './Button';
import { X, Trash2 } from 'lucide-react';

interface UserHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    stats?: { quizzesTaken: number; lastActive: string | null };
    onDelete: (user: User) => void;
}

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ isOpen, onClose, user, stats, onDelete }) => {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            const fetchScores = async () => {
                setLoading(true);
                const userScores = await leaderboardService.getScoresByUserId(user.id);
                setScores(userScores);
                setLoading(false);
            };
            fetchScores();
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl border border-border shadow-lg p-6 w-full max-w-3xl m-4 flex flex-col transform transition-all duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold text-text-primary">User Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
                    <div>
                        <strong className="text-text-secondary block font-medium">Email</strong>
                        <span className="text-text-primary break-all">{user.email}</span>
                    </div>
                     <div>
                        <strong className="text-text-secondary block font-medium">Role</strong>
                        <span className="text-text-primary capitalize">{user.role}</span>
                    </div>
                     <div>
                        <strong className="text-text-secondary block font-medium">Quizzes Taken</strong>
                        <span className="text-text-primary">{stats?.quizzesTaken ?? 0}</span>
                    </div>
                     <div>
                        <strong className="text-text-secondary block font-medium">Last Active</strong>
                        <span className="text-text-primary">{stats?.lastActive ?? 'Never'}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                     <h3 className="text-xl font-bold text-text-primary mb-2">Quiz History</h3>
                    {loading ? (
                        <Loader text="Loading history..." />
                    ) : scores.length === 0 ? (
                        <p className="text-center p-8 text-text-secondary">This user has not completed any quizzes yet.</p>
                    ) : (
                        <div className="border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-border">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-text-secondary uppercase">Quiz</th>
                                        <th className="p-3 text-sm font-semibold text-text-secondary uppercase">Score</th>
                                        <th className="p-3 text-sm font-semibold text-text-secondary uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {scores.map((score) => (
                                        <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-text-primary font-medium">{score.quizTitle}</td>
                                            <td className="p-3 font-semibold text-text-primary">{score.score} / {score.totalQuestions}</td>
                                            <td className="p-3 text-text-secondary">{new Date(score.date).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-border">
                    <Button onClick={() => onDelete(user)} variant="danger">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserHistoryModal;