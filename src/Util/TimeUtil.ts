import { strPadLeft } from "./Util"

export const SECOND_MS = 1000
export const MINUTE_MS = 60 * SECOND_MS
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS

export function msToUnits(ms: number) {
  let milliseconds = ms % 1000
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)))
  return { hours, minutes, seconds, milliseconds }
}
export function timeString(ms: number) {
  //shows only in terms of hours/minutes. there are better calculations for days using Date functions.
  let { hours, minutes, seconds } = msToUnits(ms)
  let timeText = "Minutes"
  if (hours) timeText = "Hours"
  return `${hours ? `${hours}:` : ""}${strPadLeft(minutes, '0', 2)}:${strPadLeft(seconds, '0', 2)} ${timeText}`;
}
export function timeStringMs(ms: number) {
  //shows only in terms of hours/minutes. there are better calculations for days using Date functions.
  let { hours, minutes, seconds, milliseconds } = msToUnits(ms)
  let timeText = "Minutes"
  if (hours) timeText = "Hours"
  return `${hours ? `${hours}:` : ""}${strPadLeft(minutes, '0', 2)}:${strPadLeft(seconds, '0', 2)}.${strPadLeft(milliseconds, '0', 3)} ${timeText}`;
}
