import { MutableSDK } from "../../src/core/mutable-sdk"
import { ErrorCode, MutableSDKError } from "../../src/types"

describe("MutableSDK", () => {
  let sdk: MutableSDK

  beforeEach(() => {
    sdk = new MutableSDK({
      apiKey: "test-api-key",
      environment: "development",
      debug: true,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should create an instance with default values", () => {
    expect(sdk).toBeInstanceOf(MutableSDK)
    expect(sdk.isInitialized()).toBe(false)
  })

  it("should initialize with game info", async () => {
    const gameInfo = {
      id: "test-game",
      name: "Test Game",
      version: "1.0.0",
    }

    // Mock module initialize methods
    const authInitSpy = jest.spyOn(sdk.auth, "initialize").mockResolvedValue()
    const gameStateInitSpy = jest.spyOn(sdk.gameState, "initialize").mockResolvedValue()
    const transactionsInitSpy = jest.spyOn(sdk.transactions, "initialize").mockResolvedValue()
    const analyticsInitSpy = jest.spyOn(sdk.analytics, "initialize").mockResolvedValue()
    const unityBridgeInitSpy = jest.spyOn(sdk.unityBridge, "initialize").mockResolvedValue()
    const trackEventSpy = jest.spyOn(sdk.analytics, "trackEvent").mockImplementation()

    await sdk.initialize(gameInfo)

    expect(sdk.isInitialized()).toBe(true)
    expect(sdk.getGameInfo()).toEqual(gameInfo)

    // Verify all modules were initialized
    expect(authInitSpy).toHaveBeenCalled()
    expect(gameStateInitSpy).toHaveBeenCalledWith(gameInfo)
    expect(transactionsInitSpy).toHaveBeenCalled()
    expect(analyticsInitSpy).toHaveBeenCalledWith(gameInfo)
    expect(unityBridgeInitSpy).toHaveBeenCalled()

    // Verify analytics event was tracked
    expect(trackEventSpy).toHaveBeenCalledWith(
      "custom",
      expect.objectContaining({
        action: "sdk_initialized",
        gameId: gameInfo.id,
        gameVersion: gameInfo.version,
      }),
    )
  })

  it("should throw error when initializing with incomplete game info", async () => {
    const incompleteGameInfo = {
      id: "",
      name: "Test Game",
      version: "1.0.0",
    }

    await expect(sdk.initialize(incompleteGameInfo)).rejects.toThrow(MutableSDKError)
    await expect(sdk.initialize(incompleteGameInfo)).rejects.toMatchObject({
      code: ErrorCode.INVALID_CONFIGURATION,
    })
  })

  it("should set and get player info", () => {
    const playerInfo = {
      id: "player-123",
      name: "Test Player",
      walletAddress: "0x123456",
    }

    // Mock module setPlayer methods
    const authSetPlayerSpy = jest.spyOn(sdk.auth, "setPlayer").mockImplementation()
    const gameStateSetPlayerSpy = jest.spyOn(sdk.gameState, "setPlayer").mockImplementation()
    const transactionsSetPlayerSpy = jest.spyOn(sdk.transactions, "setPlayer").mockImplementation()
    const analyticsSetPlayerSpy = jest.spyOn(sdk.analytics, "setPlayer").mockImplementation()
    const unityBridgeSetPlayerSpy = jest.spyOn(sdk.unityBridge, "setPlayer").mockImplementation()

    sdk.setPlayer(playerInfo)

    expect(sdk.getPlayer()).toEqual(playerInfo)

    // Verify all modules received the player info
    expect(authSetPlayerSpy).toHaveBeenCalledWith(playerInfo)
    expect(gameStateSetPlayerSpy).toHaveBeenCalledWith(playerInfo)
    expect(transactionsSetPlayerSpy).toHaveBeenCalledWith(playerInfo)
    expect(analyticsSetPlayerSpy).toHaveBeenCalledWith(playerInfo)
    expect(unityBridgeSetPlayerSpy).toHaveBeenCalledWith(playerInfo)
  })

  it("should get SDK configuration", () => {
    const config = sdk.getConfig()

    expect(config).toMatchObject({
      apiKey: "test-api-key",
      environment: "development",
      debug: true,
      apiUrl: "https://dev-api.mutable.io",
      websocketUrl: "wss://dev-ws.mutable.io",
    })
  })
})
