'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Eye, EyeOff, MapPin, Users, CheckCircle } from 'lucide-react';
import { AsahiKun } from '@/components/AsahiKun';
import { ResultDisplay } from '@/components/ResultDisplay';
import { useGameSession, useTimer } from '@/lib/hooks';
import { castVote, TOPICS } from '@/lib/game-storage';
import { Player } from '@/lib/types';

export default function PlayerPage() {
  const params = useParams();
  const playerId = params?.id as string;
  const session = useGameSession();
  useTimer(session);

  const [isTopicRevealed, setIsTopicRevealed] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  const player = useMemo(() => {
    return session?.players.find(p => p.id === playerId);
  }, [session, playerId]);

  const teamInfo = useMemo(() => {
    if (!session || !player) return null;

    for (let i = 0; i < session.teams.length; i++) {
      const team = session.teams[i];
      if (team.find(p => p.id === playerId)) {
        return {
          team,
          teamNumber: i + 1,
        };
      }
    }
    return null;
  }, [session, player, playerId]);

  // プレイヤーのお題を取得（チームごとに異なるお題）
  const currentTopic = TOPICS.find(t => t.id === player?.topicId) || TOPICS[0];

  // Debug: Log if topic is missing
  if (player && !player.topicId) {
    console.error('[PlayerPage] Player missing topicId:', player.name, 'Player data:', player);
  }

  const hasVoted = session?.votes[playerId] !== undefined;

  const handleVote = (votedId: string) => {
    if (hasVoted) return;
    setSelectedVote(votedId);
  };

  const confirmVote = async () => {
    if (!selectedVote || hasVoted) return;
    try {
      await castVote(playerId, selectedVote);
      alert('投票完了しました！');
    } catch (err) {
      console.error('[confirmVote] Error:', err);
      alert('投票に失敗しました');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">プレイヤーが見つかりません</h2>
          <p className="text-gray-500 text-sm">
            もう一度参加ページから入ってください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 text-gray-800 font-sans pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">
              {player.name[0]}
            </div>
            <h1 className="font-bold text-sm md:text-lg text-gray-700">{player.name}</h1>
          </div>
          <div className="text-xs text-gray-500">
            {session.phase === 'waiting' && '待機中'}
            {session.phase === 'playing' && formatTime(session.timer)}
            {session.phase === 'voting' && '投票中'}
            {session.phase === 'result' && '結果発表'}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {/* Phase: WAITING */}
        {session.phase === 'waiting' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <AsahiKun mood="happy" size="md" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                ゲーム参加完了！
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                管理者がゲームを開始するまで、このページで待機してください
              </p>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 justify-center text-yellow-800">
                  <Users size={20} />
                  <span className="font-bold">
                    現在 {session.players.length}名 参加中
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-center gap-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  ゲーム開始をお待ちください...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Phase: PLAYING */}
        {session.phase === 'playing' && teamInfo && (
          <div className="space-y-6 animate-fade-in">
            {/* Asahi-kun Message */}
            <div className="flex items-end gap-3">
              <AsahiKun mood={session.timer < 60 ? 'worry' : 'excited'} size="sm" />
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-gray-600 flex-1 border border-orange-100">
                {session.timer < 60
                  ? 'あとちょっとだよ！仲間を見つけられた？'
                  : '番号の場所に移動してチーム集合だよ！仲間を見つけてね👀'}
              </div>
            </div>

            {/* Team Number Display */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <h3 className="text-orange-100 font-bold text-sm tracking-widest uppercase mb-1">Your Team</h3>
                <div className="flex items-center justify-center gap-3">
                  <MapPin size={32} className="text-orange-200 animate-bounce" />
                  <span className="text-5xl font-black">No.{teamInfo.teamNumber}</span>
                </div>
                <p className="text-xs text-orange-100 mt-2 bg-orange-600/30 inline-block px-3 py-1 rounded-full">
                  チーム{teamInfo.teamNumber} の場所に集合！
                </p>
              </div>
            </div>

            {/* Topic Card (Secret) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
              <h3 className="text-center text-gray-500 font-bold mb-4 text-sm uppercase tracking-widest">
                Your Secret Topic
              </h3>

              <div
                onClick={() => setIsTopicRevealed(!isTopicRevealed)}
                className={`relative h-32 rounded-xl cursor-pointer transition-all duration-500 transform ${
                  isTopicRevealed ? 'bg-white' : 'bg-gray-800 pattern-dots'
                }`}
              >
                {/* Hidden State */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${
                    isTopicRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <EyeOff size={32} className="mb-2 text-gray-400" />
                  <p className="font-bold text-gray-300">タップしてお題を確認</p>
                  <p className="text-xs text-gray-500">周りに見られないようにね！</p>
                </div>

                {/* Revealed State */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center text-gray-800 border-2 border-orange-400 rounded-xl p-4 bg-orange-50 transition-opacity duration-300 ${
                    isTopicRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-xs text-orange-500 font-bold mb-1">あなたのお題</p>
                  <p className="text-3xl font-bold text-center leading-tight">
                    {player.role === 'citizen' ? currentTopic.citizen : currentTopic.wolf}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Eye size={12} />
                    <span>タップして隠す</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Users size={20} className="text-orange-500" />
                チーム{teamInfo.teamNumber}のメンバー
              </h3>
              <div className="flex flex-wrap gap-2">
                {teamInfo.team.map(p => (
                  <span
                    key={p.id}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      p.id === playerId
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.name}
                    {p.id === playerId && ' (あなた)'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase: VOTING */}
        {session.phase === 'voting' && (
          <div className="space-y-6 animate-fade-in">
            {/* Asahi-kun Message */}
            <div className="flex items-end gap-3">
              <AsahiKun mood="excited" size="sm" />
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-gray-600 flex-1 border border-orange-100">
                投票タイム！誰がウルフだと思う？慎重に選んでね！
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-2 text-center">投票してください</h2>
              <p className="text-center text-gray-500 text-sm mb-6">
                ウルフだと思うプレイヤーを1人選んでください
              </p>

              {hasVoted ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-green-800 mb-2">投票完了！</p>
                  <p className="text-sm text-green-600">
                    他のプレイヤーの投票をお待ちください
                  </p>
                </div>
              ) : (
                <>
                  {/* Vote Options */}
                  <div className="space-y-2 mb-6">
                    {session.players
                      .filter(p => p.id !== playerId)
                      .map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleVote(p.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all ${
                            selectedVote === p.id
                              ? 'border-orange-400 bg-orange-50 text-orange-800'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{p.name}</span>
                            {selectedVote === p.id && (
                              <CheckCircle size={20} className="text-orange-500" />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={confirmVote}
                    disabled={!selectedVote}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedVote
                      ? `${session.players.find(p => p.id === selectedVote)?.name} に投票する`
                      : '投票先を選んでください'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Phase: RESULT */}
        {session.phase === 'result' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-end gap-3">
              <AsahiKun mood="happy" size="sm" />
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-gray-600 flex-1 border border-orange-100">
                結果発表だよ！次のゲームも楽しみだね🎉
              </div>
            </div>

            <ResultDisplay session={session} />

            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-500">
                管理者が次のゲームを準備しています...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
