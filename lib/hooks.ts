import { useState, useEffect } from 'react';
import { GameSession } from './types';
import { getCurrentSessionId, subscribeToSession, saveGameSession } from './game-storage';

export const useGameSession = () => {
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    const sessionId = getCurrentSessionId();
    if (!sessionId) {
      console.log('[useGameSession] No session ID found');
      setSession(null);
      return;
    }

    console.log('[useGameSession] Subscribing to session:', sessionId);

    // Subscribe to real-time updates from Firebase
    const unsubscribe = subscribeToSession(sessionId, (updatedSession) => {
      if (updatedSession && updatedSession.players.length !== session?.players.length) {
        console.log('[useGameSession] Player count changed:', session?.players.length, '->', updatedSession.players.length);
      }
      setSession(updatedSession);
    });

    return () => {
      console.log('[useGameSession] Unsubscribing from session');
      unsubscribe();
    };
  }, []); // Only run once on mount

  return session;
};

export const useTimer = (session: GameSession | null) => {
  useEffect(() => {
    if (!session || !session.isTimerRunning || session.timer <= 0) {
      return;
    }

    const interval = setInterval(async () => {
      if (session && session.isTimerRunning && session.timer > 0) {
        session.timer -= 1;

        // Auto-transition to voting when timer reaches 0
        if (session.timer === 0) {
          session.phase = 'voting';
          session.isTimerRunning = false;
        }

        await saveGameSession(session);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session?.isTimerRunning, session?.timer, session?.id]);
};
