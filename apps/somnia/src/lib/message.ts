import type { EmbedBuilder } from '@discordjs/builders'
import type {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  Interaction,
} from 'discord.js'

export async function send(
  interaction: ChatInputCommandInteraction,
  content: string,
  embed?: EmbedBuilder,
  components?: ActionRowBuilder,
  ephemeral = false
) {
  const msg: any = { content: content }
  if (embed) msg.embeds = [embed]
  if (components) msg.components = [components]
  if (ephemeral) msg.ephemeral = ephemeral
  return await interaction.reply(msg)
}

export function error(interaction: Interaction, e: any, ephemeral = true) {
  if (!(typeof e === 'string')) {
    if ('rawError' in e) e = e.rawError
    e =
      `\`\`\`json\n${JSON.stringify(e, Object.getOwnPropertyNames(e)).slice(0, 1990)}\`\`\``
  }
  if (!interaction.isAutocomplete())
    return interaction.reply({
      content: e.slice(0, 2000),
      ephemeral: ephemeral,
    })
  return
}
