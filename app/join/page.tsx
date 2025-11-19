'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, LogIn } from 'lucide-react';
import { AsahiKun } from '@/components/AsahiKun';
import { addPlayer, getGameSession } from '@/lib/game-storage';

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if session exists, don't create a new one
    const session = getGameSession();
    if (!session) {
      console.log('[JoinPage] No session found. Admin must create session first.');
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const player = addPlayer(name.trim());
      // Redirect to player page
      router.push(`/player/${player.id}`);
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 text-gray-800 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-400 to-red-500"></div>

          {/* Asahi-kun */}
          <div className="flex justify-center mb-6 mt-4">
            <AsahiKun mood="excited" size="lg" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            ワードウルフへようこそ！
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            名前を入力してゲームに参加しよう
          </p>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                あなたの名前
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-colors text-lg"
                maxLength={20}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus size={24} />
              {isLoading ? '参加中...' : 'ゲームに参加'}
            </button>
          </form>

          {/* Admin Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGoToAdmin}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              管理者として入る
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>参加したら、あさひくんの管理画面にあなたの名前が表示されるよ！</p>
        </div>
      </div>
    </div>
  );
}
