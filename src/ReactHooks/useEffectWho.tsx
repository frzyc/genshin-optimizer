import { useEffect } from "react"

/**
 * A debug utility function. Should not be used in prod code.
 */
export function useEffectWho(who: { [key: string]: any }) {
  // eslint-disable-next-line
  for (const [key, a] of Object.entries(who)) {
    // eslint-disable-next-line
    useEffect(() => {
      console.log("useEffect:", key)
      // eslint-disable-next-line
    }, [a])
  }
}
