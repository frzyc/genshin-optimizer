import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { ElementalTypeKey, StatKey } from '@genshin-optimizer/sr/consts'
import { allElementalTypeKeys } from '@genshin-optimizer/sr/consts'
import { useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import type { Member, Tag } from '@genshin-optimizer/sr/formula'
import { tagFieldMap } from '@genshin-optimizer/sr/formula-ui'
import { DeleteForever } from '@mui/icons-material'
import {
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
} from '@mui/material'
import { useContext } from 'react'
import { PresetContext, useTeamContext, useTeammateContext } from './context'

export function BonusStatsSection() {
  const { database } = useDatabaseContext()
  const { presetIndex } = useContext(PresetContext)
  const {
    teamId,
    team: { bonusStats },
  } = useTeamContext()
  const { characterKey } = useTeammateContext()
  const newTarget = (q: InitialStats) => {
    const tag = newTag(q, characterKey)
    database.teams.setBonusStat(teamId, tag, 0, presetIndex)
  }
  if (!presetIndex) return null
  return (
    <CardThemed>
      <CardHeader title="Bonus Stats" />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          {bonusStats.map(({ tag, values }, i) => (
            <BonusStatDisplay
              key={JSON.stringify(tag) + i}
              tag={tag}
              value={values[presetIndex]}
              setValue={(value) =>
                database.teams.setBonusStat(teamId, tag, value, presetIndex)
              }
              onDelete={() =>
                database.teams.setBonusStat(teamId, tag, 0, presetIndex)
              }
              setTag={(tag) =>
                database.teams.setBonusStat(teamId, tag, 0, presetIndex)
              }
            />
          ))}
          <InitialStatDropdown onSelect={newTarget} />
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
function newTag(q: Tag['q'], member: Member): Tag {
  return {
    src: member,
    dst: member,
    et: 'own',
    q,
    qt: 'premod',
    sheet: 'agg',
  }
}
const initialStats: StatKey[] = [
  'hp',
  'hp_',
  'def',
  'def_',
  'atk',
  'atk_',
  'spd',
  'spd_',
  'dmg_',
  'enerRegen_',
  'brEffect_',
  'crit_',
  'crit_dmg_',
  'eff_',
  'eff_res_',
  'heal_',
] as const
type InitialStats = (typeof initialStats)[number]
function InitialStatDropdown({
  tag = {},
  onSelect,
}: {
  tag?: Tag
  onSelect: (key: (typeof initialStats)[number]) => void
}) {
  return (
    <DropdownButton
      title={(tag && tagFieldMap.subset(tag)[0]?.title) ?? 'Add Bonus Stat'}
    >
      {initialStats.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          {statKey}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function BonusStatDisplay({
  tag,
  setTag,
  value,
  setValue,
  onDelete,
}: {
  tag: Tag
  setTag: (tag: Tag) => void
  value: number
  setValue: (value: number) => void
  onDelete: () => void
}) {
  // TODO: best way to infer percentage from tag?
  const isPercent = (tag.name || tag.q)?.endsWith('_')
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{ display: 'flex', gap: 1, justifyContent: 'space-around' }}
      >
        <SqBadge sx={{ m: 'auto' }}>{tag.q}</SqBadge>
        {tag.q === 'dmg_' && (
          <ElementTypeDropdown
            tag={tag}
            setElementalType={(ele) => {
              const { elementalType, ...rest } = tag
              setTag(ele ? { ...rest, elementalType: ele } : rest)
            }}
          />
        )}
        <NumberInputLazy
          float
          value={value}
          sx={{ flexBasis: 150, flexGrow: 1, height: '100%' }}
          onChange={setValue}
          placeholder="Stat Value"
          size="small"
          inputProps={{ sx: { textAlign: 'right' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 0 }}>
                {isPercent ? '%' : undefined}{' '}
                <IconButton
                  aria-label="Delete Bonus Stat"
                  onClick={onDelete}
                  edge="end"
                >
                  <DeleteForever fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </CardContent>
    </CardThemed>
  )
}

function ElementTypeDropdown({
  tag,
  setElementalType,
}: {
  tag: Tag
  setElementalType: (ele: ElementalTypeKey | null) => void
}) {
  return (
    <DropdownButton title={tag.elementalType ?? 'No Element'}>
      <MenuItem onClick={() => setElementalType(null)}>No Element</MenuItem>
      {allElementalTypeKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => setElementalType(statKey)}>
          {statKey}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
