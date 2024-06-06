import type { Client, Interaction } from 'discord.js'
import { Commands } from '../main'

export async function ready(client: Client) {
  console.log(`ready`)
}

export async function interactionCreate(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    const command = Commands.get(interaction.commandName)
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }
    try {
      await command.run(interaction)
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`)
      console.error(error)
    }
  } else if (interaction.isAutocomplete()) {
    const command = Commands.get(interaction.commandName)
    if (!command) {
      console.error(
        `No autocomplete matching ${interaction.commandName} was found.`
      )
      return
    }
    try {
      await command.autocomplete(interaction)
    } catch (error) {
      console.error(error)
    }
  } else if (interaction.isButton()) {
    const command = Commands.get(interaction.customId.split('.')[0])
    if (!command) {
      console.error(`No button matching ${interaction.customId} was found.`)
      return
    }
    try {
      await command.button(interaction)
    } catch (error) {
      console.error(error)
    }
  }
}
