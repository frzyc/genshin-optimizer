import type { IArtifact, ICharacter, IGOOD, IWeapon } from '@genshin-optimizer/gi-good';
import type { Calculator, TagMapNodeEntries } from '@genshin-optimizer/gi-formula';
import { artifactsData, charData, convert, enemyDebuff, genshinCalculatorWithEntries, selfBuff, selfTag, translate, weaponData, withMember } from '@genshin-optimizer/gi-formula';
import { allStats } from '@genshin-optimizer/gi-stats'

const member0 = convert(selfTag, { member: 'member0', et: 'self' });

export function getcalculator(chardata : Record<string, any>) {
    const team: TagMapNodeEntries = [
        ...withMember(
            'member0',
            ...charData(chardata['char'] as ICharacter),
            ...weaponData(chardata['weapon'] as IWeapon),
            ...artifactsData(chardata['artifacts'].map((e : IArtifact) => {
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
        enemyDebuff.cond.cata.add(''),
        enemyDebuff.cond.amp.add(''),
        enemyDebuff.common.lvl.add(90),
        enemyDebuff.common.preRes.add(0.1),
        selfBuff.common.critMode.add('avg'),
    ];
    return genshinCalculatorWithEntries(team);
}

export function gettargets(calc : Calculator) : string[] {
    return calc.listFormulas(member0.formula.listing).map(e => e.tag.name || '').filter(e => e.length > 0);
}

export function calc(calc : Calculator, target : string) : any {
    const read = calc
        .listFormulas(member0.formula.listing)
        .find(e => e.tag.name === target)
    if (!read) throw `No target "${target}`;
    return {
        hp: calc.compute(member0.final.hp).val,
        atk: calc.compute(member0.final.atk).val,
        def: calc.compute(member0.final.def).val,
        eleMas: calc.compute(member0.final.eleMas).val,
        critRate: calc.compute(member0.final.critRate_).val,
        critDMG: calc.compute(member0.final.critDMG_).val,
        target: read ? calc.compute(read).val : undefined,
        target_formula: read ? translate(calc.compute(read)).deps.map(({name, formula}) => `${name} <= ${formula}`) : undefined
    };
}
