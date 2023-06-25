import type { CharacterKey } from '@genshin-optimizer/consts'
import {
  artifactsData,
  charData,
  convert,
  genshinCalculatorWithEntries,
  selfTag,
  teamData,
  weaponData,
  withMember,
} from '@genshin-optimizer/formula'
import React, { useMemo } from 'react'

type CharacterCardProps = {
  characterKey: CharacterKey
}

export default function CharacterCard({ characterKey }: CharacterCardProps) {
  // TODO: Stop mocking data, and read from DB instead
  // const character = useCharacter(characterKey)
  // const weapon = useWeapon(character?.equippedWeapon)
  const calc = useMemo(
    () =>
      // character &&
      // weapon &&
      genshinCalculatorWithEntries([
        ...teamData(['member0'], ['member0']),
        ...withMember(
          'member0',
          ...charData({
            name: characterKey,
            lvl: 50,
            ascension: 3,
            constellation: 3,
            conds: {},
          }),
          ...weaponData({
            name: 'DullBlade',
            lvl: 50,
            ascension: 3,
            refinement: 1,
            conds: {},
          }),
          ...artifactsData(
            [
              // per art stat
            ],
            {
              // conditionals
            }
          )
        ),
      ]),
    [characterKey]
  )
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  if (!calc) return null
  return (
    <>
      <br />
      hp: {calc.compute(member0.final.hp).val}
      <br />
      atk: {calc.compute(member0.final.atk).val}
    </>
  )
}
