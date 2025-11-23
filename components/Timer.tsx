import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    displayTime: string;
    secondsLeft: number;
}

const Timer: React.FC<TimerProps> = ({ displayTime, secondsLeft }) => {
    const isLowTime = secondsLeft <= 30;
    const colorClass = isLowTime ? 'text-danger animate-pulse' : 'text-primary';

    return (
        <div className={`flex items-center justify-center p-2 rounded-lg bg-gray-200 border ${isLowTime ? 'border-danger/50' : 'border-border'}`}>
            <Clock className={`w-6 h-6 mr-2 ${colorClass}`} />
            <span className={`text-2xl font-bold tracking-widest ${colorClass}`}>{displayTime}</span>
        </div>
    );
};

export default Timer;