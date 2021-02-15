exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!np

    try {
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!client.servers[message.guild.id]) return message.channel.send(noQueueEmbed);
        
        const ytdl = require(`ytdl-core-discord`);
        const moment = require(`moment`);
        const randomColor = require('randomcolor');
        
        let info = await ytdl.getInfo(client.servers[message.guild.id].nowplaying.link);
        let server = client.servers[message.guild.id];
        let progress = await client.voiceDispatcher.streamTime;
        
        let total = info.player_response.videoDetails.lengthSeconds * 1000;
        let percentage = Math.floor((progress * 100) / total);
        
        let progressBar = [`▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`];
        
        if (percentage <= 10) {
            progressBar[0] = `🔘`;
        } else if (percentage > 10) {
            progressBar[percentage.toString().slice(0, 1)] = `🔘`;
        };

        let footer = 'República Gamer';
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
        
        let progressEmbed = new discord.MessageEmbed()
            .setColor(randomColor())
            .setAuthor(`Ahora mismo:`, `https://i.imgur.com/lvShSwa.png`)
            .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n${progressBar.join(``)} ${percentage}%\n\`${moment().startOf('day').milliseconds(progress).format('H:mm:ss')} / ${moment().startOf('day').milliseconds(total).format('HH:mm:ss')}\``)
            .setFooter(footer, resources.server.iconURL());
        
        message.channel.send(progressEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}