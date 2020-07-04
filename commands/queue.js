exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.MessageEmbed ()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!queue

    try {
        const randomColor = require('randomcolor');
        
        let noQueueEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!bot.servers[message.guild.id]) return message.channel.send(noQueueEmbed);
        
        let server = bot.servers[message.guild.id];
        
        let queueEmbed = new discord.MessageEmbed ()
                .setColor(randomColor())
                .setAuthor(`Cola de reproducción - Ahora mismo:`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n` + '● Duración: `' + server.nowplaying.duration + '`.\n ● Requerida por: `' + server.nowplaying.requestedBy + '`')
                .setFooter(`© 2020 República Gamer S.L. | BETA Pública`, resources.server.iconURL());
        
        if (!bot.servers[message.guild.id].queue[0]) {
            
            //Si no hay cola, envia nowPlaying
            message.channel.send(queueEmbed);
        } else if (!bot.servers[message.guild.id].queue[1]) {
            let serverQueue = bot.servers[message.guild.id].queue
            let queueList = '`1.` ' + ` [${serverQueue[0].title}](${serverQueue[0].link}) | ` + '`' + serverQueue[0].duration + ' ' + serverQueue[0].requestedBy + '`\n\n';
            
            queueEmbed.addField(`A continuación`, queueList, true)
            message.channel.send(queueEmbed);
            
        } else {
            
            let serverQueue = bot.servers[message.guild.id].queue
            let queueList = '`1.` ' + ` [${serverQueue[0].title}](${serverQueue[0].link}) | ` + '`' + serverQueue[0].duration + ' ' + serverQueue[0].requestedBy + '`\n\n';
            
            for (let id = 1; id < serverQueue.length; id++) {
                queueList = queueList + '`' + (id + 1) + '.` ' + ` [${serverQueue[id].title}](${serverQueue[id].link}) | ` + '`' + serverQueue[id].duration + ' ' + serverQueue[id].requestedBy + '`\n\n';
            }
            
            queueEmbed.addField(`A continuación`, queueList, true)
            message.channel.send(queueEmbed);
        }
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
