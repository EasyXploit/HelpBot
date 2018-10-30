exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {

    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)

    //!move (posición 1) (posición 2)

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

        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'move (posición 1) (posición 2)`');
        
        let noDispatcherEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);
        
        let noQueueEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voiceConnection) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si hay reproducción
        if (!bot.voiceDispatcher) return message.channel.send(noDispatcherEmbed);
        
        //Comprueba si hay cola
        if (!bot.servers[message.guild.id] || bot.servers[message.guild.id].queue <= 0) return message.channel.send(noQueueEmbed);
        
        let isNaNEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un número entero.`);
        
        let tooBigEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Valor demasiado grande.`);

        //Comprueba si se ha proporcionado un número entero
        if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send(isNaNEmbed);
        
        //Comprueba si no es 0
        if (args[0] === `0` || args[1] === `0`) return message.channel.send(`Quieres jugar sucio eh ...`);
        
        //Comprueba si el valor introducido es válido
        if (args[0] > (bot.servers[message.guild.id].queue.length) || args[1] > (bot.servers[message.guild.id].queue.length)) return message.channel.send(tooBigEmbed);
        
        //Obtiene el objeto a desplazar
        let toMove = await bot.servers[message.guild.id].queue[args[0] - 1];
        
        //Elimina el objeto
        await bot.servers[message.guild.id].queue.splice(args[0] - 1, 1);
        
        //Lo vuelve a introducir en la ubicación especificada
        await bot.servers[message.guild.id].queue.splice(args[1] - 1, 0, toMove);
        
        //Manda un mensaje de confirmación
        await message.channel.send(`${resources.GreenTick} | He reubicado la canción en la cola`);

    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
