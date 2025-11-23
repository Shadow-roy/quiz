import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (duration: number, onTimeout: () => void) => {
    const [secondsLeft, setSecondsLeft] = useState(duration);
    const onTimeoutRef = useRef(onTimeout);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        setSecondsLeft(duration);
        intervalRef.current = window.setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    onTimeoutRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [duration, stopTimer]);
    
    useEffect(() => {
        startTimer();
        return () => stopTimer();
    }, [startTimer]);

    const resetTimer = useCallback(() => {
        startTimer();
    }, [startTimer]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    return {
        displayTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        secondsLeft,
        resetTimer,
    };
};