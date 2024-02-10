import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { PersonAdd } from '@mui/icons-material'
import type { AutocompleteProps } from '@mui/material'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CardLight from '../../../Components/Card/CardLight'
import CharacterCard from '../../../Components/Character/CharacterCard'
import ColorText from '../../../Components/ColoredText'
import DocumentDisplay from '../../../Components/DocumentDisplay'
import { NodeFieldDisplay } from '../../../Components/FieldDisplay'
import type { GeneralAutocompleteOption } from '../../../Components/GeneralAutocomplete'
import { GeneralAutocomplete } from '../../../Components/GeneralAutocomplete'
import CharIconSide from '../../../Components/Image/CharIconSide'
import { InfoTooltipInline } from '../../../Components/InfoTooltip'
import type { CharacterContextObj } from '../../../Context/CharacterContext'
import { CharacterContext } from '../../../Context/CharacterContext'
import type { dataContextObj } from '../../../Context/DataContext'
import { DataContext } from '../../../Context/DataContext'
import { SillyContext } from '../../../Context/SillyContext'
import { dataSetEffects, getArtSheet } from '../../../Data/Artifacts'
import { getCharSheet } from '../../../Data/Characters'
import type CharacterSheet from '../../../Data/Characters/CharacterSheet'
import { resonanceSheets } from '../../../Data/Resonance'
import type { NodeDisplay } from '../../../Formula/uiData'
import useCharSelectionCallback from '../../../ReactHooks/useCharSelectionCallback'
import { objPathValue, range } from '../../../Util/Util'

