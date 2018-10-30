exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    let staffRole = message.guild.roles.get(config.botStaff);
    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(staffRole.id) && message.author.id !== config.botOwner) return message.channel.send(noPrivilegesEmbed)

    //!replay

    try {
        
        let noConnectionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${bot.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${bot.user.id}>.`);
        
        let noDispatcherEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voiceConnection) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si hay reproducción
        if (!bot.voiceDispatcher) return message.channel.send(noDispatcherEmbed);
        
        let nowplaying = bot.servers[message.guild.id].nowplaying;
        
        //Genera la información de la cola
        let newQueueItem = {
            link: nowplaying.link,
            title: nowplaying.title,
            duration: nowplaying.duration,
            requestedBy: nowplaying.requestedBy
        };

        //Sube la canción a la cola en el primer puesto y hace skip
        await bot.servers[message.guild.id].queue.splice(0, 0, newQueueItem);
        await bot.voiceDispatcher.end();
        
        //Manda un mensaje de confirmación
        await message.channel.send(`${resources.GreenTick} | La canción se volverá a reproducir`);

    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
