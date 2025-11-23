import { Quiz, Question, Score } from '@/types';
import { leaderboardService } from './leaderboardService';
import { authService } from './authService';

const QUIZZES_KEY = 'quiz_app_quizzes';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const sampleQuizzes: Quiz[] = [
    {
        id: '1',
        title: 'React Fundamentals',
        description: 'Test your basic knowledge of React concepts.',
        timeLimit: 300, // 5 minutes
        questions: [
            { id: 'q1-1', question: 'What is JSX?', options: ['A JavaScript syntax extension', 'A CSS preprocessor', 'A database query language', 'A templating engine'], correctAnswer: 'A JavaScript syntax extension' },
            { id: 'q1-2', question: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswer: 'useState' },
            { id: 'q1-3', question: 'How do you pass data from a parent to a child component?', options: ['State', 'Context', 'Props', 'Redux'], correctAnswer: 'Props' },
            { id: 'q1-4', question: 'What does `useEffect` do?', options: ['Manages component state', 'Performs side effects', 'Renders JSX', 'Defines component structure'], correctAnswer: 'Performs side effects' },
        ],
    },
    {
        id: '2',
        title: 'Advanced CSS',
        description: 'Challenge your knowledge of modern CSS features.',
        timeLimit: 480, // 8 minutes
        questions: [
            { id: 'q2-1', question: 'What is the purpose of `z-index`?', options: ['To control the vertical stacking order of elements', 'To set the zoom level', 'To define the element\'s width', 'To create 3D effects'], correctAnswer: 'To control the vertical stacking order of elements' },
            { id: 'q2-2', question: 'Which of these is NOT a valid value for the `display` property?', options: ['block', 'inline', 'grid', 'center'], correctAnswer: 'center' },
            { id: 'q2-3', question: 'What does CSS Grid allow you to do?', options: ['Create one-dimensional layouts', 'Create two-dimensional layouts', 'Animate elements', 'Style text only'], correctAnswer: 'Create two-dimensional layouts' },
        ],
    }
];

export const quizService = {
    initialize: () => {
        if (!localStorage.getItem(QUIZZES_KEY)) {
            localStorage.setItem(QUIZZES_KEY, JSON.stringify(sampleQuizzes));
        }
    },

    getQuizzes: async (): Promise<Quiz[]> => {
        await delay(300);
        const quizzes = localStorage.getItem(QUIZZES_KEY);
        return quizzes ? JSON.parse(quizzes) : [];
    },

    getQuizById: async (id: string): Promise<Quiz | undefined> => {
        await delay(300);
        const quizzes = await quizService.getQuizzes();
        return quizzes.find(q => q.id === id);
    },

    submitQuiz: async (quizId: string, answers: { [questionId: string]: string }): Promise<Score> => {
        await delay(500);
        const quiz = await quizService.getQuizById(quizId);
        const currentUser = authService.getCurrentUser();

        if (!quiz || !currentUser) {
            throw new Error('Quiz or user not found');
        }

        let correctAnswers = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                correctAnswers++;
            }
        });

        const newScore: Score = {
            id: String(Date.now()),
            quizId,
            quizTitle: quiz.title,
            userId: currentUser.id,
            userEmail: currentUser.email,
            score: correctAnswers,
            totalQuestions: quiz.questions.length,
            date: new Date().toISOString(),
            answers,
        };

        await leaderboardService.addScore(newScore);
        return newScore;
    },
    
    saveQuiz: async (quiz: Omit<Quiz, 'id'> | Quiz): Promise<Quiz> => {
        await delay(500);
        const quizzes = await quizService.getQuizzes();
        
        if ('id' in quiz && quiz.id) {
            // Update existing quiz
            const index = quizzes.findIndex(q => q.id === quiz.id);
            if (index !== -1) {
                quizzes[index] = quiz;
                localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
                return quiz;
            }
        }
        
        // Add new quiz
        const newQuiz: Quiz = {
            ...quiz,
            id: String(Date.now()),
        };
        quizzes.push(newQuiz);
        localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
        return newQuiz;
    },

    deleteQuiz: async (quizId: string): Promise<void> => {
        await delay(500);
        let quizzes = await quizService.getQuizzes();
        quizzes = quizzes.filter(q => q.id !== quizId);
        localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
    }
};