import { Close, Difference } from "@mui/icons-material"
import { Button, Skeleton, Tooltip, Typography } from "@mui/material"
import { Suspense, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { CharacterContext } from "../../../../Context/CharacterContext"
import { HitModeToggle, ReactionToggle } from "../../../../Components/HitModeEditor"
import ModalWrapper from "../../../../Components/ModalWrapper"
import { DatabaseContext } from "../../../../Database/Database"
import { DataContext } from "../../../../Context/DataContext"
import useBoolState from "../../../../ReactHooks/useBoolState"
import useTeamData from "../../../../ReactHooks/useTeamData"
import { objectMap } from "../../../../Util/Util"
import useBuildSetting from "../TabOptimize/useBuildSetting"
import BuildDisplayItem from "../TabOptimize/Components/BuildDisplayItem"

export default function CompareBuildButton({ artId, weaponId }: { artId?: string, weaponId?: string }) {
  const { t } = useTranslation("page_character")
  const [show, onShow, onHide] = useBoolState(false)

  return <>
    <ModalWrapper open={show} onClose={onHide} containerProps={{ maxWidth: "xl" }}>
      <CompareContent artId={artId} weaponId={weaponId} onHide={onHide} />
    </ModalWrapper>
    <Tooltip title={<Typography>{t`tabEquip.compare`}</Typography>} placement="top" arrow>
      <Button color="info" size="small" onClick={onShow} ><Difference /></Button>
    </Tooltip>
  </>
}
function CompareContent({ artId, weaponId, onHide }: { artId?: string, weaponId?: string, onHide: () => void }) {
  const { database } = useContext(DatabaseContext)
  const { character: { key: characterKey, equippedArtifacts } } = useContext(CharacterContext)
  const { buildSetting: { mainStatAssumptionLevel } } = useBuildSetting(characterKey)
  const { data: oldData } = useContext(DataContext)
  const build = useMemo(() => {
    const newArt = database.arts.get(artId ?? "")
    const artmap = objectMap(equippedArtifacts, (id, slot) => slot === newArt?.slotKey ? newArt : database.arts.get(id))
    return Object.values(artmap).filter(a => a)
  }, [database, equippedArtifacts, artId])
  const teamData = useTeamData(characterKey, mainStatAssumptionLevel, build, weaponId ? database.weapons.get(weaponId) : undefined)
  const dataProviderValue = useMemo(() => teamData && ({ data: teamData[characterKey]!.target, teamData, oldData }), [characterKey, teamData, oldData])
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={600} />}>
    {dataProviderValue && <DataContext.Provider value={dataProviderValue}>
      <BuildDisplayItem compareBuild={true} extraButtonsLeft={<><HitModeToggle size="small" /><ReactionToggle size="small" /></>} extraButtonsRight={<><Button size='small' color="error" onClick={onHide} ><Close /></Button></>} />
    </DataContext.Provider>}
  </Suspense>
}
