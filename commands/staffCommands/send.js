exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-send (texto)
    
    try {
        let noCorrectSyntaxEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes escribir el contenido del mensaje`);
        
        let text = args.join(` `);
        if (!text) return message.channel.send(noCorrectSyntaxEmbed);
            
        message.delete();

        let resultEmbed = new discord.MessageEmbed ()
            .setColor(0xFFC857)
            .setDescription(text);
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
