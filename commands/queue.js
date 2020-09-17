exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!queue

    try {
        const randomColor = require('randomcolor');
        const moment = require(`moment`);
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!client.servers[message.guild.id]) return message.channel.send(noQueueEmbed);
        
        let server = client.servers[message.guild.id];

        let footer = `© ${new Date().getFullYear()} República Gamer S.L.`;
        if (server.mode) {
            switch (server.mode) {
                case 'shuffle':
                    footer = footer + ` | 🔀`;
                    break;
            
                case 'loop':
                    footer = footer + ` | 🔂`;
                    break;

                case 'loopqueue':
                    footer = footer + ` | 🔁`;
                    break;
            };
        };
        
        let queueEmbed = new discord.MessageEmbed()
                .setColor(randomColor())
                .setAuthor(`Cola de reproducción - Ahora mismo:`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n● Duración: \`${server.nowplaying.duration}\`.\n ● Requerida por: \`${server.nowplaying.requestedBy}\``)
                .setFooter(footer, resources.server.iconURL());
        
        if (!client.servers[message.guild.id].queue[0]) {
            //Si no hay cola, envia nowPlaying
            message.channel.send(queueEmbed);
        } else if (!client.servers[message.guild.id].queue[1]) {
            let serverQueue = client.servers[message.guild.id].queue;
            let queueList = `\`1.\` [${serverQueue[0].title}](${serverQueue[0].link}) | \`${moment().startOf('day').seconds(serverQueue[0].lengthSeconds).format('H:mm:ss')}\` | ${serverQueue[0].requestedBy}\n`;
            
            queueEmbed.addField(`A continuación`, queueList, true);
            message.channel.send(queueEmbed);
            
        } else {
            
            let serverQueue = client.servers[message.guild.id].queue
            let queueList = `\`1.\` [${serverQueue[0].title}](${serverQueue[0].link}) | \`${moment().startOf('day').seconds(serverQueue[0].lengthSeconds).format('H:mm:ss')}\` | ${serverQueue[0].requestedBy}\n`;
            
            for (let id = 1; id < serverQueue.length; id++) {
                queueList = queueList + '`' + (id + 1) + `.\` [${serverQueue[id].title}](${serverQueue[id].link}) | \`${moment().startOf('day').seconds(serverQueue[id].lengthSeconds).format('H:mm:ss')}\` | ${serverQueue[id].requestedBy}\n`;
            }
            
            queueEmbed.addField(`A continuación`, queueList, true);
            message.channel.send(queueEmbed);
        }
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
