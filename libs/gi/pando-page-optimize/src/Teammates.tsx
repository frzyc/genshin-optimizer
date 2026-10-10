import { SolidToggleButtonGroup } from '@genshin-optimizer/common/ui'
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import type { SetConditionalFunc } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  ConditionalValuesContext,
  SetConditionalContext,
  SrcDstDisplayContext,
  type SrcDstDisplayContextObj,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { PandoMember } from '@genshin-optimizer/gi/db'
import {
  pandoMembers,
  pandoTeammateMembers,
  pandoTeamSrcKeys,
} from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  useDatabase,
  useDBMeta,
  useRequiredPandoTeam,
} from '@genshin-optimizer/gi/db-ui'
import { isMember, resolveActiveMember } from '@genshin-optimizer/gi/formula'
import { TeammateBuffSheetDisplay } from '@genshin-optimizer/gi/formula-ui'
import {
  CharacterName,
  CharacterSingleSelectionModal,
} from '@genshin-optimizer/gi/ui'
import { Button, Grid, Stack, ToggleButton, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function TeammatesSection() {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { character } = useContext(CharacterContext)
  const pandoTeam = useRequiredPandoTeam()
  const [pickingSlot, setPickingSlot] = useState<0 | 1 | 2>()

  return (
    <Stack gap={1}>
      <OnFieldSelector />
      <Grid container spacing={1} columns={{ xs: 1, md: 3 }}>
        <Suspense fallback={false}>
          <CharacterSingleSelectionModal
            show={pickingSlot !== undefined}
            onHide={() => setPickingSlot(undefined)}
            onSelect={(ck) => {
              if (pickingSlot === undefined) return
              database.chars.getWithInitWeapon(ck)
              database.pandoTeams.setTeammate(character.key, pickingSlot, ck)
              setPickingSlot(undefined)
            }}
          />
        </Suspense>
        {pandoTeammateMembers.map((member, slot) => (
          <TeammateSlotColumn
            key={member}
            member={member}
            teammateKey={pandoTeam.teammates[slot] ?? ''}
            onPick={() => setPickingSlot(slot as 0 | 1 | 2)}
            onClear={() =>
              database.pandoTeams.setTeammate(
                character.key,
                slot as 0 | 1 | 2,
                ''
              )
            }
            addLabel={t('addTeammate', { n: slot + 1 })}
          />
        ))}
      </Grid>
    </Stack>
  )
}

function OnFieldSelector() {
  const { t } = useTranslation('page_optimize')
  const database = useDatabase()
  const { character } = useContext(CharacterContext)
  const pandoTeam = useRequiredPandoTeam()
  const { gender } = useDBMeta()
  const activeMember = resolveActiveMember(
    pandoTeamSrcKeys(pandoTeam.teammates).filter(isMember),
    pandoTeam.activeMember
  )
  return (
    <Stack gap={0.5}>
      <Typography variant="subtitle2">{t('onField')}</Typography>
      <SolidToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={activeMember}
        onChange={(_, value: PandoMember | null) => {
          if (!value) return
          database.pandoTeams.setActiveMember(character.key, value)
        }}
      >
        {pandoMembers.map((member) => {
          const teammateKey =
            member === '0'
              ? character.key
              : (pandoTeam.teammates[+member - 1] ?? '')
          return (
            <ToggleButton key={member} value={member} disabled={!teammateKey}>
              {teammateKey ? (
                <CharacterName
                  characterKey={teammateKey}
                  gender={gender ?? 'F'}
                />
              ) : (
                t('teammateSlot', { n: +member })
              )}
            </ToggleButton>
          )
        })}
      </SolidToggleButtonGroup>
    </Stack>
  )
}

function TeammateSlotColumn({
  member,
  teammateKey,
  onPick,
  onClear,
  addLabel,
}: {
  member: (typeof pandoTeammateMembers)[number]
  teammateKey: CharacterKey | ''
  onPick: () => void
  onClear: () => void
  addLabel: string
}) {
  const { t } = useTranslation('page_optimize')
  const { gender } = useDBMeta()
  return (
    <Grid item xs={1}>
      <Stack gap={1} sx={{ height: '100%' }}>
        <Button
          fullWidth
          color={teammateKey ? 'success' : 'primary'}
          onClick={onPick}
        >
          {teammateKey ? (
            <CharacterName characterKey={teammateKey} gender={gender ?? 'F'} />
          ) : (
            addLabel
          )}
        </Button>
        {teammateKey ? (
          <>
            <Button color="error" variant="outlined" onClick={onClear}>
              {t('removeTeammate')}
            </Button>
            <TeammateBuffs member={member} teammateKey={teammateKey} />
          </>
        ) : null}
      </Stack>
    </Grid>
  )
}

function TeammateBuffs({
  member,
  teammateKey,
}: {
  member: (typeof pandoTeammateMembers)[number]
  teammateKey: CharacterKey
}) {
  const tag = useMemo(
    () => ({ src: member, dst: '0' as const, preset: 'preset0' as const }),
    [member]
  )
  return (
    <TeammateConditionalProvider member={member} teammateKey={teammateKey}>
      <TagContext.Provider value={tag}>
        <TeammateBuffSheetDisplay characterKey={teammateKey} />
      </TagContext.Provider>
    </TeammateConditionalProvider>
  )
}

function TeammateConditionalProvider({
  member,
  teammateKey,
  children,
}: {
  member: (typeof pandoTeammateMembers)[number]
  teammateKey: CharacterKey
  children: ReactNode
}) {
  const parentSetConditional = useContext(SetConditionalContext)
  const parentConditionals = useContext(ConditionalValuesContext)
  const parentSrcDstDisplay = useContext(SrcDstDisplayContext)
  const { gender } = useDBMeta()
  const setConditional = useCallback<SetConditionalFunc>(
    (sheet, condKey, _src, dst, condValue) =>
      parentSetConditional?.(sheet, condKey, member, dst, condValue),
    [member, parentSetConditional]
  )
  const teammateConditionals = useMemo(
    () => parentConditionals.filter(({ src }) => src === member),
    [member, parentConditionals]
  )
  const srcDstDisplay = useMemo(
    () =>
      mergeTeammateSrcDstDisplay(
        parentSrcDstDisplay,
        member,
        teammateKey,
        gender ?? 'F'
      ),
    [gender, member, parentSrcDstDisplay, teammateKey]
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

function mergeTeammateSrcDstDisplay(
  parent: SrcDstDisplayContextObj,
  member: string,
  teammateKey: CharacterKey,
  gender: 'F' | 'M'
): SrcDstDisplayContextObj {
  return {
    srcDisplay: {
      ...parent.srcDisplay,
      [member]: <CharacterName characterKey={teammateKey} gender={gender} />,
    },
    dstDisplay: parent.dstDisplay,
  }
}
