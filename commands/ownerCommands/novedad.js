exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription('❕ **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);

    // Introduce los argumentos separados por " en el array 'fields'
    var fields = message.content.slice(10).split('" "');
    var lastField = fields.slice(-1).join();

    lastField = lastField.substring(0, lastField.length - 1);
    fields.splice(-1);
    fields.push(lastField);

    if (fields.length >= 2) {
        if (fields.length <= 2) {

            message.delete();

            let embed = new discord.RichEmbed()
                .setAuthor(fields[0], 'https://i.imgur.com/pihFXyM.png')
                .setColor(0xFFC857)
                .setDescription(fields[1])
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .setThumbnail('https://i.imgur.com/oqDsHz4.png');
            message.channel.send(embed);

            count = 0;
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ ' + message.author.username + ', tan solo puedes añadir un título para la novedad, y su contenido');
            message.channel.send(errorEmbed);
        }
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ ' + message.author.username + ', debes proporcionar un título para la novedad, y su contenido \n(asegúrate de que no haya más de un espacio en blanco entre los campos)');
        message.channel.send(errorEmbed);
    }
}
