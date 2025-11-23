import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz } from '@/types';
import { quizService } from './services/quizService';
import { useTimer } from '@/hooks/useTimer';
import Loader from '@/components/Loader';
import QuestionCard from '@/components/QuestionCard';
import Timer from '@/components/Timer';
import Button from '@/components/Button';
import ConfirmModal from '@/components/ConfirmModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const QuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const answersRef = useRef(answers);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const handleNext = useCallback(() => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentQuestionIndex, quiz]);
    
    const performSubmit = useCallback(async () => {
        if (!quizId) return;
        const currentAnswers = answersRef.current;
        const score = await quizService.submitQuiz(quizId, currentAnswers);
        navigate(`/results/${quizId}`, { state: { score, answers: currentAnswers } });
    }, [quizId, navigate]);

    const handleTimeout = useCallback(() => {
        if (quiz && currentQuestionIndex === quiz.questions.length - 1) {
            performSubmit();
        } else {
            handleNext();
        }
    }, [currentQuestionIndex, quiz, handleNext, performSubmit]);

    const { displayTime, secondsLeft, resetTimer } = useTimer(30, handleTimeout);

    useEffect(() => {
        if (quiz) { // Reset timer whenever question changes
            resetTimer();
        }
    }, [currentQuestionIndex, quiz, resetTimer]);

    useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            setLoading(true);
            const data = await quizService.getQuizById(quizId);
            if (data) {
                setQuiz(data);
            } else {
                navigate('/dashboard'); // Quiz not found
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [quizId, navigate]);

    const handleSubmit = useCallback(() => {
       setIsConfirmModalOpen(true);
    }, []);

    const handleOptionSelect = (option: string) => {
        if (!quiz) return;
        const questionId = quiz.questions[currentQuestionIndex].id;
        setAnswers({ ...answers, [questionId]: option });
    };
    
    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading || !quiz) {
        return <Loader text="Loading Quiz..." />;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="max-w-3xl mx-auto text-center">
                 <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-md">
                    <h1 className="text-3xl font-bold text-danger">Quiz Incomplete</h1>
                    <p className="text-text-secondary mt-2">This quiz currently has no questions. Please contact an administrator.</p>
                    <Button onClick={() => navigate('/dashboard')} className="mt-6">Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onConfirm={() => {
                    setIsConfirmModalOpen(false);
                    performSubmit();
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
                title="Submit Quiz"
                message="Are you sure you want to submit your answers? This action cannot be undone."
            />
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{quiz.title}</h1>
                        <p className="text-text-secondary mt-1">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    </div>
                    <div className="self-end sm:self-center">
                         <Timer displayTime={displayTime} secondsLeft={secondsLeft} />
                    </div>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>

                <QuestionCard
                    question={currentQuestion}
                    selectedOption={answers[currentQuestion.id] || null}
                    onOptionSelect={handleOptionSelect}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 mt-8">
                    <Button onClick={handlePrev} disabled={currentQuestionIndex === 0} variant="secondary" className="w-full sm:w-auto">
                        <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                    </Button>
                    
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <Button onClick={handleSubmit} className="w-full sm:w-auto">Submit</Button>
                    ) : (
                        <Button onClick={handleNext} className="w-full sm:w-auto">
                            Next <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
};

export default QuizPage;