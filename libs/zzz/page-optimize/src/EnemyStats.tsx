import {
  CardThemed,
  ColorText,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { isIn, shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import type { EnemyStatKey, EnemyStatsTag } from '@genshin-optimizer/zzz/db'
import { enemyStatKeys, newEnemyStatTag } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { TagDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { AttributeName } from '@genshin-optimizer/zzz/ui'
import { DeleteForever } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'

export function EnemyStatsSection() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const {
    enemyStats,
    enemyLvl,
    enemyDef,
    enemyisStunned,
    enemyStunMultiplier,
  } = useCharOpt(characterKey)!

  const setStat = useCallback(
    (tag: EnemyStatsTag, value: number | null, index?: number) =>
      database.charOpts.setEnemyStat(characterKey, tag, value, index),
    [database, characterKey]
  )
  const newTarget = (q: EnemyStatKey) =>
    database.charOpts.setEnemyStat(characterKey, newEnemyStatTag(q), 0)

  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <NumberInputLazy
          label="Enemy Lvl"
          value={enemyLvl}
          inputProps={{ min: 0, sx: { width: '4em' } }}
          onChange={(v) => database.charOpts.set(characterKey, { enemyLvl: v })}
        />
        <NumberInputLazy
          label="Enemy DEF"
          value={enemyDef}
          inputProps={{ min: 0, sx: { width: '4em' } }}
          onChange={(v) => database.charOpts.set(characterKey, { enemyDef: v })}
        />
        <NumberInputLazy
          label="Enemy Stun Multiplier"
          value={enemyStunMultiplier}
          inputProps={{ min: 0, sx: { width: '8em' } }}
          onChange={(v) =>
            database.charOpts.set(characterKey, { enemyStunMultiplier: v })
          }
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
        />
        <Button
          onClick={() =>
            database.charOpts.set(characterKey, {
              enemyisStunned: !enemyisStunned,
            })
          }
          color={enemyisStunned ? 'success' : 'secondary'}
        >
          {enemyisStunned ? 'Stunned' : 'Not Stunned'}
        </Button>
      </Box>
      {enemyStats.map(({ tag, value }, i) => (
        <EnemyStatDisplay
          key={JSON.stringify(tag) + i}
          tag={tag}
          value={value}
          setValue={(value) => setStat(tag, value, i)}
          onDelete={() => setStat(tag, null, i)}
          setTag={(tag) => setStat(tag, value, i)}
        />
      ))}
      <InitialStatDropdown onSelect={newTarget} />
    </Stack>
  )
}

function InitialStatDropdown({
  tag,
  onSelect,
}: {
  tag?: Tag
  onSelect: (key: EnemyStatKey) => void
}) {
  return (
    <DropdownButton
      title={
        (tag && (
          <TagDisplay
            tag={{ ...tag, qt: 'common', et: 'enemy', sheet: 'agg' }}
          />
        )) ??
        'Add Enemy Stat'
      }
    >
      {enemyStatKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          <TagDisplay
            tag={{ q: statKey, qt: 'common', et: 'enemy', sheet: 'agg' }}
            showPercent
          />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function EnemyStatDisplay({
  tag,
  setTag,
  value,
  setValue,
  onDelete,
}: {
  tag: EnemyStatsTag
  setTag: (tag: EnemyStatsTag) => void
  value: number
  setValue: (value: number) => void
  onDelete: () => void
}) {
  const isPercent = tag.q?.endsWith('_')
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Typography>
          <TagDisplay tag={tag} />
        </Typography>
        {isIn(['res_', 'resRed_'] as const, tag.q) && (
          <AttributeDropdown
            tag={tag}
            setAttribute={(ele) => {
              const { attribute, ...rest } = tag
              setTag(ele ? { ...rest, attribute: ele } : rest)
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
                  aria-label="Delete Enemy Stat"
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
      {shouldShowDevComponents && (
        <>
          <Divider />
          <CardContent>
            <Typography sx={{ fontFamily: 'monospace' }}>
              {JSON.stringify(tag)}
            </Typography>
          </CardContent>
        </>
      )}
    </CardThemed>
  )
}

function AttributeDropdown({
  tag,
  setAttribute,
}: {
  tag: EnemyStatsTag
  setAttribute: (ele: Attribute | null) => void
}) {
  return (
    <DropdownButton
      title={
        tag.attribute ? (
          <AttributeName attribute={tag.attribute} />
        ) : (
          'No Attribute'
        )
      }
      color={tag.attribute!}
    >
      <MenuItem onClick={() => setAttribute(null)}>No Attribute</MenuItem>
      {allAttributeKeys.map((attr) => (
        <MenuItem key={attr} onClick={() => setAttribute(attr)}>
          <ColorText color={attr}>
            <AttributeName attribute={attr} />
          </ColorText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
