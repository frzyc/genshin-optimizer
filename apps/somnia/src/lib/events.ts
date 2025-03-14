import type {
  Client,
  Interaction,
  MessageReaction,
  MessageReactionEventDetails,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js'
import { Commands } from '../main'
import perms from './permissions'

export async function ready(client: Client) {
  const name = client.user?.username
  console.log(`${name} ready`)
}

export async function interactionCreate(interaction: Interaction) {
  let args: string[]
  try {
    if (interaction.isChatInputCommand()) {
      const command = Commands.get(interaction.commandName)
      if (!command)
        return console.error(`No command ${interaction.commandName}`)
      await command.run(interaction)
    } else if (interaction.isAutocomplete()) {
      const command = Commands.get(interaction.commandName)
      if (!command)
        return console.error(`No autocomplete ${interaction.commandName}`)
      await command.autocomplete(interaction)
    } else if (interaction.isButton()) {
      args = interaction.customId.split(' ')
      const command = Commands.get(args[0])
      if (!command) return console.error(`No button ${interaction.customId}`)
      await command.button(interaction, args)
    } else if (interaction.isStringSelectMenu()) {
      args = interaction.customId.split(' ')
      const command = Commands.get(args[0])
      if (!command)
        return console.error(`No selectmenu ${interaction.customId}`)
      await command.selectmenu(interaction, args)
    }
  } catch (e) {
    console.error(e)
  }
}

export async function messageReactionAdd(
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser,
  _details: MessageReactionEventDetails,
) {
  if (reaction.partial) {
    try {
      reaction = await reaction.fetch()
    } catch (error) {
      console.error(error)
      return
    }
  }
  //ignore other bot reactions
  if (perms.bot(user)) return
  const message = reaction.message
  //only act on messages from self
  if (!perms.self(message)) return

  const arg = message.interaction?.commandName.split(' ')
  if (arg) {
    const command = Commands.get(arg[0])
    if ('reaction' in command) command.reaction(reaction, user, arg)
  }
}
