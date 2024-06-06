
import type { ChatInputCommandInteraction} from "discord.js";

export function error(interaction : ChatInputCommandInteraction, e : any, ephemeral = true) {
    if (!(typeof e === 'string')) {
        if ('rawError' in e) e = e.rawError;
        e = '```json\n' + JSON.stringify(e, Object.getOwnPropertyNames(e)).slice(0,1990) + '```';
    }
    return interaction.reply({content: e.slice(0,2000), ephemeral: ephemeral});
}
