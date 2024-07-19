import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageReaction,
  StringSelectMenuInteraction,
} from 'discord.js'
import { SlashCommandBuilder } from 'discord.js'

import { error } from '../lib/message'

import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
  type ArtifactSetKey,
  type CharacterKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import { artifactArchive } from './archive/artifact'
import { charArchive } from './archive/char'
import { weaponArchive } from './archive/weapon'

const languageCodeList = [
  'chs',
  'cht',
  'de',
  'en',
  'es',
  'fr',
  'id',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'th',
  'tr',
  'vi',
]

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
      //.addStringOption((o) =>
      //  o
      //    .setName('lang')
      //    .setDescription('Language')
      //    .addChoices(
      //      languageCodeList.map((e) => {
      //        return { name: e, value: e }
      //      })
      //    )
      //)
  )

type ArchiveSubcommand = 'char' | 'weapon' | 'artifact'
const archive = {
  char: allCharacterKeys,
  weapon: allWeaponKeys,
  artifact: allArtifactSetKeys,
}
function translate(
  namespace: string,
  key: string,
  lang = 'en',
  object = false
): any {
  return i18nInstance.t(`${namespace}:${key}`, {
    returnObjects: object,
    lng: lang,
  })
}
export { translate }
export type { ArchiveSubcommand }
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
  s = s.replaceAll(/(<i>)+/g, '-# *')
  s = s.replaceAll(/(<\/i>)+/g, '*')
  //turn rest into bold
  s = s.replaceAll(/(<\/?\w+>)+/g, '**')
  //ignore <br/> tags
  s = s.replaceAll(/<\w+\/>/g, '')
  //remove extra whitespace
  return s.trim()
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const subcommand = interaction.options.getSubcommand() as ArchiveSubcommand
  const focus = interaction.options.getFocused(true)
  const lang = interaction.options.getString('lang') ?? 'en'
  let reply: ApplicationCommandOptionChoiceData[] = []

  //character/weapon/artifact name autocomplete
  //TODO: better search
  if (focus.name === 'name') {
    const text = focus.value.toLowerCase()
    reply = archive[subcommand]
      .filter((e) => e.toLocaleLowerCase().includes(text))
      .slice(0, 25)
      .map((e) => {
        return { name: translate(`${subcommand}Names_gen`, e, lang), value: e }
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

async function archiveMessage(
  subcommand: ArchiveSubcommand,
  id: string,
  lang: string,
  arg: string
) {
  //character archive
  if (subcommand === 'char') {
    if (!archive[subcommand].includes(id as CharacterKey))
      throw 'invalid character name'
    return await charArchive(id as CharacterKey, lang, arg)
  }
  //weapons archive
  else if (subcommand === 'weapon') {
    if (!archive[subcommand].includes(id as WeaponKey))
      throw 'invalid weapon name'
    return await weaponArchive(id as WeaponKey, lang, arg)
  }
  //artifacts archive
  else if (subcommand === 'artifact') {
    if (!archive[subcommand].includes(id as ArtifactSetKey))
      throw 'invalid artifact name'
    return artifactArchive(id as ArtifactSetKey, lang)
  } else throw 'Invalid selection'
}

export async function run(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand() as ArchiveSubcommand
  const id = interaction.options.getString('name', true)
  const lang = interaction.options.getString('lang') ?? 'en'

  let arg = ''
  if (subcommand === 'char')
    arg = interaction.options.getString('talent', false) ?? 'p'
  if (subcommand === 'weapon')
    arg = interaction.options.getString('refine', false) ?? ''

  try {
    interaction.reply(await archiveMessage(subcommand, id, lang, arg))
  } catch (e) {
    error(interaction, e)
  }
}

export async function selectmenu(
  interaction: StringSelectMenuInteraction,
  args: string[]
) {
  const subcommand = args[1] as ArchiveSubcommand
  const id = args[2]
  const lang = args[3]
  const arg = interaction.values[0]

  try {
    interaction.update(await archiveMessage(subcommand, id, lang, arg))
  } catch (e) {
    error(interaction, e)
  }
}

export async function reaction(reaction: MessageReaction, arg: string[]) {
  if (arg[1] != 'char') return
  let message = reaction.message
  if (message.partial) message = await message.fetch()
  const embed = message.embeds[0].toJSON()
  if (!embed) return

  const emoji = reaction.emoji.name

  //reactions to change traveler gender
  if (
    embed.author?.name.includes('Traveler') &&
    embed.author.icon_url &&
    embed.thumbnail
  ) {
    let gender = ''
    //determine gender
    if (emoji === '🏳️‍⚧️')
      gender =
        embed.author.icon_url?.includes('Girl') ||
        embed.thumbnail?.url.includes('Girl')
          ? 'M'
          : 'F'
    else if (emoji === '♀️') gender = 'F'
    else if (emoji === '♂️') gender = 'M'
    //replace gender
    if (gender === 'F') {
      embed.author.icon_url = embed.author.icon_url.replace('Boy', 'Girl')
      embed.thumbnail.url = embed.thumbnail.url.replace('Boy', 'Girl')
    } else if (gender === 'M') {
      embed.author.icon_url = embed.author.icon_url.replace('Girl', 'Boy')
      embed.thumbnail.url = embed.thumbnail.url.replace('Girl', 'Boy')
    }
  }

  //edit message
  try {
    await message.edit({ embeds: [embed] })
  } catch (e) {
    console.log(e)
  }
  return
}
