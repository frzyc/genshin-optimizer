import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import {
  ConditionalValuesContext,
  DocumentDisplay,
  FieldDisplayList,
  SetConditionalContext,
  TagFieldDisplay,
  type SetConditionalFunc,
  SrcDstDisplayContext,
} from '@genshin-optimizer/game-opt/sheet-ui'
import {
  characterAsset,
  factionDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
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
  tagToTagField,
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
import { useTeammateBuffDisplayData } from './useTeammateBuffDisplayData'

const EXTRA_TEAMMATE_SLOTS = [1, 2] as const

// This file does three things:
// - Pick which characters are teammates
// - Scope sheet UI + conditionals to `src=teammate` → `dst=main`
// - Render only the teammate buffs that actually affect the main unit
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
      {EXTRA_TEAMMATE_SLOTS.map((slot) => {
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
  // Pull teammate loadout. We only display buffs that would apply to the
  // currently-optimized (main) character.
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

  return (
    <TeammateConditionalProvider teammateKey={teammateKey}>
      <TagContext.Provider value={tag}>
        <TeammateBuffsContent
          teammateKey={teammateKey}
          mindscape={character?.mindscape ?? 0}
          sets={sets}
          wengine={wengine}
        />
      </TagContext.Provider>
    </TeammateConditionalProvider>
  )
}

// Renders filtered kit / wengine / disc documents for teammate team buffs.
function TeammateBuffsContent({
  teammateKey,
  mindscape,
  sets,
  wengine,
}: {
  teammateKey: CharacterKey
  mindscape: number
  sets: Partial<Record<DiscSetKey, number>>
  wengine: ReturnType<typeof useWengine>
}) {
  const { kitDocuments, wengineDocuments, discDisplays, listingOnlyReads } =
    useTeammateBuffDisplayData({
      teammateKey,
      mindscape,
      sets,
      wengine,
    })

  if (
    !kitDocuments.length &&
    !wengineDocuments.length &&
    !discDisplays.length &&
    !listingOnlyReads.length
  )
    return null

  return (
    <CardThemed bgt="dark" sx={{ flexGrow: 1 }}>
      <Stack spacing={1} sx={{ p: 1 }}>
        {kitDocuments.map((document, index) => (
          <DocumentDisplay key={index} document={document} bgt="light" />
        ))}
        {wengine && !!wengineDocuments.length && (
          <TeammateWengineSheetDisplay
            wengine={wengine}
            documents={wengineDocuments}
          />
        )}
        {discDisplays.map(({ setKey, pieces }) => (
          <TeammateDiscSheetDisplay
            key={setKey}
            setKey={setKey}
            pieces={pieces}
          />
        ))}
        {!!listingOnlyReads.length && (
          <FieldDisplayList sx={{ m: 0 }} bgt="light">
            {listingOnlyReads.map((read, index) => (
              <TagFieldDisplay
                key={`${read.tag.sheet}:${read.tag.name}:${index}`}
                field={tagToTagField(read.tag)}
                calcRead={read}
                showZero={false}
              />
            ))}
          </FieldDisplayList>
        )}
      </Stack>
    </CardThemed>
  )
}

// Route sheet conditionals through this teammate as `src` (main unit stays `dst` via TagContext).
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
