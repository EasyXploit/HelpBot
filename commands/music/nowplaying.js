exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!nowplaying

    try {
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!client.queues[message.guild.id].nowplaying || Object.entries(client.queues[message.guild.id].nowplaying).length === 0) return message.channel.send({ embeds: [noQueueEmbed] });
        
        const ytdl = require(`ytdl-core-discord`);
        const moment = require(`moment`);
        const randomColor = require('randomcolor');
        
        let info = await ytdl.getInfo(client.queues[message.guild.id].nowplaying.link);
        let server = client.queues[message.guild.id];
        let progress = await client.voiceDispatcher.streamTime;
        
        let total = info.player_response.videoDetails.lengthSeconds * 1000;
        let percentage = Math.floor((progress * 100) / total);
        
        let progressBar = [`▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`];
        
        if (percentage <= 10) {
            progressBar[0] = `🔘`;
        } else if (percentage > 10) {
            progressBar[percentage.toString().slice(0, 1)] = `🔘`;
        };

        let footer = client.homeGuild.name;
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
            .setAuthor(`Ahora mismo:`, 'attachment://dj.png')
            .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n${progressBar.join(``)} ${percentage}%\n\`${moment().startOf('day').milliseconds(progress).format('H:mm:ss')} / ${moment().startOf('day').milliseconds(total).format('HH:mm:ss')}\``)
            .setFooter(footer, client.homeGuild.iconURL({dynamic: true}));
        
        message.channel.send({ embeds: [progressEmbed], files: ['./resources/images/dj.png'] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'nowplaying',
    aliases: ['np']
};