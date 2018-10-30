exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    const noPrivilegesEmbed = new discord.RichEmbed()
        .setColor(resources.red)
        .setDescription(`${resources.RedTick} ${message.author.username}, no dispones de privilegios suficientes para realizar esta operación`);

    if (!message.member.roles.has(config.botStaff) && !message.member.roles.has(`375376646771048449`)) return message.channel.send(noPrivilegesEmbed)
    
    //!skip (cantidad opcional)

    try {
        let notPlayingEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${bot.user.id}>.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.voiceConnection) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) return message.channel.send(notAvailableEmbed);

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voiceChannelID !== message.guild.member(bot.user).voiceChannelID) return message.channel.send(notAvailableEmbed);

        let noTalkPermissionEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)
        
        let NaNEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un número entero.`);
        
        let tooBigEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Solo puedes hacer skip de ` + '`' + (bot.servers[message.guild.id].queue.length + 1) + '` canciones.');
        
        //Si se especifica una cantidad, se skipearan en consecuencia
        if (args[0]) {
            
            let tooMuchSkipsEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes omitir más de una canción con el modo aleatorio activado.`);
            
            //Comprueba si está activado el modo aleatorio
            if (bot.servers[message.guild.id].shuffle === true) return message.channel.send(tooMuchSkipsEmbed);
            
            //Comprueba si se ha proporcionado un número entero
            if (isNaN(args[0])) return message.channel.send(NaNEmbed);
            
            //Comprueba si no es 0
            if (args[0] === `0`) return message.channel.send(`Quieres jugar sucio eh ...`);
            
            //Comprueba si el valor introducido es válido
            if (args[0] > (bot.servers[message.guild.id].queue.length + 1)) return message.channel.send(tooBigEmbed);
            
            //Cambia la cola
            await bot.servers[message.guild.id].queue.splice(0, args[0] - 1)
        }

        //Omite la reproducción y manda un mensaje de confirmación
        await message.channel.send(`⏭ | Canción omitida`)
        await bot.voiceDispatcher.end();
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
