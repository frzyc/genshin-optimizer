import type { IArtifact, ICharacter, IGOOD, IWeapon } from '@genshin-optimizer/gi-good';
import type { TagMapNodeEntries } from '@genshin-optimizer/gi-formula';
import { artifactsData, charData, convert, enemyDebuff, genshinCalculatorWithEntries, selfBuff, selfTag, translate, weaponData, withMember } from '@genshin-optimizer/gi-formula';
import { allStats } from '@genshin-optimizer/gi-stats'


export function calc(data : Record<string, any>) {
  const team: TagMapNodeEntries = [
    ...withMember(
      'member0',
      ...charData(data['char'] as ICharacter),
      ...weaponData(data['weapon'] as IWeapon),
      ...artifactsData(data['artifacts'].map((e : IArtifact) => {
        return {
          set: e.setKey,
          stats: [
            {key: e.mainStatKey, value: allStats.art.main[e.rarity][e.mainStatKey][e.level]},
            ...e.substats.map(s => {
              if (s.key.endsWith('_')) s.value /= 100;
              return s;
            })
          ]
        };
      }))
    ),
    // Enemy
    enemyDebuff.cond.cata.add('spread'),
    enemyDebuff.cond.amp.add(''),
    enemyDebuff.common.lvl.add(80),
    enemyDebuff.common.preRes.add(0.1),
    selfBuff.common.critMode.add('avg'),
  ];
  const calc = genshinCalculatorWithEntries(team);
  const member0 = convert(selfTag, { member: 'member0', et: 'self' });
  const read = calc
    .listFormulas(member0.formula.listing)
    .find((x) => x.tag.name === 'karma_dmg')!
  console.log(translate(calc.compute(read)).deps);
  return {
    hp: calc.compute(member0.final.hp).val,
    atk: calc.compute(member0.final.atk).val,
    def: calc.compute(member0.final.def).val,
    eleMas: calc.compute(member0.final.eleMas).val,
    critRate: calc.compute(member0.final.critRate_).val,
    critDMG: calc.compute(member0.final.critDMG_).val,
    karma_dmg: read ? calc.compute(read).val : undefined,
    karma_formula: read ? translate(calc.compute(read)).deps.map(({name, formula}) => `${name} <= ${formula}`) : undefined
  };
}
