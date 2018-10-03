exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!reves
    
    try {
        let notToAnswerEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes escribir el texto a invertir.\nLa sintaxis de este comando es `' + config.prefix + 'reves <texto>`');

        if (!args[0]) return message.channel.send(notToAnswerEmbed);

        let text = message.content.slice(7).split("").reverse().join("");

        const resultEmbed = new discord.RichEmbed()
            .setColor(0xA37044)
            .setDescription('📝 | ' + text);
        message.channel.send(resultEmbed);
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
