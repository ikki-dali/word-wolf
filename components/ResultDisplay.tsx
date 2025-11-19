import React from 'react';
import { Trophy, Target, Users } from 'lucide-react';
import { GameSession, VoteResult } from '@/lib/types';
import { TOPICS } from '@/lib/game-storage';

interface ResultDisplayProps {
  session: GameSession;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ session }) => {
  // Calculate vote results
  const voteResults: VoteResult[] = [];
  const voteCount: Record<string, number> = {};
  const voters: Record<string, string[]> = {};

  Object.entries(session.votes).forEach(([voterId, votedId]) => {
    if (!voteCount[votedId]) {
      voteCount[votedId] = 0;
      voters[votedId] = [];
    }
    voteCount[votedId]++;
    const voterName = session.players.find(p => p.id === voterId)?.name || '不明';
    voters[votedId].push(voterName);
  });

  Object.entries(voteCount).forEach(([playerId, count]) => {
    const player = session.players.find(p => p.id === playerId);
    if (player) {
      voteResults.push({
        playerId,
        playerName: player.name,
        voteCount: count,
        voters: voters[playerId],
      });
    }
  });

  voteResults.sort((a, b) => b.voteCount - a.voteCount);

  // Get wolves
  const wolves = session.players.filter(p => p.role === 'wolf');

  // Check if wolf was found
  const topVoted = voteResults[0];
  const wolfFound = wolves.some(w => w.id === topVoted?.playerId);

  return (
    <div className="space-y-6">
      {/* Winner Announcement */}
      <div className={`p-6 rounded-2xl text-center ${
        wolfFound ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'
      } text-white`}>
        <Trophy size={48} className="mx-auto mb-3" />
        <h2 className="text-3xl font-bold mb-2">
          {wolfFound ? '市民の勝利！' : 'ウルフの勝利！'}
        </h2>
        <p className="text-lg opacity-90">
          {wolfFound
            ? 'ウルフを見つけ出しました！'
            : 'ウルフは見つかりませんでした...'}
        </p>
      </div>

      {/* Vote Results */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-orange-500" />
          投票結果
        </h3>
        <div className="space-y-3">
          {voteResults.length === 0 ? (
            <p className="text-gray-400 text-center py-4">投票はありませんでした</p>
          ) : (
            voteResults.map((result, index) => {
              const player = session.players.find(p => p.id === result.playerId);
              const isWolf = player?.role === 'wolf';

              return (
                <div
                  key={result.playerId}
                  className={`p-4 rounded-xl border-2 ${
                    index === 0
                      ? isWolf
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy size={20} className="text-orange-500" />}
                      <span className={`font-bold ${
                        index === 0 ? 'text-lg' : 'text-base'
                      }`}>
                        {result.playerName}
                      </span>
                      {isWolf && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          Wolf
                        </span>
                      )}
                    </div>
                    <span className={`font-bold ${
                      index === 0 ? 'text-2xl' : 'text-xl'
                    } ${isWolf ? 'text-red-600' : 'text-gray-600'}`}>
                      {result.voteCount}票
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    投票者: {result.voters.join(', ')}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Actual Wolves */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target size={24} className="text-red-500" />
          正解
        </h3>
        <div className="space-y-2">
          {wolves.map(wolf => {
            const teamNumber = session.teams.findIndex(team =>
              team.some(p => p.id === wolf.id)
            ) + 1;

            return (
              <div key={wolf.id} className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-red-800 text-lg">{wolf.name}</span>
                    <span className="text-sm text-red-600 ml-2">
                      (Team {teamNumber})
                    </span>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Wolf
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Teams Info */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">全チーム情報</h3>
        <div className="space-y-3">
          {session.teams.map((team, idx) => {
            const teamTopic = TOPICS.find(t => t.id === team[0]?.topicId) || TOPICS[0];
            return (
              <div key={idx} className="border border-gray-200 p-4 rounded-xl">
                <div className="font-bold text-gray-700 mb-2">Team {idx + 1}</div>
                <div className="text-xs text-orange-600 font-bold mb-2">
                  お題: {teamTopic.name}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {team.map(p => (
                    <span
                      key={p.id}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        p.role === 'wolf'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {p.name}
                      {p.role === 'wolf' && ' 🐺'}
                    </span>
                  ))}
                </div>
                <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                  <span className="text-gray-500">市民: </span>
                  <span className="font-medium">{teamTopic.citizen}</span>
                  <span className="mx-2">|</span>
                  <span className="text-red-500">Wolf: </span>
                  <span className="font-medium">{teamTopic.wolf}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
