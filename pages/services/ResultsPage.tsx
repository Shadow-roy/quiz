import React from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Score } from '@/types';
import Button from '@/components/Button';
import { CheckCircle, XCircle, BarChart2 } from 'lucide-react';

const ResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { quizId } = useParams();
    const state = location.state as { score: Score; answers: { [questionId: string]: string } } | null;

    if (!state || !state.score) {
        return (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-danger">Error</h1>
                <p className="text-text-secondary mt-2">No results to display. Please take a quiz first.</p>
                <Button onClick={() => navigate('/dashboard')} className="mt-6">Back to Dashboard</Button>
            </div>
        );
    }
    
    const { score } = state;
    const percentage = Math.round((score.score / score.totalQuestions) * 100);
    const passed = percentage >= 60;

    return (
        <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">Quiz Results</h1>
            <h2 className="text-xl sm:text-2xl text-text-secondary mb-8">{score.quizTitle}</h2>

            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-md">
                <p className="text-lg text-text-secondary">You scored</p>
                <p className={`text-6xl sm:text-7xl font-bold my-4 ${passed ? 'text-success' : 'text-danger'}`}>
                    {percentage}%
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center text-lg sm:text-xl space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center text-success">
                        <CheckCircle className="w-6 h-6 mr-2" />
                        <span>{score.score} Correct</span>
                    </div>
                    <div className="flex items-center text-danger">
                        <XCircle className="w-6 h-6 mr-2" />
                        <span>{score.totalQuestions - score.score} Incorrect</span>
                    </div>
                </div>
                 {passed ? (
                    <p className="text-xl sm:text-2xl mt-6 text-success font-semibold">Congratulations, you passed!</p>
                ) : (
                    <p className="text-xl sm:text-2xl mt-6 text-danger font-semibold">Better luck next time!</p>
                )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link to={`/quiz/${quizId}`}>
                    <Button variant="secondary" className="w-full sm:w-auto">Try Again</Button>
                </Link>
                <Link to="/dashboard">
                    <Button className="w-full sm:w-auto">Back to Dashboard</Button>
                </Link>
                <Link to="/leaderboard">
                    <Button variant="success" className="w-full sm:w-auto">
                        <BarChart2 className="w-5 h-5 mr-2" />
                        View Leaderboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ResultsPage;