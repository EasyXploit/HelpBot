exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //-envia (texto)
    
    try {
        const text = message.content.slice(7);
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes escribir el contenido del mensaje');
    
        if (text.length < 1) return message.channel.send(noCorrectSyntaxEmbed);
            
        message.delete();

        let resultEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setDescription(text);
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
