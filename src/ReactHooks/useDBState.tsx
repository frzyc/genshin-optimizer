import { useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../Database/Database";

export default function useDBState<O extends object>(key: string, init: () => O): [O, (value: Partial<O>) => void] {
  const database = useContext(DatabaseContext)
  const [state, setState] = useState(database._getState<O>(key, init))
  useEffect(() => setState(database._getState(key, init)), [database, key, init])
  useEffect(() =>
    key ? database.followState(key, setState) : undefined,
    [key, setState, database])
  const updateState = useCallback(
    value => database.updateState(key, value),
    [database, key],
  )

  return [state, updateState]
}
