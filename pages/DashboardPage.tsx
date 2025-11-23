import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Quiz } from '@/types';
import { quizService } from './services/quizService';
import Loader from '@/components/Loader';
import { ArrowRight, BookOpen } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            const data = await quizService.getQuizzes();
            setQuizzes(data);
            setLoading(false);
        };
        fetchQuizzes();
    }, []);

    if (loading) {
        return <Loader text="Loading Quizzes..." />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">Available Quizzes</h1>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                    <h3 className="text-xl font-medium text-text-primary">No quizzes available</h3>
                    <p className="text-text-secondary mt-2">Check back later or contact an admin to create a new quiz.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-card p-6 rounded-xl border border-border flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div>
                                <h2 className="text-xl font-bold text-text-primary mb-2">{quiz.title}</h2>
                                <p className="text-text-secondary mb-4 text-sm">{quiz.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-text-secondary text-sm flex items-center">
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  <span>{quiz.questions.length} Questions</span>
                                </div>
                                <Link to={`/quiz/${quiz.id}`} className="inline-flex items-center font-semibold text-primary hover:underline group">
                                    Start Quiz <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;