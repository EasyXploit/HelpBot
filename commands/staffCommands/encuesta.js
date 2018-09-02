exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
     
    // Introduce los argumentos separados por " en el array 'fields'
    let fields = message.content.slice(11).split('" "');
    let lastField = fields.slice(-1).join();

    lastField = lastField.substring(0, lastField.length - 1);
    fields.splice(-1);
    fields.push(lastField);

    if (fields.length >= 2) {
        if (fields.length <= 11) {

            message.delete();

            let count = 2;
            let lines = fields [1] + '\n';
            var emojiOptions = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'];
            var UTFemojis = ['\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3', '\u0030\u20E3'];

            while (count < fields.length) {
                lines = lines + ' \n' + emojiOptions[count - 1] + ' ' + fields[count] + '\n';
                count = count + 1;
            }

            let embed = new discord.RichEmbed()
                .setAuthor('Encuesta disponible', 'https://i.imgur.com/zdAm4AD.png')
                .setColor(0x2AB7F1)
                .setDescription('**' + fields[0] + '**\n\n:one: ' + lines)
                .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
                .setThumbnail('https://i.imgur.com/9ciWYgU.png');
            message.channel.send(embed)

            .then(async function (message) {
                for (c = 1; c < fields.length; c++) {
                    await message.react(UTFemojis[c]);
                }
            })   
            count = 0;
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' proporcionó demasiados argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ Tan solo puedes añadir un máximo de 10 opciones');
            message.channel.send(errorEmbed);
        }
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ Debes proporcionar un título para la encuesta y al menos una opción \n(asegúrate de que no haya más de un espacio en blanco entre los campos)');
        message.channel.send(errorEmbed);
    }
}
