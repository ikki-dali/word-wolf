import { GameSession, Player, TopicSet } from './types';

const STORAGE_KEY = 'wordwolf-game-session';
const SESSION_ID_KEY = 'wordwolf-session-id';

export const TOPICS: TopicSet[] = [
  // 学生編
  { id: 1, name: '学生', citizen: '学生時代に「憧れていた」タイプ', wolf: '学生時代に「付き合いたかった」タイプ' },
  { id: 2, name: '学生', citizen: '尊敬する先生の特徴', wolf: '嫌いだった先生の特徴' },
  { id: 3, name: '学生', citizen: '学生時代、親友との黒歴史', wolf: '学生時代、恋人との1番の思い出' },
  { id: 4, name: '学生', citizen: '授業中に「隠れてやっていた」こと', wolf: '学校生活で密かに楽しみにしていたこと' },
  { id: 5, name: '学生', citizen: '修学旅行で楽しかったこと', wolf: '修学旅行で憧れていたけどできなかったこと' },
  { id: 6, name: '学生', citizen: '学生時代でお小遣いを一番使っていたもの', wolf: '学生時代に流行っていて密かにバカにしていたもの' },
  { id: 7, name: '学生', citizen: '学生時代親に隠していたこと', wolf: '学生時代先生に隠していたこと' },
  { id: 8, name: '学生', citizen: '帰り道によく寄っていた場所', wolf: '家族でよく行っていた場所' },
  { id: 9, name: '学生', citizen: '学校の中で一番好きだった場所', wolf: '学校内の都市伝説になっていた場所' },
  { id: 10, name: '学生', citizen: '学生時代好きだった給食', wolf: '学生時代好きだった親のお弁当' },

  // 最近（日常編）
  { id: 11, name: '最近', citizen: '最近見るのが怖いもの', wolf: '最近辛いときに見るもの' },
  { id: 12, name: '最近', citizen: '最近増えたもの', wolf: '最近失いつつあるもの' },
  { id: 13, name: '最近', citizen: '最近悲しかったこと', wolf: '最近相談されたこと' },
  { id: 14, name: '最近', citizen: '最近得を積んだこと', wolf: '最近人にがっかりしたこと' },
  { id: 15, name: '最近', citizen: 'まじで勘弁してほしいこと', wolf: 'どうでもいいけどつい見ちゃうこと' },

  // パーソナル（日常編）
  { id: 16, name: '個人', citizen: '気に入っている自分の性格', wolf: '早く治すべきな自分の性格' },
  { id: 17, name: '個人', citizen: '意外に褒められる自分の〇〇', wolf: '憧れの芸能人からもらいたい〇〇' },
  { id: 18, name: '個人', citizen: 'これだけは譲れん！のもの', wolf: '周りに引かれる好きなもの' },
];

