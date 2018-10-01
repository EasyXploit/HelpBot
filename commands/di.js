exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!di (texto)
    
    try {   
        let noTextEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes escribir el contenido del mensaje');

        if (!args[0]) return message.channel.send(noTextEmbed);
        
        message.delete();
        const text = message.content.slice(4);

        let resultEmbed = new discord.RichEmbed()
            .setColor(0x2E4052)
            .setAuthor(message.author.username + ' dijo:', message.author.avatarURL)
            .setDescription(text);
        
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
