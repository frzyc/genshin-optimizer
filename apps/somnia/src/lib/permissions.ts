import type {
  ChatInputCommandInteraction,
  Message,
  PartialMessage,
  PartialUser,
  PermissionsBitField,
  User,
} from 'discord.js'
import { clientid, ownerid } from '../config.json'

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

  //true if user or message author is self
  self(x: Message | PartialMessage | User | PartialUser) {
    if ('author' in x) return x.author?.id === clientid
    if ('id' in x) return x.id === clientid
    return false
  },

  //true if user or message author is bot
  bot(x: Message | PartialMessage | User | PartialUser) {
    if ('bot' in x) return x.bot
    if ('author' in x) return x.author?.bot
    return false
  },
}
