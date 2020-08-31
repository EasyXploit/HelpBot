exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!di (texto)
    
    try {   
        let noTextEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes escribir el contenido del mensaje`);

        if (!args[0]) return message.channel.send(noTextEmbed);
        
        message.delete();
        const text = message.content.slice(4);

        let resultEmbed = new discord.MessageEmbed()
            .setColor(0x2E4052)
            .setAuthor(`${message.author.username} dijo:`, message.author.avatarURL())
            .setDescription(text);
        
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
