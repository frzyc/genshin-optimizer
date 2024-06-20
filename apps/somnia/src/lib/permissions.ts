import type {
  ChatInputCommandInteraction,
  Message,
  PermissionsBitField,
} from 'discord.js'
import { ownerid } from '../config.json'

export default {
  //true if interaction author has permissions
  has(interaction: ChatInputCommandInteraction, arr: PermissionsBitField) {
    if ((interaction.member?.permissions as PermissionsBitField).has(arr))
      return true
    interaction.reply({
      content: `You do not have permission to use this command.`,
      ephemeral: true,
    })
    return false
  },

  //true if interaction author is owner
  owner(interaction: ChatInputCommandInteraction) {
    if (interaction.user?.id === ownerid) return true
    interaction.reply({
      content: `You do not have permission to use this command.`,
      ephemeral: true,
    })
    return false
  },

  //true if message author is bot
  bot(message: Message) {
    return message.author?.bot
  },
}
