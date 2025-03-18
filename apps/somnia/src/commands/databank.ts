import * as fs from 'node:fs'
import * as path from 'node:path'
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageReaction,
  StringSelectMenuInteraction,
} from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

import { error } from '../lib/message'
import { cwd } from '../lib/util'

import type {
  CharacterGenderedKey,
  LightConeKey,
  RelicSetKey,
} from '@genshin-optimizer/sr/consts'
import { charBank } from './databank/char'
import { lightconeBank } from './databank/lightcone'
import { relicBank } from './databank/relics'

export const slashcommand = new SlashCommandBuilder()
  .setName('databank')
  .setDescription('Star Rail databank')
  .addSubcommand((s) =>
    s
      .setName('char')
      .setDescription('Characters')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Character name')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption((o) =>
        o.setName('skill').setDescription('Skill name').setAutocomplete(true)
      )
  )
  .addSubcommand((s) =>
    s
      .setName('lightcone')
      .setDescription('Light Cones')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Light Cone name')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName('superimposition')
          .setDescription('Superimposition level (1-5)')
          .addChoices(
            { name: 'Superimposition 1', value: '0' },
            { name: 'Superimposition 2', value: '1' },
            { name: 'Superimposition 3', value: '2' },
            { name: 'Superimposition 4', value: '3' },
            { name: 'Superimposition 5', value: '4' }
          )
      )
  )
  .addSubcommand((s) =>
    s
      .setName('relic')
      .setDescription('Relics')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Relic set name')
          .setAutocomplete(true)
          .setRequired(true)
      )
  )

//requiring all the data because imports dont work
//TODO: use generated imports instead of require
const databankPath = path.join(
  cwd,
  '/libs/sr/dm-localization/assets/locales/en'
)
//get keys
//TODO: fix any typing
const databank: Record<string, any> = {
  key: {
    char: require(path.join(databankPath, '/charNames_gen.json')),
    lightcone: require(path.join(databankPath, '/lightConeNames_gen.json')),
    relic: require(path.join(databankPath, '/relicNames_gen.json')),
  },
  char: {},
  lightcone: {},
  relic: {},
}
//traveler data
for (const name in databank.key.char) {
  if (name.match(/Trailblazer/)) delete databank.key.char[name]
}
databank.key.char.TrailblazerPhysicalF = 'Trailblazer (Destruction)'
databank.key.char.TrailblazerFireF = 'Trailblazer (Preservation)'
// TODO: databank['key']['char']['TrailblazerImaginaryF'] = 'Trailblazer (Harmony)'
//get all the data from keys
for (const category in databank.key) {
  for (const name in databank.key[category]) {
    const itempath =
      category === 'lightcone'
        ? path.join(databankPath, `/lightCone_${name}_gen.json`)
        : path.join(databankPath, `/${category}_${name}_gen.json`)
    if (fs.existsSync(itempath)) databank[category][name] = require(itempath)
  }
}
export { databank }
export const skillsList = {
  n: { name: 'Basic Attack', value: 'n' },
  e: { name: 'Skill', value: 'e' },
  u: { name: 'Ultimate', value: 'u' },
  t: { name: 'Technique', value: 't' },
  o: { name: 'Overworld', value: 'o' },
  c: { name: 'Eidolons', value: 'c' },
}

//clean tags from input
//discord has no colored text, so just bold everything instead
export function clean(s: string) {
  //keep italic tags
  s = s.replaceAll(/(<\/?i>)+/g, '*')
  //turn rest into bold
  s = s.replaceAll(/(<\/?\w+>)+/g, '**')
  //ignore <br/> tags
  s = s.replaceAll(/<\w+\/>/g, '')
  //remove extra whitespace
  return s.trim()
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const focus = interaction.options.getFocused(true)
  let reply: ApplicationCommandOptionChoiceData[] = []

  //character/weapon/artifact name autocomplete
  //TODO: better search
  if (focus.name === 'name') {
    const text = focus.value.toLowerCase()
    reply = Object.keys(databank.key[subcommand])
      .filter((e) => e.toLocaleLowerCase().includes(text))
      .slice(0, 25)
      .map((e) => {
        return { name: databank.key[subcommand][e], value: e }
      })
  }

  //character talent suggestions
  if (focus.name === 'skill') {
    const skill = focus.value.toLowerCase()
    //direct reference
    if (skill in skillsList)
      reply = [skillsList[skill as keyof typeof skillsList]]
    //ascension/exploration passives
    else if (skill.match(/a\d?/))
      reply = [{ name: `Trace ${skill[1]}`, value: `t${skill[1]}` }]
    //constellations
    else if (skill.match(/c[123456]?/))
      reply = [{ name: `Eidolon ${skill[1]}`, value: `c${skill[1]}` }]
    //autocomplete
    else {
      reply = Object.values(skillsList).filter((e) => e.name.includes(skill))
    }
  }
  interaction.respond(reply)
}

export function databankMessage(subcommand: string, id: string, arg: string) {
  const name = databank.key[subcommand][id]
  const data = databank[subcommand][id]

  //handle invalid names
  if (!(id in databank[subcommand])) throw `Invalid ${subcommand} name.`
  //character archive
  if (subcommand === 'char') {
    return charBank(id as CharacterGenderedKey, name, data, arg)
  }
  //weapons archive
  if (subcommand === 'lightcone') {
    return lightconeBank(id as LightConeKey, name, data, arg)
  }
  //artifacts archive
  if (subcommand === 'relic') {
    return relicBank(id as RelicSetKey, name, data)
  }throw 'Invalid selection'
}

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const id = interaction.options.getString('name', true)

  let arg = ''
  if (subcommand === 'char')
    arg = interaction.options.getString('skill', false) ?? 'n'
  if (subcommand === 'lightcone')
    arg = interaction.options.getString('superimposition', false) ?? ''

  try {
    interaction.reply(databankMessage(subcommand, id, arg))
  } catch (e) {
    error(interaction, e)
  }
}

export async function selectmenu(
  interaction: StringSelectMenuInteraction,
  args: string[]
) {
  const subcommand = args[1]
  const id = args[2]
  const arg = interaction.values[0]

  try {
    interaction.update(databankMessage(subcommand, id, arg))
  } catch (e) {
    error(interaction, e)
  }
}

export async function reaction(_reaction: MessageReaction, _arg: string[]) {
  return
}
