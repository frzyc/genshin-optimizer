import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  ConditionalValuesContext,
  DocumentDisplay,
  SetConditionalContext,
  type SetConditionalFunc,
  SrcDstDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  characterAsset,
  factionDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import {
  useCharacter,
  useCharacterContext,
  useDatabaseContext,
  useDiscSets,
  useDiscs,
  useTeam,
  useWengine,
} from '@genshin-optimizer/zzz/db-ui'
import {
  TeammateDiscSheetDisplay,
  TeammateWengineSheetDisplay,
  charSheets,
  filterTeammateDocuments,
  teammateDiscHasMainUnitBuffs,
  teammateWengineHasMainUnitBuffs,
} from '@genshin-optimizer/zzz/formula-ui'
import { allStats, getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import {
  CharacterName,
  CharacterSingleSelectionModal,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import { Box, Button, Grid, Stack } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'

const TEAMMATE_SLOTS = [1, 2] as const

const TEAMMATE_SHEET_KEYS = [
  ...allSkillKeys,
  'core',
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
] as const

export function TeammatesSection() {
  const { database } = useDatabaseContext()
  const { key: mainCharacterKey } = useCharacterContext()!
  const team = useTeam(mainCharacterKey)!
  const [pickingSlot, setPickingSlot] = useState<1 | 2>()
  const setTeammate = useCallback(
    (teammateKey: CharacterKey | null, slot: 1 | 2) => {
      database.teams.setTeammate(mainCharacterKey, teammateKey, slot - 1)
    },
    [mainCharacterKey, database.teams]
  )
  const icons = useCallback(
    (charKey: CharacterKey | undefined) =>
      charKey
        ? [
            characterAsset(charKey, 'interknot'),
            specialityDefIcon(allStats.char[charKey]?.specialty),
            factionDefIcon(allStats.char[charKey]?.faction),
          ]
        : [],
    []
  )

  return (
    <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={pickingSlot !== undefined}
          onHide={() => setPickingSlot(undefined)}
          onSelect={(ck) => {
            if (pickingSlot) {
              if (ck) database.chars.getOrCreate(ck)
              setTeammate(ck, pickingSlot)
            }
            setPickingSlot(undefined)
          }}
          showNone
        />
      </Suspense>
      {TEAMMATE_SLOTS.map((slot) => {
        const teammateKey = team.teammates[slot]?.characterKey
        return (
          <Grid item xs={1} key={slot}>
            <Stack gap={1} sx={{ height: '100%' }}>
              <Button
                fullWidth
                color={
                  (teammateKey && getCharStat(teammateKey).attribute) ||
                  undefined
                }
                onClick={() => setPickingSlot(slot)}
              >
                {(teammateKey && (
                  <CharacterName characterKey={teammateKey} />
                )) ||
                  `Add ${slot === 1 ? 'First' : 'Second'} Teammate`}
              </Button>
              {teammateKey && (
                <>
                  <ZCard bgt="dark">
                    <Grid
                      container
                      sx={{ display: 'flex', padding: 0.5 }}
                      columns={{ xs: 2, lg: 4 }}
                      spacing={0.5}
                    >
                      {range(0, 2).map((icon) => (
                        <Grid item xs={1} key={icon} height="90px">
                          <TeammateIconCard>
                            <ImgIcon
                              size={5}
                              src={icons(teammateKey)?.[icon]}
                            />
                          </TeammateIconCard>
                        </Grid>
                      ))}
                      <Grid item xs={1}>
                        <TeammateIconCard>
                          <ElementIcon
                            ele={getCharStat(teammateKey)?.attribute}
                            iconProps={{
                              sx: { width: '2.5em', height: '2.5em' },
                            }}
                          />
                        </TeammateIconCard>
                      </Grid>
                    </Grid>
                  </ZCard>
                  <TeammateBuffs
                    teammateKey={teammateKey}
                    mainCharacterKey={mainCharacterKey}
                  />
                </>
              )}
            </Stack>
          </Grid>
        )
      })}
    </Grid>
  )
}

function TeammateBuffs({
  teammateKey,
  mainCharacterKey,
}: {
  teammateKey: CharacterKey
  mainCharacterKey: CharacterKey
}) {
  const character = useCharacter(teammateKey)
  const discs = useDiscs(character?.equippedDiscs)
  const sets = useDiscSets(discs)
  const wengine = useWengine(character?.equippedWengine)
  const tag = useMemo(
    () => ({
      src: teammateKey,
      dst: mainCharacterKey,
      preset: 'preset0' as const,
    }),
    [teammateKey, mainCharacterKey]
  )
  const documents = useMemo(
    () =>
      collectTeammateDocuments(
        charSheets[teammateKey],
        character?.mindscape ?? 0
      ),
    [teammateKey, character?.mindscape]
  )
  const hasEquipmentBuffs = useMemo(() => {
    const hasWengine = !!wengine && teammateWengineHasMainUnitBuffs(wengine.key)
    const hasDisc = Object.entries(sets).some(([setKey, count]) =>
      teammateDiscHasMainUnitBuffs(setKey as DiscSetKey, count)
    )
    return hasWengine || hasDisc
  }, [wengine, sets])

  if (!documents.length && !hasEquipmentBuffs) return null

  return (
    <CardThemed bgt="dark" sx={{ flexGrow: 1 }}>
      <Stack spacing={1} sx={{ p: 1 }}>
        <TeammateConditionalProvider teammateKey={teammateKey}>
          <TagContext.Provider value={tag}>
            {hasEquipmentBuffs && (
              <TeammateEquippedConditionals sets={sets} wengine={wengine} />
            )}
            {documents.map((document, index) => (
              <DocumentDisplay key={index} document={document} bgt="light" />
            ))}
          </TagContext.Provider>
        </TeammateConditionalProvider>
      </Stack>
    </CardThemed>
  )
}

function collectTeammateDocuments(
  sheet: (typeof charSheets)[CharacterKey],
  mindscape: number
): Document[] {
  return filterTeammateDocuments(
    TEAMMATE_SHEET_KEYS.flatMap((key) => {
      const section = sheet[key] as UISheetElement | undefined
      return section?.documents ?? []
    }),
    mindscape
  )
}

function TeammateConditionalProvider({
  teammateKey,
  children,
}: {
  teammateKey: CharacterKey
  children: ReactNode
}) {
  const parentSetConditional = useContext(SetConditionalContext)
  const parentConditionals = useContext(ConditionalValuesContext)
  const setConditional = useCallback<SetConditionalFunc>(
    (sheet, condKey, _src, dst, condValue) =>
      parentSetConditional?.(sheet, condKey, teammateKey, dst, condValue),
    [parentSetConditional, teammateKey]
  )
  const teammateConditionals = useMemo(
    () => parentConditionals.filter(({ src }) => src === teammateKey),
    [parentConditionals, teammateKey]
  )
  const srcDstDisplay = useMemo(
    () => ({
      srcDisplay: {
        [teammateKey]: <CharacterName characterKey={teammateKey} />,
      },
      dstDisplay: {},
    }),
    [teammateKey]
  )

  return (
    <SetConditionalContext.Provider value={setConditional}>
      <ConditionalValuesContext.Provider value={teammateConditionals}>
        <SrcDstDisplayContext.Provider value={srcDstDisplay}>
          {children}
        </SrcDstDisplayContext.Provider>
      </ConditionalValuesContext.Provider>
    </SetConditionalContext.Provider>
  )
}

function TeammateEquippedConditionals({
  sets,
  wengine,
}: {
  sets: Partial<Record<DiscSetKey, number>>
  wengine: ReturnType<typeof useWengine>
}) {
  const discCards = Object.entries(sets).flatMap(([setKey, count]) => {
    if (!teammateDiscHasMainUnitBuffs(setKey as DiscSetKey, count ?? 0))
      return []
    return (
      <TeammateDiscSheetDisplay
        key={setKey}
        setKey={setKey as DiscSetKey}
        fade2={(count ?? 0) < 2}
        fade4={(count ?? 0) < 4}
      />
    )
  })

  const wengineCard =
    wengine && teammateWengineHasMainUnitBuffs(wengine.key) ? (
      <TeammateWengineSheetDisplay wengine={wengine} />
    ) : null

  return (
    <Stack spacing={1}>
      {wengineCard}
      {discCards}
    </Stack>
  )
}

function TeammateIconCard({ children }: { children?: React.ReactNode }) {
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          padding: 0.5,
          display: 'flex',
          justifyContent: 'center',
          height: '100%',
          alignItems: 'center',
        }}
      >
        {children}
      </Box>
    </CardThemed>
  )
}