export const createGameSession = (): GameSession => {
  const sessionId = generateSessionId();
  const session: GameSession = {
    id: sessionId,
    phase: 'waiting',
    players: [],
    teams: [],
    currentTopicId: 1,
    timer: 600,
    isTimerRunning: false,
    history: [],
    votes: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveGameSession(session);
  localStorage.setItem(SESSION_ID_KEY, sessionId);
  return session;
};

export const getGameSession = (): GameSession | null => {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const saveGameSession = (session: GameSession): void => {
  if (typeof window === 'undefined') return;

  session.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const getCurrentSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_ID_KEY);
};

export const addPlayer = (name: string): Player => {
  const session = getGameSession();
  if (!session) {
    console.error('[addPlayer] No active session found!');
    throw new Error('No active session');
  }

  console.log('[addPlayer] Current session:', session.id, 'Players before:', session.players.length);

  const player: Player = {
    id: generatePlayerId(),
    name,
    isOnline: true,
  };

  session.players.push(player);
  console.log('[addPlayer] Added player:', player.name, 'Total players now:', session.players.length);

  saveGameSession(session);
  console.log('[addPlayer] Session saved to localStorage');

  return player;
};

export const removePlayer = (playerId: string): void => {
  const session = getGameSession();
  if (!session) return;

  session.players = session.players.filter(p => p.id !== playerId);
  saveGameSession(session);
};

export const updatePlayer = (playerId: string, updates: Partial<Player>): void => {
  const session = getGameSession();
  if (!session) return;

  const player = session.players.find(p => p.id === playerId);
  if (player) {
    Object.assign(player, updates);
    saveGameSession(session);
  }
};

export const shuffleTeams = (): Player[][] => {
  const session = getGameSession();
  if (!session) {
    console.error('[shuffleTeams] No session found');
    return [];
  }

  console.log('[shuffleTeams] Starting with', session.players.length, 'players');

  let bestTeams: Player[][] = [];
  let minConflicts = Infinity;

  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = [...session.players].sort(() => 0.5 - Math.random());
    const tempTeams: Player[][] = [];

    const numTeams = Math.max(1, Math.floor(shuffled.length / 3));
    const baseSize = Math.floor(shuffled.length / numTeams);
    const remainder = shuffled.length % numTeams;

    let startIndex = 0;

    for (let i = 0; i < numTeams; i++) {
      const size = baseSize + (i < remainder ? 1 : 0);
      const teamMembers = shuffled.slice(startIndex, startIndex + size);
      startIndex += size;

      // チームが存在する場合は必ず追加（3人未満でも）
      if (teamMembers.length > 0) {
        // 各チームにランダムなお題を割り当て（お題は重複OK）
        // チーム数がお題数より多い場合でも、全チームに確実にお題が割り当てられます
        const randomTopicId = Math.floor(Math.random() * TOPICS.length) + 1;
        const wolfIndex = Math.floor(Math.random() * teamMembers.length);

        console.log(`[shuffleTeams] Team ${i + 1}: ${teamMembers.length} members, topic ID ${randomTopicId}`);

        const teamWithRoles = teamMembers.map((p, idx) => ({
          ...p,
          role: (idx === wolfIndex ? 'wolf' : 'citizen') as 'wolf' | 'citizen',
          teamId: i + 1,
          topicId: randomTopicId,
        }));
        tempTeams.push(teamWithRoles);
      }
    }

    let conflicts = 0;
    tempTeams.forEach(team => {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          const pairId = [team[i].id, team[j].id].sort().join('-');
          if (session.history.includes(pairId)) conflicts++;
        }
      }
    });

    if (conflicts < minConflicts) {
      minConflicts = conflicts;
      bestTeams = tempTeams;
    }
  }

  // Update session with new teams and history
  session.teams = bestTeams;

  // チーム分けが成功した場合のみplayersを更新
  if (bestTeams.length > 0) {
    session.players = bestTeams.flat();
    console.log('[shuffleTeams] Created', bestTeams.length, 'teams with total', session.players.length, 'players');
  } else {
    // フォールバック: チーム分けに失敗した場合、全員を1チームにする
    console.warn('[shuffleTeams] チーム分けに失敗しました。全員を1チームにします。');
    const randomTopicId = Math.floor(Math.random() * TOPICS.length) + 1;
    const wolfIndex = Math.floor(Math.random() * session.players.length);
    console.log('[shuffleTeams] Fallback: 1 team, topic ID', randomTopicId);
    session.players = session.players.map((p, idx) => ({
      ...p,
      role: (idx === wolfIndex ? 'wolf' : 'citizen') as 'wolf' | 'citizen',
      teamId: 1,
      topicId: randomTopicId,
    }));
    session.teams = [session.players];
  }

  // Verify all players have required fields
  session.players.forEach((p) => {
    if (!p.topicId || !p.teamId || !p.role) {
      console.error(`[shuffleTeams] Player ${p.name} missing fields:`, {
        topicId: p.topicId,
        teamId: p.teamId,
        role: p.role,
      });
    }
  });

  const newPairs: string[] = [];
  session.teams.forEach(team => {
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        newPairs.push([team[i].id, team[j].id].sort().join('-'));
      }
    }
  });
  session.history = [...session.history, ...newPairs];

  console.log('[shuffleTeams] Final teams:', session.teams.length, 'History pairs:', newPairs.length);
  saveGameSession(session);
  return session.teams;
};

export const startGame = (): void => {
  const session = getGameSession();
  if (!session) {
    console.error('[startGame] No session found');
    return;
  }

  console.log('[startGame] Starting game with', session.players.length, 'players');

  const teams = shuffleTeams();
  console.log('[startGame] Shuffle returned', teams.length, 'teams');

  // Re-fetch session after shuffle
  const updatedSession = getGameSession();
  if (!updatedSession) {
    console.error('[startGame] Session disappeared after shuffle');
    return;
  }

  console.log('[startGame] Updated session has', updatedSession.teams.length, 'teams');

  updatedSession.phase = 'playing';
  updatedSession.timer = 600;
  updatedSession.isTimerRunning = true;
  saveGameSession(updatedSession);

  console.log('[startGame] Game started, final teams:', updatedSession.teams.length);
};

export const castVote = (voterId: string, votedId: string): void => {
  const session = getGameSession();
  if (!session) return;

  session.votes[voterId] = votedId;

  const player = session.players.find(p => p.id === voterId);
  if (player) {
    player.vote = votedId;
  }

  saveGameSession(session);
};

export const endVoting = (): void => {
  const session = getGameSession();
  if (!session) return;

  session.phase = 'result';
  session.isTimerRunning = false;
  saveGameSession(session);
};

export const resetGame = (): void => {
  const session = getGameSession();
  if (!session) return;

  session.phase = 'waiting';
  session.teams = [];
  session.votes = {};
  session.timer = 600;
  session.isTimerRunning = false;
  session.currentTopicId = (session.currentTopicId % TOPICS.length) + 1;

  // Reset player roles but keep players
  session.players = session.players.map(p => ({
    ...p,
    role: undefined,
    teamId: undefined,
    topicId: undefined,
    vote: undefined,
  }));

  saveGameSession(session);
};

// Helper functions
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generatePlayerId(): string {
  return `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
