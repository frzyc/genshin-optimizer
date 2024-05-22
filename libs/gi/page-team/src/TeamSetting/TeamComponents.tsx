import { CardThemed, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { artifactAsset } from '@genshin-optimizer/gi/assets'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import type {
  CharacterContextObj,
  TeamCharacterContextObj,
} from '@genshin-optimizer/gi/db-ui'
import {
  CharacterContext,
  TeamCharacterContext,
  useBuildTc,
  useCharacter,
  useDatabase,
  useTeam,
  useTeamChar,
} from '@genshin-optimizer/gi/db-ui'
import type { CharacterSheet } from '@genshin-optimizer/gi/sheets'
import { dataSetEffects, getArtSheet } from '@genshin-optimizer/gi/sheets'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import {
  ArtifactSetName,
  CharacterCardEquipmentRow,
  CharacterCardHeader,
  CharacterCardHeaderContent,
  DataContext,
  DocumentDisplay,
  FieldDisplayList,
  NodeFieldDisplay,
  WeaponFullCardObj,
} from '@genshin-optimizer/gi/ui'
import { input } from '@genshin-optimizer/gi/wr'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CardActionArea,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'

export function TeamBuffDisplay() {
  const { data } = useContext(DataContext)
  const nodes = useMemo(() => {
    const teamBuffs = data.getTeamBuff()
    const nodes = [
      ...Object.values(teamBuffs.total ?? {}),
      ...Object.values(teamBuffs.premod ?? {}),
      ...Object.values(teamBuffs.enemy ?? {}),
    ] as const

    return nodes.filter((node) => !node.isEmpty && node.value !== 0)
  }, [data])

  if (!nodes.length) return null
  return (
    <Accordion
      sx={(theme) => ({
        bgcolor: theme.palette.contentLight.main,
        borderRadius: '4px',
        '&:before': {
          display: 'none',
        },
      })}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>Received Team Buffs</Typography>
          <SqBadge sx={{ ml: 1 }} color={nodes.length ? 'success' : 'info'}>
            {nodes.length}
          </SqBadge>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Divider />
        <FieldDisplayList bgt="light">
          {nodes.map((n) => (
            <NodeFieldDisplay key={JSON.stringify(n.info)} calcRes={n} />
          ))}
        </FieldDisplayList>
      </AccordionDetails>
    </Accordion>
  )
}
export function TeammateDisplay({
  teamCharId,
  dataContextValue,
  teamId,
}: {
  teamCharId: string
  teamId: string
  dataContextValue: dataContextObj
}) {
  const database = useDatabase()
  const { teamData } = dataContextValue
  const team = useTeam(teamId)!
  const teamChar = useTeamChar(teamCharId)!
  const loadoutDatum = database.teams.getLoadoutDatum(teamId, teamCharId)!
  const teamMateKey = teamChar?.key
  const character = useCharacter(teamMateKey)!
  const { key: characterKey } = character

  const dataBundle = teamData[teamMateKey]
  const teammateCharacterContext: TeamCharacterContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        teamId,
        team,
        teamCharId,
        teamChar,
        loadoutDatum,
      },
    [teamId, team, teamCharId, teamChar, dataBundle, loadoutDatum]
  )
  const characterContext: CharacterContextObj | undefined = useMemo(
    () => ({
      character,
    }),
    [character]
  )
  const teamMateDataContext: dataContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        data: dataBundle.target,
        teamData: teamData,
      },
    [dataBundle, teamData]
  )
  if (
    !teamMateKey ||
    !teammateCharacterContext ||
    !teamMateDataContext ||
    !characterContext
  )
    return null

  const isTCCharOverride =
    loadoutDatum.buildType === 'tc' &&
    !!database.buildTcs.get(loadoutDatum.buildTcId)?.character
  return (
    <TeamCharacterContext.Provider value={teammateCharacterContext}>
      <DataContext.Provider value={teamMateDataContext}>
        <CharacterContext.Provider value={characterContext}>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={600} />
            }
          >
            <CardThemed bgt="light">
              <CardActionArea
                component={Link}
                to={`${characterKey}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <CharacterCardHeader characterKey={characterKey}>
                  <CharacterCardHeaderContent
                    characterKey={characterKey}
                    tcOverride={isTCCharOverride}
                  />
                </CharacterCardHeader>
              </CardActionArea>
            </CardThemed>

            <EquipmentRow loadoutDatum={loadoutDatum} />
            <CharacterCardWeaponFull loadoutDatum={loadoutDatum} />
            <TeamBuffDisplay />
            <CharArtifactCondDisplay />
            <CharWeaponCondDisplay />
            <CharTalentCondDisplay />
          </Suspense>
        </CharacterContext.Provider>
      </DataContext.Provider>
    </TeamCharacterContext.Provider>
  )
}
function EquipmentRow({
  loadoutDatum,
  loadoutDatum: { buildType },
}: {
  loadoutDatum: LoadoutDatum
}) {
  if (buildType !== 'tc') return <CharacterCardEquipmentRow hideWeapon />
  else return <TcEquipmentRow loadoutDatum={loadoutDatum} />
}
function TcEquipmentRow({
  loadoutDatum: { buildTcId },
}: {
  loadoutDatum: LoadoutDatum
}) {
  const {
    artifact: { sets },
  } = useBuildTc(buildTcId)!
  return (
    <CardThemed bgt="light" sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* TODO: Translation */}
        <SqBadge color="info">TC Build</SqBadge>
        {Object.entries(sets).map(([setKey, number]) => (
          <Box
            key={setKey}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <ImgIcon size={2} src={artifactAsset(setKey, 'flower')} />
            <span>
              <ArtifactSetName setKey={setKey} />
            </span>
            <SqBadge>x{number}</SqBadge>
          </Box>
        ))}
      </Box>
    </CardThemed>
  )
}
function CharacterCardWeaponFull({
  loadoutDatum,
}: {
  loadoutDatum: LoadoutDatum
}) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const weapon = useMemo(() => {
    const weaponId = data.get(input.weapon.id).value?.toString() ?? 'invalid'

    if (weaponId && weaponId !== 'invalid')
      return database.weapons.get(weaponId)
    else return database.teams.getLoadoutWeapon(loadoutDatum) // TC build
  }, [database, data, loadoutDatum])
  if (!weapon) return null
  return <WeaponFullCardObj weapon={weapon} bgt="light" />
}
function CharArtifactCondDisplay() {
  const { data } = useContext(DataContext)
  const sections = useMemo(
    () =>
      Object.entries(dataSetEffects(data)).flatMap(([setKey, setNums]) =>
        setNums.flatMap((sn) => getArtSheet(setKey).setEffectDocument(sn) ?? [])
      ),
    [data]
  )
  if (!sections) return null
  return <DocumentDisplay bgt="light" sections={sections} teamBuffOnly={true} />
}
function CharWeaponCondDisplay() {
  const {
    character: { key: charKey },
  } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet
  if (!weaponSheet.document) return null
  return (
    <DocumentDisplay
      bgt="light"
      sections={weaponSheet.document}
      teamBuffOnly={true}
    />
  )
}
function CharTalentCondDisplay() {
  const {
    character: { key: charKey },
  } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const characterSheet = teamData[charKey]!.characterSheet as CharacterSheet
  const sections = Object.values(characterSheet.talent).flatMap(
    (sts) => sts.sections
  )
  if (!sections) return null
  return <DocumentDisplay bgt="light" sections={sections} teamBuffOnly={true} />
}
