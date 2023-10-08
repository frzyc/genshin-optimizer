import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { IArtifact, ICharacter, IGOOD, IWeapon } from '@genshin-optimizer/gi-good';
import type { TagMapNodeEntries } from '@genshin-optimizer/gi-formula';
import { artifactsData, charData, convert, enemyDebuff, genshinCalculatorWithEntries, selfBuff, selfTag, translate, weaponData, withMember } from '@genshin-optimizer/gi-formula';
import { allStats } from '@genshin-optimizer/gi-stats'

export const slashcommand = new SlashCommandBuilder()
.setName('go')
.setDescription('shows optimizer data')
.addSubcommand(subcommand => subcommand
    .setName('team')
    .setDescription('show team info')
    .addStringOption(option => option
        .setName('char')
        .setDescription('the character to show with team')
        .setRequired(true))
    .addUserOption(option => option
        .setName('user')
        .setDescription('user')))
.addSubcommand(subcommand => subcommand
    .setName('char')
    .setDescription('show char info')
    .addStringOption(option => option
        .setName('char')
        .setDescription('the character to show')
        .setRequired(true))
    .addUserOption(option => option
        .setName('user')
        .setDescription('user')))
.addSubcommand(subcommand => subcommand
    .setName('artifact')
    .setDescription('show artifact info')
    .addStringOption(option => option
        .setName('filters')
        .setDescription('filters'))
    .addUserOption(option => option
        .setName('user')
        .setDescription('user')))

type IChar = {
    char : ICharacter | undefined,
    weapon : IWeapon | undefined,
    artifacts : IArtifact[] | undefined,
    target : any
}

//TODO
type IGO = IGOOD & {buildSettings : any[]}

var data : Record<string, IGO> = {};

export function getchardata(user : string, charname : string) : any {
    console.log(charname);
    let out : any = {};
    data['test'] = require('../../data/test.json');
    out.char = data['test'].characters?.find(e => e.key === charname);
    if (out.char === undefined) throw 0;
    out.weapon = data['test'].weapons?.find(e => e.location === charname);
    out.artifacts = data['test'].artifacts?.filter(e => e.location === charname);
    out.target = data['test'].buildSettings?.find(e => e.id === charname);
    console.log(JSON.stringify(out.target.optimizationTarget));``
    const team: TagMapNodeEntries = [
      ...withMember(
        'member0',
        ...charData(out.char as ICharacter),
        ...weaponData(out.weapon as IWeapon),
        ...artifactsData(out.artifacts.map((e : IArtifact) => {
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

export async function run(interaction : ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user', false) || interaction.user;
    const charname = interaction.options.getString('char', true);
    let chardata : any;
    try {
        chardata = getchardata(user.id, charname);
    }
    catch (e) {
        console.log(e);
        interaction.reply(JSON.stringify(e, null, 2).slice(0, 2000));
        return;
    }
    interaction.reply('```json\n'+JSON.stringify(chardata, null, 2).slice(0, 1980)+'```');
}
