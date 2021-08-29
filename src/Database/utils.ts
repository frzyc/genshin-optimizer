import { DBStorage } from "./DBStorage"

export function getDBVersion(storage: DBStorage) {
  return parseInt(storage.getString('db_ver') ?? '0')
}
export function setDBVersion(storage: DBStorage, version: number) {
  storage.setString('db_ver', version.toString())
}
