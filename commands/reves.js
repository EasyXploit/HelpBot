exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!reves
    
    try {
        let notToAnswerEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes escribir el texto a invertir.\nLa sintaxis de este comando es `' + config.prefix + 'reves <texto>`');

        if (!args[0]) return message.channel.send(notToAnswerEmbed);

        let text = message.content.slice(7).split("").reverse().join("");

        const resultEmbed = new discord.MessageEmbed ()
            .setColor(0xA37044)
            .setDescription('📝 | ' + text);
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
