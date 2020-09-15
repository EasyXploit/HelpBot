exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!skip (cantidad opcional)

    try {
        let notPlayingEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay ninguna canción en cola/reproducción.`);
        
        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        //Comprueba si el bot tiene o no una conexión a un canal de voz en el servidor
        if (!message.guild.voice) return message.channel.send(notPlayingEmbed);
        
        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(notAvailableEmbed);

        //Comprueba si el miembro está en el mismo canal que el bot
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);

        let noTalkPermissionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No tengo permiso para hablar en esta sala.`);

        //Comprueba si el bot tiene permiso para hablar
        if (!voiceChannel.speakable) return message.channel.send(noTalkPermissionEmbed)
        
        let NaNEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un número entero.`);
        
        let tooBigEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Solo puedes hacer skip de \`${(client.servers[message.guild.id].queue.length + 1)}\` canciones.`);
        
        //Si se especifica una cantidad, se skipearan en consecuencia
        if (args[0]) {
            
            let tooMuchSkipsRandomEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes omitir más de una canción con el modo aleatorio activado.`);

            let tooMuchSkipsLoopEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} No puedes omitir más de una canción con el modo loop activado.`);
            
            //Comprueba si está activado el modo aleatorio
            if (client.servers[message.guild.id].mode === 'shuffle') return message.channel.send(tooMuchSkipsRandomEmbed);

            //Comprueba si está activado el modo loop
            if (client.servers[message.guild.id].mode === 'loop' || client.servers[message.guild.id].mode === 'loopqueue') return message.channel.send(tooMuchSkipsLoopEmbed);
            
            //Comprueba si se ha proporcionado un número entero
            if (isNaN(args[0])) return message.channel.send(NaNEmbed);
            
            //Comprueba si no es 0
            if (args[0] === `0`) return message.channel.send(`Quieres jugar sucio eh ...`);
            
            //Comprueba si el valor introducido es válido
            if (args[0] > (client.servers[message.guild.id].queue.length + 1)) return message.channel.send(tooBigEmbed);
            
            //Cambia la cola
            await client.servers[message.guild.id].queue.splice(0, args[0] - 1)
        };

        //Omite la reproducción y manda un mensaje de confirmación
        await message.channel.send(`⏭ | Canción omitida`);
        await client.voiceDispatcher.end();
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
