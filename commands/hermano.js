exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!hermano
    
    try {
        message.delete();

        let resultEmbed = new discord.MessageEmbed()
            .setColor(0x2E4052)
            .setAuthor('El Pilko', 'https://cdn.discordapp.com/avatars/223945607662927872/1b2170a1d14e3d46d97254e999a98431.png?')
            .setTitle('¡HERMANO, QUE ME DA LA PUTA RISA!');
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
