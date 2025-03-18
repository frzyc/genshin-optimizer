export const ARTIFACT_QUERY =
  'id, created_at, setKey, slotKey, level, rarity, substats(key, value), lock, mainStatKey, character:characters(id, key)' as const
