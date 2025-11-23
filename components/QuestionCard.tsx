import React from 'react';
import { Question } from '@/types';

interface QuestionCardProps {
    question: Question;
    selectedOption: string | null;
    onOptionSelect: (option: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedOption, onOptionSelect }) => {
    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-text-primary mb-6">{question.question}</h2>
            <div className="space-y-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedOption === option;
                    return (
                        <button
                            key={index}
                            onClick={() => onOptionSelect(option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 
                                ${isSelected
                                    ? 'bg-indigo-50 border-primary text-primary font-semibold shadow-inner'
                                    : 'bg-slate-50 border-border hover:border-slate-400'
                                }`}
                        >
                            <span className="font-medium">{option}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;