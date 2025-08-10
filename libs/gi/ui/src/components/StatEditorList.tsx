import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import {
  GeneralAutocomplete,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { MainStatKey, SubstatKey } from '@genshin-optimizer/gi/consts'
import { allMainStatKeys, allSubstatKeys } from '@genshin-optimizer/gi/consts'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import type { InputPremodKey } from '@genshin-optimizer/gi/wr'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  ButtonGroup,
  IconButton,
  InputAdornment,
  List,
  ListSubheader,
  Popper,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { statPercent } from './util'

export function StatEditorList({
  statKeys,
  statFilters,
  setStatFilters,
  disabled = false,
  wrapperFunc = (ele) => ele,
  label,
}: {
  statKeys: InputPremodKey[]
  statFilters: Partial<Record<InputPremodKey, number>>
  setStatFilters: (statFilters: Partial<Record<InputPremodKey, number>>) => void
  disabled?: boolean
  wrapperFunc?: (ele: JSX.Element, key?: string) => JSX.Element
  label?: string
}) {
  const { t: tk } = useTranslation('statKey_gen')
  const statOptions = useMemo(
    () =>
      statKeys
        .map(
          (statKey: InputPremodKey): StatOption => ({
            key: statKey,
            grouper: inputPremodKeyToGroupMap[statKey],
            label: (
              [...allMainStatKeys, ...allSubstatKeys] as string[]
            ).includes(statKey)
              ? `${tk(statKey as MainStatKey | SubstatKey)}${statPercent(
                  statKey as MainStatKey | SubstatKey
                )}`
              : (KeyMap.getStr(statKey) ?? 'ERROR'),
            color: KeyMap.getVariant(statKey),
          })
        )
        .sort(
          (a, b) =>
            allGroupKeys.indexOf(a.grouper as GroupKey) -
            allGroupKeys.indexOf(b.grouper as GroupKey)
        ),
    [tk, statKeys]
  )

  const getOptionDiabled = useCallback(
    (option: StatOption) => Object.keys(statFilters).includes(option.key),
    [statFilters]
  )

  const setKey = useCallback(
    (newk: InputPremodKey, oldk: InputPremodKey | null) => {
      if (oldk)
        setStatFilters(
          Object.fromEntries(
            Object.entries(statFilters).map(([k, v]) => [
              k === oldk ? newk : k,
              v,
            ])
          )
        )
      else {
        const statFilters_ = { ...statFilters }
        statFilters_[newk] = 0
        setStatFilters({ ...statFilters_ })
      }
    },
    [statFilters, setStatFilters]
  )

  const setFilter = useCallback(
    (sKey: InputPremodKey, min: number) => {
      const statFilters_ = { ...statFilters }
      statFilters_[sKey] = min
      setStatFilters({ ...statFilters_ })
    },
    [statFilters, setStatFilters]
  )

  const delKey = useCallback(
    (statKey: InputPremodKey) => {
      const statFilters_ = { ...statFilters }
      delete statFilters_[statKey]
      setStatFilters({ ...statFilters_ })
    },
    [statFilters, setStatFilters]
  )

  return (
    <>
      {Object.entries(statFilters).map(([statKey, min]) =>
        wrapperFunc(
          <StatFilterItem
            key={statKey}
            statKey={statKey}
            statKeyOptions={statOptions}
            disabled={disabled}
            value={min}
            setValue={setFilter}
            setKey={setKey}
            delKey={delKey}
            getOptionDisabled={getOptionDiabled}
          />,
          statKey
        )
      )}
      {wrapperFunc(
        <StatFilterItem
          key={Object.entries(statFilters).length}
          statKey={null}
          statKeyOptions={statOptions}
          setValue={setFilter}
          setKey={setKey}
          delKey={delKey}
          disabled={disabled}
          getOptionDisabled={getOptionDiabled}
          label={label}
        />
      )}
    </>
  )
}

type StatOption = GeneralAutocompleteOption<InputPremodKey>
function StatFilterItem({
  statKey,
  statKeyOptions = [],
  value = 0,
  delKey,
  setKey,
  setValue,
  disabled = false,
  getOptionDisabled,
  label,
}: {
  statKey: InputPremodKey | null
  statKeyOptions: StatOption[]
  value?: number
  delKey: (delKey: InputPremodKey) => void
  setKey: (newKey: InputPremodKey, oldKey: InputPremodKey | null) => void
  setValue: (statKey: InputPremodKey, value: number) => void
  disabled?: boolean
  getOptionDisabled: (option: StatOption) => boolean
  label?: string
}) {
  const theme = useTheme()
  const { t } = useTranslation('ui')
  const isThreeCol = useMediaQuery(theme.breakpoints.up('lg'))
  const isOneCol = useMediaQuery(theme.breakpoints.down('md'))
  const isFloat = statKey ? getUnitStr(statKey) === '%' : false
  const onValueChange = useCallback(
    (value?: number) => statKey && setValue(statKey, value ?? 0),
    [setValue, statKey]
  )
  const onKeyChange = useCallback(
    (newKey: InputPremodKey | null) => {
      if (newKey) {
        setKey(newKey, statKey)
      } else if (statKey) {
        delKey(statKey)
      }
    },
    [statKey, setKey, delKey]
  )
  const onDeleteKey = useCallback(
    () => statKey && delKey(statKey),
    [delKey, statKey]
  )
  return (
    <Box sx={{ display: 'flex' }}>
      <ButtonGroup sx={{ flexGrow: 1 }}>
        <GeneralAutocomplete
          size="small"
          options={statKeyOptions}
          onChange={onKeyChange}
          valueKey={statKey}
          getOptionDisabled={getOptionDisabled}
          groupBy={(option) => inputPremodKeyToGroupMap[option.key]}
          renderGroup={(params) => (
            <List
              key={params.key}
              component={Box}
              sx={{ paddingTop: 0, marginTop: 0 }}
            >
              <ListSubheader key={`${params.group}Header`} sx={{ top: '-1em' }}>
                <strong>{t(`statGroupKey.${params.group}`)}</strong>
              </ListSubheader>
              {params.children}
            </List>
          )}
          toImg={(sKey: InputPremodKey) => (
            <StatIcon
              statKey={sKey}
              iconProps={{ color: KeyMap.getVariant(sKey) }}
            />
          )}
          ListboxProps={{
            style: {
              display: 'grid',
              gridTemplateColumns: isOneCol
                ? '100%'
                : isThreeCol
                  ? '33% 33% 33%'
                  : '50% 50%',
            },
          }}
          // This needs to be done with `style` prop, not `sx` prop, or it doesn't work
          PopperComponent={(props) => (
            <Popper {...props} style={{ width: '60%' }} />
          )}
          sx={{ flexGrow: 1, flexBasis: 150 }}
          textFieldProps={{
            sx: { '& .MuiInputBase-root': { borderRadius: '4px 0 0 4px' } },
          }}
          label={label}
        />
      </ButtonGroup>
      {!!statKey && (
        <NumberInputLazy
          value={value}
          float={isFloat}
          sx={{
            flexBasis: 30,
            flexGrow: 1,
          }}
          disabled={disabled}
          onChange={onValueChange}
          placeholder="Stat Value"
          size="small"
          inputProps={{ sx: { textAlign: 'right' } }}
          InputProps={{
            sx: {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 0 }}>
                {statKey ? getUnitStr(statKey) : undefined}{' '}
                <IconButton
                  aria-label="Delete Stat Constraint"
                  onClick={onDeleteKey}
                  edge="end"
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    </Box>
  )
}

const allGroupKeys = [
  'basic_stats',
  'elem_dmg_bonus',
  'enemy_debuffs',
  'self_res',
  'reaction_dmg_bonus',
  'reaction_crit',
  'elem_dmgInc',
  'talent_dmgInc',
  'elem_crit',
  'talent_dmg_bonus',
  'talent_crit',
  'talent_level_boost',
  'base_stat_mod',
  'stamina_buffs',
  'misc',
] as const
type GroupKey = (typeof allGroupKeys)[number]

const inputPremodKeyToGroupMap: Record<InputPremodKey, GroupKey> = {
  hp: 'basic_stats',
  hp_: 'basic_stats',
  atk: 'basic_stats',
  atk_: 'basic_stats',
  def: 'basic_stats',
  def_: 'basic_stats',
  eleMas: 'basic_stats',
  enerRech_: 'basic_stats',
  critRate_: 'basic_stats',
  critDMG_: 'basic_stats',
  electro_dmg_: 'elem_dmg_bonus',
  hydro_dmg_: 'elem_dmg_bonus',
  pyro_dmg_: 'elem_dmg_bonus',
  cryo_dmg_: 'elem_dmg_bonus',
  physical_dmg_: 'elem_dmg_bonus',
  anemo_dmg_: 'elem_dmg_bonus',
  geo_dmg_: 'elem_dmg_bonus',
  dendro_dmg_: 'elem_dmg_bonus',
  heal_: 'basic_stats',
  all_dmg_: 'elem_dmg_bonus',
  overloaded_dmg_: 'reaction_dmg_bonus',
  shattered_dmg_: 'reaction_dmg_bonus',
  electrocharged_dmg_: 'reaction_dmg_bonus',
  lunarcharged_baseDmg_: 'reaction_dmg_bonus',
  lunarcharged_dmg_: 'reaction_dmg_bonus',
  superconduct_dmg_: 'reaction_dmg_bonus',
  swirl_dmg_: 'reaction_dmg_bonus',
  burning_dmg_: 'reaction_dmg_bonus',
  bloom_dmg_: 'reaction_dmg_bonus',
  burgeon_dmg_: 'reaction_dmg_bonus',
  hyperbloom_dmg_: 'reaction_dmg_bonus',
  vaporize_dmg_: 'reaction_dmg_bonus',
  melt_dmg_: 'reaction_dmg_bonus',
  spread_dmg_: 'reaction_dmg_bonus',
  aggravate_dmg_: 'reaction_dmg_bonus',
  normal_dmg_: 'talent_dmg_bonus',
  charged_dmg_: 'talent_dmg_bonus',
  plunging_dmg_: 'talent_dmg_bonus',
  plunging_collision_dmg_: 'talent_dmg_bonus',
  plunging_impact_dmg_: 'talent_dmg_bonus',
  skill_dmg_: 'talent_dmg_bonus',
  burst_dmg_: 'talent_dmg_bonus',
  elemental_dmg_: 'talent_dmg_bonus',
  normalEle_dmg_: 'talent_dmg_bonus',
  physical_dmgInc: 'elem_dmgInc',
  physical_critDMG_: 'elem_crit',
  physical_res_: 'self_res',
  anemo_dmgInc: 'elem_dmgInc',
  anemo_critDMG_: 'elem_crit',
  anemo_res_: 'self_res',
  geo_dmgInc: 'elem_dmgInc',
  geo_critDMG_: 'elem_crit',
  geo_res_: 'self_res',
  electro_dmgInc: 'elem_dmgInc',
  electro_critDMG_: 'elem_crit',
  electro_res_: 'self_res',
  hydro_dmgInc: 'elem_dmgInc',
  hydro_critDMG_: 'elem_crit',
  hydro_res_: 'self_res',
  pyro_dmgInc: 'elem_dmgInc',
  pyro_critDMG_: 'elem_crit',
  pyro_res_: 'self_res',
  cryo_dmgInc: 'elem_dmgInc',
  cryo_critDMG_: 'elem_crit',
  cryo_res_: 'self_res',
  dendro_dmgInc: 'elem_dmgInc',
  dendro_critDMG_: 'elem_crit',
  dendro_res_: 'self_res',
  autoBoost: 'talent_level_boost',
  skillBoost: 'talent_level_boost',
  burstBoost: 'talent_level_boost',
  normal_dmgInc: 'talent_dmgInc',
  normal_critDMG_: 'talent_crit',
  normal_critRate_: 'talent_crit',
  charged_dmgInc: 'talent_dmgInc',
  charged_critDMG_: 'talent_crit',
  charged_critRate_: 'talent_crit',
  plunging_dmgInc: 'talent_dmgInc',
  plunging_critDMG_: 'talent_crit',
  plunging_critRate_: 'talent_crit',
  plunging_collision_dmgInc: 'talent_dmgInc',
  plunging_collision_critDMG_: 'talent_crit',
  plunging_collision_critRate_: 'talent_crit',
  plunging_impact_dmgInc: 'talent_dmgInc',
  plunging_impact_critDMG_: 'talent_crit',
  plunging_impact_critRate_: 'talent_crit',
  skill_dmgInc: 'talent_dmgInc',
  skill_critDMG_: 'talent_crit',
  skill_critRate_: 'talent_crit',
  burst_dmgInc: 'talent_dmgInc',
  burst_critDMG_: 'talent_crit',
  burst_critRate_: 'talent_crit',
  elemental_dmgInc: 'talent_dmgInc',
  elemental_critDMG_: 'talent_crit',
  elemental_critRate_: 'talent_crit',
  burning_critRate_: 'reaction_crit',
  burning_critDMG_: 'reaction_crit',
  bloom_critRate_: 'reaction_crit',
  bloom_critDMG_: 'reaction_crit',
  burgeon_critRate_: 'reaction_crit',
  burgeon_critDMG_: 'reaction_crit',
  hyperbloom_critRate_: 'reaction_crit',
  hyperbloom_critDMG_: 'reaction_crit',
  swirl_critRate_: 'reaction_crit',
  swirl_critDMG_: 'reaction_crit',
  swirl_dmgInc: 'elem_dmgInc',
  all_dmgInc: 'elem_dmgInc',
  physical_enemyRes_: 'enemy_debuffs',
  anemo_enemyRes_: 'enemy_debuffs',
  geo_enemyRes_: 'enemy_debuffs',
  electro_enemyRes_: 'enemy_debuffs',
  hydro_enemyRes_: 'enemy_debuffs',
  pyro_enemyRes_: 'enemy_debuffs',
  cryo_enemyRes_: 'enemy_debuffs',
  dendro_enemyRes_: 'enemy_debuffs',
  enemyDefRed_: 'enemy_debuffs',
  enemyDefIgn_: 'misc',
  stamina: 'stamina_buffs',
  staminaDec_: 'stamina_buffs',
  staminaSprintDec_: 'stamina_buffs',
  staminaGlidingDec_: 'stamina_buffs',
  staminaChargedDec_: 'stamina_buffs',
  incHeal_: 'misc',
  shield_: 'misc',
  cdRed_: 'misc',
  moveSPD_: 'misc',
  atkSPD_: 'misc',
  weakspotDMG_: 'misc',
  dmgRed_: 'misc',
  healInc: 'misc',
  base_atk: 'base_stat_mod',
  base_hp: 'base_stat_mod',
  base_def: 'base_stat_mod',
}
