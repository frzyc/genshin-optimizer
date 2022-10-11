import { createContext } from "react";
import { deepFreeze } from "../Util/Util";
import { TriggerString } from "./DataManager";

interface IUserData {
  id: string,
  username: string,
  email: string,
  accessToken: string,
  rememberMe: boolean,
}

export function userDataInit(): IUserData {
  return {
    id: "",
    username: "",
    email: "",
    accessToken: "",
    rememberMe: false,
  }
}
const userDataLSKey = "userData" as const
export class UserData {
  listeners: ((reason: TriggerString, object: IUserData) => void)[] = []
  data: IUserData
  constructor() {
    const dataStr = localStorage.getItem(userDataLSKey)
    this.data = dataStr ? JSON.parse(dataStr) : userDataInit()
    console.log(this.data)
    this.set(this.data)
  }
  validate(obj: any): IUserData | undefined {
    if (typeof obj !== "object") return
    let { id, username, email, accessToken, rememberMe } = obj
    if (typeof id !== "string" || typeof username !== "string" || typeof email !== "string" || typeof accessToken !== "string") {
      id = ""
      email = ""
      username = ""
      accessToken = ""
    }
    if (typeof rememberMe !== "boolean") rememberMe = false
    return { id, username, email, accessToken } as IUserData
  }
  set(data: Partial<IUserData>) {
    const newData = { ...this.data, ...data }
    const validated = this.validate(newData)
    console.log("validated", validated)
    if (!validated) return
    deepFreeze(validated)
    this.data = validated
    localStorage.setItem(userDataLSKey, JSON.stringify(this.data))
    this.trigger("update", this.data)
  }
  follow(callback: (reason: TriggerString, object: IUserData) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }
  trigger(reason: TriggerString, object?: any) {
    this.listeners.forEach(cb => cb(reason, object))
  }
}

export type UserDataContextObj = {
  setUserData: (data: Partial<IUserData>) => void
  userData: IUserData
}
export const UserDataContext = createContext({} as UserDataContextObj)
