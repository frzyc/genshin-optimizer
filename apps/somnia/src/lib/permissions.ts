import type {
  ChatInputCommandInteraction,
  Message,
  MessageInteraction,
  PartialMessage,
  PartialUser,
  PermissionsBitField,
  User,
} from 'discord.js'
import { clientid } from '../config.json'

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

  //true if user triggered the original interaction
  sender(user: User | PartialUser, interaction: MessageInteraction | null) {
    if (interaction) return user.id === interaction.user.id
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
