// Vue test setup - Vitest with jsdom environment
import { vi } from 'vitest'

// Mock fetch for data loading tests
global.fetch = vi.fn()

// Mock window.location for URL query tests
delete global.window.location
global.window.location = { search: '' }
