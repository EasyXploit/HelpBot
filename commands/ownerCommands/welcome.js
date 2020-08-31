exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //bienvenida (#canal | id)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} La sintaxis de este comando es \`${config.prefix}bienvenida (#canal | id)\``);
    
        //Comprueba si se ha proporcionado el argumento
        if (args.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si se ha proporcionado un canal de texto válido (mención/id)
        let channelMention = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
        if (!channelMention) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Almacena el ID del canal
        let channel = channelMention.id;
        
        let alreadyConfiguredEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Este canal de bienvenida ya ha sido configurado`);
        
        //Comprueba si este canal ya está configurado
        if (channel === config.welcomeChannel) return message.channel.send(alreadyConfiguredEmbed);

        //Graba el nuevo canal de bienvenida 
        config.welcomeChannel = channel;
        await fs.writeFile('./config.json', JSON.stringify(config, null, 4), (err) => console.error);

        let completedEmbed = new discord.MessageEmbed ()
            .setColor(0xB8E986)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`Cambiaste el canal de bienvenida a <#${channel}>`);

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(0x4A90E2)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL())
            .setTitle('📑 Auditoría')
            .setDescription(`${message.author.username} cambió el canal de bienvenida a <#${channel}>`);
        
        await message.channel.send(completedEmbed);
        await loggingChannel.send(loggingEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
