import React, { useState, useEffect } from 'react';
import { Score } from '@/types';
import { leaderboardService } from './services/leaderboardService';
import Loader from '@/components/Loader';
import { Trophy } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            const data = await leaderboardService.getLeaderboard();
            setScores(data);
            setLoading(false);
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <Loader text="Loading Leaderboard..." />;
    }
    
    const getRankColor = (rank: number) => {
      switch(rank) {
        case 0: return 'text-yellow-400';
        case 1: return 'text-gray-400';
        case 2: return 'text-yellow-600';
        default: return 'text-text-secondary';
      }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-8 text-left">Leaderboard</h1>
            <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b-2 border-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Rank</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Player</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Quiz</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Score</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {scores.slice(0, 10).map((score, index) => (
                            <tr key={score.id} className="hover:bg-gray-50 transition-colors">
                                <td className={`p-4 font-bold text-lg ${getRankColor(index)}`}>
                                    <span className="flex items-center">
                                      {index < 3 && <Trophy className="w-5 h-5 mr-2" />}
                                      {index + 1}
                                    </span>
                                </td>
                                <td className="p-4 text-text-primary">{score.userEmail}</td>
                                <td className="p-4 text-text-primary">{score.quizTitle}</td>
                                <td className="p-4 font-semibold text-text-primary">{score.score} / {score.totalQuestions}</td>
                                <td className="p-4 text-text-secondary">{new Date(score.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {scores.length === 0 && (
                  <p className="text-center p-8 text-text-secondary">No scores yet. Be the first to take a quiz!</p>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;