export default function TabTeambuffs() {
  return (
    <Box display="flex" flexDirection="column" gap={1} alignItems="stretch">
      <Grid container spacing={1}>
        <Grid
          item
          xs={12}
          md={6}
          lg={3}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <TeamBuffDisplay />
          <ResonanceDisplay />
        </Grid>
        {range(0, 2).map((i) => (
          <Grid item xs={12} md={6} lg={3} key={i}>
            <TeammateDisplay index={i} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
export function TeamBuffDisplay() {
  const { data, oldData } = useContext(DataContext)
  const teamBuffs = data.getTeamBuff() as any
  const nodes: Array<[string[], NodeDisplay<number>]> = []
  Object.entries(teamBuffs.total ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty && node.value !== 0 && nodes.push([['total', key], node])
  )
  Object.entries(teamBuffs.premod ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty && node.value !== 0 && nodes.push([['premod', key], node])
  )
  Object.entries(teamBuffs.enemy ?? {}).forEach(
    ([key, node]: [key: string, node: any]) =>
      !node.isEmpty &&
      typeof node.value === 'number' &&
      node.value !== 0 &&
      nodes.push([['enemy', key], node as NodeDisplay<number>])
  )
  if (!nodes.length) return null
  return (
    <CardLight>
      <CardContent>
        <Typography>Team Buffs</Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container>
          {nodes.map(
            ([path, n]) =>
              n && (
                <Grid item xs={12} key={JSON.stringify(n.info)}>
                  <NodeFieldDisplay
                    node={n}
                    oldValue={objPathValue(oldData?.getTeamBuff(), path)?.value}
                  />
                </Grid>
              )
          )}
        </Grid>
      </CardContent>
    </CardLight>
  )
}
function ResonanceDisplay() {
  const { t } = useTranslation('page_character')
  const { data } = useContext(DataContext)
  const {
    character: { team },
  } = useContext(CharacterContext)
  const teamCount = team.reduce((a, t) => a + (t ? 1 : 0), 1)
  return (
    <>
      <CardLight>
        <CardHeader
          title={
            <span>
              {t('tabTeambuff.team_reso')}{' '}
              <strong>
                <ColorText color={teamCount >= 4 ? 'success' : 'warning'}>
                  ({teamCount}/4)
                </ColorText>
              </strong>{' '}
              <InfoTooltipInline
                title={<Typography>{t`tabTeambuff.resonance_tip`}</Typography>}
              />
            </span>
          }
          titleTypographyProps={{ variant: 'subtitle2' }}
        />
      </CardLight>
      {resonanceSheets.map((res, i) => (
        <CardLight key={i} sx={{ opacity: res.canShow(data) ? 1 : 0.5 }}>
          <CardHeader
            title={
              <span>
                {res.name}{' '}
                <InfoTooltipInline
                  title={<Typography>{res.desc}</Typography>}
                />
              </span>
            }
            action={res.icon}
            titleTypographyProps={{ variant: 'subtitle2' }}
          />
          {res.canShow(data) && <Divider />}
          {res.canShow(data) && (
            <CardContent>
              <DocumentDisplay sections={res.sections} teamBuffOnly hideDesc />
            </CardContent>
          )}
        </CardLight>
      ))}
    </>
  )
}
function TeammateDisplay({ index }: { index: number }) {
  const { teamData } = useContext(DataContext)
  const { t } = useTranslation('page_character')
  const {
    character: active,
    character: { key: activeCharacterKey },
    characterDispatch,
  } = useContext(CharacterContext)
  const teamMateKey = active.team[index]
  const team = useMemo(
    () =>
      [activeCharacterKey, ...active.team].filter((t, i) => i - 1 !== index),
    [active.team, activeCharacterKey, index]
  )
  const onClickHandler = useCharSelectionCallback()
  const setTeammate = useCallback(
    (charKey: CharacterKey | '') =>
      characterDispatch({ type: 'team', index, charKey }),
    [index, characterDispatch]
  )

  const dataBundle = teamData[teamMateKey]
  const teammateCharacterContext: CharacterContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        character: {
          ...dataBundle.character,
          conditional: active.teamConditional[teamMateKey] ?? {},
        },
        characterSheet: dataBundle.characterSheet,
        characterDispatch: (state) => {
          if (!teamMateKey) return
          if (!('conditional' in state)) return
          const { conditional } = state
          if (!conditional) return
          characterDispatch({
            type: 'teamConditional',
            teamMateKey: teamMateKey,
            conditional,
          })
        },
      },
    [active, teamMateKey, dataBundle, characterDispatch]
  )
  const teamMateDataContext: dataContextObj | undefined = useMemo(
    () =>
      dataBundle && {
        data: dataBundle.target,
        teamData: teamData,
      },
    [dataBundle, teamData]
  )
  return (
    <CardLight sx={{ overflow: 'visible' }}>
      <TeammateAutocomplete
        characterKey={teamMateKey}
        team={team}
        setChar={setTeammate}
        label={t('teammate', { count: index + 1 })}
      />
      {teamMateKey && teammateCharacterContext && (
        <CharacterContext.Provider value={teammateCharacterContext}>
          {teamMateDataContext && (
            <DataContext.Provider value={teamMateDataContext}>
              <CharacterCard
                characterKey={teamMateKey}
                onClickHeader={onClickHandler}
                // Need to wrap these elements with the providers for them to use the correct functions.
                artifactChildren={
                  <CharacterContext.Provider value={teammateCharacterContext}>
                    <DataContext.Provider value={teamMateDataContext}>
                      <CharArtifactCondDisplay />
                    </DataContext.Provider>
                  </CharacterContext.Provider>
                }
                weaponChildren={
                  <CharacterContext.Provider value={teammateCharacterContext}>
                    <DataContext.Provider value={teamMateDataContext}>
                      <CharWeaponCondDisplay />
                    </DataContext.Provider>
                  </CharacterContext.Provider>
                }
                characterChildren={
                  <CharacterContext.Provider value={teammateCharacterContext}>
                    <DataContext.Provider value={teamMateDataContext}>
                      <CharTalentCondDisplay />
                    </DataContext.Provider>
                  </CharacterContext.Provider>
                }
                isTeammateCard
              />
            </DataContext.Provider>
          )}
        </CharacterContext.Provider>
      )}
    </CardLight>
  )
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
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}
function CharWeaponCondDisplay() {
  const {
    character: { key: charKey },
  } = useContext(CharacterContext)
  const { teamData } = useContext(DataContext)
  const weaponSheet = teamData[charKey]!.weaponSheet
  if (!weaponSheet.document) return null
  return <DocumentDisplay sections={weaponSheet.document} teamBuffOnly={true} />
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
  return <DocumentDisplay sections={sections} teamBuffOnly={true} />
}

function TeammateAutocomplete({
  characterKey,
  team,
  label,
  setChar,
  autoCompleteProps = {},
}: {
  characterKey: CharacterKey | ''
  team: Array<CharacterKey | ''>
  label: string
  setChar: (k: CharacterKey | '') => void
  autoCompleteProps?: Omit<
    AutocompleteProps<
      GeneralAutocompleteOption<CharacterKey | ''>,
      false,
      false,
      false
    >,
    'renderInput' | 'onChange' | 'options'
  >
}) {
  const { t } = useTranslation([
    'sillyWisher_charNames',
    'page_character',
    'sheet_gen',
    'charNames_gen',
  ])
  const database = useDatabase()
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)
  const namesCB = useCallback(
    (key: CharacterKey, silly: boolean): string =>
      key.startsWith('Traveler')
        ? `${t(
            `${
              silly ? 'sillyWisher_charNames' : 'charNames_gen'
            }:${charKeyToLocGenderedCharKey(key, gender)}`
          )} (${t(
            `sheet_gen:element.${getCharSheet(key, gender)?.elementKey}`
          )})`
        : t(`${silly ? 'sillyWisher_charNames' : 'charNames_gen'}:${key}`),
    [t, gender]
  )

  const toImg = useCallback(
    (key: CharacterKey | '') =>
      key ? <CharIconSide characterKey={key} /> : <PersonAdd />,
    []
  ) //
  const isFavorite = useCallback(
    (key: CharacterKey) => database.charMeta.get(key).favorite,
    [database]
  )
  const onDisable = useCallback(
    ({ key }: { key: CharacterKey | '' }) =>
      team.filter((t) => t && t !== characterKey).includes(key) ||
      (key.startsWith('Traveler') &&
        team.some((t) => t.startsWith('Traveler'))),
    [team, characterKey]
  )
  const values = useMemo(
    () =>
      database.chars.keys
        .map(
          (v): GeneralAutocompleteOption<CharacterKey> => ({
            key: v,
            label: namesCB(v, silly),
            favorite: isFavorite(v),
            alternateNames: [namesCB(v, false)],
          })
        )
        .sort((a, b) => {
          if (a.favorite && !b.favorite) return -1
          if (!a.favorite && b.favorite) return 1
          return a.label.localeCompare(b.label)
        }),
    [database.chars.keys, namesCB, isFavorite, silly]
  )
  return (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <GeneralAutocomplete
        size="small"
        label={label}
        options={values}
        valueKey={characterKey}
        onChange={(k) => setChar(k ?? '')}
        getOptionDisabled={onDisable}
        toImg={toImg}
        {...autoCompleteProps}
      />
    </Suspense>
  )
}
