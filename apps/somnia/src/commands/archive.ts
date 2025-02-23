import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageReaction,
  PartialUser,
  StringSelectMenuInteraction,
  User,
} from 'discord.js'
import {
  ApplicationIntegrationType,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js'

import { error } from '../lib/message'

import {
  allArtifactSetKeys,
  allCharacterSheetKeys,
  allWeaponKeys,
  CharacterSheetKey,
  type ArtifactSetKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { i18nInstance } from '@genshin-optimizer/gi/i18n-node'
import permissions from '../lib/permissions'
import { artifactArchive } from './archive/artifact'
import { charArchive, charReaction } from './archive/char'
import { weaponArchive } from './archive/weapon'

export const slashcommand = new SlashCommandBuilder()
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ])
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
  .addSubcommand(
    (s) =>
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
  char: allCharacterSheetKeys,
  weapon: allWeaponKeys,
  artifact: allArtifactSetKeys,
}
function translate(
  namespace: string,
  key: string,
  lang = 'en',
  object = false,
  options?: { [key: string]: any }
): any {
  return i18nInstance.t(`${namespace}:${key}`, {
    returnObjects: object,
    lng: lang,
    ...options,
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
  //trim whitespace
  s = s.trim()
  //italics become small
  s = s.replace(/(<i>[\s\S]*)\n([\s\S]*<\/i>)/g, (m) =>
    m.replace(/\n/g, '\n-# ')
  )
  s = s.replaceAll(/(<i>)+/g, '*-# ')
  s = s.replaceAll(/(<\/i>)+/g, '*')
  //turn rest into bold
  s = s.replaceAll(/(<\/?\w+>)+/g, '**')
  //ignore <br/> tags
  s = s.replaceAll(/<\w+\/>/g, '')
  //remove extra whitespace
  return s
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
  arg: string,
  lang: string
) {
  //character archive
  if (subcommand === 'char') {
    if (!archive[subcommand].includes(id as CharacterSheetKey))
      throw 'Invalid character name'
    return await charArchive(id as CharacterSheetKey, arg, lang)
  }
  //weapons archive
  else if (subcommand === 'weapon') {
    if (!archive[subcommand].includes(id as WeaponKey))
      throw 'Invalid weapon name'
    return await weaponArchive(id as WeaponKey, arg, lang)
  }
  //artifacts archive
  else if (subcommand === 'artifact') {
    if (!archive[subcommand].includes(id as ArtifactSetKey))
      throw 'Invalid artifact name'
    return await artifactArchive(id as ArtifactSetKey, lang)
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
    interaction.reply(await archiveMessage(subcommand, id, arg, lang))
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
  //const oldarg = args[3]
  const lang = args[4]
  const arg = interaction.values[0]

  try {
    interaction.update(await archiveMessage(subcommand, id, arg, lang))
  } catch (e) {
    error(interaction, e)
  }
}

export async function reaction(
  reaction: MessageReaction,
  user: User | PartialUser,
  arg: string[]
) {
  if (
    reaction.emoji.name === '❌' &&
    permissions.sender(user, reaction.message.interactionMetadata)
  )
    return reaction.message.delete()

  if (arg[1] == 'char') return charReaction(reaction)
}
