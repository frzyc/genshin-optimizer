import { useCallback, useContext, useEffect, useState } from "react";
import { DatabaseContext } from "../../../../Database/Database";
import { BuildSetting, BuildSettingReducerAction } from "../../../../Database/Data/BuildsettingData";
import { CharacterKey } from "../../../../Types/consts";

export default function useBuildSetting(characterKey: CharacterKey) {
  const { database } = useContext(DatabaseContext)
  const [buildSetting, setBuildSetting] = useState(() => database.buildSettings.get(characterKey))
  useEffect(() => setBuildSetting(database.buildSettings.get(characterKey)), [database, characterKey])
  useEffect(() =>
    database.buildSettings.follow(characterKey, (k, r, v) => r === "update" && setBuildSetting(v)),
    [characterKey, setBuildSetting, database])
  const buildSettingDispatch = useCallback((action: BuildSettingReducerAction) => characterKey && database.buildSettings.set(characterKey, action), [characterKey, database],)

  return { buildSetting: buildSetting as BuildSetting, buildSettingDispatch }
}
