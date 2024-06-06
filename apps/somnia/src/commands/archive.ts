/* eslint-disable @typescript-eslint/no-var-requires */
import { EmbedBuilder } from '@discordjs/builders'
import type { ElementKey } from '@genshin-optimizer/gi/consts'
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'
import * as process from 'process'
import { error } from '../lib/error'

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

const cwd = process.env['NX_WORKSPACE_ROOT'] ?? process.cwd()
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
  archive['key']['char']['TravelerAnemoF'] = 'Traveler (Anemo)'
  archive['key']['char']['TravelerGeoF'] = 'Traveler (Geo)'
  archive['key']['char']['TravelerElectroF'] = 'Traveler (Electro)'
  archive['key']['char']['TravelerDendroF'] = 'Traveler (Dendro)'
}
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
    physical: 0xaaaaaa,
    anemo: 0x61dbbb,
    geo: 0xf8ba4e,
    electro: 0xb25dcd,
    hydro: 0x5680ff,
    pyro: 0xff3c32,
    cryo: 0x77a2e6,
    dendro: 0xa5c83b,
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
    const talent = focus.value
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

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const id = interaction.options.getString('name', true)
  const name = archive['key'][subcommand][id]

  const data = archive[subcommand][id]
  const embed = new EmbedBuilder()
  let text = ''

  //handle invalid names
  if (!(id in archive[subcommand]))
    return error(interaction, `Invalid ${subcommand} name.`)

  if (subcommand === 'char') {
    //character archive
    let element = 'physical'
    if (!id.match(/Traveler/)) element = allStat_gen.char.data[id].ele
    //set element color
    embed.setColor(colors.element[element as ElementKey | 'physical'])
    //set contents
    const talent = interaction.options.getString('talent', false) ?? 'p'
    if (talent === 'p') {
      //character profile
      if (data.title?.length > 1) text = `> ${data.title}\n\n`
      embed
        .setTitle(archive['key']['char'][id])
        .setDescription(clean(`${data.description}`))
    } else if (talent === 'n') {
      //normal/charged/plunging attacks
      embed
        .setAuthor({ name: name })
        .setTitle(data.auto.name)
        .setDescription(
          clean(
            Object.values(data.auto.fields.normal).join('\n') +
              '\n\n' +
              Object.values(data.auto.fields.charged).join('\n') +
              '\n\n' +
              Object.values(data.auto.fields.plunging).join('\n') +
              '\n\n'
          )
        )
    } else if (talent === 'e') {
      //elemental skill
      embed
        .setAuthor({ name: name })
        .setTitle(data.skill.name)
        .setDescription(
          clean(Object.values(data.skills.description).flat().join('\n'))
        )
    } else if (talent === 'q') {
      //elemental burst
      embed
        .setAuthor({ name: name })
        .setTitle(data.burst.name)
        .setDescription(
          clean(Object.values(data.burst.description).flat().join('\n'))
        )
    } else if (talent.match(/a\d?/)) {
      //passives
      //list all passives
      let list = Object.keys(data).filter((e) => e.startsWith('passive'))
      //input to select a passive
      if (talent.length > 1) {
        if (talent[1] === '1') list = ['passive1']
        else if (talent[1] === '4') list = ['passive2']
        else list = list.slice(2)
      }
      //make embed
      for (const passive of list) {
        const e = data[passive]
        //ascension 1
        if (passive === 'passive1') text += `**${e.name}** (A1)\n`
        //ascension 4
        else if (passive === 'passive2') text += `**${e.name}** (A4)\n`
        //innate passives
        else text += `**${e.name}** \n`
        text += Object.values(e.description).flat().join('\n') + '\n\n'
      }
      embed.setAuthor({ name: name }).setDescription(clean(text))
    } else if (talent.match(/c[123456]?/)) {
      //constellations
      let arr = ['1', '2', '3', '4', '5', '6']
      if (talent.length > 1) arr = [talent[1]]
      for (const n of arr) {
        const e = data[`constellation${n}`]
        text +=
          `**${n}. ${e.name}** ` +
          Object.values(e.description).flat().join('\n') +
          '\n\n'
      }
      //make embed
      if (data.constellationName) embed.setTitle(data.constellationName)
      embed.setAuthor({ name: name }).setDescription(clean(text))
    } else error(interaction, 'Invalid talent name.')
  }

  else if (subcommand === 'weapon') {
    //weapons archive
    //weapon rarity color
    const rarity = allStat_gen.weapon.data[id].rarity
    const refine = (interaction.options.getInteger('refine', false) ?? 1) - 1
    //set content
    embed
      .setTitle(`${data.name} (R${refine + 1})`)
      .setColor(colors.rarity[rarity - 1])
      .setDescription(
        clean(
          Object.values(data.description).join('\n') +
            `\n\n**${data.passiveName}:** ` +
            Object.values(data.passiveDescription[refine.toString()]).join('\n')
        )
      )
  }

  else if (subcommand === 'artifact') {
    //artifacts archive
    //artifact rarity color
    const rarities = allStat_gen.art.data[id].rarities
    const rarity = rarities[rarities.length - 1]
    //set content
    embed
      .setTitle(data.setName)
      .setColor(colors.rarity[rarity - 1])
      .setDescription(
        clean(
          `**2-Pieces:** ${data.setEffects['2']}\n` +
            `**4-Pieces:** ${data.setEffects['4']}`
        )
      )
  }
  //send embed
  return interaction.reply({ content: '', embeds: [embed] })
}
