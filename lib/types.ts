export interface Player {
  id: string;
  name: string;
  role?: 'citizen' | 'wolf';
  teamId?: number;
  topicId?: number; // お題のID
  vote?: string; // player id they voted for
  isOnline?: boolean;
}

export interface TopicSet {
  id: number;
  name: string;
  citizen: string;
  wolf: string;
}

export type GamePhase = 'waiting' | 'playing' | 'voting' | 'result';

export interface GameSession {
  id: string;
  phase: GamePhase;
  players: Player[];
  teams: Player[][];
  currentTopicId: number;
  timer: number;
  isTimerRunning: boolean;
  history: string[];
  votes: Record<string, string>; // playerId -> votedPlayerId
  createdAt: number;
  updatedAt: number;
}

export interface VoteResult {
  playerId: string;
  playerName: string;
  voteCount: number;
  voters: string[]; // names of voters
}
