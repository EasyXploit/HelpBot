exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {

    const coin = bot.emojis.find('name', 'coin');
    const beta = bot.emojis.find('name', 'beta');

    let successEmbed = new discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription('Comandos sociales de ' + bot.user.username)

        .setColor(0xFFC857)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setThumbnail('https://i.imgur.com/cTW63kf.png')

        .addField('👦 ' + config.prefix + 'avatar <@usuario>',  'Muestra tu avatar o el de cualquier usuario.')
        .addField('🐈 ' + config.prefix + 'catfacts', 'Muestra un dato curioso sobre los gatos.')
        .addField('🐕 ' + config.prefix + 'dogfacts', 'Muestra un dato curioso sobre los perros.')
        .addField(':game_die: ' + config.prefix + 'dado', 'Lanzará un dado.')
        .addField(coin + ' ' + config.prefix + 'moneda', 'Lanzará una moneda.')
        .addField(':8ball: ' + config.prefix + '8ball <pregunta>', 'La bola mágica te dará una respuesta.')
        .addField('✂ ' + config.prefix + 'ppt <piedra | papel | tijeras>', 'Juega a Piedra Papel y Tijeras con ' + bot.user.username + '.')
        .addField('🦎 ' + config.prefix + 'pptls <piedra | papel | tijeras | lagarto | spock>', 'Juega a Piedra Papel, Tijeras, Lagarto y Spock con ' + bot.user.username + '.')
        .addField('🎯 ' + config.prefix + 'elige "opción1" "opción2" ...', bot.user.username + ' elegirá por ti de entre las opciones que le facilites.')
        .addField('📝 ' + config.prefix + 'reves <texto>', bot.user.username + ' le dará la vuelta al texto que especifiques.')
        .addField('💭 ' + config.prefix + 'di <texto>', 'Hará que ' + bot.user.username + ' repita lo que escribas.')
    message.channel.send(successEmbed);
}
