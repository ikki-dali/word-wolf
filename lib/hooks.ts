import { useState, useEffect } from 'react';
import { GameSession } from './types';
import { getGameSession } from './game-storage';

export const useGameSession = () => {
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    // Initial load
    const loadSession = () => {
      const current = getGameSession();
      if (current && current.players.length !== session?.players.length) {
        console.log('[useGameSession] Player count changed:', session?.players.length, '->', current.players.length);
      }
      setSession(current);
    };

    loadSession();

    // Poll for updates every second
    const interval = setInterval(loadSession, 1000);

    // Listen to storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wordwolf-game-session') {
        console.log('[useGameSession] Storage event detected from another tab');
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session?.players.length]);

  return session;
};

export const useTimer = (session: GameSession | null) => {
  useEffect(() => {
    if (!session || !session.isTimerRunning || session.timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const currentSession = getGameSession();
      if (currentSession && currentSession.isTimerRunning && currentSession.timer > 0) {
        currentSession.timer -= 1;

        // Auto-transition to voting when timer reaches 0
        if (currentSession.timer === 0) {
          currentSession.phase = 'voting';
          currentSession.isTimerRunning = false;
        }

        // Save is handled in game-storage
        const { saveGameSession } = require('./game-storage');
        saveGameSession(currentSession);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.isTimerRunning, session?.timer]);
};
