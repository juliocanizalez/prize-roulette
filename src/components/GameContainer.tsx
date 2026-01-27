import { useReducer, createContext, useContext, type Dispatch } from 'react';
import type { GameState, GameAction } from '../lib/types';
import SetupForm from './SetupForm';
import GameStage from './GameStage';
import GameOver from './GameOver';

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        stage: 'READY_TO_SPIN',
        participants: action.participants,
        remainingParticipants: [...action.participants],
        prizes: action.prizes,
        currentPrizeIndex: 0,
        currentWinner: null,
        winners: [],
      };
    case 'START_SPIN':
      return { ...state, stage: 'SPINNING' };
    case 'SPIN_COMPLETE':
      return { ...state, stage: 'AWAITING_DECISION', currentWinner: action.winner };
    case 'ACCEPT_WINNER': {
      const winner = state.currentWinner!;
      const prize = state.prizes[state.currentPrizeIndex];
      const newWinners = [...state.winners, { participant: winner, prize }];
      const remaining = state.remainingParticipants.filter((p) => p.id !== winner.id);
      const nextIndex = state.currentPrizeIndex + 1;
      const isOver = nextIndex >= state.prizes.length || remaining.length === 0;
      return {
        ...state,
        stage: 'PRIZE_AWARDED',
        winners: newWinners,
        remainingParticipants: remaining,
        currentPrizeIndex: isOver ? state.currentPrizeIndex : nextIndex,
        currentWinner: winner,
        isOver,
      };
    }
    case 'ADVANCE_TO_NEXT_PRIZE': {
      return {
        ...state,
        stage: state.isOver ? 'GAME_OVER' : 'READY_TO_SPIN',
        currentWinner: null,
      };
    }
    case 'REJECT_WINNER':
      return { ...state, stage: 'READY_TO_SPIN', currentWinner: null };
    case 'RESTART':
      return initialState;
    default:
      return state;
  }
}

const initialState: GameState = {
  stage: 'SETUP',
  participants: [],
  remainingParticipants: [],
  prizes: [],
  currentPrizeIndex: 0,
  currentWinner: null,
  winners: [],
  isOver: false,
};

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<GameAction> }>({
  state: initialState,
  dispatch: () => {},
});

export function useGame() {
  return useContext(GameContext);
}

export default function GameContainer() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div className="h-dvh w-dvw overflow-hidden">
        {state.stage === 'SETUP' && <SetupForm />}
        {state.stage === 'GAME_OVER' && <GameOver />}
        {state.stage !== 'SETUP' && state.stage !== 'GAME_OVER' && <GameStage />}
      </div>
    </GameContext.Provider>
  );
}
