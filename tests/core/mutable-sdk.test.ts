import { MutableSDK } from "../../src/core/mutable-sdk"

describe("MutableSDK", () => {
  let sdk: MutableSDK

  beforeEach(() => {
    sdk = new MutableSDK({
      apiKey: "test-api-key",
      environment: "development",
      debug: true,
    })
  })

  it("should create an instance with default values", () => {
    expect(sdk).toBeDefined()
    expect(sdk.isInitialized()).toBe(false)
  })

  it("should initialize with game info", async () => {
    const gameInfo = {
      id: "test-game",
      name: "Test Game",
      version: "1.0.0",
    }

    await sdk.initialize(gameInfo)

    expect(sdk.isInitialized()).toBe(true)
    expect(sdk.getGameInfo()).toEqual(gameInfo)
  })

  it("should set and get player info", () => {
    const playerInfo = {
      id: "player-123",
      name: "Test Player",
      walletAddress: "0x123456",
    }

    sdk.setPlayer(playerInfo)

    expect(sdk.getPlayer()).toEqual(playerInfo)
  })

  it("should get SDK configuration", () => {
    const config = sdk.getConfig()

    expect(config).toMatchObject({
      apiKey: "test-api-key",
      environment: "development",
      debug: true,
      apiUrl: "https://dev-api.mutable.io",
    })
  })
})
