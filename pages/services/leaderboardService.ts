import { Score } from '@/types';

const LEADERBOARD_KEY = 'quiz_app_leaderboard';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const leaderboardService = {
    getLeaderboard: async (): Promise<Score[]> => {
        await delay(300);
        const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        // Sort by score (desc), then by date (asc)
        scores.sort((a: Score, b: Score) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        return scores;
    },

    addScore: async (newScore: Score): Promise<void> => {
        await delay(200);
        const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        scores.push(newScore);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
    },
    
    getScoresByUserId: async (userId: string): Promise<Score[]> => {
        await delay(300);
        const allScores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        return allScores.filter((score: Score) => score.userId === userId).sort((a: Score, b: Score) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    updateUserEmail: async (userId: string, newEmail: string): Promise<void> => {
        await delay(200);
        const scores: Score[] = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        const updatedScores = scores.map(score => {
            if (score.userId === userId) {
                return { ...score, userEmail: newEmail };
            }
            return score;
        });
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
    },

    deleteScoresByUserId: async (userId: string): Promise<void> => {
        await delay(200);
        const scores: Score[] = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        const updatedScores = scores.filter(score => score.userId !== userId);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
    },

    getAllScores: async (): Promise<Score[]> => {
        await delay(300);
        const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
        return scores;
    }
};