# Enhanced Tic-Tac-Toe Game

A fully-featured, highly customizable Tic-Tac-Toe game with multiple game modes, AI difficulty levels, and advanced features.

## Features

### Game Modes

- **Classic**: Standard Tic-Tac-Toe rules - get a row, column or diagonal to win
- **Misère**: Reverse rules - force your opponent to get a row, column or diagonal
- **Ultimate**: Play on a 3x3 grid of Tic-Tac-Toe boards (9 boards simultaneously)

### Board Configuration

- Configurable board sizes (3x3, 4x4, 5x5, 6x6)
- Adjustable win length (3-in-a-row up to board-size-in-a-row)
- First player selection (X, O, or random)

### AI Opponent

- **Multiple difficulty levels**:
  - Easy: Makes mostly random moves
  - Medium: Blocks obvious threats and makes strategic moves
  - Hard: Plays more strategically with some occasional mistakes
  - Impossible: Uses minimax with alpha-beta pruning for optimal play (unbeatable on 3x3)

- **AI Personalities**:
  - Balanced: Even mix of offensive and defensive play
  - Aggressive: Prioritizes creating winning opportunities
  - Defensive: Focuses on blocking player threats
  - Random: Makes unpredictable moves
  - Strategic: Plans several moves ahead
  - Mimicking: Adapts to match the player's style

### Game Features

- Timed moves with configurable time limits
- Move history tracking
- Undo/redo functionality
- Hint system with move recommendations and explanations
- Win detection for various board sizes and win conditions

## Architecture

The game is built with a clean separation of concerns:

- **Game Logic** (`gameLogic.ts`): Core game mechanics and AI algorithms
- **Types** (`types.ts`): TypeScript type definitions for game state and settings
- **UI Components**: React components for game board and settings

### Core Components

- `TicTacToeGame`: Main game component with board rendering and game controls
- `TicTacToeSettings`: Settings configuration component

## Game Algorithms

- **Minimax with Alpha-Beta Pruning**: For optimal AI play on 3x3 boards
- **Heuristic Evaluation**: For larger board sizes where full minimax is impractical
- **Pattern Recognition**: For detecting win conditions on various board sizes

## Usage

```tsx
import { TicTacToeGame, TicTacToeSettings } from "./games/tictactoe";

// Use the settings component to configure the game
<TicTacToeSettings 
  initialSettings={settings}
  onSave={handleSettingsSave}
/>

// Then use the game component with the configured settings
<TicTacToeGame
  initialGameState={gameState}
  customSettings={gameSettings}
  playerSymbol="X"
  isAIGame={true}
  aiPersonality="balanced"
  onGameEnd={handleGameEnd}
/>
```

## Technical Highlights

- **Immutable State Management**: All game state updates create new state objects without mutating existing state
- **Scalable Architecture**: The same code handles various board sizes and game modes
- **Type Safety**: Comprehensive TypeScript typing for all game elements
- **Optimized AI**: Fast decision making even for complex board states
- **Responsive Design**: Adapts to various screen sizes for mobile and desktop play