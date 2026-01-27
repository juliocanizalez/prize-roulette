export interface Participant {
  id: string;
  name: string;
}

export interface Prize {
  id: string;
  name: string;
}

export interface Winner {
  participant: Participant;
  prize: Prize;
}

export type GameStage =
  | 'SETUP'
  | 'READY_TO_SPIN'
  | 'SPINNING'
  | 'AWAITING_DECISION'
  | 'PRIZE_AWARDED'
  | 'GAME_OVER';

export interface GameState {
  stage: GameStage;
  participants: Participant[];
  remainingParticipants: Participant[];
  prizes: Prize[];
  currentPrizeIndex: number;
  currentWinner: Participant | null;
  winners: Winner[];
  isOver: boolean;
}

export type GameAction =
  | { type: 'START_GAME'; participants: Participant[]; prizes: Prize[] }
  | { type: 'START_SPIN' }
  | { type: 'SPIN_COMPLETE'; winner: Participant }
  | { type: 'ACCEPT_WINNER' }
  | { type: 'REJECT_WINNER' }
  | { type: 'ADVANCE_TO_NEXT_PRIZE' }
  | { type: 'RESTART' };
