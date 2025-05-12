### Mutable SDK





## Overview

Mutable SDK is a comprehensive platform that enables game developers to integrate blockchain-based features, player authentication, game state management, transactions, and analytics into their games. This SDK supports multiple game engines including Unity, Godot, and standard web games.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Integration Guides](#integration-guides)

- [Web Games](#web-games)
- [Unity Integration](#unity-integration)
- [Godot Integration](#godot-integration)



- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Support](#support)


## Installation

### NPM Installation

```shellscript
npm install @mutablepvp/sdk
```

### Yarn Installation

```shellscript
yarn add @mutablepvp/sdk
```

### CDN Usage

```html
<script src="https://cdn.mutable.io/sdk/latest/index.umd.js"></script>
```

## Getting Started

### 1. Create a Mutable Developer Account

Sign up at [developer.mutable.io](https://developer.mutable.io) to get your API key.

### 2. Initialize the SDK

```javascript
import { MutableSDK } from '@mutablepvp/sdk';

const sdk = new MutableSDK({
  apiKey: 'YOUR_API_KEY',
  environment: 'development', // Use 'production' for live games
  debug: true // Set to false in production
});

// Initialize with your game information
await sdk.initialize({
  id: 'your-game-id',
  name: 'Your Game Name',
  version: '1.0.0'
});
```

### 3. Authenticate Players

```javascript
// Guest authentication
const player = await sdk.auth.authenticateAsGuest('PlayerName');

// Set the player in the SDK
sdk.setPlayer(player);
```

### 4. Create a Game Session

```javascript
// Create a new game session
const session = await sdk.gameState.createSession('standard', true);

// Set the session ID for analytics
sdk.analytics.setSessionId(session.sessionId);

// Start the session
const gameState = await sdk.gameState.startSession();
```

## Core Concepts

### Player Authentication

The SDK provides multiple authentication methods:

- Guest authentication
- Wallet-based authentication
- Custom authentication systems


### Game State Management

Track and synchronize game state across clients:

- Create and manage game sessions
- Update player states
- Handle real-time game state changes


### Transactions

Manage in-game economies and rewards:

- Award tokens to players
- Process wagers
- Handle deposits and withdrawals
- Track transaction history


### Analytics

Collect and analyze game data:

- Track game events
- Monitor player behavior
- Measure engagement metrics
- Generate insights


## Integration Guides

### Web Games

For web-based games, the SDK can be directly integrated into your JavaScript/TypeScript codebase.

```javascript
// Initialize the SDK
const sdk = new MutableSDK({
  apiKey: 'YOUR_API_KEY',
  environment: 'development'
});

// Initialize with game info
await sdk.initialize({
  id: 'web-game',
  name: 'My Web Game',
  version: '1.0.0'
});

// Handle player authentication
document.getElementById('login-button').addEventListener('click', async () => {
  const playerName = document.getElementById('player-name').value;
  const player = await sdk.auth.authenticateAsGuest(playerName);
  sdk.setPlayer(player);
  
  // Show game screen
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
});
```

### Unity Integration

The SDK provides a dedicated Unity bridge for seamless integration with Unity games.

#### 1. Initialize the Unity Bridge

```javascript
// Initialize the SDK
await sdk.initialize({
  id: 'unity-game',
  name: 'My Unity Game',
  version: '1.0.0'
});

// Load the Unity game
await sdk.unityBridge.loadUnity('unity-container', {
  loaderUrl: 'Build/WebGL.loader.js',
  dataUrl: 'Build/WebGL.data',
  frameworkUrl: 'Build/WebGL.framework.js',
  codeUrl: 'Build/WebGL.wasm'
});
```

#### 2. Communicate with Unity

```javascript
// Send message to Unity
sdk.unityBridge.sendMessage('GameManager', 'SetSessionInfo', {
  sessionId: session.sessionId,
  gameMode: 'standard'
});

// Receive messages from Unity
sdk.unityBridge.on('score_update', (data) => {
  // Update player state with new score
  sdk.gameState.updatePlayerState(player.id, {
    score: data.score
  });
});
```

#### 3. Unity-side Integration

```csharp
// C# script in Unity
using UnityEngine;
using System.Runtime.InteropServices;

public class MutableBridge : MonoBehaviour
{
    // Import JavaScript function
    [DllImport("__Internal")]
    private static extern void SendMessageToMutable(string messageType, string data);

    // Function to send messages to the SDK
    public void SendToMutable(string messageType, string jsonData)
    {
        #if UNITY_WEBGL && !UNITY_EDITOR
            SendMessageToMutable(messageType, jsonData);
        #else
            Debug.Log($"Would send to Mutable: {messageType} - {jsonData}");
        #endif
    }

    // Function called by JavaScript
    public void ReceiveFromMutable(string messageType, string jsonData)
    {
        // Handle messages from the SDK
        Debug.Log($"Received from Mutable: {messageType} - {jsonData}");
        
        // Parse JSON and handle different message types
        // ...
    }
}
```

### Godot Integration

The SDK includes a Godot bridge for integrating with Godot games.

#### 1. Initialize the Godot Bridge

```javascript
// Initialize the SDK
await sdk.initialize({
  id: 'godot-game',
  name: 'My Godot Game',
  version: '1.0.0'
});

// Load the Godot game
await sdk.godotBridge.loadGodot('godot-container', {
  engineUrl: 'godot-engine.js',
  executableUrl: 'game.wasm',
  projectZipUrl: 'game.zip'
});
```

#### 2. Communicate with Godot

```javascript
// Send message to Godot
sdk.godotBridge.sendMessage('SetSessionInfo', {
  sessionId: session.sessionId,
  gameMode: 'standard'
}, '/root/Main');

// Receive messages from Godot
sdk.godotBridge.on('game_event', (data) => {
  if (data.type === 'score_update') {
    // Update player state with new score
    sdk.gameState.updatePlayerState(player.id, {
      score: data.score
    });
  }
});

// Register callback for Godot to call
sdk.godotBridge.registerCallback('endGame', async (data) => {
  // End the session
  await sdk.gameState.endSession([player.id]);
  
  // Award tokens based on score
  await sdk.transactions.awardReward(
    Math.floor(data.finalScore / 10),
    'MUTB',
    sdk.getGameInfo()?.id,
    session.sessionId
  );
});
```

#### 3. Godot-side Integration

```plaintext
# GDScript in Godot
extends Node

# Function to send messages to the SDK
func send_message_to_sdk(message_type, data):
    var json_data = JSON.print(data)
    JavaScript.eval("window.mutableReceiveMessage('" + message_type + "', '" + json_data + "')")

# Function to handle messages from the SDK
func receive_message_from_sdk(message_type, data_json):
    var data = JSON.parse(data_json).result
    
    match message_type:
        "SetPlayerInfo":
            handle_player_info(data)
        "SetSessionInfo":
            handle_session_info(data)
        # Handle other message types
        _:
            print("Unknown message type: ", message_type)

# Called when the node enters the scene tree
func _ready():
    # Set up communication with the SDK
    JavaScript.create_callback(self, "receive_message_from_sdk")
    
    # Signal that the game is ready
    send_message_to_sdk("game_ready", {})
```

## API Reference

### MutableSDK

The main SDK class that provides access to all modules.

```typescript
class MutableSDK {
  constructor(config: MutableSDKConfig);
  
  // Core methods
  async initialize(gameInfo: GameInfo): Promise<void>;
  setPlayer(playerInfo: PlayerInfo): void;
  getPlayer(): PlayerInfo | undefined;
  getGameInfo(): GameInfo | undefined;
  isInitialized(): boolean;
  getConfig(): MutableSDKConfig;
  
  // Modules
  auth: AuthModule;
  gameState: GameStateModule;
  transactions: TransactionsModule;
  analytics: AnalyticsModule;
  unityBridge: UnityBridgeModule;
  godotBridge: GodotBridgeModule;
}
```

### AuthModule

Handles player authentication and session management.

```typescript
class AuthModule {
  async authenticateAsGuest(name?: string): Promise<PlayerInfo>;
  async authenticateWithWallet(walletAddress: string, signedMessage: string): Promise<PlayerInfo>;
  async logout(): Promise<void>;
  getPlayer(): PlayerInfo | undefined;
  isAuthenticated(): boolean;
}
```

### GameStateModule

Manages game state, sessions, and real-time updates.

```typescript
class GameStateModule {
  async createSession(modeId: string, isPublic?: boolean): Promise<GameSession>;
  async joinSession(sessionId: string): Promise<GameSession>;
  async leaveSession(): Promise<void>;
  async startSession(): Promise<GameState>;
  async endSession(winnerIds?: string[]): Promise<void>;
  async updateGameState(stateUpdate: Partial<GameState>): Promise<GameState>;
  async updatePlayerState(playerId: string, playerState: Partial<PlayerState>): Promise<GameState>;
  getCurrentSession(): GameSession | undefined;
  getCurrentState(): GameState | undefined;
  onStateUpdate(callback: (state: GameState) => void): () => void;
  onSessionUpdate(callback: (session: GameSession) => void): () => void;
}
```

### TransactionsModule

Handles token transactions, wagers, and rewards.

```typescript
class TransactionsModule {
  async getBalance(currency?: string): Promise<number>;
  async placeWager(amount: number, currency?: string, gameId?: string, sessionId?: string): Promise<TransactionInfo>;
  async awardReward(amount: number, currency?: string, gameId?: string, sessionId?: string): Promise<TransactionInfo>;
  async getTransactionHistory(limit?: number, offset?: number, type?: string): Promise<TransactionInfo[]>;
  async deposit(amount: number, currency?: string, walletAddress?: string): Promise<TransactionInfo>;
  async withdraw(amount: number, currency?: string, walletAddress?: string): Promise<TransactionInfo>;
}
```

### AnalyticsModule

Tracks game events and player behavior for analytics.

```typescript
class AnalyticsModule {
  setSessionId(sessionId: string): void;
  trackEvent(eventType: EventType, data?: Record<string, any>): void;
  trackGameStart(data?: Record<string, any>): void;
  trackGameEnd(data?: Record<string, any>): void;
  trackRoundStart(data?: Record<string, any>): void;
  trackRoundEnd(data?: Record<string, any>): void;
  trackPlayerJoin(data?: Record<string, any>): void;
  trackPlayerLeave(data?: Record<string, any>): void;
  trackTransaction(data?: Record<string, any>): void;
  trackError(data?: Record<string, any>): void;
  flushEvents(sync?: boolean): Promise<void>;
}
```

### UnityBridgeModule

Handles communication between the Mutable platform and Unity WebGL games.

```typescript
class UnityBridgeModule {
  async loadUnity(canvasId: string, unityConfig: UnityConfig): Promise<void>;
  sendMessage(gameObject: string, method: string, data: any): void;
  on(messageType: string, handler: (data: any) => void): () => void;
  unloadUnity(): void;
}
```

### GodotBridgeModule

Handles communication between the Mutable platform and Godot games.

```typescript
class GodotBridgeModule {
  async loadGodot(containerId: string, godotConfig: GodotConfig): Promise<void>;
  sendMessage(method: string, data: any, objectPath?: string): void;
  on(messageType: string, handler: (data: any) => void): () => void;
  registerCallback(name: string, callback: Function): void;
  unloadGodot(): void;
}
```

## Examples

### Basic Game Flow

```javascript
import { MutableSDK } from '@mutablepvp/sdk';

async function runGame() {
  // Initialize SDK
  const sdk = new MutableSDK({ apiKey: 'YOUR_API_KEY' });
  await sdk.initialize({
    id: 'example-game',
    name: 'Example Game',
    version: '1.0.0'
  });
  
  // Authenticate player
  const player = await sdk.auth.authenticateAsGuest('Player123');
  sdk.setPlayer(player);
  
  // Create and start session
  const session = await sdk.gameState.createSession('standard');
  sdk.analytics.setSessionId(session.sessionId);
  await sdk.gameState.startSession();
  
  // Track game start
  sdk.analytics.trackGameStart({ mode: 'standard' });
  
  // Update player state during gameplay
  await sdk.gameState.updatePlayerState(player.id, {
    score: 100,
    lives: 3
  });
  
  // End game and award tokens
  await sdk.gameState.endSession([player.id]);
  await sdk.transactions.awardReward(50, 'MUTB');
  
  // Track game end
  sdk.analytics.trackGameEnd({
    score: 100,
    duration: 120,
    completed: true
  });
}
```

### More Examples

Check out the [examples directory](https://github.com/mutablepvp/sdk/tree/main/examples) for more detailed examples:

- [Basic Usage](https://github.com/mutablepvp/sdk/tree/main/examples/basic-usage.ts)
- [Unity Integration](https://github.com/mutablepvp/sdk/tree/main/examples/unity-usage.js)
- [Godot Integration](https://github.com/mutablepvp/sdk/tree/main/examples/godot-usage.js)


## Troubleshooting

### Common Issues

#### SDK Not Initializing

```javascript
// Make sure to await initialization
try {
  await sdk.initialize({
    id: 'your-game-id',
    name: 'Your Game Name',
    version: '1.0.0'
  });
} catch (error) {
  console.error('SDK initialization failed:', error);
}
```

#### Authentication Failures

- Check that your API key is correct
- Ensure you're using the correct environment ('development', 'staging', or 'production')
- Verify network connectivity


#### Game Engine Integration Issues

- For Unity: Ensure the Unity WebGL build is configured correctly with the appropriate memory settings
- For Godot: Make sure the Godot export settings include JavaScript communication


### Debugging

Enable debug mode for detailed logging:

```javascript
const sdk = new MutableSDK({
  apiKey: 'YOUR_API_KEY',
  debug: true
});
```

## Support

### Documentation

Full documentation is available at [docs.mutable.io](https://docs.mutable.io)

### Community

- [Discord Community](https://discord.gg/mutable)
- [Forum](https://forum.mutable.io)


### Contact

- Email: [support@mutable.io](mailto:support@mutable.io)
- [Submit a support ticket](https://support.mutable.io)


## License

This SDK is licensed under the [MIT License](LICENSE).

---

© 2023 Mutable. All rights reserved.
