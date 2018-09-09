exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {

    message.delete();

    let successEmbed = new discord.RichEmbed()
        .setColor(0x2E4052)
        .setAuthor('El Pilko', 'https://cdn.discordapp.com/avatars/223945607662927872/1b2170a1d14e3d46d97254e999a98431.png?')
        .setTitle('¡HERMANO, QUE ME DA LA PUTA RISA!');
    message.channel.send(successEmbed);
}
