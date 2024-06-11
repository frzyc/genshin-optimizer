import type { Client, Interaction } from 'discord.js'
import { Commands } from '../main'

export async function ready(client: Client) {
  console.log(`ready`)
}

export async function interactionCreate(interaction: Interaction) {
  let args: string[]
  try {
    if (interaction.isChatInputCommand()) {
      const command = Commands.get(interaction.commandName)
      if (!command)
        return console.error(`Command ${interaction.commandName} not found.`)
      await command.run(interaction)
    } else if (interaction.isAutocomplete()) {
      const command = Commands.get(interaction.commandName)
      if (!command)
        return console.error(
          `Autocomplete ${interaction.commandName} not found.`
        )
      await command.autocomplete(interaction)
    } else if (interaction.isButton()) {
      args = interaction.customId.split(' ')
      const command = Commands.get(args[0])
      if (!command)
        return console.error(`Button ${interaction.customId} not found.`)
      await command.button(interaction, args)
    } else if (interaction.isStringSelectMenu()) {
      args = interaction.customId.split(' ')
      const command = Commands.get(args[0])
      if (!command)
        return console.error(`Selectmenu ${interaction.customId} not found.`)
      await command.selectmenu(interaction, args)
    }
  } catch (e) {
    console.error(e)
  }
}
