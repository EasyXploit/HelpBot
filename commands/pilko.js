exports.run = (discord, fs, config, token, bot, message, args, command) => {

    const coin = bot.emojis.find('name', 'coin');
    const beta = bot.emojis.find('name', 'beta');

    let successEmbed = new discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription('Comandos de ' + bot.user.username)

        .setColor(0xFFC857)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('https://i.imgur.com/cTW63kf.png')

        .addField('Comandos sociales', '👦  **' + config.prefix + 'avatar** _muestra tu avatar o el de cualquier usuario._\n🐈  **' + config.prefix + 'catfacts** _muestra un dato curioso sobre los gatos._\n🐕  **' + config.prefix + 'dogfacts** _muestra un dato curioso sobre los perros._\n:game_die:  **' + config.prefix + 'dado** _lanzará un dado._\n' + coin + '  **' + config.prefix + 'moneda** _lanzará una moneda._\n💭  **' + config.prefix + 'di** _hará que ' + bot.user.username + ' repita lo que escribas._\n👁  **' + config.prefix + 'registra [ms]** _hará que ' + bot.user.username + ' registre los mensajes enviados durante el tiempo especificado_ ' + beta + '.', true);
    message.channel.send(successEmbed);
}
