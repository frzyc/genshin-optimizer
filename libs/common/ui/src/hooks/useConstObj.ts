import { useRef } from 'react'
import { usePrev } from './usePrev'

/**
 * Will "retain" the reference to the same object,
 * as long as the serialized representation remains the same.
 * @param objInput Input to remain constant
 * @returns a state reference to the `objInput`,
 * static as long as the JSON stringlization of `objInput`
 * remains the same(even if the reference is different).
 */
export function useConstObj<T extends object | undefined>(objInput: T) {
  const ref = useRef(objInput)
  if (
    usePrev(objInput) !== objInput &&
    JSON.stringify(ref.current) !== JSON.stringify(objInput)
  )
    ref.current = objInput
  return ref.current
}
