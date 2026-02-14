import { DBLocalStorage } from './DBLocalStorage'
import type { StorageType } from './DBStorage'
import { SandboxStorage } from './SandboxStorage'

/**
 * Create a mock localStorage for testing
 */
export function createMockStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage
}

/**
 * Create a DBLocalStorage for testing with isolated storage
 */
export function createTestDBStorage(storageType: StorageType = 'go') {
  const mockStorage = createMockStorage()
  return new DBLocalStorage(mockStorage, storageType)
}

/**
 * Create a SandboxStorage for testing (in-memory only)
 */
export function createTestSandboxStorage() {
  return new SandboxStorage()
}
