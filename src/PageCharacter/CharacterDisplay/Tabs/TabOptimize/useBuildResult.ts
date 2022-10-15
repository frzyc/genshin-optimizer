import { useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../../../../Database/Database";
import { IBuildResult } from "../../../../Database/DataManagers/BuildResult";
import { CharacterKey } from "../../../../Types/consts";

export default function useBuildResult(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  const [buildResult, setBuildResult] = useState(() => database.buildResult.get(characterKey))
  useEffect(() => setBuildResult(database.buildResult.get(characterKey)), [database, characterKey])
  useEffect(() =>
    database.buildResult.follow(characterKey, (k, r, v) => r === "update" && setBuildResult(v)),
    [characterKey, setBuildResult, database])
  const buildResultDispatch = useCallback((action: Partial<IBuildResult>) => characterKey && database.buildResult.set(characterKey, action), [characterKey, database],)

  return { buildResult, buildResultDispatch }
}
