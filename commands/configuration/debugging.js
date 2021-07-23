exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!debugging (#canal | id)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}debugging (#canal | id)\``);
    
        //Comprueba si se ha proporcionado el argumento
        if (args.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si se ha proporcionado un canal de texto válido (mención/id)
        let channelMention = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channelMention) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Almacena el ID del canal
        let channel = channelMention.id;
        
        let alreadyConfiguredEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Este canal de depuración ya ha sido configurado`);
        
        //Comprueba si este canal ya está configurado
        if (channel === client.config.guild.debuggingChannel) return message.channel.send(alreadyConfiguredEmbed);

        //Graba el nuevo canal de depuración 
        client.config.guild.debuggingChannel = channel;
        await client.fs.writeFile('./configs/guild.json', JSON.stringify(client.config.guild, null, 4), (err) => console.error(err));

        let completedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`Cambiaste el canal de depuración a <#${channel}>`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.blue)
            .setTitle('📑 Auditoría - [CANAL DE DEPURACIÓN]')
            .setDescription(`${message.author.tag} cambió el canal de depuración a <#${channel}>`);
        
        await message.channel.send(completedEmbed);
        await client.functions.loggingManager(loggingEmbed);
        
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'debugging',
    aliases: ['debug']
};
