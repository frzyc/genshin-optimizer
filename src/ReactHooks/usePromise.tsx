import { useEffect, useMemo, useState } from "react";

export default function usePromise<T>(promise: Promise<T> | undefined, dependencies: any[]): T | undefined {
  const [res, setRes] = useState<T | undefined>(undefined);
  useEffect(() => {
    let pending = true
    promise?.then(res => pending && setRes(() => res), console.error) ?? setRes(undefined)
    return () => {
      pending = false
      setRes(undefined)
    }
  }, dependencies)// eslint-disable-line react-hooks/exhaustive-deps
  return res
}
export function useStablePromise<T>(promise: Promise<T> | undefined): T | undefined {
  const [{ value, oldPromise }, setNewValue] = useState<{ value?: T, oldPromise?: Promise<T> }>({})

  useEffect(() => {
    let pending = true
    if (promise !== oldPromise) {
      promise?.then(value => pending && setNewValue({ value, oldPromise: promise }))
      return () => {
        pending = false
      }
    }
  }, [promise, oldPromise, setNewValue])

  return useMemo(() =>
    promise === oldPromise ? value : undefined,
    [promise, oldPromise, value])
}
