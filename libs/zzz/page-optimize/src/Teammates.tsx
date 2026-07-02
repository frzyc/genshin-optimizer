import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import {
  ConditionalValuesContext,
  DocumentDisplay,
  FieldDisplayList,
  SetConditionalContext,
  TagFieldDisplay,
  type SetConditionalFunc,
  SrcDstDisplayContext,
  type SrcDstDisplayContextObj,
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
      {EXTRA_TEAMMATE_SLOTS.map((slot) => (
        <TeammateSlotColumn
          key={slot}
          slot={slot}
          teammateKey={team.teammates[slot]?.characterKey}
          mainCharacterKey={mainCharacterKey}
          onPick={() => setPickingSlot(slot)}
        />
      ))}
    </Grid>
  )
}

function TeammateSlotColumn({
  slot,
  teammateKey,
  mainCharacterKey,
  onPick,
}: {
  slot: 1 | 2
  teammateKey: CharacterKey | undefined
  mainCharacterKey: CharacterKey
  onPick: () => void
}) {
  return (
    <Grid item xs={1}>
      <Stack gap={1} sx={{ height: '100%' }}>
        <Button
          fullWidth
          color={
            (teammateKey && getCharStat(teammateKey).attribute) || undefined
          }
          onClick={onPick}
        >
          {(teammateKey && <CharacterName characterKey={teammateKey} />) ||
            `Add ${slot === 1 ? 'First' : 'Second'} Teammate`}
        </Button>
        {teammateKey && (
          <>
            <TeammateProfileCard teammateKey={teammateKey} />
            <TeammateBuffs
              teammateKey={teammateKey}
              mainCharacterKey={mainCharacterKey}
            />
          </>
        )}
      </Stack>
    </Grid>
  )
}

function TeammateProfileCard({ teammateKey }: { teammateKey: CharacterKey }) {
  const profileIcons = teammateProfileIcons(teammateKey)
  return (
    <ZCard bgt="dark">
      <Grid
        container
        sx={{ display: 'flex', padding: 0.5 }}
        columns={{ xs: 2, lg: 4 }}
        spacing={0.5}
      >
        {range(0, 2).map((iconIndex) => (
          <Grid item xs={1} key={iconIndex} height="90px">
            <TeammateIconCard>
              <ImgIcon size={5} src={profileIcons[iconIndex]} />
            </TeammateIconCard>
          </Grid>
        ))}
        <Grid item xs={1}>
          <TeammateIconCard>
            <ElementIcon
              ele={getCharStat(teammateKey)?.attribute}
              iconProps={{ sx: { width: '2.5em', height: '2.5em' } }}
            />
          </TeammateIconCard>
        </Grid>
      </Grid>
    </ZCard>
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
    () => teammateCalcTag(teammateKey, mainCharacterKey),
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
  // Filtered kit / wengine / disc documents for teammate team buffs.
  const { kitDocuments, wengineDocuments, discDisplays, listingOnlyReads } =
    useTeammateBuffDisplayData({
      teammateKey,
      mindscape,
      sets,
      wengine,
    })

  if (!hasAnyContent(kitDocuments, wengineDocuments, discDisplays, listingOnlyReads))
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
        <ListingOnlyFieldList reads={listingOnlyReads} />
      </Stack>
    </CardThemed>
  )
}

function TeammateConditionalProvider({
  teammateKey,
  children,
}: {
  teammateKey: CharacterKey
  children: ReactNode
}) {
  // Route sheet conditionals through this teammate as `src` (main unit stays `dst` via TagContext).
  const parentSetConditional = useContext(SetConditionalContext)
  const parentConditionals = useContext(ConditionalValuesContext)
  const parentSrcDstDisplay = useContext(SrcDstDisplayContext)
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
    () => mergeTeammateSrcDstDisplay(parentSrcDstDisplay, teammateKey),
    [parentSrcDstDisplay, teammateKey]
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

function ListingOnlyFieldList({ reads }: { reads: Read[] }) {
  // Fallback when a buff is in team listing but has no matching sheet field row.
  if (!reads.length) return null
  return (
    <FieldDisplayList sx={{ m: 0 }} bgt="light">
      {reads.map((read, index) => (
        <TagFieldDisplay
          key={`${read.tag.sheet}:${read.tag.name}:${index}`}
          field={tagToTagField(read.tag)}
          calcRead={read}
          showZero={false}
        />
      ))}
    </FieldDisplayList>
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

function teammateProfileIcons(charKey: CharacterKey) {
  const { specialty, faction } = allStats.char[charKey] ?? {}
  return [
    characterAsset(charKey, 'interknot'),
    specialityDefIcon(specialty),
    factionDefIcon(faction),
  ]
}

function teammateCalcTag(
  teammateKey: CharacterKey,
  mainCharacterKey: CharacterKey
) {
  // Buff reads and conditionals: teammate applies, main unit receives.
  return {
    src: teammateKey,
    dst: mainCharacterKey,
    preset: 'preset0' as const,
  }
}

function mergeTeammateSrcDstDisplay(
  parent: SrcDstDisplayContextObj,
  teammateKey: CharacterKey
): SrcDstDisplayContextObj {
  // Keep parent dst labels (main unit) for targeted conditional UI.
  return {
    srcDisplay: {
      ...parent.srcDisplay,
      [teammateKey]: <CharacterName characterKey={teammateKey} />,
    },
    dstDisplay: parent.dstDisplay,
  }
}

function hasAnyContent(...lists: ReadonlyArray<{ length: number }>) {
  return lists.some(({ length }) => length > 0)
}
