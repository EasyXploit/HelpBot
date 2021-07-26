exports.run = async (discord, client, message, args, command, commandConfig) => {

    //!move (posición 1) (posición 2)

    try {
        
        let noConnectionEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} <@${client.user.id}> no está conectado a ninguna sala.`);
        
        let noChannelEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes estar conectado a un canal de voz.`);

        let notAvailableEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes estar en el mismo canal de voz que <@${client.user.id}>.`);

        let incorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es: \`${client.config.guild.prefix}move (posición 1) (posición 2)\``);
        
        let noDispatcherEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No hay nada en reproducción.`);
        
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} No hay nada en la cola.`);
        
        //Comprueba si el bot tiene o no una conexión a un canal de voz
        if (!message.guild.voice) return message.channel.send(noConnectionEmbed);

        //Comprueba si el miembro está en un canal de voz
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.channel.send(noChannelEmbed);
        
        //Comprueba si el bot está en el mismo canal que el miembro
        if (message.member.voiceChannelID !== message.guild.member(client.user).voiceChannelID) return message.channel.send(notAvailableEmbed);
        
        //Comprueba si se han proporcionado argumentos
        if (!args[0] || !args[1]) return message.channel.send(incorrectSyntaxEmbed);
        
        //Comprueba si hay reproducción
        if (!client.voiceDispatcher) return message.channel.send(noDispatcherEmbed);
        
        //Comprueba si hay cola
        if (!client.queues[message.guild.id] || client.queues[message.guild.id].queue <= 0) return message.channel.send(noQueueEmbed);
        
        let isNaNEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un número entero.`);
        
        let tooBigEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Valor demasiado grande.`);

        //Comprueba si se ha proporcionado un número entero
        if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send(isNaNEmbed);
        
        //Comprueba si no es 0
        if (args[0] === `0` || args[1] === `0`) return message.channel.send(`Quieres jugar sucio eh ...`);
        
        //Comprueba si el valor introducido es válido
        if (args[0] > (client.queues[message.guild.id].queue.length) || args[1] > (client.queues[message.guild.id].queue.length)) return message.channel.send(tooBigEmbed);

        //Comprueba si es necesaria una votación
        if (await client.functions.evaluateDjOrVotes(message, 'move')) {
            //Obtiene el objeto a desplazar
            let toMove = await client.queues[message.guild.id].queue[args[0] - 1];
            
            //Elimina el objeto
            await client.queues[message.guild.id].queue.splice(args[0] - 1, 1);
            
            //Lo vuelve a introducir en la ubicación especificada
            await client.queues[message.guild.id].queue.splice(args[1] - 1, 0, toMove);
            
            //Manda un mensaje de confirmación
            await message.channel.send(`${client.customEmojis.greenTick} | He reubicado la canción en la cola`);
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'move',
    aliases: ['mv']
};