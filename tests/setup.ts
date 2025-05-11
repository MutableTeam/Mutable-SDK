// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

// Set up global mocks
global.localStorage = new LocalStorageMock()

// Mock fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: {
      get: () => "application/json",
    },
  }),
)

// Mock WebSocket
class WebSocketMock {
  url: string
  onopen: ((this: WebSocket, ev: Event) => any) | null = null
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null
  onerror: ((this: WebSocket, ev: Event) => any) | null = null
  readyState: number = WebSocket.CONNECTING

  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      this.readyState = WebSocketMock.OPEN
      if (this.onopen) {
        this.onopen(new Event("open"))
      }
    }, 0)
  }

  send(data: string) {
    // Mock implementation
  }

  close() {
    this.readyState = WebSocketMock.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent("close"))
    }
  }
}

global.WebSocket = WebSocketMock as any

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
