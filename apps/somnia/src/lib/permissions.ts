import { readFileSync } from 'fs'
import type {
  ChatInputCommandInteraction,
  Message,
  MessageInteractionMetadata,
  PartialMessage,
  PartialUser,
  PermissionsBitField,
  User,
} from 'discord.js'
// So we can modify config.json after building, thereby not exposing credentials in our build drop
const { clientid } = JSON.parse(
  readFileSync('./apps/somnia/src/config.json').toString()
)

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
  sender(
    user: User | PartialUser,
    interaction: MessageInteractionMetadata | null
  ) {
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
