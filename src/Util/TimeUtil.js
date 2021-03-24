import { strPadLeft } from "./Util"

export function msToUnits(ms) {
  let milliseconds = ms % 1000
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)))
  return { hours, minutes, seconds, milliseconds }
}
export function timeString(ms) {
  //shows only in terms of hours/minutes. there are better calculations for days using Date functions.
  let { hours, minutes, seconds } = msToUnits(ms, "hours")
  let timeText = "Minutes"
  if (hours) timeText = "Hours"
  return `${hours ? `${hours}:` : ""}${strPadLeft(minutes, '0', 2)}:${strPadLeft(seconds, '0', 2)} ${timeText}`;
}
export function timeStringMs(ms) {
  //shows only in terms of hours/minutes. there are better calculations for days using Date functions.
  let { hours, minutes, seconds, milliseconds } = msToUnits(ms, "hours")
  let timeText = "Minutes"
  if (hours) timeText = "Hours"
  return `${hours ? `${hours}:` : ""}${strPadLeft(minutes, '0', 2)}:${strPadLeft(seconds, '0', 2)}.${strPadLeft(milliseconds, '0', 3)} ${timeText}`;
}
