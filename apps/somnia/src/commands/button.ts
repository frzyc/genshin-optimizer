import type { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js'

export const slashcommand = new SlashCommandBuilder()
  .setName('button')
  .setDescription('Click Me!')

let clicks = 0

function getbutton() {
  const button = new ButtonBuilder()
    .setCustomId(`button ${clicks}`)
    .setLabel(`${clicks}`)
    .setStyle(ButtonStyle.Primary)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
  return { components: [row] }
}

export async function run(interaction: ChatInputCommandInteraction) {
  interaction.reply(getbutton())
  return
}

export async function button(interaction: ButtonInteraction, args: string[]) {
  const newclicks = Number.parseInt(args[1])
  if (newclicks && !Number.isNaN(newclicks)) clicks = Math.max(newclicks, clicks)
  clicks++
  interaction.update(getbutton())
  return
}
