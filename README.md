# Mutable SDK

The official SDK for integrating with the Mutable gaming platform.

## Installation

\`\`\`bash
npm install @mutable/sdk
# or
yarn add @mutable/sdk
\`\`\`

## Quick Start

\`\`\`typescript
import { MutableSDK } from '@mutable/sdk';

// Initialize the SDK
const sdk = new MutableSDK({
  environment: 'production', // or 'development', 'staging'
  apiKey: 'YOUR_API_KEY',
  debug: false
});

// Initialize with game information
await sdk.initialize({
  id: 'your-game-id',
  name: 'Your Game Name',
  version: '1.0.0'
});

// Authenticate a player
const player = await sdk.auth.authenticateAsGuest('Player1');

// Set the player in the SDK
sdk.setPlayer(player);

// Now you can use other SDK features
const balance = await sdk.transactions.getBalance('MUTB');
console.log(`Player balance: ${balance} MUTB`);
\`\`\`

## Features

- **Authentication**: Support for guest and wallet-based authentication
- **Game State Management**: Create and manage game sessions, track player states
- **Transactions**: Handle token transactions, wagers, and rewards
- **Analytics**: Track game events and player behavior
- **Unity Integration**: Seamless integration with Unity WebGL games

## Documentation

For full documentation, visit [docs.mutable.io](https://docs.mutable.io).

## Examples

### Creating a Game Session

\`\`\`typescript
// Create a new game session
const session = await sdk.gameState.createSession('standard', true);

// Start the session
const gameState = await sdk.gameState.startSession();

// Update a player's state
await sdk.gameState.updatePlayerState(player.id, {
  score: 100,
  lives: 3
});

// End the session
await sdk.gameState.endSession([player.id]);
\`\`\`

### Handling Transactions

\`\`\`typescript
// Get player balance
const balance = await sdk.transactions.getBalance('MUTB');

// Place a wager
await sdk.transactions.placeWager(10, 'MUTB', gameId, sessionId);

// Award a reward
await sdk.transactions.awardReward(50, 'MUTB', gameId, sessionId);
\`\`\`

### Tracking Analytics

\`\`\`typescript
// Track game start
sdk.analytics.trackGameStart({
  mode: 'standard',
  difficulty: 'normal'
});

// Track custom event
sdk.analytics.trackEvent('custom', {
  action: 'level_complete',
  level: 5,
  score: 1000
});
\`\`\`

### Unity Integration

\`\`\`typescript
// Load Unity WebGL game
await sdk.unityBridge.loadUnity('unity-canvas', {
  loaderUrl: 'Build/Game.loader.js',
  dataUrl: 'Build/Game.data',
  frameworkUrl: 'Build/Game.framework.js',
  codeUrl: 'Build/Game.wasm'
});

// Send message to Unity
sdk.unityBridge.sendMessage('GameManager', 'StartGame', {
  difficulty: 'hard',
  level: 1
});

// Listen for messages from Unity
sdk.unityBridge.on('score_update', (data) => {
  console.log('Score updated:', data.score);
});
\`\`\`

## License

MIT
