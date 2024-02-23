import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import { useDatabase, useOptConfig } from '@genshin-optimizer/gi/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DifferenceIcon from '@mui/icons-material/Difference'
import { Button, Skeleton, Tooltip, Typography } from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterContext } from '../Context/CharacterContext'
import type { dataContextObj } from '../Context/DataContext'
import { DataContext } from '../Context/DataContext'
import { TeamCharacterContext } from '../Context/TeamCharacterContext'
import BuildDisplayItem from '../PageTeam/CharacterDisplay/Tabs/TabOptimize/Components/BuildDisplayItem'
import useCharData from '../ReactHooks/useCharData'
import useTeamData from '../ReactHooks/useTeamData'
import { HitModeToggle, ReactionToggle } from './HitModeEditor'
export default function CompareBuildButton({
  artId,
  weaponId,
}: {
  artId?: string
  weaponId?: string
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onHide] = useBoolState(false)
  return (
    <>
      <ModalWrapper
        open={show}
        onClose={onHide}
        containerProps={{ maxWidth: 'xl' }}
      >
        <CompareContentWrapper
          artId={artId}
          weaponId={weaponId}
          onHide={onHide}
        />
      </ModalWrapper>
      <Tooltip
        title={<Typography>{t`tabEquip.compare`}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onShow}>
          <DifferenceIcon />
        </Button>
      </Tooltip>
    </>
  )
}
type WrapperProps = {
  artId?: string
  weaponId?: string
  onHide: () => void
}
function CompareContentWrapper(props: WrapperProps) {
  const teamCharacterContextObj = useContext(TeamCharacterContext)
  const characterContextObj = useContext(CharacterContext)
  if (teamCharacterContextObj?.teamChar?.optConfigId)
    return <TeamWrapper {...props} />
  else if (characterContextObj?.character)
    return <CharacterWrapper {...props} />
  return null
}
function TeamWrapper({ artId, weaponId, onHide }: WrapperProps) {
  const database = useDatabase()
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    teamCharId,
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { mainStatAssumptionLevel } = useOptConfig(optConfigId)
  const { data: oldData } = useContext(DataContext)
  const build = useMemo(() => {
    const newArt = database.arts.get(artId ?? '')
    const equippedArtifacts = database.teamChars.getLoadoutArtifacts(teamCharId)
    const artmap = objMap(equippedArtifacts, (art, slot) =>
      slot === newArt?.slotKey ? newArt : art
    )
    return Object.values(artmap).filter((a) => a)
  }, [database, teamCharId, artId])
  const teamData = useTeamData(
    mainStatAssumptionLevel,
    build,
    weaponId ? database.weapons.get(weaponId) : undefined
  )
  const dataProviderValue = useMemo(
    () =>
      teamData && { data: teamData[characterKey]!.target, teamData, oldData },
    [characterKey, teamData, oldData]
  )
  return <BuildDisplay dataProviderValue={dataProviderValue} onHide={onHide} />
}

function CharacterWrapper({ artId, weaponId, onHide }: WrapperProps) {
  const database = useDatabase()
  const {
    character: { key: characterKey, equippedArtifacts },
  } = useContext(CharacterContext)
  const { data: oldData } = useContext(DataContext)
  const build = useMemo(() => {
    const newArt = database.arts.get(artId ?? '')
    const artmap = objMap(equippedArtifacts, (id, slot) =>
      slot === newArt?.slotKey ? newArt : database.arts.get(id)
    )
    return Object.values(artmap).filter((a) => a)
  }, [database, equippedArtifacts, artId])
  const teamData = useCharData(
    characterKey,
    0,
    build,
    weaponId ? database.weapons.get(weaponId) : undefined
  )
  const dataProviderValue = useMemo(
    () =>
      teamData && { data: teamData[characterKey]!.target, teamData, oldData },
    [characterKey, teamData, oldData]
  )
  return <BuildDisplay dataProviderValue={dataProviderValue} onHide={onHide} />
}
function BuildDisplay({
  dataProviderValue,
  onHide,
}: {
  dataProviderValue: dataContextObj
  onHide: () => void
}) {
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={600} />}
    >
      {dataProviderValue && (
        <DataContext.Provider value={dataProviderValue}>
          <BuildDisplayItem
            extraButtonsLeft={
              <>
                <HitModeToggle size="small" />
                <ReactionToggle size="small" />
              </>
            }
            extraButtonsRight={
              <Button size="small" color="error" onClick={onHide}>
                <CloseIcon />
              </Button>
            }
          />
        </DataContext.Provider>
      )}
    </Suspense>
  )
}
