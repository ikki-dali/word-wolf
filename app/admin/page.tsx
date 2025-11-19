'use client';

import React, { useState } from 'react';
import { Clock, Play, RotateCcw, UserPlus, Trash2, Users, Heart, GraduationCap, Calendar, Share2, CheckCircle } from 'lucide-react';
import { AsahiKun } from '@/components/AsahiKun';
import { ResultDisplay } from '@/components/ResultDisplay';
import { useGameSession, useTimer } from '@/lib/hooks';
import {
  addPlayer,
  removePlayer,
  startGame,
  resetGame,
  TOPICS,
  getGameSession,
  saveGameSession,
  endVoting,
  createGameSession
} from '@/lib/game-storage';

export default function AdminPage() {
  const session = useGameSession();
  useTimer(session);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // Auto-create session if it doesn't exist
  React.useEffect(() => {
    if (!session) {
      console.log('[AdminPage] No session found, creating new session');
      createGameSession().catch(err => {
        console.error('[AdminPage] Failed to create session:', err);
      });
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    try {
      await addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    } catch (err) {
      console.error('[handleAddPlayer] Error:', err);
      alert('プレイヤーの追加に失敗しました');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (confirm('このプレイヤーを削除しますか？')) {
      try {
        await removePlayer(playerId);
      } catch (err) {
        console.error('[handleRemovePlayer] Error:', err);
      }
    }
  };

  const handleStartGame = async () => {
    if (session.players.length < 4) {
      alert('最低4人のプレイヤーが必要です！');
      return;
    }
    try {
      await startGame();
    } catch (err) {
      console.error('[handleStartGame] Error:', err);
      alert('ゲーム開始に失敗しました');
    }
  };

  const handleToggleTimer = async () => {
    try {
      const current = await getGameSession();
      if (current) {
        current.isTimerRunning = !current.isTimerRunning;
        await saveGameSession(current);
      }
    } catch (err) {
      console.error('[handleToggleTimer] Error:', err);
    }
  };

  const handleResetTimer = async () => {
    try {
      const current = await getGameSession();
      if (current) {
        current.timer = 600;
        await saveGameSession(current);
      }
    } catch (err) {
      console.error('[handleResetTimer] Error:', err);
    }
  };

  const handleNextRound = async () => {
    try {
      await resetGame();
    } catch (err) {
      console.error('[handleNextRound] Error:', err);
    }
  };

  const handleStartVoting = async () => {
    try {
      const current = await getGameSession();
      if (current) {
        current.phase = 'voting';
        current.isTimerRunning = false;
        await saveGameSession(current);
      }
    } catch (err) {
      console.error('[handleStartVoting] Error:', err);
    }
  };

  const handleEndVoting = async () => {
    try {
      await endVoting();
    } catch (err) {
      console.error('[handleEndVoting] Error:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join` : '';

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    alert('リンクをコピーしました！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 text-gray-800 font-sans pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">W</div>
            <h1 className="font-bold text-sm md:text-lg text-gray-700">管理者ページ</h1>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-500 transition-colors flex items-center gap-2"
          >
            <Share2 size={16} />
            参加リンク
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Asahi-kun Greeting */}
        <div className="flex items-end gap-3 animate-fade-in">
          <AsahiKun mood={session.phase === 'playing' && session.timer < 60 ? 'worry' : 'happy'} size="sm" />
          <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm text-sm text-gray-600 flex-1 border border-orange-100">
            {session.phase === 'waiting' && 'プレイヤーを追加してゲームを始めよう！'}
            {session.phase === 'playing' && session.timer >= 60 && 'ゲーム進行中！時間内に仲間を見つけてね👀'}
            {session.phase === 'playing' && session.timer < 60 && 'もうすぐ時間だよ！投票の準備はいい？'}
            {session.phase === 'voting' && 'さあ、投票タイム！誰がウルフかな？'}
            {session.phase === 'result' && '結果発表！次のゲームも楽しもう🎉'}
          </div>
        </div>

        {/* Phase: WAITING */}
        {session.phase === 'waiting' && (
          <div className="space-y-6 animate-fade-in">
            {/* Player Entry Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users size={24} className="text-orange-500" />
                参加プレイヤー ({session.players.length}名)
              </h2>

              {/* Add Player Form */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="プレイヤー名を入力..."
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors"
                />
                <button
                  onClick={handleAddPlayer}
                  className="bg-orange-400 text-white p-3 rounded-xl hover:bg-orange-500 transition-colors"
                >
                  <UserPlus size={24} />
                </button>
              </div>

              {/* Player List */}
              <div className="flex flex-wrap gap-2">
                {session.players.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4">まだプレイヤーがいません</p>
                ) : (
                  session.players.map(p => (
                    <div
                      key={p.id}
                      className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 group"
                    >
                      <span>{p.name}</span>
                      <button
                        onClick={() => handleRemovePlayer(p.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Game Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                      📝 各チームにランダムなお題が割り当てられます
                    </span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">10分</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    お題は全{TOPICS.length}種類から選ばれます
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                disabled={session.players.length < 4}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                チーム分け＆ゲーム開始！
              </button>
            </div>
          </div>
        )}

        {/* Phase: PLAYING */}
        {session.phase === 'playing' && (
          <div className="space-y-6 animate-fade-in">
            {/* Timer */}
            <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <Clock size={100} />
              </div>
              <div className="text-6xl font-mono font-bold tracking-tighter mb-4 relative z-10">
                {formatTime(session.timer)}
              </div>
              <div className="flex justify-center gap-4 relative z-10">
                <button
                  onClick={handleToggleTimer}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                >
                  {session.isTimerRunning ? (
                    <div className="w-6 h-6 border-x-4 border-white ml-0.5"></div>
                  ) : (
                    <Play size={24} fill="white" />
                  )}
                </button>
                <button
                  onClick={handleResetTimer}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </div>

            {/* Teams Display */}
            <div className="grid gap-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800">
                👑 管理者モード: 全員の役職とお題が見えています。
              </div>

              {session.teams.length === 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
                  ⚠️ チーム情報が見つかりません。ブラウザのコンソール（F12）を開いて、[shuffleTeams] や [startGame] のログを確認してください。
                </div>
              )}

              {session.teams.map((team, tIdx) => (
                <div key={tIdx} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-orange-400">
                  <div className="bg-orange-50 px-4 py-2 flex justify-between items-center">
                    <span className="font-bold text-orange-800">Team {tIdx + 1}</span>
                    <span className="text-xs text-orange-400 bg-white px-2 py-0.5 rounded-full">{team.length}名</span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {team.map(p => (
                        <div key={p.id} className="relative group">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium border flex items-center gap-1 ${
                            p.role === 'wolf'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}>
                            {p.name}
                            {p.role === 'wolf' && (
                              <span className="text-[10px] bg-red-500 text-white px-1 rounded ml-1">Wolf</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {(() => {
                        const firstPlayer = team[0];
                        if (!firstPlayer?.topicId) {
                          console.error('[AdminPage] Team missing topicId:', team.map(p => p.name));
                        }
                        const teamTopic = TOPICS.find(t => t.id === firstPlayer?.topicId) || TOPICS[0];
                        return (
                          <>
                            <div className="text-xs font-bold text-orange-600 mb-2">
                              お題: {teamTopic.name}
                              {!firstPlayer?.topicId && <span className="text-red-500 ml-2">(エラー: お題未設定)</span>}
                            </div>
                            <div className="flex gap-4 text-xs">
                              <div>
                                <span className="text-gray-400">市民: </span>
                                <span className="font-bold">{teamTopic.citizen}</span>
                              </div>
                              <div>
                                <span className="text-red-400">Wolf: </span>
                                <span className="font-bold">{teamTopic.wolf}</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleStartVoting}
                className="bg-blue-500 text-white py-3 rounded-xl font-bold shadow hover:bg-blue-600 transition-colors"
              >
                投票開始
              </button>
              <button
                onClick={handleNextRound}
                className="bg-gray-800 text-white py-3 rounded-xl font-bold shadow hover:bg-gray-700 transition-colors"
              >
                次のゲーム
              </button>
            </div>
          </div>
        )}

        {/* Phase: VOTING */}
        {session.phase === 'voting' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">投票タイム！</h2>
              <p className="text-gray-600 mb-6">
                各プレイヤーは自分のページで誰がウルフかを投票してください
              </p>

              {/* Voting Progress */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">投票済み</span>
                  <span className="font-bold">
                    {Object.keys(session.votes).length} / {session.players.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-orange-400 h-full transition-all duration-500"
                    style={{ width: `${(Object.keys(session.votes).length / session.players.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Players Who Voted */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-2">投票済みプレイヤー</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {session.players.map(p => (
                    <span
                      key={p.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        session.votes[p.id]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {p.name}
                      {session.votes[p.id] && <CheckCircle size={14} className="inline ml-1" />}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEndVoting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95"
              >
                投票を締め切って結果を見る
              </button>
            </div>
          </div>
        )}

        {/* Phase: RESULT */}
        {session.phase === 'result' && (
          <div className="space-y-6 animate-fade-in">
            <ResultDisplay session={session} />

            <button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95"
            >
              次のゲームを始める
            </button>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white p-6 rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">参加リンクを共有</h3>
            <p className="text-sm text-gray-600 mb-4">
              このリンクをプレイヤーに送ってゲームに参加してもらおう！
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 break-all text-sm font-mono">
              {joinUrl}
            </div>
            <button
              onClick={copyJoinLink}
              className="w-full bg-orange-400 text-white py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors"
            >
              リンクをコピー
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
