exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    const coin = bot.emojis.find('name', 'coin');
    const beta = bot.emojis.find('name', 'beta');

    let successEmbed = new discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription('Comandos sociales de ' + bot.user.username)

        .setColor(0xFFC857)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('https://i.imgur.com/cTW63kf.png')

        .addField('👦 ' + config.prefix + 'avatar',  'Muestra tu avatar o el de cualquier usuario.')
        .addField('🐈 ' + config.prefix + 'catfacts', 'Muestra un dato curioso sobre los gatos.')
        .addField('🐕 ' + config.prefix + 'dogfacts', 'Muestra un dato curioso sobre los perros.')
        .addField(':game_die: ' + config.prefix + 'dado', 'Lanzará un dado.')
        .addField(coin + ' ' + config.prefix + 'moneda', 'Lanzará una moneda.')
        .addField('💭 ' + config.prefix + 'di', 'Hará que ' + bot.user.username + ' repita lo que escribas.')
    message.channel.send(successEmbed);
}
