import React, { useState } from 'react';
import { EditableQuiz, EditableQuestion } from '@/types';
import { geminiService } from '@/pages/services/geminiService';
import Button from './Button';
import Input from './Input';
import { PlusCircle, Trash2, Wand2, Save, ArrowLeft } from 'lucide-react';

interface QuizEditorProps {
    quiz: EditableQuiz;
    onSave: () => void;
    onCancel: () => void;
    setQuiz: React.Dispatch<React.SetStateAction<EditableQuiz | null>>;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onSave, onCancel, setQuiz }) => {
    const [aiTopic, setAiTopic] = useState('');
    const [aiCount, setAiCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    
    const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuiz(prev => prev ? { ...prev, [e.target.name]: e.target.value } : null);
    };
    
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuiz(prev => prev ? { ...prev, timeLimit: Number(e.target.value) * 60 } : null);
    };

    const handleQuestionChange = (index: number, field: keyof EditableQuestion, value: string | string[]) => {
        setQuiz(prev => {
            if (!prev) return null;
            const newQuestions = [...prev.questions];
            (newQuestions[index] as any)[field] = value;
            return { ...prev, questions: newQuestions };
        });
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        setQuiz(prev => {
            if (!prev) return null;
            const newQuestions = [...prev.questions];
            const newOptions = [...newQuestions[qIndex].options];
            newOptions[oIndex] = value;
            newQuestions[qIndex].options = newOptions;
            return { ...prev, questions: newQuestions };
        });
    };

    const addQuestion = () => {
        setQuiz(prev => prev ? { ...prev, questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }] } : null);
    };

    const removeQuestion = (index: number) => {
        setQuiz(prev => prev ? { ...prev, questions: prev.questions.filter((_, i) => i !== index) } : null);
    };
    
    const handleGenerateQuestions = async () => {
        if (!aiTopic || aiCount <= 0) return;
        setIsGenerating(true);
        setAiError('');
        try {
            const newQuestions = await geminiService.generateQuizQuestions(aiTopic, aiCount);
            setQuiz(prev => prev ? { ...prev, questions: [...prev.questions, ...newQuestions] } : null);
        } catch (err: any) {
            setAiError(err.message || 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="bg-white p-8 rounded-lg shadow-md border border-border space-y-6">
            <div className="flex items-center gap-4">
                <Button onClick={onCancel} variant="admin-secondary" size="sm" className="!p-2">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-3xl font-bold text-text-primary">{quiz.id ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            </div>
            <div className="space-y-4 border-b border-border pb-6">
                <Input variant="admin" id="title" name="title" label="Quiz Title" value={quiz.title} onChange={handleQuizChange} />
                <Input variant="admin" id="description" name="description" label="Description" value={quiz.description} onChange={handleQuizChange} />
                <Input variant="admin" id="timeLimit" name="timeLimit" label="Time Limit (minutes)" type="number" value={quiz.timeLimit / 60} onChange={handleTimeChange} />
            </div>

            <div className="p-4 rounded-lg border border-border bg-admin-background">
                <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center"><Wand2 className="mr-2 text-admin-primary"/> Generate Questions with AI</h3>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow w-full"><Input variant="admin" id="ai-topic" label="Topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. JavaScript Promises"/></div>
                    <div className="w-full sm:w-32"><Input variant="admin" id="ai-count" label="Number" type="number" value={aiCount} onChange={e => setAiCount(Number(e.target.value))} /></div>
                    <Button variant="admin-primary" onClick={handleGenerateQuestions} disabled={isGenerating} className="w-full sm:w-auto">
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
                {aiError && <p className="text-danger mt-2 text-sm">{aiError}</p>}
            </div>

            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-text-primary">Questions</h3>
                {quiz.questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="p-4 rounded-lg border border-border bg-admin-background">
                        <div className="flex justify-between items-center mb-2">
                           <p className="font-bold text-md text-text-primary">Question {qIndex + 1}</p>
                           <button onClick={() => removeQuestion(qIndex)} className="text-danger hover:opacity-80"><Trash2 className="w-5 h-5"/></button>
                        </div>
                        <textarea value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} className="w-full bg-white border border-border rounded-lg p-2 mb-2 text-text-primary focus:ring-admin-primary focus:border-admin-primary focus:ring-2" placeholder="Question text"/>
                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2 mb-2">
                                <input type="radio" name={`correct_answer_${qIndex}`} checked={q.correctAnswer === opt} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)} className="accent-admin-primary h-4 w-4"/>
                                <Input variant="admin" id={`q${qIndex}o${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="flex-grow !py-1.5"/>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <Button onClick={addQuestion} variant="admin-secondary"><PlusCircle className="mr-2"/>Add Question Manually</Button>
            
            <div className="flex justify-end gap-4 mt-6 border-t border-border pt-6">
                <Button onClick={onCancel} variant="admin-secondary">Cancel</Button>
                <Button onClick={onSave} variant="admin-primary"><Save className="mr-2"/> Save Quiz</Button>
            </div>
        </div>
    );
};

export default QuizEditor;