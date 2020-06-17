exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.MessageEmbed ()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!np

    try {
        let noQueueEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!bot.servers[message.guild.id]) return message.channel.send(noQueueEmbed);
        
        const ytdl = require(`ytdl-core`);
        const moment = require(`moment`);
        const randomColor = require('randomcolor');
        
        let info = await ytdl.getInfo(bot.servers[message.guild.id].nowplaying.link);
        let server = bot.servers[message.guild.id];
        let progress = await bot.voiceDispatcher.time;
        
        let total = info.player_response.videoDetails.lengthSeconds * 1000;
        let percentage = Math.floor((progress * 100) / total);
        
        let progressBar = [`▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`, `▬`];
        
        if (percentage <= 10) {
            progressBar[0] = `🔘`;
        } else if (percentage > 10) {
            progressBar[percentage.toString().slice(0, 1)] = `🔘`;
        }
        
        let progressEmbed = new discord.MessageEmbed ()
            .setColor(randomColor())
            .setAuthor(`Ahora mismo:`, `https://i.imgur.com/lvShSwa.png`)
            .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n${progressBar.join(``)} ${percentage}%\n` + '`' + moment().startOf('day').milliseconds(progress).format('H:mm:ss') + ' / ' + moment().startOf('day').milliseconds(total).format('H:mm:ss') + '`')
            .setFooter(`© 2018 República Gamer LLC | BETA Pública`, resources.server.iconURL);
        
        message.channel.send(progressEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}