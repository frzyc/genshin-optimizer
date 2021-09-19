import { useEffect, useState } from "react";

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