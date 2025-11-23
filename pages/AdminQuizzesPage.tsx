import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Quiz, EditableQuiz } from '@/types';
import { quizService } from './services/quizService';
import { leaderboardService } from './services/leaderboardService';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import QuizEditor from '@/components/QuizEditor';
import Input from '@/components/Input';
import ConfirmModal from '@/components/ConfirmModal';
import { PlusCircle, Trash2, Edit, Search } from 'lucide-react';

const AdminQuizzesPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [editingQuiz, setEditingQuiz] = useState<EditableQuiz | null>(null);
    const [quizSearch, setQuizSearch] = useState('');
    const [quizStats, setQuizStats] = useState<{ [quizId: string]: { attempts: number } }>({});
    const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [quizzesData, scoresData] = await Promise.all([
                quizService.getQuizzes(),
                leaderboardService.getAllScores(),
            ]);

            setQuizzes(quizzesData);

            const newQuizStats: { [key: string]: { attempts: number } } = {};
            scoresData.forEach(score => {
                if (!newQuizStats[score.quizId]) newQuizStats[score.quizId] = { attempts: 0 };
                newQuizStats[score.quizId].attempts++;
            });
            setQuizStats(newQuizStats);

        } catch (error) {
            console.error("Failed to load quiz data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredQuizzes = useMemo(() => quizzes.filter(q => q.title.toLowerCase().includes(quizSearch.toLowerCase())), [quizzes, quizSearch]);

    const handleNewQuiz = () => setEditingQuiz({ title: '', description: '', timeLimit: 300, questions: [] });
    const handleEditQuiz = (quiz: Quiz) => setEditingQuiz({ ...quiz });

    const handleConfirmQuizDelete = async () => {
        if (quizToDelete) {
            await quizService.deleteQuiz(quizToDelete);
            setQuizToDelete(null);
            fetchData();
        }
    };

    const handleSaveQuiz = async () => {
        if (editingQuiz) {
            const quizToSave = {
                ...editingQuiz,
                questions: editingQuiz.questions.map((q, index) => ({
                    ...q,
                    id: q.id || `q-${Date.now()}-${index}`,
                })),
            };
            await quizService.saveQuiz(quizToSave as Quiz);
            setEditingQuiz(null);
            fetchData();
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader text="Loading Quizzes..." /></div>;
    if (editingQuiz) return <QuizEditor quiz={editingQuiz} onSave={handleSaveQuiz} onCancel={() => setEditingQuiz(null)} setQuiz={setEditingQuiz} />;

    return (
        <div className="space-y-6">
            <ConfirmModal
                isOpen={!!quizToDelete}
                onConfirm={handleConfirmQuizDelete}
                onCancel={() => setQuizToDelete(null)}
                title="Delete Quiz"
                message="Are you sure you want to delete this quiz? This action cannot be undone."
            />
            
            <h1 className="text-3xl font-bold text-text-primary">Manage Quizzes</h1>

            <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <div className="relative w-auto flex-grow">
                        <Input id="search-quiz" variant="admin" placeholder="Search quizzes..." value={quizSearch} onChange={e => setQuizSearch(e.target.value)} className="pl-10" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <Button onClick={handleNewQuiz} variant="admin-primary" className="flex-shrink-0">
                        <PlusCircle className="mr-2 h-5 w-5" /> Add Quiz
                    </Button>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-border overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b border-border bg-gray-50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Title</th>
                                <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Questions</th>
                                <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Attempts</th>
                                <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredQuizzes.length > 0 ? filteredQuizzes.map(quiz => (
                                <tr key={quiz.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-text-primary font-medium">{quiz.title}</td>
                                    <td className="p-4 text-text-secondary">{quiz.questions.length}</td>
                                    <td className="p-4 text-text-secondary">{quizStats[quiz.id]?.attempts || 0}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEditQuiz(quiz)} className="text-admin-primary hover:opacity-80 p-1" title="Edit Quiz"><Edit className="w-5 h-5" /></button>
                                            <button onClick={() => setQuizToDelete(quiz.id)} className="text-danger hover:opacity-80 p-1" title="Delete Quiz"><Trash2 className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center p-8 text-text-secondary">No quizzes found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminQuizzesPage;