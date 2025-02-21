import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useCharOpt,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Attribute, Member, Tag } from '@genshin-optimizer/zzz/formula'
import { tagFieldMap } from '@genshin-optimizer/zzz/formula-ui'
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
import { useCallback } from 'react'

export function BonusStatsSection() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const { bonusStats } = useCharOpt(characterKey)!
  const setStat = useCallback(
    (tag: Tag, value: number | null) =>
      database.charOpts.setBonusStat(characterKey, tag, value),
    [database, characterKey]
  )
  const newTarget = (q: InitialStats) => {
    const tag = newTag(q, characterKey)
    database.charOpts.setBonusStat(characterKey, tag, 0)
  }
  return (
    <CardThemed>
      <CardHeader title="Bonus Stats" />
      <Divider />
      <CardContent>
        <Stack spacing={1}>
          {bonusStats.map(({ tag, value }, i) => (
            <BonusStatDisplay
              key={JSON.stringify(tag) + i}
              tag={tag}
              value={value}
              setValue={(value) => setStat(tag, value)}
              onDelete={() => setStat(tag, null)}
              setTag={(tag) => setStat(tag, 0)}
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
  'dmg_',
  'enerRegen_',
  'crit_',
  'crit_dmg_',
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
  setElementalType: (ele: Attribute | null) => void
}) {
  return (
    <DropdownButton title={tag.elementalType ?? 'No Element'}>
      <MenuItem onClick={() => setElementalType(null)}>No Element</MenuItem>
      {allAttributeKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => setElementalType(statKey)}>
          {statKey}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
