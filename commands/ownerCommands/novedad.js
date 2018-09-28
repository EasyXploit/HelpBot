exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    let disabledEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(emojis.GrayTick + ' Comando `' + command.slice(-0, -3) + '` deshabilitado temporalmente');
    message.channel.send(disabledEmbed);
    return;
    
    //$novedad "título" "contenido"
    
    try {
        // Introduce los argumentos separados por " en el array 'fields'
        var fields = message.content.slice(10).split('" "');
        var lastField = fields.slice(-1).join();

        lastField = lastField.substring(0, lastField.length - 1);
        fields.splice(-1);
        fields.push(lastField);

        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' La sintaxis de este comando es `' + config.ownerPrefix + 'novedad "título" "contenido"`');

        if (fields.length < 2) return message.channel.send(noCorrectSyntaxEmbed);

        message.delete();

        let embed = new discord.RichEmbed()
            .setAuthor(fields[0], 'https://i.imgur.com/pihFXyM.png')
            .setColor(0xFFC857)
            .setDescription(fields[1])
            .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
            .setThumbnail('https://i.imgur.com/oqDsHz4.png');
        message.channel.send(embed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
