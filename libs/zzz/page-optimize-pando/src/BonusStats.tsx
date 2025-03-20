import {
  CardThemed,
  ColorText,
  DropdownButton,
  NumberInputLazy,
  TextFieldLazy,
} from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import type { BonusStatKey, BonusStatTag } from '@genshin-optimizer/zzz/db'
import {
  bonusStatDamageTypes,
  bonusStatDmgTypeIncStats,
  bonusStatQtKeys,
} from '@genshin-optimizer/zzz/db'
import { bonusStatKeys, newBonusStatTag } from '@genshin-optimizer/zzz/db'
import {
  useCharOpt,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { TagDisplay, qtMap } from '@genshin-optimizer/zzz/formula-ui'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { DeleteForever } from '@mui/icons-material'
import {
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AfterShockToggleButton } from './AfterShockToggleButton'
import { DmgTypeDropdown } from './DmgTypeDropdown'

export function BonusStatsSection() {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const { bonusStats } = useCharOpt(characterKey)!
  const charMetaDesc =
    characterKey && database.charMeta.get(characterKey).description
  const setStat = useCallback(
    (tag: BonusStatTag, value: number | null, index?: number) =>
      database.charOpts.setBonusStat(characterKey, tag, value, index),
    [database, characterKey]
  )
  const newTarget = (q: BonusStatKey) =>
    database.charOpts.setBonusStat(characterKey, newBonusStatTag(q), 0)
  const setDescription = useCallback(
    (description: string | undefined) => {
      if (!characterKey || !description) return
      database.charMeta.set(characterKey, { description: description })
    },
    [database.charMeta, characterKey]
  )
  return (
    <Stack spacing={1}>
      {bonusStats.map(({ tag, value }, i) => (
        <BonusStatDisplay
          key={JSON.stringify(tag) + i}
          tag={tag}
          value={value}
          setValue={(value) => setStat(tag, value, i)}
          onDelete={() => setStat(tag, null, i)}
          setTag={(tag) => setStat(tag, value, i)}
        />
      ))}
      <InitialStatDropdown onSelect={newTarget} />
      <TextFieldLazy
        placeholder={t('bonusStatsNotes')}
        value={charMetaDesc}
        disabled={!characterKey}
        onChange={(value) => setDescription(value)}
        autoFocus
        multiline
        minRows={5}
        fullWidth={true}
      />
    </Stack>
  )
}

function InitialStatDropdown({
  tag,
  onSelect,
}: {
  tag?: Tag
  onSelect: (key: BonusStatKey) => void
}) {
  return (
    <DropdownButton
      title={(tag && <TagDisplay tag={tag} />) ?? 'Add Bonus Stat'}
    >
      {bonusStatKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          <StatDisplay statKey={statKey} showPercent />
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
  tag: BonusStatTag
  setTag: (tag: BonusStatTag) => void
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
        <QtDropdown qt={tag.qt} setQt={(qt) => setTag({ ...tag, qt })} />
        {tag.q === 'dmg_' && (
          <AttributeDropdown
            tag={tag}
            setAttribute={(ele) => {
              const { attribute, ...rest } = tag
              setTag(ele ? { ...rest, attribute: ele } : rest)
            }}
          />
        )}
        {bonusStatDmgTypeIncStats.includes(
          tag.q as (typeof bonusStatDmgTypeIncStats)[number]
        ) && (
          <DmgTypeDropdown
            dmgType={tag.damageType1}
            keys={bonusStatDamageTypes}
            setDmgType={(dmgType) => {
              const { damageType1, ...rest } = tag
              setTag(dmgType ? { ...rest, damageType1: dmgType } : rest)
            }}
          />
        )}
        {/* in-game there is only buffs that increase aftershock dmg_ and crit_dmg_ */}
        {(['dmg_', 'crit_dmg_'] as const).includes(
          tag.q as 'dmg_' | 'crit_dmg_'
        ) && (
          <AfterShockToggleButton
            isAftershock={tag.damageType2 === 'aftershock'}
            setAftershock={(aftershock) => {
              const { damageType2, ...rest } = tag
              setTag(aftershock ? { ...rest, damageType2: 'aftershock' } : rest)
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
  tag: BonusStatTag
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

function QtDropdown({
  qt,
  setQt,
}: {
  qt: Tag['qt']
  setQt: (ele: (typeof bonusStatQtKeys)[number]) => void
}) {
  return (
    <DropdownButton title={qt && qtMap[qt as keyof typeof qtMap]}>
      {bonusStatQtKeys.map((q) => (
        <MenuItem
          key={q}
          onClick={() => setQt(q)}
          selected={qt === q}
          disabled={qt === q}
        >
          {qtMap[q]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
