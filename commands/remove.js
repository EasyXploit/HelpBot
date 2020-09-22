exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {

    //!remove (posición | all)

    try {
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es:` + '`' + config.prefix + 'remove (posición)`');
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en reproducción.`);
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voice.channelID !== message.guild.member(client.user).voice.channelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0]) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);
        
        //Comprueba si hay cola
        if (!client.servers[message.guild.id] || client.servers[message.guild.id].queue <= 0) return message.channel.send(noQueueEmbed);
        
        if (args[0] === 'all') {

            //Comprueba si es necesaria una votación
            if (await resources.evaluateDjOrVotes(message, 'remove-all')) {
                //Elimina el elemento de la cola
                await client.servers[message.guild.id].queue.splice(0, client.servers[message.guild.id].queue.length);
                
                //Manda un mensaje de confirmación
                await message.channel.send(`${resources.GreenTick} | He eliminado todas las canciones de la cola`);
            };
        } else {
            let isNaNEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} Debes proporcionar un número entero.`);
            
            let tooBigEmbed = new discord.MessageEmbed()
                .setColor(resources.red)
                .setDescription(`${resources.RedTick} La canción Nº\`${args[0]}\` no está añadida a la cola.`);

            //Comprueba si se ha proporcionado un número entero
            if (isNaN(args[0])) return message.channel.send(isNaNEmbed);
            
            //Comprueba si no es 0
            if (args[0] === `0`) return message.channel.send(`Quieres jugar sucio eh ...`);
            
            //Comprueba si el valor introducido es válido
            if (args[0] > (client.servers[message.guild.id].queue.length)) return message.channel.send(tooBigEmbed);

            //Comprueba si es necesaria una votación
            if (await resources.evaluateDjOrVotes(message, 'remove', args[0])) {
                //Elimina el elemento de la cola
                await client.servers[message.guild.id].queue.splice(args[0] - 1, 1);
                
                //Manda un mensaje de confirmación
                await message.channel.send(`${resources.GreenTick} | He eliminado la canción de la cola`);
            };
        };
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
