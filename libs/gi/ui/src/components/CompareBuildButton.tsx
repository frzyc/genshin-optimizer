import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import CloseIcon from '@mui/icons-material/Close'
import DifferenceIcon from '@mui/icons-material/Difference'
import {
  Button,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { dataContextObj } from '../context'
import { DataContext } from '../context'
import { useTeamData } from '../hooks'
import { useCharData } from '../hooks/useCharData'
import { HitModeToggle, ReactionToggle } from './HitModeEditor'
import { BuildDisplayItem } from './build/BuildDisplayItem'
export function CompareBuildButton({
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
    loadoutDatum,
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { mainStatAssumptionLevel } = useOptConfig(optConfigId)!
  const { data } = useContext(DataContext)
  const build = useMemo(() => {
    const newArt = database.arts.get(artId ?? '')
    const equippedArtifacts = database.teams.getLoadoutArtifacts(loadoutDatum)
    const artmap = objMap(equippedArtifacts, (art, slot) =>
      slot === newArt?.slotKey ? newArt : art
    )
    return Object.values(artmap).filter((a) => a)
  }, [database, loadoutDatum, artId])
  const teamData = useTeamData(
    mainStatAssumptionLevel,
    build,
    weaponId ? database.weapons.get(weaponId) : undefined
  )
  const dataProviderValue = useMemo(
    () =>
      teamData && {
        data: teamData[characterKey]!.target,
        teamData,
        compareData: data,
      },
    [characterKey, teamData, data]
  )
  if (!dataProviderValue) return null
  return <BuildDisplay dataProviderValue={dataProviderValue} onHide={onHide} />
}

function CharacterWrapper({ artId, weaponId, onHide }: WrapperProps) {
  const database = useDatabase()
  const {
    character: { key: characterKey, equippedArtifacts },
  } = useContext(CharacterContext)
  const { data: compareData } = useContext(DataContext)
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
      teamData && {
        data: teamData[characterKey]!.target,
        teamData,
        compareData,
      },
    [characterKey, teamData, compareData]
  )
  if (!dataProviderValue) return
  return <BuildDisplay dataProviderValue={dataProviderValue} onHide={onHide} />
}
function BuildDisplay({
  dataProviderValue,
  onHide,
}: {
  dataProviderValue: dataContextObj
  onHide: () => void
}) {
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { mainStatAssumptionLevel, allowLocationsState } = useOptConfig(
    optConfigId
  ) ?? { mainStatAssumptionLevel: 0, allowLocationsState: 'all' }
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
              <IconButton onClick={onHide}>
                <CloseIcon />
              </IconButton>
            }
            mainStatAssumptionLevel={mainStatAssumptionLevel}
            allowLocationsState={allowLocationsState}
          />
        </DataContext.Provider>
      )}
    </Suspense>
  )
}
