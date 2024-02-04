import type { DBStorage } from './DBStorage'

export class Database {
  storage: DBStorage
  constructor(storage: DBStorage) {
    this.storage = storage
  }
}
