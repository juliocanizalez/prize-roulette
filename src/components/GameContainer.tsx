import { useReducer, useEffect, createContext, useContext, type Dispatch } from 'react';
import type { GameState, GameAction } from '../lib/types';
import { PreferencesProvider } from '../lib/PreferencesContext';
import SetupForm from './SetupForm';
import GameStage from './GameStage';
import GameOver from './GameOver';

const STORAGE_KEY = 'prize-roulette-state';

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
    case 'REJECT_AND_SPIN':
      return { ...state, stage: 'SPINNING', currentWinner: null };
    case 'RESTART':
      return initialState;
    case 'RESTART_WITH_DATA':
      return {
        ...initialState,
        stage: 'SETUP',
        participants: state.participants,
        prizes: state.prizes,
      };
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

function loadState(): GameState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved: GameState = JSON.parse(raw);

    // If mid-spin or awarding, reset to a safe stage
    if (saved.stage === 'SPINNING') saved.stage = 'READY_TO_SPIN';
    if (saved.stage === 'PRIZE_AWARDED') saved.stage = 'READY_TO_SPIN';

    // If no participants/prizes, go back to setup
    if (saved.participants.length === 0 || saved.prizes.length === 0) {
      return initialState;
    }

    // If no remaining participants but not in terminal state, go to game over
    if (
      saved.remainingParticipants.length === 0 &&
      saved.stage !== 'SETUP' &&
      saved.stage !== 'GAME_OVER'
    ) {
      saved.stage = 'GAME_OVER';
      saved.isOver = true;
    }

    return saved;
  } catch {
    return initialState;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<GameAction> }>({
  state: initialState,
  dispatch: () => {},
});

export function useGame() {
  return useContext(GameContext);
}

export default function GameContainer() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <PreferencesProvider>
      <GameContext.Provider value={{ state, dispatch }}>
        <div className="w-full">
          {state.stage === 'SETUP' && <SetupForm />}
          {state.stage === 'GAME_OVER' && <GameOver />}
          {state.stage !== 'SETUP' && state.stage !== 'GAME_OVER' && <GameStage />}
        </div>
      </GameContext.Provider>
    </PreferencesProvider>
  );
}
