exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!psychopass (@usuario | nada)
    
    try {
        let notFoundEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const member = await resources.fetchMember(message.guild, args[0] || message.author.id);
        if (!member) return message.channel.send(notFoundEmbed);

        const coefficient = Math.floor(Math.random() * 400);
        let result;

        if (coefficient < 100) {
            result = '** no es un criminal en potencia.'
        } else if (coefficient >= 100 && coefficient <= 300) {
            result = '** es un criminal que necesita ser paralizado.'
        } else if (coefficient > 300) {
            result = '** es un criminal que necesita ser ejecutado mortalmente.'
        }

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xDDDDDD)
            .setTitle(`:gun: | Coeficiente criminal: **${coefficient}%**`)
            .setDescription(`**${member.displayName}${result}`)

        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
