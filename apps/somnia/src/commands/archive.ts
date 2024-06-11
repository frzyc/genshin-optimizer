/* eslint-disable @typescript-eslint/no-var-requires */
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Interaction,
  StringSelectMenuInteraction,
} from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'

import { error } from '../lib/message'
import { cwd } from '../main'

import { artifactarchive } from './archive/artifact'
import { chararchive } from './archive/char'
import { weaponarchive } from './archive/weapon'

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
      .addIntegerOption((o) =>
        o
          .setName('refine')
          .setDescription('Refinement level (1-5)')
          .setMinValue(1)
          .setMaxValue(5)
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

const allStat_gen = require(path.join(
  cwd,
  '/libs/gi/stats/src/allStat_gen.json'
))
//requiring all the data because imports dont work
const archivepath = path.join(cwd, '/libs/gi/dm-localization/assets/locales/en')
//get keys
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
archive['key']['char']['TravelerAnemoF'] = 'Traveler (Anemo)'
archive['key']['char']['TravelerGeoF'] = 'Traveler (Geo)'
archive['key']['char']['TravelerElectroF'] = 'Traveler (Electro)'
archive['key']['char']['TravelerDendroF'] = 'Traveler (Dendro)'
archive['key']['char']['TravelerHydroF'] = 'Traveler (Hydro)'
//get all the data from keys
for (const category in archive['key']) {
  for (const name in archive['key'][category]) {
    const itempath = path.join(archivepath, `/${category}_${name}_gen.json`)
    if (fs.existsSync(itempath)) archive[category][name] = require(itempath)
  }
}

const colors = {
  rarity: [0x818486, 0x5a977a, 0x5987ad, 0x9470bb, 0xc87c24],
  element: {
    none: {
      img: 'https://api.ambr.top/assets/UI/UI_Icon_Item_Temp.png',
      color: 0xaaaaaa,
    },
    anemo: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Wind.png',
      color: 0x61dbbb,
    },
    geo: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Rock.png',
      color: 0xf8ba4e,
    },
    electro: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Electric.png',
      color: 0xb25dcd,
    },
    hydro: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Water.png',
      color: 0x5680ff,
    },
    pyro: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Fire.png',
      color: 0xff3c32,
    },
    cryo: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Ice.png',
      color: 0x77a2e6,
    },
    dendro: {
      img: 'https://api.ambr.top/assets/UI/UI_Buff_Element_Grass.png',
      color: 0xa5c83b,
    },
  },
}
const talentlist = {
  profile: { name: 'Character Profile', value: '' },
  n: { name: 'Normal/Charged/Plunging Attack', value: 'n' },
  e: { name: 'Elemental Skill', value: 'e' },
  q: { name: 'Elemental Burst', value: 'q' },
  a: { name: 'Ascension Passives', value: 'a' },
  c: { name: 'Constellations', value: 'c' },
}

//clean tags from input
//discord has no colored text, so just bold everything instead
function clean(s: string) {
  //keep italic tags
  s = s.replaceAll(/(<\/?i>)+/g, '*')
  //turn rest into bold
  s = s.replaceAll(/(<\/?\w+>)+/g, '**')
  //ignore <br/> tags
  s = s.replaceAll(/<\w+\/>/g, '')
  //remove extra whitespace
  return s.trim()
}

export { allStat_gen, archive, clean, colors, talentlist }
export type archiveargs = {
  talent: string
  refine: number | null
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const focus = interaction.options.getFocused(true)
  let reply: ApplicationCommandOptionChoiceData[] = []

  //character/weapon/artifact name autocomplete
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

export function archivemsg(
  interaction: Interaction,
  subcommand: string,
  id: string,
  args: archiveargs
) {
  const name = archive['key'][subcommand][id]
  const data = archive[subcommand][id]

  //handle invalid names
  if (!(id in archive[subcommand])) throw `Invalid ${subcommand} name.`
  //character archive
  if (subcommand === 'char') {
    return chararchive(interaction, id, name, data, args)
  }
  //weapons archive
  else if (subcommand === 'weapon') {
    return weaponarchive(interaction, id, name, data, args)
  }
  //artifacts archive
  else if (subcommand === 'artifact') {
    return artifactarchive(interaction, id, name, data)
  } else throw 'Invalid selection'
}

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const id = interaction.options.getString('name', true)

  const talent = interaction.options.getString('talent', false) ?? 'p'
  const refine = interaction.options.getInteger('refine', false)
  const args = {
    talent: talent.toLowerCase(),
    refine: refine,
  }

  try {
    interaction.reply(archivemsg(interaction, subcommand, id, args))
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
  const a = {
    talent: args[3],
    refine: parseInt(interaction.values[0]),
  }

  try {
    interaction.update(archivemsg(interaction, subcommand, id, a))
  } catch (e) {
    error(interaction, e)
  }
}
