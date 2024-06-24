'use client'
import { useEffect, useState } from 'react'

/**
 * Will "retain" the reference to the same object,
 * as long as the serialized representation remains the same.
 * @param objInput Input to remain constant
 * @returns a state reference to the `objInput`,
 * static as long as the JSON stringlization of `objInput`
 * remains the same(even if the reference is different).
 */
export function useConstObj<T extends object | undefined>(objInput: T) {
  const [obj, setobj] = useState(objInput)
  const objStr = JSON.stringify(obj)
  useEffect(() => {
    if (JSON.stringify(objInput) !== objStr) setobj(objInput)
  }, [objInput, objStr])
  return obj
}
