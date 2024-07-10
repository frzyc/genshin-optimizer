import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
} from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'

import { error } from '../lib/message'
import { cwd } from '../lib/util'

import type {
  ArtifactSetKey,
  CharacterKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { artifactArchive } from './archive/artifact'
import { charArchive } from './archive/char'
import { weaponArchive } from './archive/weapon'

export const slashcommand = new SlashCommandBuilder()
  .setName('archive')
  .setDescription('Genshin Archive')
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
        o.setName('talent').setDescription('Talent name').setAutocomplete(true)
      )
  )
  .addSubcommand((s) =>
    s
      .setName('weapon')
      .setDescription('Weapons')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Weapon name')
          .setAutocomplete(true)
          .setRequired(true)
      )
      .addStringOption((o) =>
        o
          .setName('refine')
          .setDescription('Refinement level (1-5)')
          .addChoices(
            { name: 'Refinement 1', value: '0' },
            { name: 'Refinement 2', value: '1' },
            { name: 'Refinement 3', value: '2' },
            { name: 'Refinement 4', value: '3' },
            { name: 'Refinement 5', value: '4' }
          )
      )
  )
  .addSubcommand((s) =>
    s
      .setName('artifact')
      .setDescription('Artifacts')
      .addStringOption((o) =>
        o
          .setName('name')
          .setDescription('Artifact set name')
          .setAutocomplete(true)
          .setRequired(true)
      )
  )

//requiring all the data because imports dont work
//TODO: use generated imports instead of require
const archivepath = path.join(cwd, '/libs/gi/dm-localization/assets/locales/en')
//get keys
//TODO: fix any typing
const archive: Record<string, any> = {
  key: {
    char: require(path.join(archivepath, '/charNames_gen.json')),
    weapon: require(path.join(archivepath, '/weaponNames_gen.json')),
    artifact: require(path.join(archivepath, '/artifactNames_gen.json')),
  },
  char: {},
  weapon: {},
  artifact: {},
}
//traveler data
for (const name in archive['key']['char']) {
  if (name.match(/Traveler/)) delete archive['key']['char'][name]
}
archive['key']['char']['TravelerAnemo'] = 'Traveler (Anemo)'
archive['key']['char']['TravelerGeo'] = 'Traveler (Geo)'
archive['key']['char']['TravelerElectro'] = 'Traveler (Electro)'
archive['key']['char']['TravelerDendro'] = 'Traveler (Dendro)'
archive['key']['char']['TravelerHydro'] = 'Traveler (Hydro)'
//get all the data from keys
for (const category in archive['key']) {
  for (const name in archive['key'][category]) {
    let file = name
    //why does traveler have to be gendered smh
    if (category === 'char' && name.match(/Traveler/)) file += 'F'
    const itempath = path.join(archivepath, `/${category}_${file}_gen.json`)
    if (fs.existsSync(itempath)) archive[category][name] = require(itempath)
  }
}
export { archive }
export const talentlist = {
  p: { name: 'Character Profile', value: 'p' },
  n: { name: 'Normal/Charged/Plunging Attack', value: 'n' },
  e: { name: 'Elemental Skill', value: 'e' },
  q: { name: 'Elemental Burst', value: 'q' },
  a: { name: 'Ascension Passives', value: 'a' },
  c: { name: 'Constellations', value: 'c' },
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
    reply = Object.keys(archive['key'][subcommand])
      .filter((e) => e.toLocaleLowerCase().includes(text))
      .slice(0, 25)
      .map((e) => {
        return { name: archive['key'][subcommand][e], value: e }
      })
  }

  //character talent suggestions
  if (focus.name === 'talent') {
    const talent = focus.value.toLowerCase()
    //direct reference
    if (talent in talentlist)
      reply = [talentlist[talent as keyof typeof talentlist]]
    //ascension/exploration passives
    else if (talent.match(/a\d?/))
      reply = [{ name: `Passive ${talent[1]}`, value: `a${talent[1]}` }]
    //constellations
    else if (talent.match(/c[123456]?/))
      reply = [{ name: `Constellation ${talent[1]}`, value: `c${talent[1]}` }]
    //autocomplete
    else {
      reply = Object.values(talentlist).filter((e) => e.name.includes(talent))
    }
  }
  interaction.respond(reply)
}

export function archiveMessage(subcommand: string, id: string, arg: string) {
  const name = archive['key'][subcommand][id]
  const data = archive[subcommand][id]

  //handle invalid names
  if (!(id in archive[subcommand])) throw `Invalid ${subcommand} name.`
  //character archive
  if (subcommand === 'char') {
    return charArchive(id as CharacterKey, name, data, arg)
  }
  //weapons archive
  else if (subcommand === 'weapon') {
    return weaponArchive(id as WeaponKey, name, data, arg)
  }
  //artifacts archive
  else if (subcommand === 'artifact') {
    return artifactArchive(id as ArtifactSetKey, name, data)
  } else throw 'Invalid selection'
}

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const id = interaction.options.getString('name', true)

  let arg = ''
  if (subcommand === 'char')
    arg = interaction.options.getString('talent', false) ?? 'p'
  if (subcommand === 'weapon')
    arg = interaction.options.getString('refine', false) ?? ''

  try {
    interaction.reply(archiveMessage(subcommand, id, arg))
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
    interaction.update(archiveMessage(subcommand, id, arg))
  } catch (e) {
    error(interaction, e)
  }
}
