import { useEffect, useState } from "react";
/**
 *
 * @param promiseFunc
 * @param dependencies - Reloads the promise when any of the dependencies are changed. (Using useEffect dependency)
 * @param useOld - When the promises are updated, then there is a period of time before the new promise return. useOld uses the previous value without a undefined gap.
 * @returns
 */
export default function usePromise<T>(promiseFunc: () => Promise<T> | undefined, dependencies: any[], useOld = true): T | undefined {
  const [res, setRes] = useState<[T] | undefined>(undefined);
  useEffect(() => {
    let pending = true
    //encapsulate `res` in an array `[res]`, because res can sometimes be a function, that can interfere with the `useState` api.
    promiseFunc()?.then(res => pending && setRes([res]), console.error) ?? setRes(undefined)
    return () => {
      pending = false
      !useOld && setRes(undefined)
    }
  }, dependencies)// eslint-disable-line react-hooks/exhaustive-deps
  return res?.[0]
}
