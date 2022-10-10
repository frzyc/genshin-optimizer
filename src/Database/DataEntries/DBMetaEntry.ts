import { Gender, genderKeys } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DataEntry } from "../DataEntry";
import { IGO, IGOOD, ImportResult } from "../exim";

interface IDBMeta {
  name: string,
  lastEdit: number,
  gender: Gender,
  latestVersion: string,
}

function dbMetaInit(): IDBMeta {
  return {
    name: `Database`,
    lastEdit: 0,
    gender: "F",
    latestVersion: "1.0.0"
  }
}

export class DBMetaEntry extends DataEntry<"dbMeta", "dbMeta", IDBMeta, IDBMeta>{
  constructor(database: ArtCharDatabase) {
    super(database, "dbMeta", dbMetaInit, "dbMeta")
  }
  validate(obj: any): IDBMeta | undefined {
    if (typeof obj !== "object") return
    let { name, lastEdit, gender, latestVersion } = obj
    if (typeof name !== "string") name = `Database ${this.database.storage.getDBIndex()}`
    if (typeof lastEdit !== "number") console.log("lastEdit INVALID")
    if (typeof lastEdit !== "number") lastEdit = 0
    if (!genderKeys.includes(gender)) gender = "F"
    if (typeof latestVersion !== "string") latestVersion = "1.0.0"

    return { name, lastEdit, gender, latestVersion } as IDBMeta
  }
  importGOOD(go: IGO & IGOOD, result: ImportResult): void {
    const data = go[this.goKey as any]
    if (data) {
      // Don't copy over lastEdit or latestVersion data
      const { lastEdit, latestVersion, ...rest } = data
      this.set(rest)
    }
  }
}
