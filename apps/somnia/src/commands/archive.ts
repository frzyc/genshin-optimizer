/* eslint-disable @typescript-eslint/no-var-requires */
import * as process from 'process'
import * as fs from 'fs';
import * as path from 'path';
import { EmbedBuilder } from '@discordjs/builders';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
//import { getCharStat, getWeaponStat, getArtSetStat } from '@genshin-optimizer/gi/stats'
//import { CharacterKey, WeaponKey, ArtifactSetKey, allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { error } from '../lib/error';

export const slashcommand = new SlashCommandBuilder()
.setName('archive')
.setDescription('Genshin Archive')
.addSubcommand(s => s
    .setName('char')
    .setDescription('Characters')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Character name')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption(o => o
        .setName('talent')
        .setDescription('Talent name')
        .setAutocomplete(true)
    )
)
.addSubcommand(s => s
    .setName('weapon')
    .setDescription('Weapons')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Weapon name')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addIntegerOption(o => o
        .setName('refine')
        .setDescription('Refinement level (1-5)')
        .setMinValue(1).setMaxValue(5)
    )
)
.addSubcommand(s => s
    .setName('artifact')
    .setDescription('Artifacts')
    .addStringOption(o => o
        .setName('name')
        .setDescription('Artifact set name')
        .setAutocomplete(true)
        .setRequired(true)
    )
)

function clean(s : string) {
    s = s.replaceAll(/(<\/?\w+>)+/g, '**');
    s = s.replaceAll(/<\w+\/>/g, '');
    return s;
}

const archivepath = path.join(process.env['NX_WORKSPACE_ROOT'] ?? process.cwd(), '/libs/gi/dm-localization/assets/locales/en');
const archive : Record<string, any> = {
    key: {
        char: require(path.join(archivepath, '/charNames_gen.json')),
        weapon: require(path.join(archivepath, '/weaponNames_gen.json')),
        artifact: require(path.join(archivepath, '/artifactNames_gen.json'))
    },
    char: {},
    weapon: {},
    artifact: {}
}
for (const category in archive['key']) {
    for (const name in archive['key'][category]) {
        const itempath = path.join(archivepath, `/${category}_${name}_gen.json`);
        if (fs.existsSync(itempath))
        archive[category][name] = require(itempath);
    }
}

export async function autocomplete(interaction : AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const focus = interaction.options.getFocused(true);
    let reply : ApplicationCommandOptionChoiceData[] = [];

    if (focus.name === 'name') {
        const text = focus.value.toLowerCase();
        const results = Object.keys(archive['key'][subcommand]).filter((e : string) => e.toLocaleLowerCase().includes(text));
        reply = results.slice(0,25).map((e : string) => {
            return {name:archive['key'][subcommand][e], value:e};
        });
    }

    if (focus.name === 'talent') {
        reply = [
            {name:'Character Profile', value:''},
            {name:'Normal/Charged/Plunging Attack', value:'n'},
            {name:'Elemental Skill', value:'e'},
            {name:'Elemental Burst', value:'q'},
            {name:'Ascension Passives', value:'a'},
            {name:'Constellations', value:'c'}
        ]
        const talent = focus.value;
        if (talent === 'n') reply = [reply[1]];
        else if (talent === 'e') reply = [reply[2]];
        else if (talent === 'q') reply = [reply[3]];
        else if (talent === 'a') reply = [reply[4]];
        else if (talent === 'c') reply = [reply[5]];
        else if (talent.match(/a[123]?/)) reply = [{name:`Passive ${talent[1]}`, value:`a${talent[1]}`}];
        else if (talent.match(/c[123456]?/)) reply = [{name:`Constellation ${talent[1]}`, value:`c${talent[1]}`}];
        else {reply = reply.filter(e => e.name.includes(talent));}
    }

    interaction.respond(reply);
}

export async function run(interaction : ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString('name', true);

    const data = archive[subcommand][name];
    const embed = new EmbedBuilder();
    let text = '';

    //reply = JSON.stringify(archive[subcommand][name]).replaceAll(/(<\/?\w+\/?>)+/g, '**').slice(0,2000);
    if (subcommand === 'char') {
        const talent = (interaction.options.getString('talent', false) ?? '');

        if (talent === '') {
            embed
            .setTitle(data.name)
            .setDescription(clean(
                `> ${data.title}\n\n${data.description}`
            ))
        }
        else if (['n','na','ca','p'].includes(talent)) {
            embed
            .setAuthor({name: data.name})
            .setTitle(data.auto.name)
            .setDescription(clean(
                Object.values(data.auto.fields.normal).join('\n') + '\n\n' +
                Object.values(data.auto.fields.charged).join('\n') + '\n\n' +
                Object.values(data.auto.fields.plunging).join('\n') + '\n\n'
            ))
        }
        else if (talent === 'e') {
            embed
            .setAuthor({name: data.name})
            .setTitle(data.skill.name)
            .setDescription(clean(
                Object.values(data.skills.description).flat().join('\n')
            ))
        }
        else if (talent === 'q') {
            embed
            .setAuthor({name: data.name})
            .setTitle(data.burst.name)
            .setDescription(clean(
                Object.values(data.burst.description).flat().join('\n')
            ))
        }
        else if (talent.match(/a[123]?/)) {
            let arr = ['1','2','3'];
            if (talent.length > 1) arr = [talent[1]];
            for (const n of arr) {
                const e = data[`passive${n}`];
                text += `**${e.name}** \n` +
                Object.values(e.description).flat().join('\n') + '\n\n'
            }
            embed
            .setAuthor({name: data.name})
            .setDescription(clean(text))
        }
        else if (talent.match(/c[123456]?/)) {
            let arr = ['1','2','3','4','5','6'];
            if (talent.length > 1) arr = [talent[1]];
                for (const n of arr) {
                const e = data[`constellation${n}`];
                text += `**${n}. ${e.name}** ` +
                Object.values(e.description).flat().join('\n') + '\n\n'
            }
            embed
            .setAuthor({name: data.name})
            .setTitle(data.constellationName)
            .setDescription(clean(text))
        }
    }
    else if (subcommand === 'weapon') {
        const refine = (interaction.options.getInteger('refine', false) ?? 1) - 1;
        console.log(refine.toString(), data.passiveDescription)
        embed
        .setTitle(data.name)
        .setDescription(clean(
            Object.values(data.description).join('\n') +
            `\n\n**${data.passiveName}:** ` +
            Object.values(data.passiveDescription[refine.toString()]).join('\n')
        ))
    }
    else if (subcommand === 'artifact') {
        //if (!(name in allArtifactSetKeys)) return error(interaction, 'Invalid artifact name!');
        //const rarity = getArtSetStat(name as ArtifactSetKey);
        embed
        .setTitle(data.setName)
        .setDescription(clean(
            `**2-Pieces:** ${data.setEffects['2']}\n`+
            `**4-Pieces:** ${data.setEffects['4']}`
        ))
    }

    return interaction.reply({content: '', embeds:[embed]});
}
