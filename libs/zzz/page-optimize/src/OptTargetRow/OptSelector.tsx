import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import {
  type ICachedCharacter,
  type Team,
  getTeamFrame0,
  targetTag,
} from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { formulaDimensionByQ, own } from '@genshin-optimizer/zzz/formula'
import type { FormulaDimension } from '@genshin-optimizer/zzz/formula'
import {
  AbilityOptTargetLabel,
  FullTagDisplay,
  OptPanelSectionHeader,
  OptTargetFormulaLabel,
  OptTargetSelectedLabel,
  OptTargetSkillSectionHeader,
  filterNonStatFields,
  getFormulaDisplaySection,
  groupFieldsByDisplaySection,
  groupFormulas,
  isAbilityFormulaTag,
  isMultiTagField,
  isTagField,
  listStatReadsFromFormulas,
  orderedDisplaySections,
  primaryTagFromField,
  statReadTagKey,
  statReadToTargetTag,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box, ListItemText, MenuItem } from '@mui/material'
import { useMemo } from 'react'

function setAbilityTarget(
  database: ReturnType<typeof useDatabaseContext>['database'],
  characterKey: CharacterKey,
  sheet: string,
  name: string,
  formulaDimension: FormulaDimension,
  damageType1?: TargetTag['damageType1'],
  damageType2?: TargetTag['damageType2']
) {
  database.teams.setFrame0(characterKey, {
    tag: {
      sheet,
      name,
      formulaDimension,
      damageType1,
      damageType2,
    },
  })
}

function OptTargetFieldMenuItem({
  field,
  fieldKey,
  characterKey,
  target,
  database,
}: {
  field: Field
  fieldKey: string
  characterKey: CharacterKey
  target: ReturnType<typeof getTeamFrame0>['tag']
  database: ReturnType<typeof useDatabaseContext>['database']
}) {
  if (isMultiTagField(field)) {
    const ref = primaryTagFromField(field)
    if (!ref?.name) return null
    const sheet = ref.sheet ?? characterKey
    const formulaDimension: FormulaDimension =
      target?.name === ref.name && target.formulaDimension
        ? target.formulaDimension
        : 'dmg'
    return (
      <MenuItem
        key={fieldKey}
        onClick={() =>
          setAbilityTarget(
            database,
            characterKey,
            sheet,
            ref.name!,
            formulaDimension
          )
        }
      >
        <ListItemText>
          <AbilityOptTargetLabel charKey={characterKey} tag={ref} />
        </ListItemText>
      </MenuItem>
    )
  }

  if (!isTagField(field)) return null
  const { fieldRef } = field
  const { name } = fieldRef
  if (!name) return null

  if (isAbilityFormulaTag(fieldRef)) {
    const formulaDimension =
      target?.name === name && target.formulaDimension
        ? target.formulaDimension
        : (formulaDimensionByQ[
            fieldRef.q as keyof typeof formulaDimensionByQ
          ] ?? 'dmg')
    return (
      <MenuItem
        key={fieldKey}
        onClick={() =>
          setAbilityTarget(
            database,
            characterKey,
            fieldRef.sheet ?? characterKey,
            name,
            formulaDimension
          )
        }
      >
        <ListItemText>
          <AbilityOptTargetLabel charKey={characterKey} tag={fieldRef} />
        </ListItemText>
      </MenuItem>
    )
  }

  return (
    <MenuItem
      key={fieldKey}
      onClick={() =>
        database.teams.setFrame0(characterKey, {
          tag: { sheet: characterKey, name },
        })
      }
    >
      <ListItemText>
        {getFormulaDisplaySection(characterKey, fieldRef) ? (
          <OptTargetFormulaLabel charKey={characterKey} tag={fieldRef} />
        ) : (
          <FullTagDisplay tag={fieldRef} />
        )}
      </ListItemText>
    </MenuItem>
  )
}

export function OptSelector({
  character: { key: characterKey },
  team,
}: {
  team: Team
  character: ICachedCharacter
}) {
  const { tag: target } = getTeamFrame0(team)
  const calc = useZzzCalcContext()
  const { database } = useDatabaseContext()
  const tag = useMemo(() => {
    if (!target) return undefined
    return targetTag(target)
  }, [target])

  const { statReads, skillSections, otherFields } = useMemo(() => {
    if (!calc)
      return {
        statReads: [],
        skillSections: [],
        otherFields: [] as Field[],
      }
    const reads = calc.listFormulas(own.listing.formulas)
    const fields = groupFormulas(reads, characterKey, characterKey)
    const { bySection, other } = groupFieldsByDisplaySection(
      characterKey,
      fields
    )
    return {
      statReads: listStatReadsFromFormulas(reads),
      skillSections: orderedDisplaySections(bySection),
      otherFields: filterNonStatFields(other),
    }
  }, [calc, characterKey])

  const selectedTitle = tag ? (
    <OptTargetSelectedLabel charKey={characterKey} tag={tag} inline />
  ) : null

  return (
    <DropdownButton
      color={tag ? 'success' : 'warning'}
      title={
        tag ? (
          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              alignItems: 'center',
              minWidth: 0,
              overflow: 'hidden',
              textWrap: 'nowrap',
            }}
          >
            <strong>Target:</strong>
            {selectedTitle}
          </Box>
        ) : (
          'Select an Optimization Target'
        )
      }
      variant={tag ? 'outlined' : undefined}
      sx={{
        height: '100%',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
        justifyContent: 'flex-start',
      }}
    >
      <OptPanelSectionHeader>Stats</OptPanelSectionHeader>
      {statReads.map((read) => (
        <MenuItem
          key={`stat_${statReadTagKey(read.tag)}`}
          onClick={() =>
            database.teams.setFrame0(characterKey, {
              tag: statReadToTargetTag(read),
            })
          }
        >
          <ListItemText>
            <FullTagDisplay tag={read.tag} />
          </ListItemText>
        </MenuItem>
      ))}
      {otherFields.length > 0 && (
        <OptPanelSectionHeader>Other</OptPanelSectionHeader>
      )}
      {otherFields.map((field, i) => (
        <OptTargetFieldMenuItem
          key={`other_${i}`}
          field={field}
          fieldKey={`other_${i}`}
          characterKey={characterKey}
          target={target}
          database={database}
        />
      ))}
      {skillSections.flatMap(({ section, fields }) => [
        <OptTargetSkillSectionHeader
          key={`header_${section}`}
          skill={section}
        />,
        ...fields.map((field, i) => (
          <OptTargetFieldMenuItem
            key={`${section}_${i}`}
            field={field}
            fieldKey={`${section}_${i}`}
            characterKey={characterKey}
            target={target}
            database={database}
          />
        )),
      ])}
    </DropdownButton>
  )
}
