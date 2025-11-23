export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin';
    lastLogin?: string;
}

export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    timeLimit: number; // in seconds
    questions: Question[];
}

export interface Score {
    id: string;
    quizId: string;
    quizTitle: string;
    userId: string;
    userEmail: string;
    score: number;
    totalQuestions: number;
    date: string;
    answers?: { [questionId: string]: string };
}

// Types for the Admin Quiz Editor form
export type EditableQuestion = Omit<Question, 'id'> & { id?: string };
export type EditableQuiz = Omit<Quiz, 'id' | 'questions'> & { id?: string; questions: EditableQuestion[] };