export const dbVersionKeys = ['db_ver', 'sro_db_ver'] as const
export type DbVersionKey = (typeof dbVersionKeys)[number]

export const dbIndexKeys = ['dbIndex', 'sro_dbIndex'] as const
export type DbIndexKey = (typeof dbIndexKeys)[number]

export interface DBStorage {
  keys: string[]
  entries: [key: string, value: string][]

  get(key: string): any | undefined
  set(key: string, value: any): void

  getString(key: string): string | undefined
  setString(key: string, value: string): void
  remove(key: string): void
  removeForKeys(shouldRemove: (key: string) => boolean): void

  copyFrom(other: DBStorage): void
  clear(): void
  getDBVersion(key?: DbVersionKey): number
  setDBVersion(version: number, key?: DbVersionKey): void
  getDBIndex(key?: DbIndexKey): 1 | 2 | 3 | 4
  setDBIndex(ind: 1 | 2 | 3 | 4, key?: DbIndexKey): void
}
