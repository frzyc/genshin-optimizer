import { useContext, useEffect, useState } from "react";
import WeaponSheet from "../Data/Weapons/WeaponSheet";
import { DatabaseContext } from "../Database/Database";
import { ICachedWeapon } from "../Types/weapon";
import { useStablePromise } from "./usePromise";

export default function useWeapon(id: string | undefined): { weapon?: ICachedWeapon, weaponSheet?: WeaponSheet } {
  const database = useContext(DatabaseContext)
  const [weapon, set] = useState(database._getWeapon(id ?? ""))
  // TODO: Use finer grain *stable* promises
  const weaponSheet = useStablePromise(WeaponSheet.getAll)?.[weapon?.key!]

  useEffect(() => database.followWeapon(id ?? "", set), [database, id, set])
  return { weapon, weaponSheet }
}
