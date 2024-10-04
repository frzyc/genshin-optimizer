import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { ElementalTypeKey, StatKey } from '@genshin-optimizer/sr/consts'
import { allElementalTypeKeys } from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { tagFieldMap } from '@genshin-optimizer/sr/formula-ui'
import { LoadoutContext, useDatabaseContext } from '@genshin-optimizer/sr/ui'
import { DeleteForever } from '@mui/icons-material'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
} from '@mui/material'
import { useContext } from 'react'

export function BonusStats() {
  const [open, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button onClick={onOpen}>Bonus Stats</Button>
      <BonusStatsModal open={open} onClose={onClose} />
    </>
  )
}

function BonusStatsModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { database } = useDatabaseContext()
  const {
    loadout: { bonusStats },
    loadoutId,
  } = useContext(LoadoutContext)
  const newTarget = (q: InitialStats) => {
    const tag = newTag(q)
    database.loadouts.set(loadoutId, (loadout) => {
      loadout.bonusStats.push({
        tag,
        value: 0,
      })
    })
  }
  return (
    <ModalWrapper open={open} onClose={onClose}>
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
                setValue={(value) => {
                  database.loadouts.set(loadoutId, (loadout) => {
                    loadout.bonusStats[i].value = value
                  })
                }}
                onDelete={() => {
                  database.loadouts.set(loadoutId, (loadout) => {
                    loadout.bonusStats.splice(i, 1)
                  })
                }}
                setTag={(tag) => {
                  database.loadouts.set(loadoutId, (loadout) => {
                    loadout.bonusStats[i].tag = tag
                  })
                }}
              />
            ))}
            <InitialStatDropdown onSelect={newTarget} />
          </Stack>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function newTag(q: Tag['q']): Tag {
  return {
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
