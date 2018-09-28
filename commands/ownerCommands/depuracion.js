exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //depuracion (#canal | id)
    
    try {
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' La sintaxis de este comando es `' + config.prefix + 'depuracion (#canal | id)`');
    
        //Comprueba si se ha proporcionado el argumento
        if (args.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Comprueba si se ha proporcionado un canal de texto válido (mención/id)
        let channelMention = message.mentions.channels.first() || message.guild.channels.get(args[0]);
        if (!channelMention) return message.channel.send(noCorrectSyntaxEmbed);
        
        //Almacena el ID del canal
        let channel = channelMention.id;
        
        let alreadyConfiguredEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Este canal de depuración ya ha sido configurado');
        
        //Comprueba si este canal ya está configurado
        if (channel === config.debuggingChannel) return message.channel.send(alreadyConfiguredEmbed);

        //Graba el nuevo canal de depuración 
        config.debuggingChannel = channel;
        await fs.writeFile('./config.json', JSON.stringify(config), (err) => console.error);

        let completedEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(emojis.GreenTick + ' Operación completada')
            .setDescription('Cambiaste el canal de depuración a <#' + channel + '>');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x4A90E2)
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL)
            .setTitle('📑 Auditoría')
            .setDescription(message.author.username + ' cambió el canal de depuración a <#' + channel + '>');
        
        await message.channel.send(completedEmbed);
        await loggingChannel.send(loggingEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
