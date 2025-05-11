// Mock Mutable SDK for testing
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) :
  typeof define === "function" && define.amd ? define(["exports"], factory) :
  (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.MutableSDK = {}));
})(this, (function(exports) {
  "use strict";

  // MutableSDK class
  class MutableSDK {
    constructor(config) {
      this.config = config;
      console.log("MutableSDK initialized with config:", config);
      
      // Initialize modules
      this.auth = {
        authenticateAsGuest: async (name) => {
          console.log("Authenticating as guest:", name);
          return { id: "guest-" + Date.now(), name: name || "Guest" };
        }
      };
      
      this.gameState = {
        createSession: async () => {
          console.log("Creating game session");
          return "session-" + Date.now();
        },
        updateGameState: async (state) => {
          console.log("Updating game state:", state);
          return true;
        },
        endSession: async (sessionId) => {
          console.log("Ending session:", sessionId);
          return true;
        }
      };
      
      this.transactions = {
        getBalance: async (currency) => {
          console.log("Getting balance for currency:", currency);
          return 1000;
        },
        awardReward: async (amount, currency) => {
          console.log("Awarding reward:", amount, currency);
          return true;
        }
      };
    }
    
    async initialize(gameInfo) {
      console.log("Initializing SDK with game info:", gameInfo);
      return true;
    }
    
    setPlayer(player) {
      console.log("Setting player:", player);
      this.player = player;
    }
    
    getPlayer() {
      return this.player;
    }
  }
  
  // Export the class
  exports.MutableSDK = MutableSDK;
  
  Object.defineProperty(exports, "__esModule", { value: true });
}));