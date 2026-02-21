import { parse, stringify } from 'yaml'
import { Client as FClient, Events as FEvents, Webhook, PermissionFlags } from '@fluxerjs/core'
import { Client as DClient, Events as DEvents, GatewayIntentBits, PermissionsBitField} from 'discord.js'
import { readFile, writeFile } from 'fs/promises'
import * as disc from './lib/disc_funcs.js'
import * as flux from './lib/flux_funcs.js'
import * as cmd from './lib/cmds.js'

const PREFIX = process.env.CMD_PREFIX ?? 'brdg;'
let bridges;
try {
    const bridgefile = parse(await readFile('./db/Bridges.yaml', 'utf8'), {schema: 'failsafe'}); console.log(`Bridges loaded!`)
    bridges = ('Discord' in bridgefile && 'Fluxer' in bridgefile)? bridgefile : {Discord: {}, Fluxer: {}};
    writeFile('./db/Bridges.yaml', stringify(bridges));
}
catch {
    console.log("Error finding './db/Bridges.yaml.\nAttempting to create one now");
    bridges = {Discord: {}, Fluxer: {}};
    writeFile('./db/Bridges.yaml', stringify(bridges))
}

const fluxBot = new FClient({ intents: 0 });
const discBot = new DClient({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]});

fluxBot.once(FEvents.Ready, () => console.log(`Fluxer logged in as ${fluxBot.user.username}#${fluxBot.user.discriminator}`));

fluxBot.on(FEvents.MessageCreate, async (msg) => {
    const fluxGuild = await msg.guild ?? fluxBot.guilds.fetch(msg.guildId);
    if (msg.content.startsWith(PREFIX) && !msg.author.bot) {
        const stripped = msg.content.replace(PREFIX, "");
        const mem = await msg.guild.members.get(msg.author.id)
        const authed = mem.permissions.has(PermissionFlags.ManageChannels);
        let res = cmd.parse(authed, bridges, 'Fluxer', msg.channel.id, stripped);
        if (typeof res == 'object') {
            bridges = res;
            writeFile('./db/Bridges.yaml', stringify(bridges))
            msg.react('👍')
        }
        else {
            res = res.replaceAll("[PRFX]", PREFIX)
            msg.channel.send(res)
        }
        return;
    }
    const rawAttachments = await flux.get_flux_attachments(msg);
    if (msg.author.bot || (!msg.content && rawAttachments.size == 0)) {return};
    if (msg.channelId in bridges.Fluxer) {
        const rawMsg = await flux.get_flux_content(msg, msg.referencedMessage)
        for(const ID of bridges.Fluxer[msg.channelId]) {
            const discChannel = await discBot.channels.fetch(ID);
            const guildHook = await disc.get_disc_hook(discBot, discChannel);
            guildHook.send({
                username: msg.author.globalName,
                avatarURL: `https://fluxerusercontent.com/avatars/${msg.author.id}/${msg.author.avatar}.webp`,
                content: rawMsg,
                files: rawAttachments
            })
        }
    }
})

// DISCORD / FLUXER BOT DIVIDER FOR RILLABEL EASY READING

discBot.once('clientReady', (data) => console.log(`Discord logged in as ${data.user.tag}!`));

discBot.on("messageCreate", async (msg) => {
    if (msg.content.startsWith(PREFIX) && !msg.author.bot) {
        const stripped = msg.content.replace(PREFIX, "");
        const authed = msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels);
        let res = cmd.parse(authed, bridges, 'Discord', msg.channel.id, stripped);
        if (typeof res == 'object') {
            bridges = res;
            writeFile('./db/Bridges.yaml', stringify(bridges))
            msg.react('👍')
        }
        else {
            res = res.replaceAll("[PRFX]", PREFIX)
            msg.channel.send(res);
        }

        return;
    }
    const rawAttachments = await disc.get_disc_attachments(msg);
    if (msg.author.bot || (!msg.content && rawAttachments.length == 0)) {return}
    if (msg.channelId in bridges.Discord) {
        const discGuild = msg.guild;
        let replyTo;
        if (msg.reference) {
            replyTo = await msg.fetchReference();
        }
        const rawContent = await disc.get_disc_content(msg, replyTo);
        for (const ID of bridges.Discord[msg.channelId]) {
            const fluxChannel = await fluxBot.channels.fetch(ID);
            const hook = await flux.get_flux_hook(fluxBot, fluxChannel);
            hook.send({
            username: msg.author.displayName,
            content: rawContent,
            avatar_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}`,
            files: rawAttachments
            })
        }
    }
})

process.on('uncaughtException', (e) => {
    console.log(new Date().toTimeString().match(/\S+/)[0], 'Ran into an error:', e.message, "\nBoth bots will attempt to restart.")
    discBot.destroy();
    fluxBot.destroy();
    setTimeout(() => {
        discBot.login(process.env.DISCORD_TOKEN);
        fluxBot.login(process.env.FLUXER_TOKEN);
    }, 3000)
})

discBot.login(process.env.DISCORD_TOKEN);
fluxBot.login(process.env.FLUXER_TOKEN);

