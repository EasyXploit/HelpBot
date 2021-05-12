exports.run = async (discord, client, message, args, command) => {
    
    //bienvenida (#canal | id)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} La sintaxis de este comando es \`${client.config.prefixes.mainPrefix}bienvenida (#canal | id)\``);
    
        //Comprueba si se ha proporcionado el argumento
        if (args.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si se ha proporcionado un canal de texto válido (mención/id)
        let channelMention = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channelMention) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Almacena el ID del canal
        let channel = channelMention.id;
        
        let alreadyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Este canal de bienvenida ya ha sido configurado`);
        
        //Comprueba si este canal ya está configurado
        if (channel === client.config.guild.welcomeChannel) return message.channel.send(alreadyConfiguredEmbed);

        //Graba el nuevo canal de bienvenida 
        client.config.guild.welcomeChannel = channel;
        await client.fs.writeFile('./configs/guild.json', JSON.stringify(config, null, 4), (err) => console.error);

        let completedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.emotes.greenTick} Operación completada`)
            .setDescription(`Cambiaste el canal de bienvenida a <#${channel}>`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue)
            .setTitle('📑 Auditoría - [CANAL DE BIENVENIDA]')
            .setDescription(`${message.author.tag} cambió el canal de bienvenida a <#${channel}>`);
        
        await message.channel.send(completedEmbed);
        await client.loggingChannel.send(loggingEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
