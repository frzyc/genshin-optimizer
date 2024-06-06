/* eslint-disable @typescript-eslint/no-var-requires */
import { EmbedBuilder } from '@discordjs/builders'
import type {
  ArtifactSetKey,
  CharacterKey,
  ElementKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
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

function clean(s: string) {
  s = s.replaceAll(/(<\/?\w+>)+/g, '**')
  s = s.replaceAll(/<\w+\/>/g, '')
  return s
}

const cwd = process.env['NX_WORKSPACE_ROOT'] ?? process.cwd()
const allStat_gen = require(path.join(
  cwd,
  '/libs/gi/stats/src/allStat_gen.json'
))
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
const archivepath = path.join(cwd, '/libs/gi/dm-localization/assets/locales/en')
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
for (const category in archive['key']) {
  for (const name in archive['key'][category]) {
    const itempath = path.join(archivepath, `/${category}_${name}_gen.json`)
    if (fs.existsSync(itempath)) archive[category][name] = require(itempath)
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const focus = interaction.options.getFocused(true)
  let reply: ApplicationCommandOptionChoiceData[] = []

  if (focus.name === 'name') {
    const text = focus.value.toLowerCase()
    const results = Object.keys(archive['key'][subcommand]).filter(
      (e: string) => e.toLocaleLowerCase().includes(text)
    )
    reply = results.slice(0, 25).map((e: string) => {
      return { name: archive['key'][subcommand][e], value: e }
    })
  }

  if (focus.name === 'talent') {
    reply = [
      { name: 'Character Profile', value: '' },
      { name: 'Normal/Charged/Plunging Attack', value: 'n' },
      { name: 'Elemental Skill', value: 'e' },
      { name: 'Elemental Burst', value: 'q' },
      { name: 'Ascension Passives', value: 'a' },
      { name: 'Constellations', value: 'c' },
    ]
    const talent = focus.value
    if (talent === 'n') reply = [reply[1]]
    else if (talent === 'e') reply = [reply[2]]
    else if (talent === 'q') reply = [reply[3]]
    else if (talent === 'a') reply = [reply[4]]
    else if (talent === 'c') reply = [reply[5]]
    else if (talent.match(/a[123]?/))
      reply = [{ name: `Passive ${talent[1]}`, value: `a${talent[1]}` }]
    else if (talent.match(/c[123456]?/))
      reply = [{ name: `Constellation ${talent[1]}`, value: `c${talent[1]}` }]
    else {
      reply = reply.filter((e) => e.name.includes(talent))
    }
  }

  interaction.respond(reply)
}

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand()
  const name = interaction.options.getString('name', true)

  const data = archive[subcommand][name]
  const embed = new EmbedBuilder()
  let text = ''

  if (subcommand === 'char') {
    const char = name as CharacterKey
    if (!allCharacterKeys.includes(char))
      return error(interaction, 'Invalid character name.')
    const element = allStat_gen.char.data[char].ele as ElementKey
    embed.setColor(colors.element[element])
    const talent = interaction.options.getString('talent', false) ?? ''
    if (talent === '') {
      embed
        .setTitle(data.name)
        .setDescription(clean(`> ${data.title}\n\n${data.description}`))
    } else if (talent === 'n') {
      embed
        .setAuthor({ name: data.name })
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
      embed
        .setAuthor({ name: data.name })
        .setTitle(data.skill.name)
        .setDescription(
          clean(Object.values(data.skills.description).flat().join('\n'))
        )
    } else if (talent === 'q') {
      embed
        .setAuthor({ name: data.name })
        .setTitle(data.burst.name)
        .setDescription(
          clean(Object.values(data.burst.description).flat().join('\n'))
        )
    } else if (talent.match(/a[123]?/)) {
      let arr = ['1', '2', '3']
      if (talent.length > 1) arr = [talent[1]]
      for (const n of arr) {
        const e = data[`passive${n}`]
        text +=
          `**${e.name}** \n` +
          Object.values(e.description).flat().join('\n') +
          '\n\n'
      }
      embed.setAuthor({ name: data.name }).setDescription(clean(text))
    } else if (talent.match(/c[123456]?/)) {
      let arr = ['1', '2', '3', '4', '5', '6']
      if (talent.length > 1) arr = [talent[1]]
      for (const n of arr) {
        const e = data[`constellation${n}`]
        text +=
          `**${n}. ${e.name}** ` +
          Object.values(e.description).flat().join('\n') +
          '\n\n'
      }
      embed
        .setAuthor({ name: data.name })
        .setTitle(data.constellationName)
        .setDescription(clean(text))
    } else error(interaction, 'Invalid talent name.')
  } else if (subcommand === 'weapon') {
    const weapon = name as WeaponKey
    if (!allWeaponKeys.includes(weapon))
      return error(interaction, 'Invalid weapon name.')
    const rarity = allStat_gen.weapon.data[weapon].rarity
    const refine = (interaction.options.getInteger('refine', false) ?? 1) - 1
    embed
      .setTitle(data.name)
      .setDescription(
        clean(
          Object.values(data.description).join('\n') +
            `\n\n**${data.passiveName}:** ` +
            Object.values(data.passiveDescription[refine.toString()]).join('\n')
        )
      )
      .setColor(colors.rarity[rarity - 1])
  } else if (subcommand === 'artifact') {
    const set = name as ArtifactSetKey
    if (!allArtifactSetKeys.includes(set))
      return error(interaction, 'Invalid artifact set name.')
    const rarities = allStat_gen.art.data[set].rarities
    const rarity = rarities[rarities.length - 1]
    embed
      .setTitle(data.setName)
      .setDescription(
        clean(
          `**2-Pieces:** ${data.setEffects['2']}\n` +
            `**4-Pieces:** ${data.setEffects['4']}`
        )
      )
      .setColor(colors.rarity[rarity - 1])
  }

  return interaction.reply({ content: '', embeds: [embed] })
}
