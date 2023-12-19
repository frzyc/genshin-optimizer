import { useCallback, useState } from 'react'

/* Hook to get a callback function for throwing
synchronous error from asynchronous code
When this callback is used somewhere within an error boundary,
it will trigger it, even if you are in an async block

```
const throwError = useGlobalError()
async function foo() { throwError(new Error()) }
```
*/
export default function useGlobalError(): (e: Error) => void {
  const [, setError] = useState()
  return useCallback((e: Error) => {
    setError(() => {
      throw e
    })
  }, [])
}
