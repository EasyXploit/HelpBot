exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!psychopass (@usuario | nada)
    
    try {
        const member = message.mentions.users.first() || message.member.displayName;
        const coefficient = Math.floor(Math.random() * 400);
        let result;

        if (coefficient < 100) {
            result = '** no es un criminal en potencia.'
        } else if (coefficient >= 100 && coefficient <= 300) {
            result = '** es un criminal que necesita ser paralizado.'
        } else if (coefficient > 300) {
            result = '** es un criminal que necesita ser ejecutado mortalmente.'
        }

        const resultEmbed = new discord.MessageEmbed ()
            .setColor(0xDDDDDD)
            .setTitle(':gun: | Coeficiente criminal: **' + coefficient + '%**')
            .setDescription('**' + member + result)

        message.channel.send(resultEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
